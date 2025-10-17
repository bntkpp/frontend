"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get("course_id")
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    async function processPayment() {
      if (!courseId) {
        router.push("/courses")
        return
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Get course details
      const { data: course } = await supabase.from("courses").select("*").eq("id", courseId).single()

      if (!course) {
        router.push("/courses")
        return
      }

      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .single()

      if (!existingEnrollment) {
        // Create enrollment
        await supabase.from("enrollments").insert({
          user_id: user.id,
          course_id: courseId,
          enrolled_at: new Date().toISOString(),
          progress_percentage: 0,
        })

        // Create payment record
        await supabase.from("payments").insert({
          user_id: user.id,
          course_id: courseId,
          amount: course.price,
          currency: "ARS",
          status: "completed",
          payment_method: "mercadopago",
        })
      }

      setIsProcessing(false)
    }

    processPayment()
  }, [courseId, router])

  if (isProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Procesando tu pago...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-accent/20 p-4">
              <CheckCircle2 className="h-12 w-12 text-accent" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Pago Exitoso</h1>
            <p className="text-muted-foreground">
              Tu pago ha sido procesado correctamente. Ya puedes acceder al curso.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard">Ir a Mis Cursos</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/courses">Explorar Más Cursos</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
