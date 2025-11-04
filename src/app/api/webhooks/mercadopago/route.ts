export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔔 Webhook recibido:", JSON.stringify(body, null, 2));

    const { type, data } = body;

    if (type !== "payment") {
      console.log("⏭️ No es evento de pago, se ignora.");
      return NextResponse.json({ received: true });
    }

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

    if (!courseId || !userId) {
      console.log("❌ Faltan metadatos:", { courseId, userId });
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("mercadopago_payment_id", String(paymentId))
      .single();

    if (existing) {
      console.log("⚠️ Pago ya procesado");
      return NextResponse.json({ received: true });
    }

    const { error: insertError } = await supabaseAdmin.from("payments").insert({
      user_id: userId,
      course_id: courseId,
      amount: paymentInfo.transaction_amount || 0,
      currency: paymentInfo.currency_id || "CLP",
      status: paymentInfo.status || "pending",
      mercadopago_payment_id: String(paymentId),
      payment_method: paymentInfo.payment_method_id || null,
      payment_type: paymentInfo.payment_type_id || null,
    });

    if (insertError) {
      console.error("❌ Error guardando pago:", insertError);
      return NextResponse.json({ error: "DB insert error" }, { status: 500 });
    }

    console.log("✅ Pago guardado correctamente");
    return NextResponse.json({ received: true, status: paymentInfo.status });
  } catch (err: any) {
    console.error("❌ Error en webhook:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

