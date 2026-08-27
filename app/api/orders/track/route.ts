import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req:Request){
  try{
    const {orderNumber,email}=await req.json();
    if(!orderNumber||!email) return NextResponse.json({error:"Order number and email are required."},{status:400});
    const supabase=createAdminClient();
    const {data:order,error}=await supabase.from("orders").select("order_number,status,payment_status,total_paise,created_at").eq("order_number",String(orderNumber).trim()).ilike("customer_email",String(email).trim()).maybeSingle();
    if(error) throw error;
    if(!order) return NextResponse.json({error:"We could not find an order with those details."},{status:404});
    return NextResponse.json({order});
  }catch(e:any){return NextResponse.json({error:e.message||"Unable to track order."},{status:500});}
}
