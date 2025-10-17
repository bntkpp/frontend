import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  completed: "Completado",
  failed: "Fallido",
  refunded: "Reembolsado",
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  completed: "bg-accent/20 text-accent-foreground",
  failed: "bg-destructive/20 text-destructive-foreground",
  refunded: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
}

export default async function PaymentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get payments with course details
  const { data: payments } = await supabase
    .from("payments")
    .select("*, courses(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Historial de Pagos</h1>
          <p className="text-muted-foreground">Revisa todos tus pagos y transacciones</p>
        </div>

        {!payments || payments.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">No tienes pagos registrados</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{payment.courses?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString("es-AR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className={statusColors[payment.status]}>
                        {statusLabels[payment.status]}
                      </Badge>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${payment.amount.toLocaleString("es-AR")}</p>
                        <p className="text-xs text-muted-foreground">{payment.currency}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
