"use client";

import { motion } from "framer-motion";
import { useAppState } from "@/lib/app-context";
import { Sparkles, TrendingUp, Zap, AlertTriangle, Users } from "lucide-react";

export default function AnalyticsPage() {
  const { sessions, coupons } = useAppState();

  const starDist = [0, 0, 0, 0, 0];
  sessions.forEach((s) => {
    starDist[s.star_rating - 1]++;
  });
  const starData = starDist.map((count, i) => ({ stars: i + 1, count }));
  const maxCount = Math.max(...starData.map((s) => s.count), 1);

  const totalSessions = sessions.length;
  const verifiedSessions = sessions.filter((s) => s.token_status === "VERIFIED").length;
  const conversionRate = totalSessions > 0 ? ((verifiedSessions / totalSessions) * 100).toFixed(1) : "0";

  const totalRewardValue = coupons.length * 620;
  const rewardYieldFormatted = totalRewardValue >= 1000
    ? `₹${(totalRewardValue / 1000).toFixed(1)}k`
    : `₹${totalRewardValue}`;

  const escalations = sessions.filter(
    (s) => s.star_rating <= 2 && s.token_status === "FRAUD"
  ).length;

  const metricCards = [
    {
      label: "Conversion Rate",
      value: `${conversionRate}%`,
      delta: "+3.2%",
      deltaPositive: true,
      icon: TrendingUp,
      color: "#7C3AED",
    },
    {
      label: "Reward Yield",
      value: rewardYieldFormatted,
      delta: "Lifetime",
      deltaPositive: true,
      icon: Zap,
      color: "#7C3AED",
    },
    {
      label: "Escalations",
      value: escalations.toString(),
      delta: "Resolved privately",
      deltaPositive: false,
      icon: AlertTriangle,
      color: "#EF4444",
    },
    {
      label: "Total Sessions",
      value: totalSessions.toString(),
      delta: "All attempts",
      deltaPositive: true,
      icon: Users,
      color: "#10B981",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#111] tracking-[-0.01em]">Analytics</h2>
        <p className="text-[13px] text-[#6B7280] mt-0.5">
          Star distribution and conversion insights
        </p>
      </div>

      {totalSessions === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <Sparkles className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
          <p className="text-[#6B7280] text-sm">No session data available yet</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_1fr] gap-5">
          {/* Star Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="glass-card rounded-2xl p-6 lg:row-span-2 relative overflow-hidden"
          >
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[13px] text-[#111] font-semibold tracking-[-0.01em]">
                  Star Distribution
                </h3>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#7C3AED]/5 border border-[#7C3AED]/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                  <span className="text-[10px] text-[#7C3AED] font-medium">Live</span>
                </div>
              </div>

              <div className="space-y-5">
                {[...starData].reverse().map((item, i) => {
                  const barPct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <motion.div
                      key={item.stars}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.06, duration: 0.4 }}
                      className="flex items-center gap-4"
                    >
                      <div className="flex items-center gap-1 w-8 flex-shrink-0 justify-end">
                        <span className="text-[14px] text-[#374151] font-medium tabular-nums">{item.stars}</span>
                        <span className="text-[14px] text-[#7C3AED]">★</span>
                      </div>

                      <div className="flex-1 h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barPct}%` }}
                          transition={{ delay: 0.3 + i * 0.08, duration: 0.7, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA]"
                        />
                      </div>

                      <span className="text-[12px] text-[#6B7280] font-mono w-8 text-right tabular-nums">
                        {item.count}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* 2x2 metric cards */}
          <div className="grid grid-cols-2 gap-4">
            {metricCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06, duration: 0.4 }}
                className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-300 group"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at center, ${card.color}08, transparent 70%)` }}
                />
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ background: `${card.color}10` }}>
                    <card.icon className="w-4 h-4" style={{ color: card.color }} />
                  </div>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-[0.12em] font-medium mb-2">
                    {card.label}
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-[#7C3AED]">
                    {card.value}
                  </p>
                  <p className={`text-[10px] mt-2 font-medium ${
                    card.deltaPositive ? "text-[#10B981]" : "text-[#6B7280]"
                  }`}>
                    {card.delta}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
