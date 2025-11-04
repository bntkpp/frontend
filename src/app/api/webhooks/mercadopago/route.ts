export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { MercadoPagoConfig, Payment } from "mercadopago"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

// Usar service role para bypasear RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("🔔 Webhook received:", JSON.stringify(body, null, 2))

    const { type, data } = body

    if (type !== "payment") {
      console.log("⏭️ Skipping non-payment notification:", type)
      return NextResponse.json({ received: true })
    }

    const paymentId = data?.id
    if (!paymentId) {
      console.log("❌ No payment ID found")
      return NextResponse.json({ error: "No payment ID" }, { status: 400 })
    }

    console.log("💳 Processing payment ID:", paymentId)

    const payment = new Payment(client)
    const paymentInfo = await payment.get({ id: paymentId })

    console.log("📄 Payment info:", JSON.stringify(paymentInfo, null, 2))

    const metadata = paymentInfo.metadata
    const courseId = metadata?.course_id
    const userId = metadata?.user_id
    const planType = metadata?.plan_type

    if (!courseId || !userId) {
      console.log("❌ Missing metadata:", { courseId, userId })
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
    }

    // Verificar si el pago ya existe
    const { data: existingPayment } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("mercadopago_payment_id", String(paymentId))
      .single()

    if (existingPayment) {
      console.log("⚠️ Payment already processed:", paymentId)
      return NextResponse.json({ received: true, message: "Already processed" })
    }

    // Guardar el pago usando service role (bypasea RLS)
    const { data: paymentRecord, error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: userId,
        course_id: courseId,
        amount: paymentInfo.transaction_amount || 0,
        currency: paymentInfo.currency_id || "CLP",
        status: paymentInfo.status || "pending",
        mercadopago_payment_id: String(paymentId),
        payment_method: paymentInfo.payment_method_id || null,
        payment_type: paymentInfo.payment_type_id || null,
      })
      .select()
      .single()

    if (paymentError) {
      console.error("❌ Error saving payment:", paymentError)
      return NextResponse.json({ error: "Error saving payment" }, { status: 500 })
    }

    console.log("✅ Payment saved:", paymentRecord)

    if (paymentInfo.status === "approved") {
      console.log("✅ Payment approved, creating enrollment...")

      let expiresAt = null
      if (planType) {
        const now = new Date()
        switch (planType) {
          case "1_month":
            now.setMonth(now.getMonth() + 1)
            break
          case "4_months":
            now.setMonth(now.getMonth() + 4)
            break
          case "8_months":
            now.setMonth(now.getMonth() + 8)
            break
        }
        expiresAt = now.toISOString()
      }

      const { data: existingEnrollment } = await supabaseAdmin
        .from("enrollments")
        .select("id")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .single()

      if (existingEnrollment) {
        const { error: updateError } = await supabaseAdmin
          .from("enrollments")
          .update({
            is_active: true,
            plan_type: planType,
            expires_at: expiresAt,
          })
          .eq("id", existingEnrollment.id)

        if (updateError) {
          console.error("❌ Error updating enrollment:", updateError)
        } else {
          console.log("✅ Enrollment updated")
        }
      } else {
        const { error: enrollmentError } = await supabaseAdmin
          .from("enrollments")
          .insert({
            user_id: userId,
            course_id: courseId,
            is_active: true,
            plan_type: planType,
            expires_at: expiresAt,
            enrolled_at: new Date().toISOString(),
          })

        if (enrollmentError) {
          console.error("❌ Error creating enrollment:", enrollmentError)
        } else {
          console.log("✅ Enrollment created")
        }
      }
    }

    return NextResponse.json({ received: true, status: paymentInfo.status })
  } catch (error: any) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    )
  }
}


