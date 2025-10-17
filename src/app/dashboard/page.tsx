import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { BookOpen, Clock, Award } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get enrolled courses with course details - CAMBIADO: agregado is_active filter
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("*, courses(*)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("enrolled_at", { ascending: false })

  console.log("[Dashboard] Enrollments:", enrollments)
  console.log("[Dashboard] Error:", enrollmentsError)

  // Get total certificates
  const { count: certificatesCount } = await supabase
    .from("certificates")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Bienvenido, {profile?.full_name || user.email}</h1>
          <p className="text-muted-foreground">Aquí puedes ver tu progreso y gestionar tus cursos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollments?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Cursos en los que estás inscrito</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Horas de Estudio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {enrollments?.reduce((acc, e) => acc + (e.courses?.duration_hours || 0), 0) || 0}h
              </div>
              <p className="text-xs text-muted-foreground">Contenido disponible</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificados</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certificatesCount || 0}</div>
              <p className="text-xs text-muted-foreground">Cursos completados</p>
            </CardContent>
          </Card>
        </div>

        {enrollmentsError && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            Error al cargar cursos: {enrollmentsError.message}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Mis Cursos</h2>
            <Button variant="outline" asChild>
              <Link href="/courses">Explorar Más Cursos</Link>
            </Button>
          </div>

          {!enrollments || enrollments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Aún no estás inscrito en ningún curso</p>
                <Button asChild>
                  <Link href="/courses">Explorar Cursos</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <img
                        src={
                          enrollment.courses?.image_url ||
                          "/placeholder.svg?height=100&width=150"
                        }
                        alt={enrollment.courses?.title || "Course"}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2 text-balance">{enrollment.courses?.title}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progreso</span>
                            <span className="font-medium">{enrollment.progress_percentage || 0}%</span>
                          </div>
                          <Progress value={enrollment.progress_percentage || 0} className="h-2" />
                        </div>
                        <Button size="sm" className="mt-3" asChild>
                          <Link href={`/courses/${enrollment.course_id}`}>Continuar</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
