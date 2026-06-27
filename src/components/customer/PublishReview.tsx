"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Shield, Clock, ClipboardCheck, CheckCircle, Copy, ChevronDown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface PublishReviewProps {
  reviewText: string;
  googleMapsUrl: string;
  onPublished: () => void;
}

export function PublishReview({ reviewText, googleMapsUrl, onPublished }: PublishReviewProps) {
  const [copied, setCopied] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const copyReview = useCallback(() => {
    navigator.clipboard.writeText(reviewText).then(() => {
      setCopied(true);
    }).catch(() => {
      setCopied(true);
    });
  }, [reviewText]);

  useEffect(() => {
    copyReview();
  }, [copyReview]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setShowGoogle(true), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleGoToGoogle = () => {
    copyReview();
    window.open(googleMapsUrl, "_blank");
    setTimeout(onPublished, 1500);
  };

  return (
    <div className="flex flex-col flex-1 px-5 pt-6 pb-5">
      <AnimatePresence mode="wait">
        {/* Copy Success Confirmation */}
        {copied && !showGoogle && (
          <motion.div
            key="copy-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center flex-1"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#166534] to-[#15803D] flex items-center justify-center mb-5 shadow-xl shadow-[#166534]/20"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[22px] font-extrabold text-[#166534] mb-2"
            >
              ✓ Review Copied!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[14px] text-[#8B9A7E] text-center leading-relaxed max-w-[280px]"
            >
              Your review is ready to paste into Google Reviews
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[12px] text-[#C4BBA8]">Opening Google Maps...</span>
            </motion.div>
          </motion.div>
        )}

        {/* Google Maps Redirect Screen */}
        {showGoogle && (
          <motion.div
            key="google-redirect"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Copied badge */}
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 mb-5"
            >
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F0FDF4] border border-[#166534]/15">
                <CheckCircle className="w-4 h-4 text-[#166534]" />
                <span className="text-[12px] text-[#166534] font-bold">Review copied to clipboard</span>
              </div>
            </motion.div>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-[20px] font-extrabold text-[#1A1A2E] mb-1.5">Post Your Review</h2>
              <p className="text-[13px] text-[#8B9A7E] leading-relaxed">
                Paste your review on Google Maps to claim your reward
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-6">
              {[
                { num: "1", text: "Tap the button below to open Google Maps", color: "#166534" },
                { num: "2", text: "Long press (mobile) or Ctrl+V to paste review", color: "#D4AF37" },
                { num: "3", text: "Submit & come back to claim your reward", color: "#15803D" },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex items-center gap-3.5 px-4 py-3 bg-white rounded-xl border border-[#E8E2D6] shadow-sm"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.num}
                  </div>
                  <p className="text-[13px] text-[#374151] font-medium">{step.text}</p>
                </motion.div>
              ))}
            </div>

            {/* Google Maps button */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8E2D6] shadow-sm mb-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#F7F3EB] flex items-center justify-center border border-[#E8E2D6]">
                  <svg viewBox="0 0 24 24" className="w-6 h-6">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#1A1A2E]">Google Maps</p>
                  <p className="text-[11px] text-[#8B9A7E]">Opens in a new tab</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleGoToGoogle}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-[#166534] to-[#15803D] text-white text-[15px] font-bold transition-all shadow-lg shadow-[#166534]/25"
              >
                Open Google Maps
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-5 mb-5">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#166534]" />
                <span className="text-[11px] text-[#6B7B68] font-medium">Secure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8B9A7E]" />
                <span className="text-[11px] text-[#6B7B68] font-medium">Takes 30 seconds</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ClipboardCheck className="w-3.5 h-3.5 text-[#15803D]" />
                <span className="text-[11px] text-[#6B7B68] font-medium">Copied</span>
              </div>
            </div>

            {/* Review preview + re-copy + skip */}
            <div className="mt-auto">
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full bg-white border border-[#E8E2D6] rounded-2xl p-4 text-left shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#166534]" />
                    <span className="text-[13px] text-[#374151] font-semibold">Your review (copied)</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#8B9A7E] transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
                </div>
                {!expanded && (
                  <p className="text-[12px] text-[#8B9A7E] line-clamp-1 mt-1 pl-6">
                    &ldquo;{reviewText.slice(0, 80)}...&rdquo;
                  </p>
                )}
              </button>

              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 space-y-3"
                >
                  <div className="bg-white border border-[#E8E2D6] rounded-2xl p-4">
                    <p className="text-[13px] text-[#374151] leading-[1.7]">{reviewText}</p>
                  </div>
                  <button
                    onClick={copyReview}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-[#166534]/20 text-[13px] text-[#166534] font-semibold hover:bg-[#F0FDF4] transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Again
                  </button>
                  <button
                    onClick={onPublished}
                    className="w-full py-3.5 rounded-2xl border border-[#E8E2D6] text-[13px] text-[#8B9A7E] font-semibold hover:text-[#374151] hover:border-[#C4BBA8] hover:bg-white transition-all"
                  >
                    I already posted — skip →
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
