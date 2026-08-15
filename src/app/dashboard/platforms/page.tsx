"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Star,
  MessageSquare,
  QrCode,
  ExternalLink,
  Settings2,
  Loader2,
  Globe2,
  TrendingUp,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useAppState } from "@/lib/app-context";
import { getPlatformMeta, getIntegrationLabel } from "@/lib/platforms";
import { AddPlatformModal } from "@/components/dashboard/AddPlatformModal";
import type { BusinessPlatform } from "@/types";

export default function PlatformsPage() {
  const { business, sessions, platforms: contextPlatforms, loading: appLoading, refreshPlatforms } = useAppState();
  const [localPlatforms, setLocalPlatforms] = useState<BusinessPlatform[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const loadPlatforms = useCallback(async () => {
    try {
      const res = await fetch("/api/platforms");
      const data = await res.json();
      if (res.ok) setLocalPlatforms(data.platforms || []);
    } catch {} finally {
      setHasFetched(true);
    }
  }, []);

  useEffect(() => { loadPlatforms(); }, [loadPlatforms]);

  const platforms = hasFetched ? localPlatforms : contextPlatforms;
  const loading = !hasFetched && appLoading;

  const revugoPlatform = platforms.find((p) => p.platform_key === "revugo");
  const externalPlatforms = platforms.filter((p) => p.platform_key !== "revugo");

  const revugoStats = {
    totalReviews: sessions.length,
    avgRating: sessions.length > 0
      ? sessions.reduce((s, r) => s + r.star_rating, 0) / sessions.length
      : 0,
    qrScans: revugoPlatform?.total_qr_scans || 0,
  };

  const allPlatformRows = platforms.map((p) => {
    const meta = getPlatformMeta(p.platform_key);
    const isRevugo = p.platform_key === "revugo";
    return {
      id: p.id,
      platformKey: p.platform_key,
      name: meta?.name || p.display_name,
      shortName: meta?.shortName || p.display_name,
      color: meta?.color || "#6B7280",
      icon: meta?.icon || p.display_name.charAt(0),
      rating: isRevugo ? revugoStats.avgRating : (p.avg_rating ?? null),
      reviews: isRevugo ? revugoStats.totalReviews : p.total_reviews,
      qrScans: p.total_qr_scans,
      connected: p.is_connected,
      integrationLevel: meta?.integrationLevel || "qr_only",
    };
  });

  const totalReviews = allPlatformRows.reduce((s, p) => s + p.reviews, 0);
  const totalScans = allPlatformRows.reduce((s, p) => s + p.qrScans, 0);
  const ratedPlatforms = allPlatformRows.filter((p) => p.rating !== null && p.rating > 0);
  const overallRating = ratedPlatforms.length > 0
    ? ratedPlatforms.reduce((s, p) => s + (p.rating || 0), 0) / ratedPlatforms.length
    : 0;

  if (!business) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#111] tracking-tight">Review Platforms</h1>
          <p className="text-[13px] text-[#6B7280] mt-1">
            Manage all your review platforms from one place
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7C3AED] text-white text-[13px] font-bold hover:bg-[#6D28D9] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Platform
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#7C3AED]" />
        </div>
      ) : platforms.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 glass-card rounded-2xl"
        >
          <Globe2 className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
          <h3 className="text-[16px] font-semibold text-[#111] mb-2">No Platforms Connected</h3>
          <p className="text-[13px] text-[#6B7280] mb-6 max-w-md mx-auto">
            Connect your review platforms like Google, Zomato, TripAdvisor, and more to manage all your reviews from one dashboard.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white text-[13px] font-bold hover:bg-[#6D28D9] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Your First Platform
          </button>
        </motion.div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Connected Platforms", value: platforms.filter((p) => p.is_connected).length, icon: Globe2, color: "#7C3AED" },
              { label: "Overall Rating", value: overallRating > 0 ? overallRating.toFixed(1) : "—", icon: Star, color: "#F59E0B" },
              { label: "Total Reviews", value: totalReviews.toLocaleString(), icon: MessageSquare, color: "#10B981" },
              { label: "Total QR Scans", value: totalScans.toLocaleString(), icon: QrCode, color: "#2563EB" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-[0.1em] font-medium">{stat.label}</p>
                  <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] flex items-center justify-center">
                    <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-[28px] font-bold text-[#111] tracking-tight">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Master table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl overflow-hidden mb-6"
          >
            <div className="px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#7C3AED]" />
                <h2 className="text-[14px] font-semibold text-[#111]">Platform Overview</h2>
              </div>
              <span className="text-[11px] text-[#9CA3AF]">{platforms.length} platform{platforms.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F3F4F6]">
                    <th className="text-left px-6 py-3 text-[10px] text-[#9CA3AF] uppercase tracking-[0.1em] font-semibold">Platform</th>
                    <th className="text-right px-4 py-3 text-[10px] text-[#9CA3AF] uppercase tracking-[0.1em] font-semibold">Rating</th>
                    <th className="text-right px-4 py-3 text-[10px] text-[#9CA3AF] uppercase tracking-[0.1em] font-semibold">Reviews</th>
                    <th className="text-right px-4 py-3 text-[10px] text-[#9CA3AF] uppercase tracking-[0.1em] font-semibold">QR Scans</th>
                    <th className="text-center px-4 py-3 text-[10px] text-[#9CA3AF] uppercase tracking-[0.1em] font-semibold">Integration</th>
                    <th className="text-center px-4 py-3 text-[10px] text-[#9CA3AF] uppercase tracking-[0.1em] font-semibold">Status</th>
                    <th className="text-right px-6 py-3 text-[10px] text-[#9CA3AF] uppercase tracking-[0.1em] font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {allPlatformRows.map((row, i) => (
                    <tr
                      key={row.id}
                      className="border-b border-[#F9FAFB] hover:bg-[#FAFAFE] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                            style={{ backgroundColor: row.color }}
                          >
                            {row.icon}
                          </div>
                          <span className="text-[13px] font-medium text-[#111]">{row.shortName}</span>
                        </div>
                      </td>
                      <td className="text-right px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                          <span className="text-[13px] font-semibold text-[#111]">
                            {row.rating !== null && row.rating > 0 ? row.rating.toFixed(1) : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="text-right px-4 py-4 text-[13px] text-[#374151] font-medium">
                        {row.reviews.toLocaleString()}
                      </td>
                      <td className="text-right px-4 py-4 text-[13px] text-[#374151] font-medium">
                        {row.qrScans.toLocaleString()}
                      </td>
                      <td className="text-center px-4 py-4">
                        <span
                          className="inline-block px-2.5 py-1 rounded-full text-[10px] font-medium"
                          style={{
                            backgroundColor: row.integrationLevel === "full" ? "#ECFDF5" : row.integrationLevel === "partial" ? "#FFF7ED" : "#F3F4F6",
                            color: row.integrationLevel === "full" ? "#059669" : row.integrationLevel === "partial" ? "#D97706" : "#6B7280",
                          }}
                        >
                          {getIntegrationLabel(row.integrationLevel)}
                        </span>
                      </td>
                      <td className="text-center px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                          row.connected
                            ? "bg-[#ECFDF5] text-[#059669]"
                            : "bg-[#FEF2F2] text-[#DC2626]"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${row.connected ? "bg-[#10B981]" : "bg-[#EF4444]"}`} />
                          {row.connected ? "Connected" : "Disconnected"}
                        </span>
                      </td>
                      <td className="text-right px-6 py-4">
                        <Link
                          href={`/dashboard/platforms/${row.id}`}
                          className="inline-flex items-center gap-1 text-[11px] text-[#7C3AED] font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Platform cards (mobile-friendly alternative) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:hidden">
            {allPlatformRows.map((row, i) => (
              <Link key={row.id} href={`/dashboard/platforms/${row.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="glass-card glass-card-hover rounded-2xl p-5 group cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: row.color }}
                    >
                      {row.icon}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#111]">{row.shortName}</p>
                      <p className="text-[10px] text-[#9CA3AF]">{getIntegrationLabel(row.integrationLevel)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] text-[#9CA3AF] mb-0.5">Rating</p>
                      <p className="text-[15px] font-bold text-[#111]">
                        {row.rating !== null && row.rating > 0 ? row.rating.toFixed(1) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#9CA3AF] mb-0.5">Reviews</p>
                      <p className="text-[15px] font-bold text-[#111]">{row.reviews}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#9CA3AF] mb-0.5">QR Scans</p>
                      <p className="text-[15px] font-bold text-[#111]">{row.qrScans}</p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </>
      )}

      <AddPlatformModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={(p) => {
          setLocalPlatforms((prev) => [...prev, p]);
          refreshPlatforms();
          setModalOpen(false);
        }}
        connectedKeys={platforms.map((p) => p.platform_key)}
      />
    </div>
  );
}
