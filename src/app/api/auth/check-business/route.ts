import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ isBusinessUser: false });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("super_admins")
    .select("id")
    .eq("email", user.email)
    .single();

  return NextResponse.json({ isBusinessUser: !data });
}
