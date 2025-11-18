export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
// Aumentar el tiempo máximo de ejecución (importante para Vercel)
export const maxDuration = 30; // segundos

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Payment } from "mercadopago";

// Usar la misma variable de entorno que en create-preference
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;

const client = new MercadoPagoConfig({
  accessToken: accessToken!,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

// Agregar soporte para GET (MercadoPago a veces hace GET para validar)
export async function GET(req: Request) {
  console.log("✅ Webhook endpoint disponible");
  return NextResponse.json({ status: "ok" });
}

export async function POST(req: Request) {
  try {
    // Log headers para debugging
    const headers = Object.fromEntries(req.headers.entries());
    console.log("📋 Headers recibidos:", headers);

    const body = await req.json();
    console.log("🔔 Webhook recibido:", JSON.stringify(body, null, 2));

    const { type, data, action } = body;

    const paymentId = data?.id;
    if (!paymentId) {
      console.log("❌ Sin paymentId");
      return NextResponse.json({ error: "No payment ID" }, { status: 400 });
    }

    console.log("💳 Procesando pago:", paymentId);

    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id: paymentId });
    console.log("📄 Info de pago:", JSON.stringify(paymentInfo, null, 2));

    const metadata = paymentInfo.metadata;
    const courseId = metadata?.course_id;
    const userId = metadata?.user_id;
    const planType = metadata?.plan_type;
    const months = metadata?.months ? parseInt(metadata.months) : 1;
    const includeQuestions = metadata?.include_questions === "true";
    const questionsPrice = metadata?.questions_price ? parseFloat(metadata.questions_price) : 0;

    if (!courseId || !userId) {
      console.log("❌ Faltan metadatos:", { courseId, userId, metadata });
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    console.log("📊 Metadatos:", { courseId, userId, planType, months, includeQuestions, questionsPrice });

    // Verificar si el pago ya fue procesado
    const { data: existing } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("mercadopago_payment_id", String(paymentId))
      .single();

    if (existing) {
      console.log("⚠️ Pago ya procesado");
      return NextResponse.json({ received: true });
    }

    // Guardar el pago
    const { error: insertError } = await supabaseAdmin.from("payments").insert({
      user_id: userId,
      course_id: courseId,
      amount: paymentInfo.transaction_amount || 0,
      currency: paymentInfo.currency_id || "CLP",
      status: paymentInfo.status || "pending",
      mercadopago_payment_id: String(paymentId),
      payment_method: paymentInfo.payment_method_id || null,
      payment_type: paymentInfo.payment_type_id || null,
      includes_questions_pack: includeQuestions,
      questions_pack_price: includeQuestions ? questionsPrice : null,
    });

    if (insertError) {
      console.error("❌ Error guardando pago:", insertError);
      return NextResponse.json({ error: "DB insert error" }, { status: 500 });
    }

    console.log("✅ Pago guardado correctamente");

    // Si el pago fue aprobado, crear o actualizar la inscripción
    if (paymentInfo.status === "approved") {
      console.log("💰 Pago aprobado, creando inscripción...");

      // Verificar si ya existe una inscripción
      const { data: existingEnrollment } = await supabaseAdmin
        .from("enrollments")
        .select("id, expires_at, is_active")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .maybeSingle();

      if (existingEnrollment) {
        console.log("📝 Inscripción existente encontrada, extendiendo...");
        
        // Calcular nueva fecha de expiración
        const currentExpiry = existingEnrollment.expires_at 
          ? new Date(existingEnrollment.expires_at) 
          : new Date();
        
        // Si la fecha actual ya pasó, usar la fecha actual como base
        const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
        const newExpiry = new Date(baseDate);
        newExpiry.setMonth(newExpiry.getMonth() + months);

        const { error: updateError } = await supabaseAdmin
          .from("enrollments")
          .update({
            expires_at: newExpiry.toISOString(),
            is_active: true,
            plan_type: planType,
          })
          .eq("id", existingEnrollment.id);

        if (updateError) {
          console.error("❌ Error actualizando inscripción:", updateError);
        } else {
          console.log("✅ Inscripción extendida hasta:", newExpiry.toISOString());
        }
      } else {
        console.log("🆕 Creando nueva inscripción...");
        
        // Calcular fecha de expiración
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + months);

        const { error: enrollError } = await supabaseAdmin
          .from("enrollments")
          .insert({
            user_id: userId,
            course_id: courseId,
            enrolled_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            is_active: true,
            plan_type: planType,
            progress_percentage: 0,
          });

        if (enrollError) {
          console.error("❌ Error creando inscripción:", enrollError);
        } else {
          console.log("✅ Inscripción creada exitosamente, expira:", expiresAt.toISOString());
        }
      }
    } else {
      console.log("⏳ Pago no aprobado aún, estado:", paymentInfo.status);
    }

    return NextResponse.json({ received: true, status: paymentInfo.status });
  } catch (err: any) {
    console.error("❌ Error en webhook:", err);
    console.error("Stack:", err.stack);
    
    // Retornar 200 para que MercadoPago no reintente inmediatamente
    // pero logear el error para debugging
    return NextResponse.json({ 
      received: true, 
      error: err.message,
      warning: "Error procesado pero confirmado para evitar reintentos"
    }, { status: 200 });
  }
}

