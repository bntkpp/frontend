import { NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

const planLabels: Record<string, string> = {
  "1_month": "Plan Mensual",
  "4_months": "Plan 4 Meses",
  "8_months": "Plan 8 Meses",
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseId, userId, plan, price, months, includeQuestions, questionsPrice, totalPrice } = body

    console.log("Creating preference:", { courseId, userId, plan, price, months, includeQuestions, questionsPrice })

    if (!courseId || !userId || !plan || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Usar la variable que ya tienes
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!accessToken) {
      console.error("MERCADO_PAGO_ACCESS_TOKEN not configured")
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 500 }
      )
    }

    const client = new MercadoPagoConfig({
      accessToken: accessToken,
    })

    // Get course name from Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const courseResponse = await fetch(
      `${supabaseUrl}/rest/v1/courses?id=eq.${courseId}&select=title`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    )

    const courses = await courseResponse.json()
    const courseTitle = courses[0]?.title || "Curso"

    const preference = new Preference(client)

    // Build items array with course and optional questions addon
    const items = [
      {
        id: courseId,
        title: `${courseTitle} - ${planLabels[plan]}`,
        description: `Acceso al curso por ${months} ${months === 1 ? "mes" : "meses"}`,
        quantity: 1,
        unit_price: Number(price),
        currency_id: "CLP",
      },
    ]

    // Add questions addon if selected
    if (includeQuestions && questionsPrice > 0) {
      items.push({
        id: `${courseId}-questions`,
        title: `Banco de Preguntas - ${courseTitle}`,
        description: "Preguntas tipo prueba para practicar",
        quantity: 1,
        unit_price: Number(questionsPrice),
        currency_id: "CLP",
      })
    }

    const preferenceData = {
      items: items,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?courseId=${courseId}&plan=${plan}`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending`,
      },
      auto_return: "approved" as const,
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/mercadopago`,
      metadata: {
        course_id: courseId,
        user_id: userId,
        plan_type: plan, // IMPORTANTE: Asegúrate que esto se envíe
        months: months.toString(),
        include_questions: includeQuestions ? "true" : "false",
        questions_price: includeQuestions ? questionsPrice.toString() : "0",
      },
    }

    console.log("Preference data:", JSON.stringify(preferenceData, null, 2))

    const response = await preference.create({
      body: preferenceData,
    })

    console.log("Preference created:", response.id)

    return NextResponse.json({
      preferenceId: response.id,
      initPoint: response.init_point,
    })
  } catch (error: any) {
    console.error("Error creating preference:", error)
    console.error("Error details:", error.message, error.cause)
    
    return NextResponse.json(
      { 
        error: "Error al crear la preferencia de pago",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    )
  }
}
