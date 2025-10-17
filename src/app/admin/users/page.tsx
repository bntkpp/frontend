import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function AdminUsersPage() {
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

  // Get all users
  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra los usuarios de la plataforma</p>
        </div>

        <div className="space-y-4">
          {!users || users.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">No hay usuarios registrados</p>
              </CardContent>
            </Card>
          ) : (
            users.map((userProfile) => (
              <Card key={userProfile.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{userProfile.full_name || "Sin nombre"}</h3>
                        <Badge variant={userProfile.role === "admin" ? "default" : "secondary"}>
                          {userProfile.role === "admin" ? "Administrador" : "Estudiante"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Registrado: {new Date(userProfile.created_at).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
