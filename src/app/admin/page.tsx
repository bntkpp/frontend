import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, GraduationCap, DollarSign } from "lucide-react"
import { AdminDashboardCharts } from "@/components/admin-dashboard-charts"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  // Get counts
  const { count: usersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { count: coursesCount } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true })

  // Get all enrollments
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*")

  const activeEnrollments = enrollments?.filter((e) => {
    if (!e.is_active) return false
    if (e.expires_at && new Date(e.expires_at) < new Date()) return false
    return true
  }) || []

  // Get payments for revenue
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })

  const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

  // Revenue by month (last 6 months)
  const now = new Date()
  const revenueSeries = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const monthPayments = payments?.filter((p) => {
      const paymentDate = new Date(p.created_at)
      return (
        paymentDate.getMonth() === date.getMonth() &&
        paymentDate.getFullYear() === date.getFullYear()
      )
    }) || []
    
    const revenue = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
    
    return {
      period: date.toLocaleDateString("es-CL", { month: "short", year: "numeric" }),
      revenue: revenue,
    }
  })

  // Top courses by enrollments
  const { data: allCourses } = await supabase
    .from("courses")
    .select("id, title")

  const coursesMap = new Map<string, { title: string; count: number }>()
  
  enrollments?.forEach((enrollment) => {
    const course = allCourses?.find(c => c.id === enrollment.course_id)
    if (course) {
      const existing = coursesMap.get(course.id)
      if (existing) {
        existing.count++
      } else {
        coursesMap.set(course.id, { title: course.title, count: 1 })
      }
    }
  })

  const topCourses = Array.from(coursesMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((c) => ({
      course: c.title.length > 20 ? c.title.substring(0, 20) + "..." : c.title,
      enrollments: c.count,
    }))

  // Funnel data - Usuarios únicos en cada etapa
  const { data: allUsers } = await supabase.from("profiles").select("id")
  
  const usersWithEnrollments = new Set(enrollments?.map(e => e.user_id) || [])
  const usersWithActiveEnrollments = new Set(activeEnrollments.map(e => e.user_id))
  const usersWithPayments = new Set(payments?.map(p => p.user_id).filter(Boolean) || [])

  // Funnel correcto: usuarios únicos en cada etapa
  const funnelSeries = [
    { stage: "Usuarios Registrados", value: allUsers?.length || 0 },
    { stage: "Con Inscripciones", value: usersWithEnrollments.size },
    { stage: "Con Inscripciones Activas", value: usersWithActiveEnrollments.size },
    { stage: "Con Pagos Realizados", value: usersWithPayments.size },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-xl border">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Panel de Administración
          </h1>
          <p className="text-muted-foreground">Vista general de la plataforma</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 hover:border-primary/20 transition-all duration-200 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-blue-500 bg-clip-text text-transparent">
                {usersCount || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Usuarios registrados</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/20 transition-all duration-200 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-purple-500 bg-clip-text text-transparent">
                {coursesCount || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Cursos disponibles</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/20 transition-all duration-200 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inscripciones Activas</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-br from-green-600 to-green-500 bg-clip-text text-transparent">
                {activeEnrollments.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Estudiantes activos</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/20 transition-all duration-200 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-br from-amber-600 to-amber-500 bg-clip-text text-transparent">
                ${totalRevenue.toLocaleString("es-CL")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Ingresos acumulados</p>
            </CardContent>
          </Card>
        </div>

        <AdminDashboardCharts
          revenueSeries={revenueSeries}
          topCourses={topCourses}
          funnelSeries={funnelSeries}
        />
      </div>
    </AdminLayout>
  )
}