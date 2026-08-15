import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_SESSIONS_PER_HOUR = 20;

function generateCouponCode(prefix: string): string {
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${suffix}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const admin = createAdminClient();

    if (action === "create-session") {
      const { business_id, campaign_id, star_rating, mcq_answers, selected_review_text, session_token } = body;
      if (!business_id || !star_rating || !session_token) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const { data: biz } = await admin.from("businesses").select("id").eq("id", business_id).single();
      if (!biz) return NextResponse.json({ error: "Invalid business" }, { status: 400 });

      if (campaign_id) {
        const { data: camp } = await admin.from("campaigns").select("id, is_active").eq("id", campaign_id).eq("business_id", business_id).single();
        if (!camp || !camp.is_active) return NextResponse.json({ error: "Invalid campaign" }, { status: 400 });
      }

      const { data: countResult } = await admin.rpc("count_recent_sessions", {
        p_business_id: business_id,
        p_minutes: 60,
      });
      if (typeof countResult === "number" && countResult >= MAX_SESSIONS_PER_HOUR) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
      }

      const sanitizedReview = typeof selected_review_text === "string"
        ? selected_review_text.slice(0, 2000)
        : "";

      const { data, error } = await admin
        .from("review_sessions")
        .insert({
          business_id,
          campaign_id: campaign_id || null,
          star_rating: Math.max(1, Math.min(5, Number(star_rating) || 1)),
          mcq_answers: mcq_answers || {},
          selected_review_text: sanitizedReview,
          session_token,
          token_status: "PENDING",
        })
        .select("id")
        .single();

      if (error) return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
      return NextResponse.json({ id: data.id });
    }

    if (action === "create-coupon") {
      const { session_id, business_id, campaign_id } = body;
      if (!business_id || !campaign_id || !session_id) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const { data: session } = await admin
        .from("review_sessions")
        .select("id, business_id")
        .eq("id", session_id)
        .single();
      if (!session || session.business_id !== business_id) {
        return NextResponse.json({ error: "Invalid session" }, { status: 400 });
      }

      const { data: existingCoupon } = await admin
        .from("coupons")
        .select("id")
        .eq("session_id", session_id)
        .single();
      if (existingCoupon) {
        return NextResponse.json({ error: "Coupon already issued for this session" }, { status: 409 });
      }

      const { data: campaignData } = await admin
        .from("campaigns")
        .select("coupon_prefix, reward_type, offer_text, max_redemptions, redeemed_count, expires_at, is_active")
        .eq("id", campaign_id)
        .eq("business_id", business_id)
        .single();

      if (!campaignData || !campaignData.is_active) {
        return NextResponse.json({ error: "Invalid campaign" }, { status: 400 });
      }

      if (campaignData.max_redemptions && (campaignData.redeemed_count || 0) >= campaignData.max_redemptions) {
        return NextResponse.json({ error: "Campaign limit reached" }, { status: 409 });
      }

      const couponCode = generateCouponCode(campaignData.coupon_prefix);

      const { error } = await admin.from("coupons").insert({
        session_id,
        business_id,
        campaign_id,
        coupon_code: couponCode,
        reward_type: campaignData.reward_type || "own_discount",
        reward_value: campaignData.offer_text || "",
        is_redeemed: false,
        issued_at: new Date().toISOString(),
        expires_at: campaignData.expires_at,
      });

      if (error) return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });

      const { count } = await admin
        .from("coupons")
        .select("*", { count: "exact", head: true })
        .eq("campaign_id", campaign_id);

      await admin
        .from("campaigns")
        .update({ redeemed_count: count ?? 0 })
        .eq("id", campaign_id);

      return NextResponse.json({ ok: true, coupon_code: couponCode });
    }

    if (action === "submit-feedback") {
      const { business_id, campaign_id, star_rating, feedback_text } = body;
      if (!business_id || !star_rating) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const { data: biz } = await admin.from("businesses").select("id").eq("id", business_id).single();
      if (!biz) return NextResponse.json({ error: "Invalid business" }, { status: 400 });

      const sanitizedFeedback = typeof feedback_text === "string"
        ? feedback_text.slice(0, 5000)
        : "";

      const { error } = await admin.from("private_feedback").insert({
        business_id,
        campaign_id: campaign_id || null,
        star_rating: Math.max(1, Math.min(5, Number(star_rating) || 1)),
        feedback_text: sanitizedFeedback,
        is_read: false,
      });

      if (error) return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (action === "submit-complaint") {
      const {
        business_id, campaign_id, star_rating, complaint_text,
        is_anonymous, contact_name, contact_email, contact_phone,
        consent_given, session_token, mcq_answers,
      } = body;
      if (!business_id || !complaint_text) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const { data: biz } = await admin.from("businesses").select("id").eq("id", business_id).single();
      if (!biz) return NextResponse.json({ error: "Invalid business" }, { status: 400 });

      const sanitizedComplaint = typeof complaint_text === "string"
        ? complaint_text.slice(0, 5000)
        : "";

      const { data, error } = await admin.from("complaints").insert({
        business_id,
        campaign_id: campaign_id || null,
        star_rating: Math.max(1, Math.min(5, Number(star_rating) || 1)),
        complaint_text: sanitizedComplaint,
        is_anonymous: is_anonymous ?? true,
        contact_name: is_anonymous ? null : (typeof contact_name === "string" ? contact_name.slice(0, 200) : null),
        contact_email: is_anonymous ? null : (typeof contact_email === "string" ? contact_email.slice(0, 200) : null),
        contact_phone: is_anonymous ? null : (typeof contact_phone === "string" ? contact_phone.slice(0, 50) : null),
        consent_given: consent_given || false,
        session_token: session_token || null,
        mcq_answers: mcq_answers || {},
        status: "open",
      }).select("id").single();

      if (error) return NextResponse.json({ error: "Failed to submit complaint" }, { status: 500 });

      await admin.from("notifications").insert({
        recipient_id: business_id,
        recipient_type: "business",
        type: "complaint",
        title: `New ${star_rating}-star concern`,
        message: sanitizedComplaint.slice(0, 200),
        reference_id: data.id,
        reference_type: "complaint",
      });

      const { data: admins } = await admin.from("super_admins").select("id");
      if (admins && admins.length > 0) {
        await admin.from("notifications").insert(
          admins.map((a: { id: string }) => ({
            recipient_id: a.id,
            recipient_type: "admin",
            type: "complaint",
            title: `Customer complaint (${star_rating}-star)`,
            message: sanitizedComplaint.slice(0, 200),
            reference_id: data.id,
            reference_type: "complaint",
          }))
        );
      }

      return NextResponse.json({ id: data.id, ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
