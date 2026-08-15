import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function generateQRCodeId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const { data: platform } = await supabase
    .from("business_platforms")
    .select("id")
    .eq("id", id)
    .eq("business_id", business.id)
    .single();
  if (!platform) return NextResponse.json({ error: "Platform not found" }, { status: 404 });

  const body = await req.json();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.display_name !== undefined) {
    updates.display_name = typeof body.display_name === "string" ? body.display_name.slice(0, 200) : "";
  }
  if (body.review_url !== undefined) {
    updates.review_url = typeof body.review_url === "string" ? body.review_url.slice(0, 2000) : "";
  }
  if (body.is_connected !== undefined) {
    updates.is_connected = !!body.is_connected;
  }
  if (body.qr_enabled !== undefined) {
    updates.qr_enabled = !!body.qr_enabled;
  }
  if (body.avg_rating !== undefined) {
    const r = Number(body.avg_rating);
    updates.avg_rating = isNaN(r) ? null : Math.max(0, Math.min(5, r));
  }
  if (body.total_reviews !== undefined) {
    const n = Number(body.total_reviews);
    updates.total_reviews = isNaN(n) ? 0 : Math.max(0, Math.floor(n));
  }

  if (body.regenerate_qr) {
    let newQrId = generateQRCodeId();
    let attempts = 0;
    while (attempts < 5) {
      const { data: clash } = await supabase
        .from("business_platforms")
        .select("id")
        .eq("qr_code_id", newQrId)
        .single();
      if (!clash) break;
      newQrId = generateQRCodeId();
      attempts++;
    }
    updates.qr_code_id = newQrId;
  }

  const { data, error } = await supabase
    .from("business_platforms")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: "Failed to update platform" }, { status: 500 });
  return NextResponse.json({ platform: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const { error } = await supabase
    .from("business_platforms")
    .delete()
    .eq("id", id)
    .eq("business_id", business.id);

  if (error) return NextResponse.json({ error: "Failed to remove platform" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
