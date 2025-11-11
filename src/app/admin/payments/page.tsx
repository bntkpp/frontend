import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin-layout"
import { AdminPaymentsManager } from "@/components/admin-payments-manager"
import { NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

// Usar service role para bypasear RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminPaymentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  // Obtener todos los pagos
  const { data: paymentsRaw } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })

  // Obtener todos los usuarios
  const { data: allUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email")

  // Obtener todos los cursos
  const { data: allCourses } = await supabase
    .from("courses")
    .select("id, title")

  // Mapear pagos con datos de usuario y curso
  const payments = paymentsRaw?.map((payment) => {
    const user = allUsers?.find((u) => u.id === payment.user_id)
    const course = allCourses?.find((c) => c.id === payment.course_id)

    return {
      ...payment,
      user: {
        full_name: user?.full_name || "Usuario desconocido",
        email: user?.email || "email@desconocido.com",
      },
      course: {
        title: course?.title || "Curso desconocido",
      },
    }
  }) || []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 rounded-xl border">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
            Gestión de Pagos
          </h1>
          <p className="text-muted-foreground">Administra todos los pagos de la plataforma</p>
        </div>

        <AdminPaymentsManager initialPayments={payments} />
      </div>
    </AdminLayout>
  )
}

export async function POST(request: NextRequest) {
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

    console.log("📋 Metadata extracted:", { courseId, userId, planType })

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

    // Si el pago fue aprobado, crear/actualizar la inscripción
    if (paymentInfo.status === "approved") {
      console.log("✅ Payment approved, processing enrollment...")
      console.log("📦 Plan type from metadata:", planType)

      // Calcular fecha de expiración según el plan
      let expiresAt: string | null = null
      if (planType) {
        const now = new Date()
        switch (planType) {
          case "1_month":
            now.setMonth(now.getMonth() + 1)
            expiresAt = now.toISOString()
            console.log("📅 1 month plan - Expires at:", expiresAt)
            break
          case "4_months":
            now.setMonth(now.getMonth() + 4)
            expiresAt = now.toISOString()
            console.log("📅 4 months plan - Expires at:", expiresAt)
            break
          case "8_months":
            now.setMonth(now.getMonth() + 8)
            expiresAt = now.toISOString()
            console.log("📅 8 months plan - Expires at:", expiresAt)
            break
          default:
            console.log("⚠️ Unknown plan type:", planType)
        }
      } else {
        console.log("⚠️ No plan type in metadata, creating unlimited enrollment")
      }

      // Verificar si ya existe una inscripción
      const { data: existingEnrollment } = await supabaseAdmin
        .from("enrollments")
        .select("id, plan_type, expires_at")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .single()

      if (existingEnrollment) {
        console.log("📝 Updating existing enrollment:", existingEnrollment)

        const { data: updatedEnrollment, error: updateError } = await supabaseAdmin
          .from("enrollments")
          .update({
            is_active: true,
            plan_type: planType || null,
            expires_at: expiresAt,
          })
          .eq("id", existingEnrollment.id)
          .select()
          .single()

        if (updateError) {
          console.error("❌ Error updating enrollment:", updateError)
        } else {
          console.log("✅ Enrollment updated successfully:", updatedEnrollment)
        }
      } else {
        console.log("📝 Creating new enrollment with plan:", planType)

        const { data: newEnrollment, error: enrollmentError } = await supabaseAdmin
          .from("enrollments")
          .insert({
            user_id: userId,
            course_id: courseId,
            is_active: true,
            plan_type: planType || null,
            expires_at: expiresAt,
            enrolled_at: new Date().toISOString(),
            progress_percentage: 0,
          })
          .select()
          .single()

        if (enrollmentError) {
          console.error("❌ Error creating enrollment:", enrollmentError)
        } else {
          console.log("✅ Enrollment created successfully:", newEnrollment)
        }
      }
    } else {
      console.log(`⏸️ Payment status is ${paymentInfo.status}, not creating enrollment`)
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

export async function GET() {
  return NextResponse.json({ message: "MercadoPago webhook endpoint" })
}
