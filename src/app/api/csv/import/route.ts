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

const VALID_MODULES = ["reviews", "complaints", "coupons"];

export async function POST(req: NextRequest) {
  const businessId = await getBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { module, records } = body;

  if (!module || !VALID_MODULES.includes(module) || !Array.isArray(records) || records.length === 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (records.length > 500) {
    return NextResponse.json({ error: "Maximum 500 records per import" }, { status: 400 });
  }

  const admin = createAdminClient();
  let success = 0;
  let failed = 0;

  if (module === "reviews") {
    const validRows: Record<string, unknown>[] = [];
    for (const rec of records) {
      const starRating = Math.min(5, Math.max(1, parseInt(rec.star_rating) || 0));
      if (!starRating || !rec.selected_review_text?.trim()) { failed++; continue; }
      validRows.push({
        business_id: businessId,
        star_rating: starRating,
        selected_review_text: rec.selected_review_text.trim().slice(0, 5000),
        session_token: rec.session_token?.trim() || `import-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        mcq_answers: {},
        campaign_id: null,
      });
    }
    if (validRows.length > 0) {
      const { error, data } = await admin.from("review_sessions").insert(validRows).select("id");
      if (error) { failed += validRows.length; }
      else { success = data?.length || 0; failed += validRows.length - success; }
    }
  } else if (module === "complaints") {
    const validRows: Record<string, unknown>[] = [];
    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    for (const rec of records) {
      const starRating = Math.min(5, Math.max(1, parseInt(rec.star_rating) || 0));
      if (!starRating || !rec.complaint_text?.trim()) { failed++; continue; }
      const status = validStatuses.includes(rec.status?.toLowerCase()) ? rec.status.toLowerCase() : "open";
      const isAnon = rec.is_anonymous?.toLowerCase() === "true" || rec.is_anonymous === "1";
      validRows.push({
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
    }
    if (validRows.length > 0) {
      const { error, data } = await admin.from("complaints").insert(validRows).select("id");
      if (error) { failed += validRows.length; }
      else { success = data?.length || 0; failed += validRows.length - success; }
    }
  } else if (module === "coupons") {
    const { data: campaigns } = await admin
      .from("campaigns")
      .select("id")
      .eq("business_id", businessId)
      .limit(1);
    const defaultCampaignId = campaigns?.[0]?.id || null;

    const validRows: Record<string, unknown>[] = [];
    const codes = new Set<string>();
    for (const rec of records) {
      if (!rec.coupon_code?.trim() || !rec.reward_value?.trim() || !rec.expires_at) { failed++; continue; }
      const expiresAt = new Date(rec.expires_at);
      if (isNaN(expiresAt.getTime())) { failed++; continue; }
      const code = rec.coupon_code.trim().toUpperCase();
      if (codes.has(code)) { failed++; continue; }
      codes.add(code);
      const isRedeemed = rec.is_redeemed?.toLowerCase() === "true" || rec.is_redeemed === "1";
      const issuedAt = rec.issued_at ? new Date(rec.issued_at) : new Date();
      validRows.push({
        business_id: businessId,
        campaign_id: defaultCampaignId,
        coupon_code: code,
        reward_type: rec.reward_type?.trim() || "own_discount",
        reward_value: rec.reward_value.trim().slice(0, 500),
        is_redeemed: isRedeemed,
        issued_at: issuedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      });
    }

    if (validRows.length > 0) {
      const { data: existingCoupons } = await admin
        .from("coupons")
        .select("coupon_code")
        .eq("business_id", businessId)
        .in("coupon_code", validRows.map((r) => r.coupon_code as string));

      const existingCodes = new Set((existingCoupons || []).map((c) => c.coupon_code));
      const newRows = validRows.filter((r) => {
        if (existingCodes.has(r.coupon_code as string)) { failed++; return false; }
        return true;
      });

      if (newRows.length > 0) {
        const { error, data } = await admin.from("coupons").insert(newRows).select("id");
        if (error) { failed += newRows.length; }
        else { success = data?.length || 0; failed += newRows.length - success; }
      }
    }
  }

  return NextResponse.json({ success, failed });
}
