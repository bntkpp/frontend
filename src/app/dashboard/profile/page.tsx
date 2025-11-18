"use client"

import type React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Calendar, ShieldCheck } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profile) {
        setProfile(profile)
        setFullName(profile.full_name || "")
      }

      setIsLoading(false)
    }

    loadProfile()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id)

    if (error) {
      setMessage({ type: "error", text: "Error al actualizar el perfil" })
    } else {
      setMessage({ type: "success", text: "Perfil actualizado correctamente" })
    }

    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu información personal y preferencias</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email Verificado</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user?.email_confirmed_at ? "✓" : "✗"}
              </div>
              <p className="text-xs text-muted-foreground">
                {user?.email_confirmed_at ? "Cuenta verificada" : "Verifica tu email"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Miembro desde</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(user?.created_at).toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })}
              </div>
              <p className="text-xs text-muted-foreground">Fecha de registro</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Activo</div>
              <p className="text-xs text-muted-foreground">Cuenta en buen estado</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Actualiza tu información de perfil visible en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Correo Electrónico
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={user?.email || ""} 
                    disabled 
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    El correo electrónico no se puede modificar. Contacta soporte si necesitas cambiarlo.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nombre Completo
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ingresa tu nombre completo"
                    className="max-w-md"
                  />
                  <p className="text-xs text-muted-foreground">
                    Este nombre aparecerá en tus certificados y comunicaciones.
                  </p>
                </div>
              </div>

              {message && (
                <Alert variant={message.type === "success" ? "default" : "destructive"}>
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setFullName(profile?.full_name || "")}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
