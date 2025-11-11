import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin-layout"
import { AdminModulesManager } from "@/components/admin-modules-manager"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminModulesPage() {
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

  const { data: modules } = await supabase
    .from("modules")
    .select("*, courses(id, title)")
    .order("created_at", { ascending: false })

  const { data: courses } = await supabase.from("courses").select("id, title").order("title", { ascending: true })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent p-6 rounded-xl border">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
            Gestión de Módulos
          </h1>
          <p className="text-muted-foreground">Administra los módulos asociados a cada curso</p>
        </div>

        <AdminModulesManager initialModules={modules || []} courses={courses || []} />
      </div>
    </AdminLayout>
  )
}