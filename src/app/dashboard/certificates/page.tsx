import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Download } from "lucide-react"

export default async function CertificatesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get certificates with course details
  const { data: certificates } = await supabase
    .from("certificates")
    .select("*, courses(title, image_url)")
    .eq("user_id", user.id)
    .order("issued_at", { ascending: false })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mis Certificados</h1>
          <p className="text-muted-foreground">Descarga y comparte tus certificados de finalización</p>
        </div>

        {!certificates || certificates.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Aún no tienes certificados</p>
              <p className="text-sm text-muted-foreground">Completa un curso para obtener tu primer certificado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((certificate) => (
              <Card key={certificate.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center">
                      <Award className="h-16 w-16 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-balance">{certificate.courses?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Emitido el{" "}
                        {new Date(certificate.issued_at).toLocaleDateString("es-AR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <Button className="w-full bg-transparent" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Certificado
                    </Button>
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
