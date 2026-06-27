"use client";

import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { LaunchCampaignModal } from "@/components/dashboard/LaunchCampaignModal";
import { RegisterClientModal } from "@/components/dashboard/RegisterClientModal";
import { Star, ShieldAlert, LogOut, Ban } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { useAppState } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const pageNames: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/campaigns": "Campaigns",
  "/dashboard/reviews": "Review Inbox",
  "/dashboard/coupons": "Verify Coupons",
  "/dashboard/analytics": "Analytics",
  "/dashboard/qr": "QR Flyer Manager",
  "/dashboard/settings": "Profile Settings",
};

const pageDescriptions: Record<string, string> = {
  "/dashboard": "Business intelligence at a glance",
  "/dashboard/campaigns": "Manage reward campaigns and customer incentives",
  "/dashboard/reviews": "Monitor and respond to customer feedback",
  "/dashboard/coupons": "Verify and redeem customer reward coupons",
  "/dashboard/analytics": "Deep insights into your review performance",
  "/dashboard/qr": "Generate and manage branded QR flyers",
  "/dashboard/settings": "Configure your business profile",
};

interface CampaignModalContextType {
  openModal: () => void;
}

export const CampaignModalContext = createContext<CampaignModalContextType>({
  openModal: () => {},
});

export function useCampaignModal() {
  return useContext(CampaignModalContext);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const { sessions, addCampaign, needsOnboarding, loading: appLoading, registerBusiness, business } = useAppState();

  const openModal = useCallback(() => setCampaignModalOpen(true), []);
  const [impersonating, setImpersonating] = useState<{ businessName: string; adminReturn: string } | null>(null);

  useEffect(() => {
    try {
      const imp = sessionStorage.getItem("rf_impersonating");
      if (imp) setImpersonating(JSON.parse(imp));
    } catch {}
  }, []);

  const exitImpersonation = async () => {
    sessionStorage.removeItem("rf_impersonating");
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.close();
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || appLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show onboarding modal if no business exists
  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="text-center max-w-md">
            <img src="/logo-name.png" alt="RevuGo" className="h-20 object-contain mx-auto mb-5 mix-blend-multiply" />
            <h1 className="text-[22px] font-bold text-[#111] mb-2">Welcome to RevuGo</h1>
            <p className="text-[13px] text-[#6B7280] mb-6 leading-relaxed">
              Set up your business profile to get started with campaigns, reviews, and rewards.
            </p>
          </div>
        </div>
        <RegisterClientModal
          open={true}
          onClose={() => {}}
          onRegister={async (data) => {
            await registerBusiness(data);
            toast.success(`Business "${data.businessName}" created successfully!`, {
              style: {
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                color: "#111",
              },
            });
          }}
        />
      </div>
    );
  }

  const isSuspended = business && !business.is_active;

  if (isSuspended && !impersonating) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#FEF2F2] flex items-center justify-center mx-auto mb-5">
            <Ban className="w-8 h-8 text-[#EF4444]" />
          </div>
          <h1 className="text-[20px] font-bold text-[#111] mb-2">Account Suspended</h1>
          <p className="text-[14px] text-[#6B7280] mb-2 leading-relaxed">
            Your business account <strong className="text-[#111]">{business.name}</strong> has been suspended by the administrator.
          </p>
          <p className="text-[13px] text-[#9CA3AF] mb-6">
            Please contact support for more information or to resolve this issue.
          </p>
          <div className="flex flex-col gap-3">
            <a href="mailto:support@revugo.in" className="w-full py-3 rounded-xl border border-[#E5E7EB] text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors inline-block">
              Contact Support
            </a>
            <button
              onClick={async () => { await signOut(); router.push("/login"); }}
              className="w-full py-3 rounded-xl bg-[#EF4444] text-white text-[13px] font-bold hover:bg-[#DC2626] transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const avgRating =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.star_rating, 0) / sessions.length
      : 0;

  const pageName = pageNames[pathname] || "Dashboard";
  const pageDesc = pageDescriptions[pathname] || "";

  const handleDeploy = async (data: {
    title: string;
    offerText: string;
    couponPrefix: string;
    maxPayouts: number;
    expiry: string;
  }) => {
    await addCampaign(data);
    setCampaignModalOpen(false);
    toast.success(`Campaign "${data.title}" deployed successfully`, {
      style: {
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        color: "#111",
      },
    });
    router.push("/dashboard/campaigns");
  };

  return (
    <CampaignModalContext.Provider value={{ openModal }}>
      <div className="min-h-screen bg-[#F8FAFB]">
        <DashboardNav />

        <main className="lg:ml-[272px] pt-14 lg:pt-0 relative z-10">
          {/* Impersonation banner */}
          {impersonating && (
            <div className="bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] px-4 py-2.5 flex items-center justify-between gap-3 relative z-40">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-white/90 flex-shrink-0" />
                <span className="text-[12px] text-white font-medium">
                  You are currently impersonating <strong>{impersonating.businessName}</strong>
                </span>
              </div>
              <button
                onClick={exitImpersonation}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold transition-colors flex-shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" /> Exit Impersonation
              </button>
            </div>
          )}
          {/* Premium top bar */}
          <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between px-6 sm:px-8 h-[56px]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <h1 className="text-[15px] text-[#111] font-semibold tracking-[-0.01em]">{pageName}</h1>
                  {pageDesc && (
                    <>
                      <span className="text-[#D1D5DB] mx-1">/</span>
                      <p className="text-[12px] text-[#9CA3AF] font-normal hidden sm:block">{pageDesc}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Avg rating */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#7C3AED]/15 bg-[#7C3AED]/5">
                  <Star className="w-4 h-4 text-[#7C3AED] fill-[#7C3AED]" />
                  <span className="text-[14px] text-[#7C3AED] font-bold tabular-nums tracking-tight">
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-[11px] text-[#6B7280] font-medium uppercase tracking-wider">Avg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="p-5 sm:p-8">{children}</div>
        </main>

        {/* Campaign modal */}
        <LaunchCampaignModal
          open={campaignModalOpen}
          onClose={() => setCampaignModalOpen(false)}
          onDeploy={handleDeploy}
        />
      </div>
    </CampaignModalContext.Provider>
  );
}
