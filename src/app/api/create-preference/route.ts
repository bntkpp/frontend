import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"
import { createClient } from "@/lib/supabase/server"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST(request: Request) {
  try {
    const { courseId } = await request.json()

    console.log("[MercadoPago] Creating preference for course:", courseId)

    const supabase = await createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[MercadoPago] Auth error:", authError)
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    console.log("[MercadoPago] User authenticated:", user.email)

    // Obtener datos del curso
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single()

    if (courseError || !course) {
      console.error("[MercadoPago] Course error:", courseError)
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
    }

    console.log("[MercadoPago] Course found:", course.title, "Price:", course.price)

    // Validar precio
    const price = Number(course.price)
    if (isNaN(price) || price <= 0) {
      console.error("[MercadoPago] Invalid price:", course.price)
      return NextResponse.json({ error: "Precio inválido" }, { status: 400 })
    }

    // Crear preferencia de pago
    const preference = new Preference(client)
    
    const preferenceBody = {
      items: [
        {
          id: course.id,
          title: course.title,
          description: course.short_description || course.description || "Curso",
          quantity: 1,
          unit_price: price,
          currency_id: "CLP",
        },
      ],
      payer: {
        email: user.email!,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?courseId=${courseId}`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending`,
      },
      auto_return: "approved" as const,
      external_reference: `${user.id}-${courseId}`,
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
      metadata: {
        user_id: user.id,
        course_id: courseId,
      },
    }

    console.log("[MercadoPago] Creating preference with body:", JSON.stringify(preferenceBody, null, 2))

    const preferenceData = await preference.create({
      body: preferenceBody,
    })

    console.log("[MercadoPago] Preference created successfully!")
    console.log("[MercadoPago] Preference ID:", preferenceData.id)
    console.log("[MercadoPago] Init Point:", preferenceData.init_point)

    return NextResponse.json({
      preferenceId: preferenceData.id,
      initPoint: preferenceData.init_point,
    })
  } catch (error: any) {
    console.error("[MercadoPago] Error creating preference:", error.message)
    console.error("[MercadoPago] Error name:", error.name)
    console.error("[MercadoPago] Error cause:", error.cause)
    
    // Capturar más detalles del error
    if (error.cause) {
      console.error("[MercadoPago] Cause message:", error.cause.message)
      console.error("[MercadoPago] Cause details:", error.cause)
    }
    
    return NextResponse.json(
      { 
        error: "Error al procesar el pago. Por favor intenta nuevamente.",
        technical: error.message,
      },
      { status: 500 }
    )
  }
}
