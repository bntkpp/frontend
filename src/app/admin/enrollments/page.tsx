import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin-layout"
import { AdminEnrollmentsManager } from "@/components/admin-enrollments-manager"

export const dynamic = 'force-dynamic'
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

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      profiles(full_name, email),
      courses(title)
    `)
    .order("enrolled_at", { ascending: false })

  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .order("full_name")

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .order("title")

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestión de Inscripciones</h1>
          <p className="text-muted-foreground">Controla el acceso de los estudiantes a los cursos</p>
        </div>

        <AdminEnrollmentsManager
          initialEnrollments={enrollments || []}
          users={users || []}
          courses={courses || []}
        />
      </div>
    </AdminLayout>
  )
}