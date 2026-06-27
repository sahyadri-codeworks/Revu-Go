"use client";

import { motion } from "framer-motion";
import { Sparkles, Check, Star, Copy, Leaf } from "lucide-react";
import { useState, useEffect } from "react";

interface ReviewCardsProps {
  reviews: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onPostToGoogle: () => void;
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

  useEffect(() => {
    if (isGenerating && reviews.length > 0) {
      setReviewsReady(true);
    }
  }, [isGenerating, reviews]);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setGenProgress((prev) => {
        if (reviewsReady) {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
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
      const timer = setTimeout(() => {
        setShowReviews(true);
        onGeneratingDone?.();
      }, 600);
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

  if (isGenerating && !showReviews) {
    return (
      <div className="flex-1 flex flex-col px-6">
        {/* Top spacer — pushes content toward visual center */}
        <div className="flex-[1.2]" />

        {/* Centered content block */}
        <div className="flex flex-col items-center">
          {/* Animated leaf icon */}
          <div className="relative mb-5">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-[#166534]/10 to-[#15803D]/10 flex items-center justify-center"
            >
              <Leaf className="w-7 h-7 text-[#166534]" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.12, 0.3, 0.12] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute inset-[-6px] rounded-full bg-[#166534]/6 blur-xl"
            />
          </div>

          <h2 className="text-[19px] font-extrabold text-[#1A1A2E] mb-1">AI is Writing</h2>
          <p className="text-[13px] text-[#8B9A7E] text-center mb-6 leading-relaxed">
            Crafting personalized reviews<br />based on your experience
          </p>

          {/* Progress bar */}
          <div className="w-full max-w-[260px] mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-[#8B9A7E] font-medium">{genStatus}</span>
              <span className="text-[11px] text-[#166534] font-bold tabular-nums">{genProgress}%</span>
            </div>
            <div className="h-[6px] bg-[#E8E2D6] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#166534] via-[#15803D] to-[#166534] rounded-full"
                style={{ width: `${genProgress}%`, backgroundSize: "200% 100%" }}
                animate={{ backgroundPosition: ["0% 0%", "100% 0%"] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>

          {/* Compact skeleton cards */}
          <div className="w-full max-w-[260px] space-y-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="rounded-xl bg-white/70 border border-[#E8E2D6]/80 px-3.5 py-2.5 flex items-center gap-2.5"
                animate={{ opacity: [0.3, 0.65, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              >
                <div className="w-4 h-4 rounded-full bg-[#E8E2D6] flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-[5px] bg-gradient-to-r from-[#E8E2D6] to-[#D6CFC0] rounded-full w-full" />
                  <div className="h-[5px] bg-gradient-to-r from-[#E8E2D6] to-[#D6CFC0] rounded-full w-[60%]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom spacer — slightly larger to account for footer */}
        <div className="flex-[1.6]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 px-5 pt-5 pb-5">
      <h2 className="text-[20px] font-extrabold text-[#1A1A2E] mb-1">Choose Your Review</h2>
      <p className="text-[13px] text-[#8B9A7E] mb-5">
        Pick the one that best matches your experience
      </p>

      {/* Review cards */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {reviews.map((review, i) => {
          const isSelected = selectedIndex === i;
          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onSelect(i);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-300 ${
                isSelected
                  ? "border-[#166534] bg-gradient-to-br from-[#166534]/[0.03] to-[#15803D]/[0.05] shadow-lg shadow-[#166534]/8"
                  : "border-[#E8E2D6] bg-white hover:border-[#166534]/20 shadow-sm hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected ? "border-[#166534] bg-[#166534]" : "border-[#C4BBA8]"
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  {i === 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D4AF37]/10 text-[10px] text-[#8B6914] font-bold uppercase tracking-wider mb-2.5">
                      <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                      Recommended
                    </span>
                  )}
                  <p className={`text-[13px] leading-[1.7] ${
                    isSelected ? "text-[#1A1A2E]" : "text-[#6B7B68]"
                  }`}>
                    {review}
                  </p>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1.5 mt-3 text-[11px] text-[#166534] font-medium"
                    >
                      <Copy className="w-3 h-3" />
                      {copied ? "Copied to clipboard!" : "Tap to copy"}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-5 pt-2">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onPostToGoogle}
          disabled={selectedIndex === null}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-[#166534] to-[#15803D] text-white text-[15px] font-bold disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#166534]/25"
        >
          Continue with Selected Review
        </motion.button>
      </div>
    </div>
  );
}
