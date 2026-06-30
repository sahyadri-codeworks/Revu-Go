"use client";

import { RegisterClientModal } from "@/components/dashboard/RegisterClientModal";
import { useAppState } from "@/lib/app-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect } from "react";

export default function RegisterBusinessPage() {
  const { needsOnboarding, registerBusiness, business } = useAppState();
  const router = useRouter();

  useEffect(() => {
    if (!needsOnboarding && business) {
      router.replace("/dashboard");
    }
  }, [needsOnboarding, business, router]);

  if (!needsOnboarding && business) {
    return null;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mb-8">
        <img src="/logo-name.png" alt="RevuGo" className="h-20 object-contain mx-auto mb-5 mix-blend-multiply" />
        <h1 className="text-[22px] font-bold text-[#111] mb-2">Welcome to RevuGo</h1>
        <p className="text-[13px] text-[#6B7280] mb-6 leading-relaxed">
          Set up your business profile to get started with campaigns, reviews, and rewards.
        </p>
      </div>
      <RegisterClientModal
        open={true}
        onClose={() => router.push("/dashboard")}
        onRegister={async (data) => {
          await registerBusiness(data);
          toast.success(`Business "${data.businessName}" created successfully!`, {
            style: {
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              color: "#111",
            },
          });
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
