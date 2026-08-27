import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { supabase } = await requireAdmin();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Upload an image file." }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Maximum image size is 5 MB." }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `products/${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage.from("product-images").upload(path, buffer, {
      contentType: file.type,
      upsert: false
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (e: any) {
    const status = e.message === "UNAUTHORIZED" || e.message === "FORBIDDEN" ? 401 : 500;
    return NextResponse.json({ error: e.message || "Upload failed" }, { status });
  }
}
