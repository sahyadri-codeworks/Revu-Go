"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppState } from "@/lib/app-context";
import { toast } from "sonner";
import {
  Search,
  TicketCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Gift,
  Copy,
} from "lucide-react";
import { format } from "date-fns";

const toastStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  color: "#111",
};

type FilterTab = "all" | "active" | "redeemed" | "expired";

export default function VerifyCouponsPage() {
  const { coupons, campaigns, redeemCoupon } = useAppState();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [verifyInput, setVerifyInput] = useState("");
  const [verifyResult, setVerifyResult] = useState<{
    status: "found" | "redeemed" | "expired" | "not_found";
    couponId?: string;
    code?: string;
    reward?: string;
    campaign?: string;
    issuedAt?: string;
    expiresAt?: string;
  } | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  const now = new Date();

  const getCouponStatus = (coupon: { is_redeemed: boolean; expires_at: string }) => {
    if (coupon.is_redeemed) return "redeemed";
    if (new Date(coupon.expires_at) < now) return "expired";
    return "active";
  };

  const filteredCoupons = useMemo(() => {
    let list = [...coupons].sort(
      (a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime()
    );

    if (filter !== "all") {
      list = list.filter((c) => getCouponStatus(c) === filter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => c.coupon_code.toLowerCase().includes(q));
    }

    return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupons, filter, searchQuery]);

  const counts = useMemo(() => {
    const all = coupons.length;
    const active = coupons.filter((c) => getCouponStatus(c) === "active").length;
    const redeemed = coupons.filter((c) => getCouponStatus(c) === "redeemed").length;
    const expired = coupons.filter((c) => getCouponStatus(c) === "expired").length;
    return { all, active, redeemed, expired };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupons]);

  const handleVerify = () => {
    const code = verifyInput.trim().toUpperCase();
    if (!code) return;

    const coupon = coupons.find((c) => c.coupon_code.toUpperCase() === code);

    if (!coupon) {
      setVerifyResult({ status: "not_found", code });
      return;
    }

    const status = getCouponStatus(coupon);
    const camp = campaigns.find((c) => c.id === coupon.campaign_id);

    setVerifyResult({
      status: status === "active" ? "found" : status === "redeemed" ? "redeemed" : "expired",
      couponId: coupon.id,
      code: coupon.coupon_code,
      reward: coupon.reward_value,
      campaign: camp?.title || "—",
      issuedAt: coupon.issued_at,
      expiresAt: coupon.expires_at,
    });
  };

  const handleRedeem = async () => {
    if (!verifyResult?.couponId) return;
    setRedeeming(true);

    const success = await redeemCoupon(verifyResult.couponId);

    if (success) {
      setVerifyResult((prev) => (prev ? { ...prev, status: "redeemed" } : null));
      toast.success("Coupon redeemed successfully!", { style: toastStyle });
    } else {
      toast.error("Failed to redeem coupon", { style: toastStyle });
    }
    setRedeeming(false);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[rgba(16,185,129,0.08)] text-[#10B981] border border-[rgba(16,185,129,0.12)]">
            <Gift className="w-3 h-3" /> Active
          </span>
        );
      case "redeemed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[rgba(124,58,237,0.08)] text-[#A78BFA] border border-[rgba(124,58,237,0.12)]">
            <CheckCircle2 className="w-3 h-3" /> Redeemed
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[rgba(239,68,68,0.08)] text-[#EF4444]/70 border border-[rgba(239,68,68,0.12)]">
            <XCircle className="w-3 h-3" /> Expired
          </span>
        );
      default:
        return null;
    }
  };

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "active", label: `Active (${counts.active})` },
    { key: "redeemed", label: `Redeemed (${counts.redeemed})` },
    { key: "expired", label: `Expired (${counts.expired})` },
  ];

  return (
    <div>
      {/* Verify Coupon Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-2xl p-6 mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[rgba(124,58,237,0.04)] to-transparent rounded-bl-full" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED]/15 to-[#7C3AED]/5 flex items-center justify-center border border-[#7C3AED]/10">
              <TicketCheck className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#111]">Verify & Redeem Coupon</h2>
              <p className="text-[11px] text-[#6B7280]">Enter a coupon code to verify and mark as redeemed</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
              <input
                type="text"
                value={verifyInput}
                onChange={(e) => {
                  setVerifyInput(e.target.value.toUpperCase());
                  setVerifyResult(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                placeholder="Enter coupon code e.g. BLOOD500-FMFER"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#111] text-sm font-mono placeholder:text-[#9CA3AF] placeholder:font-sans focus:outline-none focus:border-[#7C3AED]/30 focus:ring-1 focus:ring-[#7C3AED]/15 transition-all"
              />
            </div>
            <button
              onClick={handleVerify}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-[11px] uppercase tracking-[0.12em] font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-all whitespace-nowrap"
            >
              Verify
            </button>
          </div>

          {/* Verify Result */}
          <AnimatePresence>
            {verifyResult && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                {verifyResult.status === "not_found" ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.12)]">
                    <XCircle className="w-5 h-5 text-[#EF4444]/70 flex-shrink-0" />
                    <div>
                      <p className="text-[13px] text-[#EF4444]/80 font-semibold">Coupon Not Found</p>
                      <p className="text-[11px] text-[#6B7280] mt-0.5">
                        No coupon with code &quot;{verifyResult.code}&quot; exists in your records.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          verifyResult.status === "found"
                            ? "bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.15)]"
                            : verifyResult.status === "redeemed"
                            ? "bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.15)]"
                            : "bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.15)]"
                        }`}>
                          {verifyResult.status === "found" ? (
                            <Gift className="w-5 h-5 text-[#10B981]" />
                          ) : verifyResult.status === "redeemed" ? (
                            <CheckCircle2 className="w-5 h-5 text-[#A78BFA]" />
                          ) : (
                            <Clock className="w-5 h-5 text-[#EF4444]/70" />
                          )}
                        </div>
                        <div>
                          <p className="text-[14px] font-mono font-bold text-[#111] tracking-wide">
                            {verifyResult.code}
                          </p>
                          <p className="text-[11px] text-[#6B7280]">
                            {verifyResult.status === "found"
                              ? "Valid — ready to redeem"
                              : verifyResult.status === "redeemed"
                              ? "Already redeemed"
                              : "This coupon has expired"}
                          </p>
                        </div>
                      </div>
                      {statusBadge(verifyResult.status === "found" ? "active" : verifyResult.status)}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-[#F9FAFB]">
                        <p className="text-[9px] text-[#6B7280] uppercase tracking-wider font-medium mb-1">Reward</p>
                        <p className="text-[13px] text-[#111] font-bold truncate">{verifyResult.reward}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#F9FAFB]">
                        <p className="text-[9px] text-[#6B7280] uppercase tracking-wider font-medium mb-1">Campaign</p>
                        <p className="text-[13px] text-[#111] font-bold truncate">{verifyResult.campaign}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#F9FAFB]">
                        <p className="text-[9px] text-[#6B7280] uppercase tracking-wider font-medium mb-1">Issued</p>
                        <p className="text-[13px] text-[#111] font-bold">
                          {verifyResult.issuedAt ? format(new Date(verifyResult.issuedAt), "MMM d, yyyy") : "—"}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#F9FAFB]">
                        <p className="text-[9px] text-[#6B7280] uppercase tracking-wider font-medium mb-1">Expires</p>
                        <p className="text-[13px] text-[#111] font-bold">
                          {verifyResult.expiresAt ? format(new Date(verifyResult.expiresAt), "MMM d, yyyy") : "—"}
                        </p>
                      </div>
                    </div>

                    {verifyResult.status === "found" && (
                      <button
                        onClick={handleRedeem}
                        disabled={redeeming}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-[12px] uppercase tracking-[0.12em] font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {redeeming ? "Redeeming..." : "Mark as Redeemed"}
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Coupon List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <h2 className="text-[15px] font-bold text-[#111]">All Coupons</h2>

          {/* Filter tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB]">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${
                  filter === tab.key
                    ? "bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/15"
                    : "text-[#6B7280] hover:text-[#9CA3AF] border border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by coupon code..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#111] text-sm font-mono placeholder:text-[#9CA3AF] placeholder:font-sans focus:outline-none focus:border-[#D1D5DB] transition-all"
          />
        </div>

        {/* Coupon Table */}
        {filteredCoupons.length === 0 ? (
          <div className="text-center py-12">
            <TicketCheck className="w-10 h-10 text-[#4B5563] mx-auto mb-3" />
            <p className="text-[#6B7280] text-sm">
              {searchQuery ? "No coupons match your search" : "No coupons issued yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="hidden sm:grid sm:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.7fr_0.5fr] gap-3 px-4 py-2">
              <p className="text-[9px] text-[#6B7280] uppercase tracking-wider font-medium">Code</p>
              <p className="text-[9px] text-[#6B7280] uppercase tracking-wider font-medium">Reward</p>
              <p className="text-[9px] text-[#6B7280] uppercase tracking-wider font-medium">Campaign</p>
              <p className="text-[9px] text-[#6B7280] uppercase tracking-wider font-medium">Issued</p>
              <p className="text-[9px] text-[#6B7280] uppercase tracking-wider font-medium">Expires</p>
              <p className="text-[9px] text-[#6B7280] uppercase tracking-wider font-medium">Status</p>
            </div>

            {filteredCoupons.map((coupon, i) => {
              const status = getCouponStatus(coupon);
              const camp = campaigns.find((c) => c.id === coupon.campaign_id);
              return (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="group p-4 rounded-xl border border-[#F3F4F6] hover:border-[#E5E7EB] hover:bg-[#F9FAFB] transition-all"
                >
                  {/* Mobile layout */}
                  <div className="sm:hidden space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-mono font-bold text-[#111] tracking-wide">
                          {coupon.coupon_code}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(coupon.coupon_code);
                            toast.success("Copied!", { style: toastStyle });
                          }}
                          className="p-1 rounded hover:bg-[#F3F4F6] transition-colors"
                        >
                          <Copy className="w-3 h-3 text-[#6B7280]" />
                        </button>
                      </div>
                      {statusBadge(status)}
                    </div>
                    <p className="text-[12px] text-[#7C3AED] font-semibold">{coupon.reward_value}</p>
                    <div className="flex items-center justify-between text-[10px] text-[#6B7280]">
                      <span>{camp?.title || "—"}</span>
                      <span>Expires {format(new Date(coupon.expires_at), "MMM d, yyyy")}</span>
                    </div>
                    {status === "active" && (
                      <button
                        onClick={async () => {
                          const ok = await redeemCoupon(coupon.id);
                          if (ok) toast.success("Coupon redeemed!", { style: toastStyle });
                        }}
                        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-[10px] uppercase tracking-wider font-bold mt-1"
                      >
                        Mark as Redeemed
                      </button>
                    )}
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden sm:grid sm:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.7fr_0.5fr] gap-3 items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-mono font-bold text-[#111] tracking-wide">
                        {coupon.coupon_code}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(coupon.coupon_code);
                          toast.success("Copied!", { style: toastStyle });
                        }}
                        className="p-1 rounded hover:bg-[#F3F4F6] transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Copy className="w-3 h-3 text-[#6B7280]" />
                      </button>
                    </div>
                    <p className="text-[12px] text-[#7C3AED] font-semibold truncate">{coupon.reward_value}</p>
                    <p className="text-[12px] text-[#9CA3AF] truncate">{camp?.title || "—"}</p>
                    <p className="text-[11px] text-[#6B7280]">
                      {format(new Date(coupon.issued_at), "MMM d, yyyy")}
                    </p>
                    <p className="text-[11px] text-[#6B7280]">
                      {format(new Date(coupon.expires_at), "MMM d, yyyy")}
                    </p>
                    <div className="flex items-center gap-2">
                      {statusBadge(status)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
