"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ImpersonateSessionPage() {
  const [status, setStatus] = useState("Setting up session...");

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const businessName = params.get("business_name");
    const adminUrl = params.get("admin_url");

    if (!accessToken || !refreshToken) {
      setStatus("Invalid session tokens.");
      return;
    }

    const setup = async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        setStatus("Failed to set session: " + error.message);
        return;
      }

      sessionStorage.setItem(
        "rf_impersonating",
        JSON.stringify({ businessName: businessName || "Unknown", adminUrl: adminUrl || "" })
      );

      window.location.href = "/dashboard";
    };

    setup();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#6B7280] text-sm">{status}</p>
      </div>
    </div>
  );
}
