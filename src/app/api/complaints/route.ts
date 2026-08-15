import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function getBusinessForUser(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("businesses")
    .select("id")
    .eq("owner_id", userId)
    .single();
  return data;
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await getBusinessForUser(user.id);
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 403 });

  const body = await req.json();
  const { complaintId, status, business_notes } = body;

  if (!complaintId) {
    return NextResponse.json({ error: "Missing complaint ID" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: complaint } = await admin
    .from("complaints")
    .select("id")
    .eq("id", complaintId)
    .eq("business_id", business.id)
    .single();

  if (!complaint) {
    return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
  }

  const validStatuses = ["open", "in_progress", "resolved", "closed"];
  const updates: Record<string, string> = { updated_at: new Date().toISOString() };
  if (status) {
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updates.status = status;
  }
  if (business_notes !== undefined) {
    updates.business_notes = typeof business_notes === "string" ? business_notes.slice(0, 5000) : "";
  }

  const { error } = await admin
    .from("complaints")
    .update(updates)
    .eq("id", complaintId)
    .eq("business_id", business.id);

  if (error) return NextResponse.json({ error: "Failed to update complaint" }, { status: 500 });

  return NextResponse.json({ success: true });
}
