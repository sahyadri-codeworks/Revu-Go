"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { PLATFORMS, getPlatformMeta } from "@/lib/platforms";
import type { BusinessPlatform } from "@/types";

interface LaunchCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onDeploy: (data: {
    title: string;
    offerText: string;
    couponPrefix: string;
    maxPayouts: number;
    expiry: string;
    platformKey?: string;
  }) => void;
  connectedPlatforms?: BusinessPlatform[];
}

export function LaunchCampaignModal({ open, onClose, onDeploy, connectedPlatforms = [] }: LaunchCampaignModalProps) {
  const [title, setTitle] = useState("");
  const [offerText, setOfferText] = useState("");
  const [couponPrefix, setCouponPrefix] = useState("");
  const [maxPayouts, setMaxPayouts] = useState("100");
  const [expiry, setExpiry] = useState("");
  const [platformKey, setPlatformKey] = useState("revugo");

  const canDeploy = title.trim() && offerText.trim();

  const handleDeploy = () => {
    if (!canDeploy) return;
    onDeploy({
      title,
      offerText,
      couponPrefix: couponPrefix || title.slice(0, 6).toUpperCase().replace(/\s/g, ""),
      maxPayouts: parseInt(maxPayouts) || 100,
      expiry: expiry || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      platformKey,
    });
    setTitle("");
    setOfferText("");
    setCouponPrefix("");
    setMaxPayouts("100");
    setExpiry("");
    setPlatformKey("revugo");
  };

  const handleCancel = () => {
    setTitle("");
    setOfferText("");
    setCouponPrefix("");
    setMaxPayouts("100");
    setExpiry("");
    setPlatformKey("revugo");
    onClose();
  };

  const availablePlatforms = [
    { key: "revugo", name: "RevuGo (Our Platform)", color: "#7C3AED", icon: "R" },
    ...connectedPlatforms
      .filter((p) => p.is_connected && p.platform_key !== "revugo")
      .map((p) => {
        const meta = getPlatformMeta(p.platform_key);
        return {
          key: p.platform_key,
          name: p.display_name,
          color: meta?.color || "#6B7280",
          icon: meta?.icon || p.platform_key.charAt(0).toUpperCase(),
        };
      }),
  ];

  const selectedMeta = availablePlatforms.find((p) => p.key === platformKey) || availablePlatforms[0];

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#111] text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7C3AED]/30 focus:ring-1 focus:ring-[#7C3AED]/15 transition-all duration-200";

  const labelClass = "block text-[10px] text-[#6B7280] uppercase tracking-[0.12em] font-medium mb-2";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={handleCancel}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl shadow-xl">
              {/* Header */}
              <div className="px-6 pt-6 pb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-[15px] font-bold text-[#111] tracking-[-0.01em]">
                    Create Campaign
                  </h2>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">
                    Set up a new reward campaign for your customers
                  </p>
                </div>
                <button onClick={handleCancel} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#111] hover:bg-[#F3F4F6] transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="h-px bg-[#F3F4F6]" />

              {/* Form */}
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className={labelClass}>Campaign Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Free Cappuccino Upgrade"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Offer Description</label>
                  <input
                    type="text"
                    value={offerText}
                    onChange={(e) => setOfferText(e.target.value)}
                    placeholder="e.g. Rate us 5 stars to unlock a free espresso!"
                    className={inputClass}
                  />
                </div>

                {/* Platform Selector */}
                <div>
                  <label className={labelClass}>Review Platform</label>
                  <div className="relative">
                    <select
                      value={platformKey}
                      onChange={(e) => setPlatformKey(e.target.value)}
                      className={`${inputClass} appearance-none cursor-pointer pr-10`}
                    >
                      {availablePlatforms.map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ backgroundColor: selectedMeta.color }}
                    >
                      {selectedMeta.icon}
                    </div>
                    <span className="text-[11px] text-[#9CA3AF]">
                      {platformKey === "revugo"
                        ? "QR links to RevuGo review page"
                        : `QR links to RevuGo — after review, customer is redirected to ${selectedMeta.name}`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Coupon Prefix</label>
                    <input
                      type="text"
                      value={couponPrefix}
                      onChange={(e) => setCouponPrefix(e.target.value.toUpperCase())}
                      placeholder="e.g. CAFECAP"
                      className={`${inputClass} uppercase`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Max Payouts</label>
                    <input
                      type="number"
                      value={maxPayouts}
                      onChange={(e) => setMaxPayouts(e.target.value)}
                      placeholder="100"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Expiry Date</label>
                  <input
                    type="date"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className={`${inputClass} [color-scheme:light]`}
                  />
                </div>
              </div>

              <div className="h-px bg-[#F3F4F6]" />

              {/* Actions */}
              <div className="px-6 py-4 flex items-center gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[11px] text-[#6B7280] uppercase tracking-[0.12em] font-medium hover:text-[#111] hover:bg-[#E5E7EB] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeploy}
                  disabled={!canDeploy}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-[11px] uppercase tracking-[0.12em] font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Deploy Campaign
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
