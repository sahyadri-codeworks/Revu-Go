"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Smile, Star, Gift, TrendingUp, ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { useAppState } from "@/lib/app-context";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, startOfMonth, startOfDay, subDays } from "date-fns";
import Link from "next/link";

type TimeRange = "today" | "yesterday" | "7days" | "30days" | "this_month";

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "7days": "Last 7 Days",
  "30days": "Last 30 Days",
  this_month: "This Month",
};

function getDateRange(range: TimeRange): { start: Date; end: Date; days: number } {
  const now = new Date();
  const todayStart = startOfDay(now);
  switch (range) {
    case "today":
      return { start: todayStart, end: now, days: 1 };
    case "yesterday": {
      const yStart = subDays(todayStart, 1);
      return { start: yStart, end: todayStart, days: 1 };
    }
    case "7days":
      return { start: subDays(todayStart, 6), end: now, days: 7 };
    case "30days":
      return { start: subDays(todayStart, 29), end: now, days: 30 };
    case "this_month":
      return { start: startOfMonth(now), end: now, days: now.getDate() };
  }
}

export default function DashboardOverview() {
  const { sessions, coupons, campaigns } = useAppState();
  const [timeRange, setTimeRange] = useState<TimeRange>("30days");
  const [showDropdown, setShowDropdown] = useState(false);

  const totalReviews = sessions.filter((s) => s.star_rating >= 4).length;
  const avgRating =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.star_rating, 0) / sessions.length
      : 0;
  const couponsIssued = coupons.length;
  const activeCampaigns = campaigns.filter((c) => c.is_active).length;

  const chartData = useMemo(() => {
    const { start, days } = getDateRange(timeRange);
    const data: { date: string; reviews: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayReviews = sessions.filter(
        (s) => s.created_at.split("T")[0] === dateStr && s.star_rating >= 4
      ).length;
      data.push({ date: dateStr, reviews: dayReviews });
    }
    return data;
  }, [sessions, timeRange]);

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const statCards = [
    {
      label: "Google Reviews",
      value: totalReviews,
      icon: Smile,
      footnote: `${activeCampaigns} active campaigns`,
      footnoteColor: "#10B981",
      footnoteIcon: TrendingUp,
      href: "/dashboard/reviews",
      gradient: "from-[rgba(16,185,129,0.06)] to-transparent",
    },
    {
      label: "Avg Star Rating",
      value: avgRating.toFixed(1),
      icon: Star,
      footnote: `Based on ${sessions.length} sessions`,
      footnoteColor: "#7C3AED",
      footnoteIcon: null,
      href: "/dashboard/analytics",
      gradient: "from-[rgba(124,58,237,0.06)] to-transparent",
    },
    {
      label: "Coupons Issued",
      value: couponsIssued,
      icon: Gift,
      footnote: `${coupons.filter((c) => c.is_redeemed).length} redeemed`,
      footnoteColor: "#7C3AED",
      footnoteIcon: null,
      href: "/dashboard/campaigns",
      gradient: "from-[rgba(124,58,237,0.06)] to-transparent",
    },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {statCards.map((stat, i) => (
          <Link key={stat.label} href={stat.href}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="glass-card glass-card-hover rounded-2xl p-5 group cursor-pointer relative overflow-hidden transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-[11px] text-[#6B7280] uppercase tracking-[0.08em] font-medium">
                    {stat.label}
                  </p>
                  <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center group-hover:border-[#D1D5DB] transition-colors">
                    <stat.icon className="w-4 h-4 text-[#6B7280] group-hover:text-[#374151] transition-colors" />
                  </div>
                </div>
                <p className="text-[32px] font-bold text-[#111] tracking-tight leading-none">{stat.value}</p>
                <div className="flex items-center gap-1.5 mt-3">
                  {stat.footnoteIcon && (
                    <stat.footnoteIcon className="w-3 h-3" style={{ color: stat.footnoteColor }} />
                  )}
                  <p className="text-[11px] font-medium" style={{ color: stat.footnoteColor }}>
                    {stat.footnote}
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Chart + Session streams */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Velocity chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[14px] font-semibold text-[#111] tracking-[-0.01em]">
                  Review Velocity
                </h2>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  Completion trends over time
                </p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown((p) => !p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-[10px] text-[#6B7280] font-medium hover:border-[#D1D5DB] hover:text-[#374151] transition-all"
                >
                  {TIME_RANGE_LABELS[timeRange]}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 top-full mt-1.5 z-30 w-40 rounded-xl border border-[#E5E7EB] bg-white shadow-lg overflow-hidden">
                      {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((key) => (
                        <button
                          key={key}
                          onClick={() => { setTimeRange(key); setShowDropdown(false); }}
                          className={`w-full px-4 py-2.5 text-left text-[11px] font-medium transition-colors ${
                            timeRange === key
                              ? "text-[#7C3AED] bg-[#7C3AED]/5"
                              : "text-[#6B7280] hover:text-[#111] hover:bg-[#F9FAFB]"
                          }`}
                        >
                          {TIME_RANGE_LABELS[key]}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="h-[280px]">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <Sparkles className="w-8 h-8 text-[#D1D5DB]" />
                  <p className="text-[#6B7280] text-sm">Launch a campaign to see review data</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.15} />
                        <stop offset="50%" stopColor="#7C3AED" stopOpacity={0.05} />
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#6B7280" }}
                      tickFormatter={(v) => format(new Date(v), "MMM d")}
                      axisLine={{ stroke: "#E5E7EB" }}
                      tickLine={false}
                      interval={timeRange === "today" || timeRange === "yesterday" ? 0 : timeRange === "7days" ? 1 : 6}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#6B7280" }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                        color: "#111",
                        fontSize: "12px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                      }}
                      labelFormatter={(v) => format(new Date(v as string), "MMM d, yyyy")}
                    />
                    <Area
                      type="monotone"
                      dataKey="reviews"
                      stroke="#7C3AED"
                      strokeWidth={2}
                      fill="url(#purpleGradient)"
                      dot={false}
                      activeDot={{
                        r: 5,
                        fill: "#7C3AED",
                        stroke: "#FFFFFF",
                        strokeWidth: 3,
                      }}
                      name="Reviews"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </motion.div>

        {/* Session streams */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="glass-card rounded-2xl p-6 flex flex-col relative overflow-hidden"
        >
          <div className="relative flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[14px] font-semibold text-[#111] tracking-[-0.01em]">
                Live Sessions
              </h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span className="text-[10px] text-[#10B981] font-medium">Live</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {recentSessions.length === 0 ? (
                <div className="text-[#6B7280] text-sm text-center py-8">No sessions yet</div>
              ) : (
                recentSessions.map((session) => {
                  const sessionId = `${session.campaign_id === "camp-001" ? "CAF" : "CAD"}-${session.session_token.slice(-4).toUpperCase()}`;
                  const time = format(new Date(session.created_at), "hh:mm a");

                  return (
                    <div key={session.id} className="group p-2.5 rounded-xl hover:bg-[#F9FAFB] transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#10B981]" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] text-[#6B7280] font-mono">
                              {sessionId}
                            </span>
                            <span className="text-[10px] text-[#9CA3AF] font-mono">
                              {time}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#6B7280] truncate group-hover:text-[#374151] transition-colors leading-relaxed">
                            {session.selected_review_text.slice(0, 55)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
              <Link
                href="/dashboard/reviews"
                className="flex items-center justify-center gap-2 text-[11px] text-[#7C3AED] font-medium hover:text-[#6D28D9] transition-colors group"
              >
                View All Sessions
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
