"use client";

import { motion } from "framer-motion";
import { Sparkles, Check, Star, Copy, Leaf, Pencil, X } from "lucide-react";
import { useState, useEffect } from "react";

interface ReviewCardsProps {
  reviews: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onPostToGoogle: (finalText: string) => void;
  isGenerating: boolean;
  sessionToken: string;
  onGeneratingDone?: () => void;
}

export function ReviewCards({
  reviews,
  selectedIndex,
  onSelect,
  onPostToGoogle,
  isGenerating,
  onGeneratingDone,
}: ReviewCardsProps) {
  const [genProgress, setGenProgress] = useState(0);
  const [genStatus, setGenStatus] = useState("Analyzing your feedback...");
  const [copied, setCopied] = useState(false);
  const [reviewsReady, setReviewsReady] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [customReviews, setCustomReviews] = useState<Record<number, string>>({});

  useEffect(() => {
    if (isGenerating && reviews.length > 0) setReviewsReady(true);
  }, [isGenerating, reviews]);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setGenProgress((prev) => {
        if (reviewsReady) {
          if (prev >= 100) { clearInterval(interval); return 100; }
          return Math.min(100, prev + 4);
        }
        if (prev >= 85) { clearInterval(interval); return 85; }
        return prev + 1;
      });
    }, 38);
    return () => clearInterval(interval);
  }, [isGenerating, reviewsReady]);

  useEffect(() => {
    if (genProgress === 100 && reviewsReady && !showReviews) {
      const timer = setTimeout(() => { setShowReviews(true); onGeneratingDone?.(); }, 600);
      return () => clearTimeout(timer);
    }
  }, [genProgress, reviewsReady, showReviews, onGeneratingDone]);

  useEffect(() => {
    if (genProgress < 25) setGenStatus("Analyzing your feedback...");
    else if (genProgress < 50) setGenStatus("Understanding sentiment...");
    else if (genProgress < 75) setGenStatus("Crafting personalized reviews...");
    else if (genProgress < 100) setGenStatus("Polishing final drafts...");
    else setGenStatus("Reviews ready!");
  }, [genProgress]);

  const getReviewText = (i: number) => customReviews[i] ?? reviews[i];

  const startEdit = (i: number) => {
    setEditingIndex(i);
    setEditText(getReviewText(i));
  };

  const saveEdit = () => {
    if (editingIndex !== null && editText.trim()) {
      setCustomReviews((prev) => ({ ...prev, [editingIndex]: editText.trim() }));
      onSelect(editingIndex);
      setEditingIndex(null);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditText("");
  };

  if (isGenerating && !showReviews) {
    return (
      <div className="flex-1 flex flex-col px-6">
        <div className="flex-[1.2]" />
        <div className="flex flex-col items-center">
          <div className="relative mb-5">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7C3AED]/10 to-[#6D28D9]/10 flex items-center justify-center"
            >
              <Sparkles className="w-7 h-7 text-[#7C3AED]" />
            </motion.div>
          </div>
          <h2 className="text-[19px] font-extrabold text-[#1A1A2E] mb-1">AI is Writing</h2>
          <p className="text-[13px] text-[#6B7280] text-center mb-6 leading-relaxed">
            Crafting personalized reviews<br />based on your experience
          </p>
          <div className="w-full max-w-[260px] mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-[#6B7280] font-medium">{genStatus}</span>
              <span className="text-[11px] text-[#7C3AED] font-bold tabular-nums">{genProgress}%</span>
            </div>
            <div className="h-[6px] bg-[#E5E7EB] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#7C3AED] rounded-full"
                style={{ width: `${genProgress}%`, backgroundSize: "200% 100%" }}
                animate={{ backgroundPosition: ["0% 0%", "100% 0%"] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>
          <div className="w-full max-w-[260px] space-y-2">
            {[0, 1, 2].map((i) => (
              <motion.div key={i}
                className="rounded-xl bg-white/70 border border-[#E5E7EB]/80 px-3.5 py-2.5 flex items-center gap-2.5"
                animate={{ opacity: [0.3, 0.65, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              >
                <div className="w-4 h-4 rounded-full bg-[#E5E7EB] flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-[5px] bg-[#E5E7EB] rounded-full w-full" />
                  <div className="h-[5px] bg-[#E5E7EB] rounded-full w-[60%]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="flex-[1.6]" />
      </div>
    );
  }

  // Edit modal
  if (editingIndex !== null) {
    return (
      <div className="flex flex-col flex-1 px-5 pt-5 pb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-extrabold text-[#1A1A2E]">Edit Your Review</h2>
          <button onClick={cancelEdit} className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>
        <p className="text-[12px] text-[#6B7280] mb-3">Rephrase or write your own review</p>
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="flex-1 w-full rounded-2xl border-2 border-[#E5E7EB] focus:border-[#7C3AED]/40 p-4 text-[14px] text-[#1A1A2E] leading-[1.7] resize-none focus:outline-none transition-colors min-h-[180px]"
          placeholder="Write your review here..."
          autoFocus
        />
        <div className="mt-4 flex gap-3">
          <button onClick={cancelEdit}
            className="flex-1 py-3.5 rounded-2xl border border-[#E5E7EB] text-[14px] text-[#6B7280] font-semibold">
            Cancel
          </button>
          <button onClick={saveEdit} disabled={!editText.trim()}
            className="flex-1 py-3.5 rounded-2xl bg-[#7C3AED] text-white text-[14px] font-bold disabled:opacity-30 transition-all">
            Save Review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 px-5 pt-5 pb-5">
      <h2 className="text-[20px] font-extrabold text-[#1A1A2E] mb-1">Choose Your Review</h2>
      <p className="text-[13px] text-[#6B7280] mb-5">
        Pick the one that best matches your experience, or tap ✏️ to edit
      </p>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {reviews.map((review, i) => {
          const isSelected = selectedIndex === i;
          const displayText = getReviewText(i);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative w-full text-left rounded-2xl border-2 p-5 transition-all duration-300 ${
                isSelected
                  ? "border-[#7C3AED] bg-[#7C3AED]/[0.03] shadow-lg shadow-[#7C3AED]/8"
                  : "border-[#E5E7EB] bg-white hover:border-[#7C3AED]/20 shadow-sm"
              }`}
            >
              <button className="w-full text-left" onClick={() => {
                onSelect(i);
                navigator.clipboard.writeText(displayText).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? "border-[#7C3AED] bg-[#7C3AED]" : "border-[#D1D5DB]"
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    {i === 0 && !customReviews[0] && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#7C3AED]/10 text-[10px] text-[#7C3AED] font-bold uppercase tracking-wider mb-2.5">
                        <Star className="w-3 h-3 fill-[#7C3AED] text-[#7C3AED]" />
                        Recommended
                      </span>
                    )}
                    {customReviews[i] && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[10px] text-[#10B981] font-bold uppercase tracking-wider mb-2.5">
                        ✏️ Edited
                      </span>
                    )}
                    <p className={`text-[13px] leading-[1.7] ${isSelected ? "text-[#1A1A2E]" : "text-[#6B7280]"}`}>
                      {displayText}
                    </p>
                    {isSelected && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1.5 mt-3 text-[11px] text-[#7C3AED] font-medium">
                        <Copy className="w-3 h-3" />
                        {copied ? "Copied to clipboard!" : "Tap to copy"}
                      </motion.div>
                    )}
                  </div>
                </div>
              </button>

              {/* Edit icon */}
              <button
                onClick={(e) => { e.stopPropagation(); startEdit(i); }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] flex items-center justify-center transition-colors"
                title="Edit this review"
              >
                <Pencil className="w-3.5 h-3.5 text-[#6B7280]" />
              </button>
            </motion.div>
          );
        })}

        {/* Write your own option */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reviews.length * 0.1 }}
          onClick={() => {
            const newIdx = reviews.length;
            if (!customReviews[newIdx]) setCustomReviews((prev) => ({ ...prev, [newIdx]: "" }));
            setEditingIndex(newIdx);
            setEditText(customReviews[newIdx] || "");
          }}
          className="w-full rounded-2xl border-2 border-dashed border-[#E5E7EB] p-5 text-center hover:border-[#7C3AED]/30 transition-all"
        >
          <div className="flex items-center justify-center gap-2">
            <Pencil className="w-4 h-4 text-[#7C3AED]" />
            <span className="text-[14px] font-semibold text-[#7C3AED]">Write your own review</span>
          </div>
          <p className="text-[11px] text-[#9CA3AF] mt-1">Type a completely custom review</p>
        </motion.button>
      </div>

      <div className="mt-5 pt-2">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (selectedIndex !== null) {
              onPostToGoogle(getReviewText(selectedIndex));
            }
          }}
          disabled={selectedIndex === null}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-[15px] font-bold disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#7C3AED]/25"
        >
          Continue to Post on Google
        </motion.button>
      </div>
    </div>
  );
}
