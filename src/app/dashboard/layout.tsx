"use client";

import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { LaunchCampaignModal } from "@/components/dashboard/LaunchCampaignModal";
import { Star, ShieldAlert, LogOut, Ban, CircleHelp, Building2, ArrowRight } from "lucide-react";
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
  "/dashboard/help": "Help & Support",
  "/dashboard/register-business": "Register Business",
};

const pageDescriptions: Record<string, string> = {
  "/dashboard": "Business intelligence at a glance",
  "/dashboard/campaigns": "Manage reward campaigns and customer incentives",
  "/dashboard/reviews": "Monitor and respond to customer feedback",
  "/dashboard/coupons": "Verify and redeem customer reward coupons",
  "/dashboard/analytics": "Deep insights into your review performance",
  "/dashboard/qr": "Generate and manage branded QR flyers",
  "/dashboard/settings": "Configure your business profile",
  "/dashboard/help": "Raise issues related to the platform",
  "/dashboard/register-business": "Set up your business profile to get started",
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
  const [impersonating, setImpersonating] = useState<{ businessName: string; adminUrl?: string } | null>(null);

  useEffect(() => {
    try {
      const imp = sessionStorage.getItem("rf_impersonating");
      if (imp) setImpersonating(JSON.parse(imp));
    } catch {}
  }, []);

  const exitImpersonation = async () => {
    const adminUrl = impersonating?.adminUrl;
    sessionStorage.removeItem("rf_impersonating");
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    sessionStorage.removeItem("rf_admin_session");
    await supabase.auth.signOut();
    if (adminUrl) {
      window.location.href = adminUrl;
    } else {
      window.close();
    }
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

  const restrictedPaths = [
    "/dashboard/campaigns",
    "/dashboard/reviews",
    "/dashboard/coupons",
    "/dashboard/qr",
    "/dashboard/complaints",
    "/dashboard/analytics",
  ];
  const isRestrictedPage = needsOnboarding && restrictedPaths.includes(pathname);

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
                {/* Help button */}
                <button
                  onClick={() => router.push("/dashboard/help")}
                  className="w-9 h-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#9CA3AF] hover:text-[#7C3AED] hover:border-[#7C3AED]/30 hover:bg-[#7C3AED]/5 transition-all"
                  title="Help & Support"
                >
                  <CircleHelp className="w-[18px] h-[18px]" />
                </button>
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

          {/* Onboarding banner */}
          {needsOnboarding && pathname !== "/dashboard/register-business" && (
            <div className="mx-5 sm:mx-8 mt-5 p-4 rounded-xl bg-gradient-to-r from-[#7C3AED]/5 to-[#6D28D9]/5 border border-[#7C3AED]/15">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[14px] font-semibold text-[#111] mb-1">Complete your business registration</h3>
                  <p className="text-[12px] text-[#6B7280] leading-relaxed">
                    Complete your business registration to start creating campaigns, QR codes, coupons, and collecting customer reviews.
                  </p>
                  <button
                    onClick={() => router.push("/dashboard/register-business")}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-[12px] font-semibold hover:bg-[#6D28D9] transition-colors"
                  >
                    Register Business <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Page content */}
          <div className="p-5 sm:p-8">
            {isRestrictedPage ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/10 flex items-center justify-center mb-5">
                  <Building2 className="w-8 h-8 text-[#7C3AED]" />
                </div>
                <h2 className="text-[18px] font-bold text-[#111] mb-2">Business Required</h2>
                <p className="text-[13px] text-[#6B7280] text-center max-w-sm mb-6">
                  Please register your business first to access this feature.
                </p>
                <button
                  onClick={() => router.push("/dashboard/register-business")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white text-[13px] font-bold hover:bg-[#6D28D9] transition-colors"
                >
                  <Building2 className="w-4 h-4" /> Register Business
                </button>
              </div>
            ) : (
              children
            )}
          </div>
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
