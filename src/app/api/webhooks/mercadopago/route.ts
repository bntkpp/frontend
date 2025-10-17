import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

// Usar Service Role para bypasear RLS y evitar problemas de recursión
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log("[Webhook] Received notification:", body)

    if (body.type === "payment" || body.action === "payment.created" || body.action === "payment.updated") {
      const paymentId = body.data?.id

      if (!paymentId) {
        console.error("[Webhook] No payment ID in notification")
        return NextResponse.json({ error: "No payment ID" }, { status: 400 })
      }

      const payment = new Payment(client)
      const paymentData = await payment.get({ id: paymentId })

      console.log("[Webhook] Payment status:", paymentData.status)
      console.log("[Webhook] External reference:", paymentData.external_reference)

      const externalRef = paymentData.external_reference

      if (!externalRef) {
        console.error("[Webhook] No external reference")
        return NextResponse.json({ error: "No external reference" }, { status: 400 })
      }

      const parts = externalRef.split("-")
      
      if (parts.length !== 10) {
        console.error("[Webhook] Invalid external reference format:", externalRef)
        return NextResponse.json({ error: "Invalid reference format" }, { status: 400 })
      }

      const userId = parts.slice(0, 5).join("-")
      const courseId = parts.slice(5, 10).join("-")

      console.log("[Webhook] User ID:", userId)
      console.log("[Webhook] Course ID:", courseId)

      let paymentStatus: string

      switch (paymentData.status) {
        case "approved":
          paymentStatus = "completed"
          break
        case "pending":
        case "in_process":
          paymentStatus = "pending"
          break
        case "rejected":
        case "cancelled":
          paymentStatus = "failed"
          break
        default:
          paymentStatus = paymentData.status || "unknown"
      }

      // Verificar si el pago ya existe
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id")
        .eq("external_payment_id", paymentId.toString())
        .single()

      if (!existingPayment) {
        // Registrar el pago solo si no existe
        const { error: paymentError } = await supabase
          .from("payments")
          .insert({
            user_id: userId,
            course_id: courseId,
            amount: paymentData.transaction_amount || 0,
            currency: paymentData.currency_id || "CLP",
            status: paymentStatus,
            external_payment_id: paymentId.toString(),
            payment_method: paymentData.payment_method_id || "unknown",
          })

        if (paymentError) {
          console.error("[Webhook] Error creating payment:", paymentError)
        } else {
          console.log("[Webhook] Payment record created successfully")
        }
      } else {
        console.log("[Webhook] Payment already exists, skipping...")
      }

      // Solo crear inscripción si el pago fue aprobado
      if (paymentData.status === "approved") {
        const { data: existingEnrollment } = await supabase
          .from("enrollments")
          .select("id")
          .eq("user_id", userId)
          .eq("course_id", courseId)
          .single()

        if (!existingEnrollment) {
          const { error: enrollmentError } = await supabase
            .from("enrollments")
            .insert({
              user_id: userId,
              course_id: courseId,
              is_active: true,
              enrolled_at: new Date().toISOString(),
            })

          if (enrollmentError) {
            console.error("[Webhook] Error creating enrollment:", enrollmentError)
          } else {
            console.log("[Webhook] Successfully created enrollment")
          }
        } else {
          console.log("[Webhook] Enrollment already exists")
        }
      }

      console.log("[Webhook] Successfully processed payment:", paymentId, "Status:", paymentStatus)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("[Webhook] Error processing webhook:", error)
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    )
  }
}
