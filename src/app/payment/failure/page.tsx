import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentFailurePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/20 p-4">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Pago Fallido</h1>
            <p className="text-muted-foreground">Hubo un problema al procesar tu pago. Por favor intenta nuevamente.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild size="lg">
              <Link href="/courses">Volver a Cursos</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Ir al Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
