import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin-layout"
import { AdminUsersManager } from "@/components/admin-users-manager"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminUsersPage() {
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

  // Obtener todos los usuarios con sus estadísticas
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  // Obtener enrollments para contar inscripciones por usuario
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("user_id, is_active")

  // Obtener pagos para contar pagos por usuario
  const { data: payments } = await supabase
    .from("payments")
    .select("user_id, amount, status")

  // Mapear usuarios con sus estadísticas
  const usersWithStats = users?.map((user) => {
    const userEnrollments = enrollments?.filter((e) => e.user_id === user.id) || []
    const userPayments = payments?.filter((p) => p.user_id === user.id) || []
    const activeEnrollments = userEnrollments.filter((e) => e.is_active).length
    const totalSpent = userPayments
      .filter((p) => p.status === "approved")
      .reduce((sum, p) => sum + p.amount, 0)

    return {
      ...user,
      enrollmentsCount: userEnrollments.length,
      activeEnrollmentsCount: activeEnrollments,
      paymentsCount: userPayments.length,
      totalSpent,
    }
  }) || []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra todos los usuarios de la plataforma</p>
        </div>

        <AdminUsersManager initialUsers={usersWithStats} />
      </div>
    </AdminLayout>
  )
}
