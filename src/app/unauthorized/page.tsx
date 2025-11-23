import Link from "next/link"
import { ShieldAlert, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Acceso Restringido</CardTitle>
          <CardDescription className="text-base">
            No tienes permiso para acceder a este contenido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive" className="border-destructive/50">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              Esta página está protegida y requiere permisos especiales.
            </AlertDescription>
          </Alert>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">Posibles razones:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>No has adquirido el curso correspondiente</li>
              <li>Tu suscripción ha expirado</li>
              <li>No tienes permisos de administrador</li>
              <li>La sesión ha caducado</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-2">
          <Button asChild className="w-full" size="lg">
            <Link href="/courses">
              Explorar Cursos Disponibles
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">Volver al Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
