import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const admin = createAdminClient();

    if (action === "create-session") {
      const { business_id, campaign_id, star_rating, mcq_answers, selected_review_text, session_token } = body;
      if (!business_id || !campaign_id || !star_rating || !session_token) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const { data, error } = await admin
        .from("review_sessions")
        .insert({
          business_id,
          campaign_id,
          star_rating,
          mcq_answers: mcq_answers || {},
          selected_review_text: selected_review_text || "",
          session_token,
          token_status: "PENDING",
        })
        .select("id")
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ id: data.id });
    }

    if (action === "create-coupon") {
      const { session_id, business_id, campaign_id, coupon_code, reward_type, reward_value, expires_at } = body;
      if (!business_id || !campaign_id || !coupon_code) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const { error } = await admin.from("coupons").insert({
        session_id,
        business_id,
        campaign_id,
        coupon_code,
        reward_type: reward_type || "own_discount",
        reward_value: reward_value || "",
        is_redeemed: false,
        issued_at: new Date().toISOString(),
        expires_at,
      });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const { count } = await admin
        .from("coupons")
        .select("*", { count: "exact", head: true })
        .eq("campaign_id", campaign_id);

      await admin
        .from("campaigns")
        .update({ redeemed_count: count ?? 0 })
        .eq("id", campaign_id);

      return NextResponse.json({ ok: true });
    }

    if (action === "submit-feedback") {
      const { business_id, campaign_id, star_rating, feedback_text } = body;
      if (!business_id || !campaign_id || !star_rating) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const { error } = await admin.from("private_feedback").insert({
        business_id,
        campaign_id,
        star_rating,
        feedback_text: feedback_text || "",
        is_read: false,
      });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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

      const { data, error } = await admin.from("complaints").insert({
        business_id,
        campaign_id: campaign_id || null,
        star_rating: star_rating || 1,
        complaint_text,
        is_anonymous: is_anonymous ?? true,
        contact_name: is_anonymous ? null : (contact_name || null),
        contact_email: is_anonymous ? null : (contact_email || null),
        contact_phone: is_anonymous ? null : (contact_phone || null),
        consent_given: consent_given || false,
        session_token: session_token || null,
        mcq_answers: mcq_answers || {},
        status: "open",
      }).select("id").single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ id: data.id, ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
