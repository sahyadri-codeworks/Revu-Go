"use client";

import { motion } from "framer-motion";
import { useAppState } from "@/lib/app-context";
import {
  TrendingUp, TrendingDown, Minus,
  Star, Users, BarChart3, Zap, Calendar,
  ThumbsUp, ThumbsDown, Meh,
  Hash, Sparkles,
} from "lucide-react";
import { useState, useMemo } from "react";

type TimeRange = "15d" | "30d" | "90d" | "365d" | "all";

const TIME_LABELS: Record<TimeRange, string> = {
  "15d": "Last 15 Days",
  "30d": "Last 30 Days",
  "90d": "Last Quarter",
  "365d": "Last Year",
  all: "All Time",
};

function getDateThreshold(range: TimeRange): Date | null {
  if (range === "all") return null;
  const days = parseInt(range);
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function AnalyticsPage() {
  const { sessions, coupons } = useAppState();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const filtered = useMemo(() => {
    const threshold = getDateThreshold(timeRange);
    if (!threshold) return sessions;
    return sessions.filter((s) => new Date(s.created_at) >= threshold);
  }, [sessions, timeRange]);

  const prevFiltered = useMemo(() => {
    const threshold = getDateThreshold(timeRange);
    if (!threshold) return [];
    const days = parseInt(timeRange);
    const prevStart = new Date(threshold);
    prevStart.setDate(prevStart.getDate() - days);
    return sessions.filter((s) => {
      const d = new Date(s.created_at);
      return d >= prevStart && d < threshold;
    });
  }, [sessions, timeRange]);

  // Star distribution
  const starDist = [0, 0, 0, 0, 0];
  filtered.forEach((s) => { starDist[s.star_rating - 1]++; });
  const starData = starDist.map((count, i) => ({ stars: i + 1, count }));
  const maxCount = Math.max(...starData.map((s) => s.count), 1);

  // Averages
  const avgRating = filtered.length > 0
    ? filtered.reduce((sum, s) => sum + s.star_rating, 0) / filtered.length
    : 0;
  const prevAvgRating = prevFiltered.length > 0
    ? prevFiltered.reduce((sum, s) => sum + s.star_rating, 0) / prevFiltered.length
    : 0;
  const ratingDelta = prevFiltered.length > 0 ? avgRating - prevAvgRating : 0;

  // Conversion
  const totalSessions = filtered.length;
  const verifiedSessions = filtered.filter((s) => s.token_status === "VERIFIED").length;
  const conversionRate = totalSessions > 0 ? (verifiedSessions / totalSessions) * 100 : 0;
  const prevVerified = prevFiltered.filter((s) => s.token_status === "VERIFIED").length;
  const prevConversion = prevFiltered.length > 0 ? (prevVerified / prevFiltered.length) * 100 : 0;
  const convDelta = prevFiltered.length > 0 ? conversionRate - prevConversion : 0;

  // Coupons in range
  const threshold = getDateThreshold(timeRange);
  const filteredCoupons = threshold
    ? coupons.filter((c) => new Date(c.issued_at) >= threshold)
    : coupons;

  // Sentiment from star ratings
  const positive = filtered.filter((s) => s.star_rating >= 4).length;
  const neutral = filtered.filter((s) => s.star_rating === 3).length;
  const negative = filtered.filter((s) => s.star_rating <= 2).length;
  const sentimentTotal = positive + neutral + negative;
  const positivePct = sentimentTotal > 0 ? Math.round((positive / sentimentTotal) * 100) : 0;
  const neutralPct = sentimentTotal > 0 ? Math.round((neutral / sentimentTotal) * 100) : 0;
  const negativePct = sentimentTotal > 0 ? Math.round((negative / sentimentTotal) * 100) : 0;

  // Keyword extraction from MCQ answers
  const keywordCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((s) => {
      if (s.mcq_answers && typeof s.mcq_answers === "object") {
        Object.values(s.mcq_answers).forEach((answer) => {
          if (typeof answer === "string" && answer.trim()) {
            const key = answer.trim();
            counts[key] = (counts[key] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [filtered]);

  // Rating trend (daily averages for the period)
  const ratingTrend = useMemo(() => {
    if (filtered.length === 0) return [];
    const dailyMap: Record<string, { sum: number; count: number }> = {};
    filtered.forEach((s) => {
      const day = s.created_at.split("T")[0];
      if (!dailyMap[day]) dailyMap[day] = { sum: 0, count: 0 };
      dailyMap[day].sum += s.star_rating;
      dailyMap[day].count++;
    });
    return Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { sum, count }]) => ({
        date,
        avg: sum / count,
        count,
      }));
  }, [filtered]);

  // Rating by day of week
  const dayOfWeekData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const data = days.map((label) => ({ label, sum: 0, count: 0 }));
    filtered.forEach((s) => {
      const d = new Date(s.created_at).getDay();
      data[d].sum += s.star_rating;
      data[d].count++;
    });
    return data.map((d) => ({ ...d, avg: d.count > 0 ? d.sum / d.count : 0 }));
  }, [filtered]);

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="w-3.5 h-3.5" />;
    if (delta < 0) return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return "text-[#10B981]";
    if (delta < 0) return "text-[#EF4444]";
    return "text-[#6B7280]";
  };

  return (
    <div>
      {/* Header with time filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#111] tracking-[-0.01em]">Analytics</h2>
          <p className="text-[13px] text-[#6B7280] mt-0.5">
            Performance insights for your business
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#F3F4F6] rounded-xl">
          {(Object.keys(TIME_LABELS) as TimeRange[]).map((key) => (
            <button
              key={key}
              onClick={() => setTimeRange(key)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                timeRange === key
                  ? "bg-white text-[#7C3AED] shadow-sm"
                  : "text-[#6B7280] hover:text-[#111]"
              }`}
            >
              {TIME_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      {totalSessions === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <Sparkles className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
          <p className="text-[#6B7280] text-sm">No review data for this period</p>
          <p className="text-[#9CA3AF] text-xs mt-1">Try selecting a different time range</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Avg Rating",
                value: avgRating.toFixed(1),
                delta: ratingDelta,
                deltaText: ratingDelta !== 0 ? `${ratingDelta > 0 ? "+" : ""}${ratingDelta.toFixed(2)}` : "—",
                icon: Star,
                color: "#7C3AED",
              },
              {
                label: "Total Reviews",
                value: totalSessions.toString(),
                delta: totalSessions - prevFiltered.length,
                deltaText: prevFiltered.length > 0 ? `${totalSessions >= prevFiltered.length ? "+" : ""}${totalSessions - prevFiltered.length}` : "—",
                icon: Users,
                color: "#3B82F6",
              },
              {
                label: "Conversion Rate",
                value: `${conversionRate.toFixed(1)}%`,
                delta: convDelta,
                deltaText: convDelta !== 0 ? `${convDelta > 0 ? "+" : ""}${convDelta.toFixed(1)}%` : "—",
                icon: TrendingUp,
                color: "#10B981",
              },
              {
                label: "Rewards Claimed",
                value: filteredCoupons.length.toString(),
                delta: 0,
                deltaText: `of ${totalSessions}`,
                icon: Zap,
                color: "#F59E0B",
              },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${card.color}10` }}>
                    <card.icon className="w-4.5 h-4.5" style={{ color: card.color }} />
                  </div>
                  {timeRange !== "all" && (
                    <div className={`flex items-center gap-1 text-[11px] font-medium ${getDeltaColor(card.delta)}`}>
                      {getDeltaIcon(card.delta)}
                      <span>{card.deltaText}</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-[#6B7280] uppercase tracking-[0.08em] font-medium mb-1">{card.label}</p>
                <p className="text-[28px] font-bold text-[#111] tracking-tight">{card.value}</p>
                <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                  vs previous {TIME_LABELS[timeRange].toLowerCase()}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Star Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[14px] text-[#111] font-semibold">Star Distribution</h3>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">{totalSessions} total reviews</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#7C3AED]/5 border border-[#7C3AED]/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                  <span className="text-[10px] text-[#7C3AED] font-medium">{TIME_LABELS[timeRange]}</span>
                </div>
              </div>

              <div className="space-y-4">
                {[...starData].reverse().map((item, i) => {
                  const barPct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  const pct = totalSessions > 0 ? Math.round((item.count / totalSessions) * 100) : 0;
                  return (
                    <motion.div
                      key={item.stars}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex items-center gap-1 w-10 flex-shrink-0 justify-end">
                        <span className="text-[13px] text-[#374151] font-medium tabular-nums">{item.stars}</span>
                        <Star className="w-3.5 h-3.5 text-[#7C3AED] fill-[#7C3AED]" />
                      </div>
                      <div className="flex-1 h-3 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barPct}%` }}
                          transition={{ delay: 0.3 + i * 0.08, duration: 0.7, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA]"
                        />
                      </div>
                      <div className="flex items-center gap-2 w-16 flex-shrink-0 justify-end">
                        <span className="text-[12px] text-[#374151] font-semibold tabular-nums">{item.count}</span>
                        <span className="text-[10px] text-[#9CA3AF] tabular-nums w-8 text-right">{pct}%</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Sentiment Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[14px] text-[#111] font-semibold">Sentiment Analysis</h3>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">Based on star ratings & feedback</p>
                </div>
              </div>

              {/* Sentiment donut visual */}
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F3F4F6" strokeWidth="3" />
                    <motion.circle
                      cx="18" cy="18" r="15.915" fill="none"
                      stroke="#10B981" strokeWidth="3"
                      strokeDasharray={`${positivePct} ${100 - positivePct}`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 100" }}
                      animate={{ strokeDasharray: `${positivePct} ${100 - positivePct}` }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                    />
                    <motion.circle
                      cx="18" cy="18" r="15.915" fill="none"
                      stroke="#F59E0B" strokeWidth="3"
                      strokeDasharray={`${neutralPct} ${100 - neutralPct}`}
                      strokeDashoffset={`-${positivePct}`}
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 100" }}
                      animate={{ strokeDasharray: `${neutralPct} ${100 - neutralPct}` }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    />
                    <motion.circle
                      cx="18" cy="18" r="15.915" fill="none"
                      stroke="#EF4444" strokeWidth="3"
                      strokeDasharray={`${negativePct} ${100 - negativePct}`}
                      strokeDashoffset={`-${positivePct + neutralPct}`}
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 100" }}
                      animate={{ strokeDasharray: `${negativePct} ${100 - negativePct}` }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[18px] font-bold text-[#111]">{positivePct}%</span>
                    <span className="text-[9px] text-[#9CA3AF] font-medium">Positive</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  {[
                    { label: "Positive", value: positive, pct: positivePct, color: "#10B981", icon: ThumbsUp, desc: "4-5 stars" },
                    { label: "Neutral", value: neutral, pct: neutralPct, color: "#F59E0B", icon: Meh, desc: "3 stars" },
                    { label: "Negative", value: negative, pct: negativePct, color: "#EF4444", icon: ThumbsDown, desc: "1-2 stars" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${item.color}15` }}>
                        <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] text-[#374151] font-medium">{item.label}</span>
                          <span className="text-[12px] text-[#111] font-bold tabular-nums">{item.value}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.pct}%` }}
                              transition={{ delay: 0.4, duration: 0.6 }}
                              className="h-full rounded-full"
                              style={{ background: item.color }}
                            />
                          </div>
                          <span className="text-[10px] text-[#9CA3AF] tabular-nums">{item.pct}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick insight */}
              <div className="bg-[#F8FAFB] rounded-xl p-3 border border-[#F3F4F6]">
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  {positivePct >= 70 ? (
                    <>Your customers are highly satisfied! <strong className="text-[#10B981]">{positivePct}%</strong> gave positive ratings. Keep up the great work!</>
                  ) : positivePct >= 50 ? (
                    <>Overall positive feedback at <strong className="text-[#F59E0B]">{positivePct}%</strong>. Focus on addressing negative feedback to improve further.</>
                  ) : (
                    <>Customer satisfaction needs attention. <strong className="text-[#EF4444]">{negativePct}%</strong> gave negative ratings. Check the Customer Concerns section for details.</>
                  )}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Rating Trend + Day of Week */}
          <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
            {/* Rating Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-[14px] text-[#111] font-semibold">Rating Trend</h3>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">Daily average rating over time</p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
                  <Calendar className="w-3.5 h-3.5" />
                  {TIME_LABELS[timeRange]}
                </div>
              </div>

              {ratingTrend.length > 0 ? (
                <div className="relative">
                  {/* Y-axis labels */}
                  <div className="flex flex-col justify-between h-[180px] absolute left-0 top-0">
                    {[5, 4, 3, 2, 1].map((n) => (
                      <span key={n} className="text-[10px] text-[#9CA3AF] tabular-nums leading-none">{n}.0</span>
                    ))}
                  </div>

                  {/* Chart area */}
                  <div className="ml-8 overflow-x-auto">
                    <div className="min-w-[300px]">
                      {/* Grid lines */}
                      <div className="relative h-[180px]">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div
                            key={n}
                            className="absolute w-full border-t border-dashed border-[#F3F4F6]"
                            style={{ bottom: `${((n - 1) / 4) * 100}%` }}
                          />
                        ))}

                        {/* Bars */}
                        <div className="absolute inset-0 flex items-end gap-[2px]">
                          {ratingTrend.map((point, i) => {
                            const heightPct = ((point.avg - 1) / 4) * 100;
                            const isGood = point.avg >= 4;
                            const isOkay = point.avg >= 3;
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${Math.max(heightPct, 2)}%` }}
                                  transition={{ delay: 0.3 + i * 0.02, duration: 0.5 }}
                                  className={`w-full rounded-t-md min-h-[4px] ${
                                    isGood ? "bg-[#7C3AED]" : isOkay ? "bg-[#F59E0B]" : "bg-[#EF4444]"
                                  } group-hover:opacity-80 transition-opacity`}
                                />
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                                  <div className="bg-[#111] text-white text-[10px] px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                                    <p className="font-semibold">{formatDate(point.date)}</p>
                                    <p>Avg: {point.avg.toFixed(1)} / {point.count} reviews</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* X-axis */}
                      <div className="flex mt-2">
                        {ratingTrend.length <= 15 ? (
                          ratingTrend.map((point, i) => (
                            <span key={i} className="flex-1 text-[9px] text-[#9CA3AF] text-center truncate">
                              {formatDate(point.date)}
                            </span>
                          ))
                        ) : (
                          <>
                            <span className="text-[10px] text-[#9CA3AF]">{formatDate(ratingTrend[0].date)}</span>
                            <span className="flex-1" />
                            <span className="text-[10px] text-[#9CA3AF]">{formatDate(ratingTrend[ratingTrend.length - 1].date)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-[13px] text-[#9CA3AF]">
                  No trend data available
                </div>
              )}
            </motion.div>

            {/* Day of Week Performance */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="text-[14px] text-[#111] font-semibold mb-1">Best Days</h3>
              <p className="text-[11px] text-[#9CA3AF] mb-5">When you get the most reviews</p>

              <div className="space-y-2.5">
                {dayOfWeekData.map((day, i) => {
                  const maxDayCount = Math.max(...dayOfWeekData.map((d) => d.count), 1);
                  const widthPct = (day.count / maxDayCount) * 100;
                  return (
                    <div key={day.label} className="flex items-center gap-3">
                      <span className="text-[12px] text-[#6B7280] font-medium w-8">{day.label}</span>
                      <div className="flex-1 h-6 bg-[#F3F4F6] rounded-lg overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPct}%` }}
                          transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                          className="h-full rounded-lg bg-gradient-to-r from-[#7C3AED]/80 to-[#7C3AED] flex items-center justify-end pr-2"
                        >
                          {day.count > 0 && widthPct > 20 && (
                            <span className="text-[10px] text-white font-bold">{day.count}</span>
                          )}
                        </motion.div>
                        {day.count > 0 && widthPct <= 20 && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#6B7280] font-medium">{day.count}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#9CA3AF] w-8 text-right tabular-nums">
                        {day.avg > 0 ? `${day.avg.toFixed(1)}★` : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Popular Keywords / MCQ Choices */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[14px] text-[#111] font-semibold">Popular Keywords</h3>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                  Most selected feedback choices by customers
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3B82F6]/5 border border-[#3B82F6]/10">
                <Hash className="w-3 h-3 text-[#3B82F6]" />
                <span className="text-[10px] text-[#3B82F6] font-medium">{keywordCounts.length} Keywords</span>
              </div>
            </div>

            {keywordCounts.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {keywordCounts.map(([keyword, count], i) => {
                  const maxKw = keywordCounts[0][1];
                  const intensity = Math.max(0.15, count / maxKw);
                  return (
                    <motion.div
                      key={keyword}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.03, duration: 0.3 }}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E5E7EB] bg-white hover:shadow-sm transition-shadow"
                      style={{ background: `rgba(124, 58, 237, ${intensity * 0.08})` }}
                    >
                      <span className="text-[13px] text-[#374151] font-medium">{keyword}</span>
                      <span className="text-[11px] text-white font-bold bg-[#7C3AED] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                        {count}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <BarChart3 className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
                <p className="text-[13px] text-[#9CA3AF]">No keyword data yet</p>
                <p className="text-[11px] text-[#D1D5DB]">Keywords will appear as customers give feedback</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
