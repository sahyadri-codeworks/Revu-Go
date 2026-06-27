"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star, Gift } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
  onNext: () => void;
  businessName: string;
  businessLogo?: string;
  locationArea: string;
  locationCity: string;
  offerText: string;
  loading?: boolean;
}

const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent!"];
const ratingColors = ["", "#DC2626", "#E77C1A", "#C5A044", "#15803D", "#166534"];

export function StarRating({ rating, onRate, onNext, businessName, businessLogo, locationArea, locationCity, offerText, loading }: StarRatingProps) {
  return (
    <div className="flex flex-col items-center px-6 pt-6 pb-6 flex-1">
      {/* Business logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="relative mb-5"
      >
        <div className="w-[88px] h-[88px] rounded-[22px] bg-white shadow-lg shadow-[#166534]/8 border border-[#E8E2D6]/60 flex items-center justify-center overflow-hidden">
          {businessLogo && businessLogo.startsWith("http") ? (
            <img src={businessLogo} alt={businessName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold bg-gradient-to-br from-[#166534] to-[#15803D] bg-clip-text text-transparent">
              {businessName.charAt(0)}
            </span>
          )}
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-[#166534] to-[#15803D] flex items-center justify-center shadow-md shadow-[#166534]/25"
        >
          <span className="text-white text-[11px]">✓</span>
        </motion.div>
      </motion.div>

      {/* Business name */}
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-[22px] font-extrabold text-[#1A1A2E] text-center tracking-tight"
      >
        {businessName}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-[13px] text-[#8B9A7E] text-center mb-3"
      >
        {locationArea}, {locationCity}
      </motion.p>

      {/* Offer badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="px-4 py-2 rounded-full bg-gradient-to-r from-[#D4AF37]/12 to-[#C5A044]/12 border border-[#D4AF37]/20 mb-8"
      >
        <div className="flex items-center gap-1.5">
          <Gift className="w-3.5 h-3.5 text-[#B8860B]" />
          <span className="text-[12px] text-[#8B6914] font-semibold">{offerText}</span>
        </div>
      </motion.div>

      {/* Rating question */}
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-[18px] font-bold text-[#1A1A2E] text-center mb-2"
      >
        How was your experience?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[13px] text-[#8B9A7E] mb-7"
      >
        Tap a star to rate
      </motion.p>

      {/* Stars */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex gap-3 mb-5"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + star * 0.06 }}
            onClick={() => onRate(star)}
            className="relative p-1.5"
          >
            <Star
              className={`w-12 h-12 transition-all duration-300 ${
                star <= rating
                  ? "text-[#D4AF37] fill-[#D4AF37] drop-shadow-[0_4px_12px_rgba(212,175,55,0.45)]"
                  : "text-[#D6CFC0] fill-[#D6CFC0]"
              }`}
            />
            {star <= rating && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 bg-[#D4AF37]/15 rounded-full blur-md"
              />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Rating label */}
      <AnimatePresence mode="wait">
        {rating > 0 && (
          <motion.div
            key={rating}
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="px-5 py-2 rounded-full mb-6"
            style={{ backgroundColor: `${ratingColors[rating]}12` }}
          >
            <span className="text-[15px] font-bold" style={{ color: ratingColors[rating] }}>
              {ratingLabels[rating]}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Next button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full"
      >
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          disabled={rating === 0 || loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#166534] to-[#15803D] text-white text-[15px] font-bold disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#166534]/25 active:shadow-md flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : rating === 0 ? "Rate to continue" : "Next →"}
        </motion.button>
        {rating > 0 && (
          <p className="text-[11px] text-[#8B9A7E] text-center mt-2.5 font-medium">
            AI will generate your review next
          </p>
        )}
      </motion.div>
    </div>
  );
}
