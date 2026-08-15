import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const admin = createAdminClient();

  const { data } = await admin
    .from("business_platforms")
    .select("id, review_url, platform_key")
    .eq("qr_code_id", code)
    .eq("is_connected", true)
    .eq("qr_enabled", true)
    .single();

  if (!data || !data.review_url) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  await admin.from("platform_qr_scans").insert({
    business_platform_id: data.id,
  });

  const { count } = await admin
    .from("platform_qr_scans")
    .select("*", { count: "exact", head: true })
    .eq("business_platform_id", data.id);

  await admin
    .from("business_platforms")
    .update({ total_qr_scans: count ?? 0 })
    .eq("id", data.id);

  const target = data.review_url.startsWith("http")
    ? data.review_url
    : `https://${data.review_url}`;
  return NextResponse.redirect(target);
}
