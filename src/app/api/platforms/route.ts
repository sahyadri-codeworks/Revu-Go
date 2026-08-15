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

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const { data, error } = await supabase
    .from("business_platforms")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: "Failed to load platforms" }, { status: 500 });
  return NextResponse.json({ platforms: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: business } = await supabase
    .from("businesses")
    .select("id, slug")
    .eq("owner_id", user.id)
    .single();
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const body = await req.json();
  const { platform_key, display_name, review_url } = body;

  if (!platform_key || !display_name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (typeof platform_key !== "string" || platform_key.length > 50) {
    return NextResponse.json({ error: "Invalid platform key" }, { status: 400 });
  }

  const sanitizedName = typeof display_name === "string" ? display_name.slice(0, 200) : "";
  const sanitizedUrl = typeof review_url === "string" ? review_url.slice(0, 2000) : "";

  const { data: existing } = await supabase
    .from("business_platforms")
    .select("id")
    .eq("business_id", business.id)
    .eq("platform_key", platform_key)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Platform already connected" }, { status: 409 });
  }

  let qrCodeId = generateQRCodeId();
  let foundUnique = false;
  for (let attempts = 0; attempts < 10; attempts++) {
    const { data: clash } = await supabase
      .from("business_platforms")
      .select("id")
      .eq("qr_code_id", qrCodeId)
      .single();
    if (!clash) { foundUnique = true; break; }
    qrCodeId = generateQRCodeId();
  }
  if (!foundUnique) {
    return NextResponse.json({ error: "Could not generate unique QR code. Please try again." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("business_platforms")
    .insert({
      business_id: business.id,
      platform_key,
      display_name: sanitizedName,
      review_url: sanitizedUrl,
      qr_code_id: qrCodeId,
      is_connected: !!sanitizedUrl,
      qr_enabled: !!sanitizedUrl,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: "Failed to add platform" }, { status: 500 });
  return NextResponse.json({ platform: data });
}
