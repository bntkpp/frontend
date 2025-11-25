"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function ExpiredSubscriptionAlert() {
  const searchParams = useSearchParams()
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      setShowAlert(true)
    }
  }, [searchParams])

  if (!showAlert) return null

  return (
    <Alert variant="destructive" className="mb-6 relative">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="pr-8">Tu suscripción ha expirado</AlertTitle>
      <AlertDescription className="mt-2">
        Tu acceso a este curso ha terminado. Para continuar aprendiendo, renueva tu suscripción.
        <div className="mt-4 flex gap-2">
          <Button asChild size="sm">
            <Link href="/courses">Ver Planes</Link>
          </Button>
        </div>
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={() => setShowAlert(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  )
}
