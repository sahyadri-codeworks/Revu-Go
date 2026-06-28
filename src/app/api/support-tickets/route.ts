import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function verifySuperAdmin(email: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("super_admins")
    .select("id")
    .eq("email", email)
    .single();
  return !!data;
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const action = req.nextUrl.searchParams.get("action");

  // Super admin: list all tickets
  if (action === "all") {
    const isAdmin = user.email ? await verifySuperAdmin(user.email) : false;
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: tickets } = await admin
      .from("support_tickets")
      .select("*, businesses(name, slug)")
      .order("updated_at", { ascending: false });

    const ticketIds = (tickets || []).map((t) => t.id);
    const { data: messages } = ticketIds.length > 0
      ? await admin.from("ticket_messages").select("*").in("ticket_id", ticketIds).order("created_at")
      : { data: [] };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const msgMap: Record<string, any[]> = {};
    (messages || []).forEach((m: any) => {
      if (!msgMap[m.ticket_id]) msgMap[m.ticket_id] = [];
      msgMap[m.ticket_id].push(m);
    });

    return NextResponse.json({
      tickets: (tickets || []).map((t) => ({ ...t, messages: msgMap[t.id] || [] })),
    });
  }

  // Business owner: list own tickets
  if (action === "my-tickets") {
    const { data: business } = await admin
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!business) return NextResponse.json({ tickets: [] });

    const { data: tickets } = await admin
      .from("support_tickets")
      .select("*")
      .eq("business_id", business.id)
      .order("updated_at", { ascending: false });

    const ticketIds = (tickets || []).map((t) => t.id);
    const { data: messages } = ticketIds.length > 0
      ? await admin
          .from("ticket_messages")
          .select("*")
          .in("ticket_id", ticketIds)
          .eq("is_internal_note", false)
          .order("created_at")
      : { data: [] };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const msgMap: Record<string, any[]> = {};
    (messages || []).forEach((m: any) => {
      if (!msgMap[m.ticket_id]) msgMap[m.ticket_id] = [];
      msgMap[m.ticket_id].push(m);
    });

    return NextResponse.json({
      tickets: (tickets || []).map((t) => ({ ...t, messages: msgMap[t.id] || [] })),
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const body = await req.json();
  const { action } = body;

  // Business owner creates a ticket
  if (action === "create") {
    const { data: business } = await admin
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!business) return NextResponse.json({ error: "No business found" }, { status: 400 });

    const { data: ticket, error } = await admin
      .from("support_tickets")
      .insert({
        business_id: business.id,
        subject: body.subject,
        priority: body.priority || "medium",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Add the initial message
    await admin.from("ticket_messages").insert({
      ticket_id: ticket.id,
      sender_type: "business",
      sender_email: user.email,
      message: body.message,
    });

    return NextResponse.json({ ticket });
  }

  // Business owner replies to a ticket
  if (action === "reply") {
    const { data: business } = await admin
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!business) return NextResponse.json({ error: "No business found" }, { status: 400 });

    // Verify ticket belongs to this business
    const { data: ticket } = await admin
      .from("support_tickets")
      .select("id")
      .eq("id", body.ticketId)
      .eq("business_id", business.id)
      .single();

    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    await admin.from("ticket_messages").insert({
      ticket_id: body.ticketId,
      sender_type: "business",
      sender_email: user.email,
      message: body.message,
    });

    await admin
      .from("support_tickets")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", body.ticketId);

    return NextResponse.json({ success: true });
  }

  // Super admin replies or adds internal note
  if (action === "admin-reply") {
    const isAdmin = user.email ? await verifySuperAdmin(user.email) : false;
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await admin.from("ticket_messages").insert({
      ticket_id: body.ticketId,
      sender_type: "admin",
      sender_email: user.email,
      message: body.message,
      is_internal_note: body.isInternalNote || false,
    });

    await admin
      .from("support_tickets")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", body.ticketId);

    return NextResponse.json({ success: true });
  }

  // Super admin updates ticket status/priority
  if (action === "update-ticket") {
    const isAdmin = user.email ? await verifySuperAdmin(user.email) : false;
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updates: Record<string, string> = { updated_at: new Date().toISOString() };
    if (body.status) updates.status = body.status;
    if (body.priority) updates.priority = body.priority;

    await admin
      .from("support_tickets")
      .update(updates)
      .eq("id", body.ticketId);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
