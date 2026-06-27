"use client";

import { motion } from "framer-motion";
import { Plus, Printer, Trash2, Calendar, Circle } from "lucide-react";
import { useAppState } from "@/lib/app-context";
import { useCampaignModal } from "../layout";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const toastStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  color: "#111",
};

export default function CampaignsPage() {
  const { campaigns, deleteCampaign, toggleCampaign } = useAppState();
  const { openModal } = useCampaignModal();
  const router = useRouter();

  const handleDelete = (id: string, title: string) => {
    deleteCampaign(id);
    toast.success(`Campaign "${title}" deleted`, { style: toastStyle });
  };

  const handleToggle = (id: string, currentlyActive: boolean) => {
    toggleCampaign(id);
    toast.success(currentlyActive ? "Campaign paused" : "Campaign activated", { style: toastStyle });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold text-[#111] tracking-[-0.01em]">Campaign Manager</h2>
          <p className="text-[13px] text-[#6B7280] mt-1">
            Create and manage reward campaigns for your customers.
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white rounded-xl text-[12px] uppercase tracking-wider font-bold hover:shadow-[0_0_24px_rgba(124,58,237,0.25)] transition-all duration-300 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {/* Empty state */}
      {campaigns.length === 0 && (
        <div className="glass-card rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center mx-auto mb-5">
            <Plus className="w-7 h-7 text-[#6B7280]" />
          </div>
          <h3 className="text-[#374151] text-base font-bold mb-2">No campaigns yet</h3>
          <p className="text-[#6B7280] text-sm mb-6 max-w-sm mx-auto">Create your first campaign to start collecting reviews and rewarding customers.</p>
          <button
            onClick={openModal}
            className="px-6 py-3 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white rounded-xl text-[12px] uppercase tracking-wider font-bold hover:shadow-[0_0_24px_rgba(124,58,237,0.25)] transition-all"
          >
            Create First Campaign
          </button>
        </div>
      )}

      {/* Campaign cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {campaigns.map((campaign, i) => {
          const progress = campaign.max_redemptions > 0
            ? (campaign.redeemed_count / campaign.max_redemptions) * 100
            : 0;
          const isExpired = new Date(campaign.expires_at) < new Date("2026-06-08");
          const isActive = campaign.is_active && !isExpired;

          return (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className={`glass-card glass-card-hover rounded-2xl overflow-hidden transition-all duration-300 ${
                isExpired ? "opacity-60" : ""
              }`}
            >
              <div className="p-5">
                {/* Top row: badge + toggle */}
                <div className="flex items-center justify-between mb-5">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.06)] text-[10px] text-[#10B981] uppercase tracking-[0.12em] font-semibold">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                      Active
                    </span>
                  ) : (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] uppercase tracking-[0.12em] font-semibold ${
                      isExpired
                        ? "border-[#E5E7EB] text-[#6B7280]"
                        : "border-[#E5E7EB] text-[#9CA3AF]"
                    }`}>
                      {isExpired ? "Expired" : "Paused"}
                    </span>
                  )}
                  <button
                    onClick={() => handleToggle(campaign.id, isActive)}
                    disabled={isExpired}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? "bg-[rgba(16,185,129,0.1)] text-[#10B981] hover:bg-[rgba(16,185,129,0.15)]"
                        : isExpired
                        ? "bg-[#F3F4F6] text-[#4B5563] cursor-not-allowed"
                        : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                    }`}
                  >
                    <Circle className={`w-3.5 h-3.5 ${isActive ? "fill-[#10B981]" : ""}`} />
                  </button>
                </div>

                {/* Title + offer */}
                <h3 className="font-bold text-[15px] text-[#111] mb-1.5 leading-snug">
                  {campaign.title}{isExpired ? " (Expired)" : ""}
                </h3>
                <p className="text-[13px] text-[#9CA3AF] italic leading-relaxed mb-5">
                  &ldquo;{campaign.offer_text}&rdquo;
                </p>

                {/* Expiry */}
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[#F3F4F6]">
                  <Calendar className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <div>
                    <p className="text-[9px] text-[#6B7280] uppercase tracking-[0.15em] font-medium">
                      Expires
                    </p>
                    <p className="text-[13px] text-[#374151] font-medium">
                      {campaign.expires_at.split("T")[0]}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] text-[#6B7280]">Payouts Claimed</p>
                    <p className="text-[12px] text-[#111] font-bold tabular-nums">
                      {campaign.redeemed_count} / {campaign.max_redemptions}
                    </p>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-[#F3F4F6]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#10B981] transition-all duration-700"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2.5">
                  <button
                    onClick={() => router.push("/dashboard/qr")}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#374151] text-[11px] font-bold hover:bg-[#E5E7EB] transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Flyer
                  </button>
                  <button
                    onClick={() => handleDelete(campaign.id, campaign.title)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[#EF4444]/60 text-[11px] font-semibold hover:bg-[rgba(239,68,68,0.06)] hover:text-[#EF4444] transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
