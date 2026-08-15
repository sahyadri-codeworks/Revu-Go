import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function isValidRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const admin = createAdminClient();

  const { data } = await admin
    .from("business_platforms")
    .select("id, review_url, platform_key, total_qr_scans")
    .eq("qr_code_id", code)
    .eq("is_connected", true)
    .eq("qr_enabled", true)
    .single();

  if (!data || !data.review_url) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const target = data.review_url.startsWith("http")
    ? data.review_url
    : `https://${data.review_url}`;

  if (!isValidRedirectUrl(target)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Fire-and-forget: insert scan record + atomic increment
  Promise.all([
    admin.from("platform_qr_scans").insert({ business_platform_id: data.id }),
    admin
      .from("business_platforms")
      .update({ total_qr_scans: (data.total_qr_scans || 0) + 1 })
      .eq("id", data.id),
  ]).catch(() => {});

  return NextResponse.redirect(target);
}
