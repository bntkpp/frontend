"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, CreditCard, TrendingUp } from "lucide-react"

type Plan = "1_month" | "4_months" | "8_months"

const planLabels: Record<Plan, string> = {
  "1_month": "Plan Mensual",
  "4_months": "Plan 4 Meses",
  "8_months": "Plan 8 Meses",
}

const planDurations: Record<Plan, number> = {
  "1_month": 1,
  "4_months": 4,
  "8_months": 8,
}

export default function CheckoutPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan>("4_months")

  useEffect(() => {
    // Get plan from URL or default to 4 months
    const planParam = searchParams.get("plan") as Plan
    if (planParam && ["1_month", "4_months", "8_months"].includes(planParam)) {
      setSelectedPlan(planParam)
    }
  }, [searchParams])

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
        .eq("published", true)
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
        .eq("is_active", true)
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

  const getPlanPrice = (plan: Plan) => {
    if (!course) return 0
    switch (plan) {
      case "1_month":
        return course.price_1_month
      case "4_months":
        return course.price_4_months
      case "8_months":
        return course.price_8_months
      default:
        return course.price_1_month
    }
  }

  const calculateSavings = (plan: Plan) => {
    if (!course || plan === "1_month") return null
    
    const months = planDurations[plan]
    const regularTotal = course.price_1_month * months
    const planPrice = getPlanPrice(plan)
    const savings = regularTotal - planPrice
    const savingsPercent = Math.round((savings / regularTotal) * 100)
    
    return { savings, savingsPercent }
  }

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      const planPrice = getPlanPrice(selectedPlan)
      const planMonths = planDurations[selectedPlan]

      // Create payment preference
      const response = await fetch("/api/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: params.courseId,
          userId: user.id,
          plan: selectedPlan,
          price: planPrice,
          months: planMonths,
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
      console.error("Payment error:", error)
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

  const currentPrice = getPlanPrice(selectedPlan)
  const savings = calculateSavings(selectedPlan)

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
                    {course.image_url && (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-32 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.short_description || course.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Selecciona tu Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Plan 1 Mes */}
                    <button
                      onClick={() => setSelectedPlan("1_month")}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedPlan === "1_month"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Plan Mensual</p>
                          <p className="text-sm text-muted-foreground">Renovación mensual</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${course.price_1_month.toLocaleString("es-CL")}</p>
                          <p className="text-xs text-muted-foreground">/mes</p>
                        </div>
                      </div>
                    </button>

                    {/* Plan 4 Meses */}
                    <button
                      onClick={() => setSelectedPlan("4_months")}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left relative ${
                        selectedPlan === "4_months"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {calculateSavings("4_months") && (
                        <Badge className="absolute -top-2 -right-2 bg-green-600 hover:bg-green-700">
                          Ahorra {calculateSavings("4_months")!.savingsPercent}%
                        </Badge>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Plan 4 Meses</p>
                          <p className="text-sm text-muted-foreground">
                            ${(course.price_4_months / 4).toLocaleString("es-CL")}/mes
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${course.price_4_months.toLocaleString("es-CL")}</p>
                          <p className="text-xs text-muted-foreground">Pago único</p>
                        </div>
                      </div>
                    </button>

                    {/* Plan 8 Meses */}
                    <button
                      onClick={() => setSelectedPlan("8_months")}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left relative ${
                        selectedPlan === "8_months"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {calculateSavings("8_months") && (
                        <Badge className="absolute -top-2 -right-2 bg-green-600 hover:bg-green-700">
                          Ahorra {calculateSavings("8_months")!.savingsPercent}%
                        </Badge>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Plan 8 Meses</p>
                          <p className="text-sm text-muted-foreground">
                            ${(course.price_8_months / 8).toLocaleString("es-CL")}/mes
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${course.price_8_months.toLocaleString("es-CL")}</p>
                          <p className="text-xs text-muted-foreground">Pago único</p>
                        </div>
                      </div>
                    </button>
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
                      <span>Acceso completo durante {planDurations[selectedPlan]} {planDurations[selectedPlan] === 1 ? "mes" : "meses"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                      <span>Material descargable</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                      <span>Certificado digital al finalizar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                      <span>Soporte de profesores</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                      <span>Actualizaciones incluidas</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Resumen de Pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Plan seleccionado</span>
                      <span className="font-medium">{planLabels[selectedPlan]}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Duración</span>
                      <span className="font-medium">
                        {planDurations[selectedPlan]} {planDurations[selectedPlan] === 1 ? "mes" : "meses"}
                      </span>
                    </div>
                    {selectedPlan !== "1_month" && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Precio mensual equivalente</span>
                        <span className="font-medium">
                          ${(currentPrice / planDurations[selectedPlan]).toLocaleString("es-CL")}/mes
                        </span>
                      </div>
                    )}
                  </div>

                  {savings && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-semibold">
                          Ahorras ${savings.savings.toLocaleString("es-CL")} ({savings.savingsPercent}%)
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold">Total a Pagar</span>
                      <span className="text-2xl font-bold text-primary">
                        ${currentPrice.toLocaleString("es-CL")}
                      </span>
                    </div>
                    <Button className="w-full" size="lg" onClick={handlePayment} disabled={isProcessing}>
                      <CreditCard className="h-5 w-5 mr-2" />
                      {isProcessing ? "Procesando..." : "Pagar con Mercado Pago"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Pago seguro procesado por Mercado Pago
                  </p>
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
