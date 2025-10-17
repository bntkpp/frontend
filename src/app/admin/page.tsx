import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, CreditCard } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  // Get statistics
  const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: coursesCount } = await supabase.from("courses").select("*", { count: "exact", head: true })

  const { count: enrollmentsCount } = await supabase.from("enrollments").select("*", { count: "exact", head: true })

  const { data: payments } = await supabase.from("payments").select("amount").eq("status", "completed")

  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  const { count: reviewsCount } = await supabase.from("reviews").select("*", { count: "exact", head: true })

  // Get recent enrollments
  const { data: recentEnrollments } = await supabase
    .from("enrollments")
    .select("*, profiles(full_name, email), courses(title)")
    .order("enrolled_at", { ascending: false })
    .limit(5)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-muted-foreground">Bienvenido al panel de control de Paidek</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersCount || 0}</div>
              <p className="text-xs text-muted-foreground">Usuarios registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{coursesCount || 0}</div>
              <p className="text-xs text-muted-foreground">Cursos disponibles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inscripciones</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollmentsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Total de inscripciones</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString("es-AR")}</div>
              <p className="text-xs text-muted-foreground">Pagos completados</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inscripciones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {!recentEnrollments || recentEnrollments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay inscripciones recientes</p>
            ) : (
              <div className="space-y-4">
                {recentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{enrollment.profiles?.full_name || enrollment.profiles?.email}</p>
                      <p className="text-sm text-muted-foreground">{enrollment.courses?.title}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(enrollment.enrolled_at).toLocaleDateString("es-AR")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
