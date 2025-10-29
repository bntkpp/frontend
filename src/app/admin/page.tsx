import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, CreditCard, Activity, Trophy, UserCheck, TrendingUp } from "lucide-react"
import { AdminDashboardCharts } from "@/components/admin-dashboard-charts"
import { AdminCollectionInventory } from "@/components/admin-collection-inventory"

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

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, user_id, course_id, enrolled_at, courses(title), profiles(full_name, email)")
    .order("enrolled_at", { ascending: false })

  const enrollmentsCount = enrollments?.length || 0

  const { data: payments } = await supabase
    .from("payments")
    .select("amount, status, created_at, course_id, courses(title)")
    .eq("status", "completed")

  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  const { count: reviewsCount } = await supabase.from("reviews").select("*", { count: "exact", head: true })

  const activeThreshold = new Date()
  activeThreshold.setDate(activeThreshold.getDate() - 30)
  const activeUsersCount = enrollments
    ? new Set(
        enrollments
          .filter((enrollment) => enrollment.enrolled_at && new Date(enrollment.enrolled_at) >= activeThreshold)
          .map((enrollment) => enrollment.user_id),
      ).size
    : 0

  const uniqueEnrollmentUsers = enrollments ? new Set(enrollments.map((enrollment) => enrollment.user_id)).size : 0

  const conversionRate = usersCount ? Math.round(((payments?.length || 0) / usersCount) * 1000) / 10 : 0

  const topCourseMap = new Map<string, { title: string; count: number }>()
  enrollments?.forEach((enrollment) => {
    if (!enrollment.course_id) return
    const current =
      topCourseMap.get(enrollment.course_id) || {
        title: enrollment.courses?.title || "Curso",
        count: 0,
      }
    topCourseMap.set(enrollment.course_id, { title: current.title, count: current.count + 1 })
  })
  const topCourses = Array.from(topCourseMap.values())
    .sort((a, b) => b.count - a.count)
    .map((item) => ({ course: item.title, enrollments: item.count }))

  const mostViewedCourse = topCourses[0]?.course || "Sin datos"

  const revenueByMonth = new Map<string, number>()
  const dateFormatter = new Intl.DateTimeFormat("es-AR", { month: "short", year: "numeric" })
  const current = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(current.getFullYear(), current.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    revenueByMonth.set(key, 0)
  }

  payments?.forEach((payment) => {
    if (!payment.created_at) return
    const created = new Date(payment.created_at)
    const key = `${created.getFullYear()}-${created.getMonth()}`
    if (!revenueByMonth.has(key)) {
      revenueByMonth.set(key, 0)
    }
    revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + Number(payment.amount))
  })

  const revenueSeries = Array.from(revenueByMonth.entries()).map(([key, value]) => {
    const [year, month] = key.split("-").map(Number)
    const label = dateFormatter.format(new Date(year, month))
    return {
      period: label,
      revenue: Math.round(value * 100) / 100,
    }
  })

  const funnelSeries = [
    { stage: "Usuarios Registrados", value: usersCount || 0 },
    { stage: "Usuarios con Curso", value: uniqueEnrollmentUsers },
    { stage: "Pagos Completados", value: payments?.length || 0 },
    { stage: "Reseñas Emitidas", value: reviewsCount || 0 },
  ].map((item) => ({ ...item, value: Number(item.value || 0) }))

  const recentEnrollments = enrollments?.slice(0, 5)

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
              <Activity className="h-4 w-4 text-muted-foreground" />
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos (30 días)</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsersCount}</div>
              <p className="text-xs text-muted-foreground">Con actividad reciente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Pagos / usuarios</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Curso Más Demandado</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{mostViewedCourse}</div>
              <p className="text-xs text-muted-foreground">Basado en inscripciones</p>
            </CardContent>
          </Card>
        </div>

        <AdminDashboardCharts revenueSeries={revenueSeries} topCourses={topCourses} funnelSeries={funnelSeries} />

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

        <AdminCollectionInventory />
      </div>
    </AdminLayout>
  )
}