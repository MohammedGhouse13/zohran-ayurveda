import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req:Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return NextResponse.json({error:"Webhook is not configured."},{status:503});
  const expected = crypto.createHmac("sha256",secret).update(raw).digest("hex");

  if (expected.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(signature))) {
    return NextResponse.json({error:"Invalid webhook signature"},{status:400});
  }

  const event = JSON.parse(raw);
  const supabase = createAdminClient();

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload?.payment?.entity;
    const orderRz = payment?.order_id || event.payload?.order?.entity?.id;
    const paymentId = payment?.id || null;
    if (orderRz) {
      const {data:order} = await supabase.from("orders").select("id").eq("razorpay_order_id",orderRz).maybeSingle();
      if (order) {
        await supabase.rpc("mark_order_paid",{p_order_id:order.id,p_payment_id:paymentId});
      }
    }
  }

  if (event.event === "payment.failed") {
    const payment = event.payload?.payment?.entity;
    const orderRz = payment?.order_id;
    if (orderRz) await supabase.from("orders").update({payment_status:"failed",status:"payment_failed"}).eq("razorpay_order_id",orderRz);
  }

  return NextResponse.json({ok:true});
}
