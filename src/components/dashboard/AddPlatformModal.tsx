"use client";

import { useState } from "react";
import { X, Search, Check, ExternalLink, Loader2 } from "lucide-react";
import { PLATFORMS, getIntegrationLabel } from "@/lib/platforms";
import type { PlatformMeta } from "@/lib/platforms";
import type { BusinessPlatform } from "@/types";

interface AddPlatformModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: (platform: BusinessPlatform) => void;
  connectedKeys: string[];
}

export function AddPlatformModal({ open, onClose, onAdded, connectedKeys }: AddPlatformModalProps) {
  const [step, setStep] = useState<"select" | "configure">("select");
  const [selected, setSelected] = useState<PlatformMeta | null>(null);
  const [reviewUrl, setReviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  if (!open) return null;

  const availablePlatforms = PLATFORMS.filter(
    (p) => !connectedKeys.includes(p.key)
  );
  const filtered = availablePlatforms.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (platform: PlatformMeta) => {
    setSelected(platform);
    setReviewUrl("");
    setError("");
    if (platform.key === "revugo") {
      handleSave(platform, "");
    } else {
      setStep("configure");
    }
  };

  const handleSave = async (platform: PlatformMeta, url: string) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/platforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform_key: platform.key,
          display_name: platform.name,
          review_url: url,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add platform");
        setSaving(false);
        return;
      }
      onAdded(data.platform);
      handleReset();
    } catch {
      setError("Network error");
      setSaving(false);
    }
  };

  const handleReset = () => {
    setStep("select");
    setSelected(null);
    setReviewUrl("");
    setError("");
    setSaving(false);
    setSearch("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleReset} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
          <h3 className="text-[16px] font-semibold text-[#111]">
            {step === "select" ? "Add Review Platform" : `Configure ${selected?.shortName}`}
          </h3>
          <button
            onClick={handleReset}
            className="w-8 h-8 rounded-lg hover:bg-[#F3F4F6] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {step === "select" && (
          <div className="p-6">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search platforms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#111] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7C3AED]/30"
              />
            </div>

            {/* Platform list */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filtered.length === 0 && (
                <p className="text-center text-[13px] text-[#9CA3AF] py-8">
                  {availablePlatforms.length === 0 ? "All platforms connected" : "No platforms match your search"}
                </p>
              )}
              {filtered.map((platform) => (
                <button
                  key={platform.key}
                  onClick={() => handleSelect(platform)}
                  disabled={saving}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-[#E5E7EB] hover:border-[#7C3AED]/30 hover:bg-[#FAFAFE] transition-all group text-left"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: platform.color }}
                  >
                    {platform.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#111] group-hover:text-[#7C3AED] transition-colors">
                      {platform.name}
                    </p>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">{platform.description}</p>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-medium flex-shrink-0"
                    style={{
                      backgroundColor: platform.integrationLevel === "full" ? "#ECFDF5" : platform.integrationLevel === "partial" ? "#FFF7ED" : "#F3F4F6",
                      color: platform.integrationLevel === "full" ? "#059669" : platform.integrationLevel === "partial" ? "#D97706" : "#6B7280",
                    }}
                  >
                    {getIntegrationLabel(platform.integrationLevel)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "configure" && selected && (
          <div className="p-6">
            {/* Selected platform header */}
            <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-[#F9FAFB] border border-[#F3F4F6]">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: selected.color }}
              >
                {selected.icon}
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#111]">{selected.name}</p>
                <p className="text-[11px] text-[#9CA3AF]">{getIntegrationLabel(selected.integrationLevel)}</p>
              </div>
            </div>

            {/* Review URL input */}
            <div className="mb-4">
              <label className="block text-[11px] text-[#6B7280] uppercase tracking-[0.15em] font-semibold mb-2">
                Review Page URL
              </label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="url"
                  value={reviewUrl}
                  onChange={(e) => setReviewUrl(e.target.value)}
                  placeholder={selected.urlPlaceholder}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#111] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7C3AED]/30"
                />
              </div>
              <p className="text-[10px] text-[#9CA3AF] mt-1.5">
                Enter the direct URL where customers can leave a review on {selected.shortName} (optional — you can add it later)
              </p>
            </div>

            {error && (
              <p className="text-[12px] text-[#EF4444] mb-4">{error}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setStep("select"); setError(""); }}
                className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-[13px] text-[#6B7280] font-medium hover:bg-[#F3F4F6] transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => handleSave(selected, reviewUrl)}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#7C3AED] text-white text-[13px] font-bold hover:bg-[#6D28D9] disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</>
                ) : (
                  <><Check className="w-4 h-4" /> Connect Platform</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
