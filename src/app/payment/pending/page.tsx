import { Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Pago Pendiente</CardTitle>
          <CardDescription>
            Tu pago está siendo procesado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Estamos esperando la confirmación del pago. Te notificaremos cuando esté listo.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/dashboard">Ir al Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/courses">Explorar Cursos</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}