import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin-layout"
import { AdminEnrollmentsManager } from "@/components/admin-enrollments-manager"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminEnrollmentsPage() {
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

  // Obtener todas las inscripciones SIN relaciones
  const { data: enrollmentsRaw, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("*")
    .order("enrolled_at", { ascending: false })
  
  // Obtener todos los usuarios
  const { data: allUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .order("full_name")

  // Obtener todos los cursos
  const { data: allCourses } = await supabase
    .from("courses")
    .select("id, title, published")
    .order("title")

  // Mapear manualmente las inscripciones con datos de usuario y curso
  const enrollments = enrollmentsRaw?.map((enrollment) => {
    const userProfile = allUsers?.find((u) => u.id === enrollment.user_id)
    const course = allCourses?.find((c) => c.id === enrollment.course_id)

    return {
      ...enrollment,
      profiles: {
        full_name: userProfile?.full_name || "Usuario desconocido",
        email: userProfile?.email || "email@desconocido.com",
      },
      courses: {
        title: course?.title || "Curso desconocido",
      },
    }
  }) || []

  // Filtrar solo cursos publicados para el selector
  const publishedCourses = allCourses?.filter((c) => c.published) || []


  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent p-6 rounded-xl border">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
            Gestión de Inscripciones
          </h1>
          <p className="text-muted-foreground">Controla el acceso de los estudiantes a los cursos</p>
        </div>

        <AdminEnrollmentsManager
          initialEnrollments={enrollments}
          users={allUsers || []}
          courses={publishedCourses}
        />
      </div>
    </AdminLayout>
  )
}