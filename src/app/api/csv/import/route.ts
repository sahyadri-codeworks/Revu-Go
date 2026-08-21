import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function getBusinessId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  return data?.id || null;
}

export async function POST(req: NextRequest) {
  const businessId = await getBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { module, records } = body;

  if (!module || !Array.isArray(records) || records.length === 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (records.length > 500) {
    return NextResponse.json({ error: "Maximum 500 records per import" }, { status: 400 });
  }

  const admin = createAdminClient();
  let success = 0;
  let failed = 0;

  if (module === "reviews") {
    for (const rec of records) {
      const starRating = Math.min(5, Math.max(1, parseInt(rec.star_rating) || 0));
      if (!starRating || !rec.selected_review_text?.trim()) {
        failed++;
        continue;
      }

      const { error } = await admin.from("review_sessions").insert({
        business_id: businessId,
        star_rating: starRating,
        selected_review_text: rec.selected_review_text.trim().slice(0, 5000),
        session_token: rec.session_token?.trim() || `import-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        mcq_answers: {},
        campaign_id: null,
      });

      if (error) failed++;
      else success++;
    }
  } else if (module === "complaints") {
    for (const rec of records) {
      const starRating = Math.min(5, Math.max(1, parseInt(rec.star_rating) || 0));
      if (!starRating || !rec.complaint_text?.trim()) {
        failed++;
        continue;
      }

      const validStatuses = ["open", "in_progress", "resolved", "closed"];
      const status = validStatuses.includes(rec.status?.toLowerCase()) ? rec.status.toLowerCase() : "open";
      const isAnon = rec.is_anonymous?.toLowerCase() === "true" || rec.is_anonymous === "1";

      const { error } = await admin.from("complaints").insert({
        business_id: businessId,
        complaint_text: rec.complaint_text.trim().slice(0, 5000),
        star_rating: starRating,
        status,
        is_anonymous: isAnon,
        contact_name: rec.contact_name?.trim().slice(0, 200) || null,
        contact_email: rec.contact_email?.trim().slice(0, 320) || null,
        contact_phone: rec.contact_phone?.trim().slice(0, 20) || null,
        consent_given: false,
        business_notes: rec.business_notes?.trim().slice(0, 5000) || null,
      });

      if (error) failed++;
      else success++;
    }
  } else if (module === "coupons") {
    const { data: campaigns } = await admin
      .from("campaigns")
      .select("id")
      .eq("business_id", businessId)
      .limit(1);
    const defaultCampaignId = campaigns?.[0]?.id || null;

    for (const rec of records) {
      if (!rec.coupon_code?.trim() || !rec.reward_value?.trim() || !rec.expires_at) {
        failed++;
        continue;
      }

      const expiresAt = new Date(rec.expires_at);
      if (isNaN(expiresAt.getTime())) {
        failed++;
        continue;
      }

      const isRedeemed = rec.is_redeemed?.toLowerCase() === "true" || rec.is_redeemed === "1";
      const issuedAt = rec.issued_at ? new Date(rec.issued_at) : new Date();

      const { data: existing } = await admin
        .from("coupons")
        .select("id")
        .eq("business_id", businessId)
        .eq("coupon_code", rec.coupon_code.trim().toUpperCase())
        .single();

      if (existing) {
        failed++;
        continue;
      }

      const { error } = await admin.from("coupons").insert({
        business_id: businessId,
        campaign_id: defaultCampaignId,
        coupon_code: rec.coupon_code.trim().toUpperCase(),
        reward_type: rec.reward_type?.trim() || "own_discount",
        reward_value: rec.reward_value.trim().slice(0, 500),
        is_redeemed: isRedeemed,
        issued_at: issuedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      });

      if (error) failed++;
      else success++;
    }
  } else {
    return NextResponse.json({ error: "Unknown module" }, { status: 400 });
  }

  return NextResponse.json({ success, failed });
}
