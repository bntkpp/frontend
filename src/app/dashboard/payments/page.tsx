import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, CheckCircle2, XCircle, Clock, TrendingUp, Calendar, FileText, LucideIcon } from "lucide-react"

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  completed: "Completado",
  failed: "Fallido",
  refunded: "Reembolsado",
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  refunded: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
}

const statusIcons: Record<string, LucideIcon> = {
  pending: Clock,
  completed: CheckCircle2,
  failed: XCircle,
  refunded: TrendingUp,
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
          <p className="text-muted-foreground">Revisa todos tus pagos y transacciones realizadas</p>
        </div>

        {!payments || payments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tienes pagos registrados</h3>
              <p className="text-muted-foreground text-center">
                Tus transacciones aparecerán aquí cuando compres un curso
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Transacciones Recientes</CardTitle>
              <CardDescription>Lista detallada de todos tus pagos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {payments.map((payment, index) => {
                const StatusIcon = statusIcons[payment.status] || CreditCard
                return (
                  <div key={payment.id}>
                    {index > 0 && <hr className="my-4 border-border" />}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{payment.courses?.title}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(payment.created_at).toLocaleDateString("es-CL", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          {payment.payment_method && (
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              {payment.payment_method}
                            </div>
                          )}
                        </div>
                        {payment.includes_questions_pack && (
                          <Badge variant="outline" className="w-fit text-xs">
                            + Preguntas tipo prueba
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <Badge variant="secondary" className={`${statusColors[payment.status]} flex items-center gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusLabels[payment.status]}
                        </Badge>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">${payment.amount.toLocaleString("es-CL")}</p>
                          <p className="text-xs text-muted-foreground uppercase">{payment.currency}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
