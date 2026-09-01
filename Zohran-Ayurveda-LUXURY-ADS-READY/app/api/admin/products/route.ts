import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { supabase } = await requireAdmin();
    const body = await req.json();
    const row = {
      name: body.name,
      slug: body.slug,
      category: body.category,
      description: body.description || null,
      long_description: body.long_description || null,
      image_url: body.image_url || null,
      price_paise: Number(body.price_paise || 0),
      compare_at_price_paise: body.compare_at_price_paise ? Number(body.compare_at_price_paise) : null,
      stock_qty: Number(body.stock_qty || 0),
      is_active: body.is_active !== false
    };
    if (!row.name || !row.slug) return NextResponse.json({ error: "Name and slug are required." }, { status: 400 });
    const { error } = await supabase.from("products").insert(row);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const status = e.message === "UNAUTHORIZED" || e.message === "FORBIDDEN" ? 401 : 500;
    return NextResponse.json({ error: e.message || "Failed" }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const { supabase } = await requireAdmin();
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "Product id is required." }, { status: 400 });
    const { error } = await supabase.from("products").update({
      name: body.name,
      slug: body.slug,
      category: body.category,
      description: body.description || null,
      long_description: body.long_description || null,
      image_url: body.image_url || null,
      price_paise: Number(body.price_paise || 0),
      compare_at_price_paise: body.compare_at_price_paise ? Number(body.compare_at_price_paise) : null,
      stock_qty: Number(body.stock_qty || 0),
      is_active: Boolean(body.is_active)
    }).eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const status = e.message === "UNAUTHORIZED" || e.message === "FORBIDDEN" ? 401 : 500;
    return NextResponse.json({ error: e.message || "Failed" }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Product id is required." }, { status: 400 });
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const status = e.message === "UNAUTHORIZED" || e.message === "FORBIDDEN" ? 401 : 500;
    return NextResponse.json({ error: e.message || "Failed" }, { status });
  }
}
