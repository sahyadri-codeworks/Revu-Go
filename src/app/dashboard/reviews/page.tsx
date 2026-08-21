"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Globe, Upload, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAppState } from "@/lib/app-context";
import { format } from "date-fns";
import { generateCSV, downloadCSV, REVIEW_FIELDS } from "@/lib/csv";
import { ImportCSVModal } from "@/components/dashboard/ImportCSVModal";
import { toast } from "sonner";

const toastStyle = { backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", color: "#111" };

export default function ReviewsPage() {
  const { sessions } = useAppState();
  const [showImport, setShowImport] = useState(false);

  const publicReviews = [...sessions]
    .filter((s) => s.selected_review_text)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleExport = () => {
    const headers = ["star_rating", "selected_review_text", "session_token", "created_at"];
    const rows = publicReviews.map((r) => [
      String(r.star_rating),
      r.selected_review_text,
      r.session_token,
      r.created_at,
    ]);
    const csv = generateCSV(headers, rows);
    downloadCSV(csv, "review-inbox.csv");
    toast.success(`Exported ${rows.length} reviews`, { style: toastStyle });
  };

  const handleImport = async (records: Record<string, string>[]) => {
    const res = await fetch("/api/csv/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module: "reviews", records }),
    });
    const data = await res.json();
    if (data.success > 0) {
      setTimeout(() => window.location.reload(), 1000);
    }
    return { success: data.success || 0, failed: data.failed || 0 };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#111] tracking-[-0.01em]">Review Vault</h2>
          <p className="text-[13px] text-[#6B7280] mt-0.5">All captured review sessions</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E5E7EB] text-[11px] text-[#6B7280] font-semibold hover:text-[#111] hover:border-[#D1D5DB] transition-colors">
            <Upload className="w-3.5 h-3.5" /> Import CSV
          </button>
          <button onClick={handleExport} disabled={publicReviews.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E5E7EB] text-[11px] text-[#6B7280] font-semibold hover:text-[#111] hover:border-[#D1D5DB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {publicReviews.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center">
            <Globe className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[#6B7280] text-sm">No reviews yet</p>
          </div>
        ) : (
          publicReviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              className="glass-card glass-card-hover rounded-xl p-4 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex">
                      {Array.from({ length: review.star_rating }).map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 text-[#7C3AED] fill-[#7C3AED]" />
                      ))}
                    </div>
                    <Badge className="text-[9px] uppercase tracking-wider font-semibold border bg-[#10B981]/5 text-[#10B981] border-[#10B981]/15">
                      Captured
                    </Badge>
                    <span className="text-[10px] font-mono text-[#9CA3AF]">
                      {review.session_token}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#6B7280] leading-relaxed group-hover:text-[#374151] transition-colors">
                    {review.selected_review_text}
                  </p>
                  <p className="text-[10px] text-[#9CA3AF] mt-2 font-mono">
                    {format(new Date(review.created_at), "MMM d, yyyy 'at' hh:mm a")}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <ImportCSVModal
        open={showImport}
        onClose={() => setShowImport(false)}
        module="reviews"
        fields={REVIEW_FIELDS}
        onImport={handleImport}
      />
    </div>
  );
}
