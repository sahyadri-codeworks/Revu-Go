"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ImpersonateSessionPage() {
  const [status, setStatus] = useState("Setting up session...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const businessName = decodeURIComponent(params.get("business_name") || "");

    if (!accessToken || !refreshToken) {
      setStatus("Invalid session link");
      return;
    }

    const supabase = createClient();
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error }) => {
      if (error) {
        setStatus("Failed to set session: " + error.message);
        return;
      }

      sessionStorage.setItem("rf_impersonating", JSON.stringify({
        businessName,
        adminReturn: "",
      }));

      window.history.replaceState(null, "", "/impersonate-session");
      window.location.href = "/dashboard";
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#9CA3AF] text-sm">{status}</p>
      </div>
    </div>
  );
}
