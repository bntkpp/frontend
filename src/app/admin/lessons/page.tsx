import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin-layout"
import { AdminLessonsManager } from "@/components/admin-lessons-manager"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminLessonsPage() {
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

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*, modules(id, title, course_id, courses(title))")
    .order("created_at", { ascending: false })

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, course_id, courses(title)")
    .order("title", { ascending: true })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent p-6 rounded-xl border">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-600 to-cyan-500 bg-clip-text text-transparent">
            Gestión de Lecciones
          </h1>
          <p className="text-muted-foreground">Crea y organiza las lecciones de cada módulo</p>
        </div>

        <AdminLessonsManager initialLessons={lessons || []} modules={modules || []} />
      </div>
    </AdminLayout>
  )
}