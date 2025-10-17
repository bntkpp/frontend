"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CheckCircle2, CreditCard } from "lucide-react"

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", params.courseId)
        .eq("is_published", true)
        .single()

      if (!courseData) {
        router.push("/courses")
        return
      }

      // Check if already enrolled
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", params.courseId)
        .single()

      if (enrollment) {
        router.push("/dashboard")
        return
      }

      setCourse(courseData)
      setIsLoading(false)
    }

    loadData()
  }, [params.courseId, router])

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      // Create payment preference
      const response = await fetch("/api/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: params.courseId,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (data.initPoint) {
        // Redirect to Mercado Pago
        window.location.href = data.initPoint
      } else {
        alert("Error al procesar el pago. Por favor intenta nuevamente.")
        setIsProcessing(false)
      }
    } catch (error) {
      console.error("[v0] Payment error:", error)
      alert("Error al procesar el pago. Por favor intenta nuevamente.")
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen del Curso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <img
                      src={course.image_url || "/placeholder.svg?height=100&width=150&query=education+course"}
                      alt={course.title}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Lo que incluye</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                      <span>Acceso ilimitado de por vida</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                      <span>Material descargable</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                      <span>Asistente Virtual IA 24/7</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                      <span>Evaluaciones prácticas</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Total</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Precio del curso</span>
                    <span className="font-medium">${course.price.toLocaleString("es-CL")}</span>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-bold text-primary">${course.price.toLocaleString("es-AR")}</span>
                    </div>
                    <Button className="w-full" size="lg" onClick={handlePayment} disabled={isProcessing}>
                      <CreditCard className="h-5 w-5 mr-2" />
                      {isProcessing ? "Procesando..." : "Pagar con Mercado Pago"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Pago seguro procesado por Mercado Pago</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
