import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req:Request) {
  try {
    const {orderId,razorpay_order_id,razorpay_payment_id,razorpay_signature} = await req.json();
    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({error:"Missing payment fields."},{status:400});
    }

    if (!process.env.RAZORPAY_KEY_SECRET) return NextResponse.json({error:"Razorpay server secret is not configured."},{status:503});
    const supabase = createAdminClient();
    const {data:order,error} = await supabase.from("orders").select("id,razorpay_order_id,total_paise").eq("id",orderId).single();
    if (error || !order) return NextResponse.json({error:"Order not found."},{status:404});

    const expected = crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET!)
      .update(`${order.razorpay_order_id}|${razorpay_payment_id}`).digest("hex");

    if (expected.length !== razorpay_signature.length || !crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(razorpay_signature))) {
      return NextResponse.json({error:"Payment signature verification failed."},{status:400});
    }

    const {error:markError} = await supabase.rpc("mark_order_paid",{
      p_order_id:order.id,
      p_payment_id:razorpay_payment_id
    });
    if (markError) throw markError;

    return NextResponse.json({ok:true});
  } catch(e:any) {
    console.error(e);
    return NextResponse.json({error:e.message || "Payment verification failed."},{status:500});
  }
}
