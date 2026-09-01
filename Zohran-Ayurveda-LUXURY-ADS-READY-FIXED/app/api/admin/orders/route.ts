import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

const allowed = new Set(["pending","paid","processing","shipped","delivered","cancelled","payment_failed","payment_review"]);

export async function PATCH(req: Request) {
  try {
    const { supabase } = await requireAdmin();
    const { id, status } = await req.json();
    if (!id || !allowed.has(status)) return NextResponse.json({ error: "Invalid order update." }, { status: 400 });
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const status = e.message === "UNAUTHORIZED" || e.message === "FORBIDDEN" ? 401 : 500;
    return NextResponse.json({ error: e.message || "Failed" }, { status });
  }
}
