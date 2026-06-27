"use client";

import { motion } from "framer-motion";
import { MessageCircle, Send, CheckCircle, Heart, Star } from "lucide-react";
import { useState } from "react";

interface PrivateFeedbackFormProps {
  starRating: number;
  businessName: string;
  onSubmit: (feedback: string) => void;
}

export function PrivateFeedbackForm({ starRating, businessName, onSubmit }: PrivateFeedbackFormProps) {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pt-16 pb-6 flex-1">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="relative mb-6"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#166534] to-[#15803D] flex items-center justify-center shadow-xl shadow-[#166534]/20">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <motion.div
            initial={{ scale: 1.5, opacity: 0.4 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1, repeat: 1 }}
            className="absolute inset-0 rounded-full bg-[#166534]/15"
          />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[24px] font-extrabold text-[#1A1A2E] mb-2"
        >
          Thank You!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[13px] text-[#8B9A7E] text-center max-w-sm leading-relaxed mb-6"
        >
          Your feedback has been sent privately to <span className="text-[#166534] font-semibold">{businessName}</span>.
          They&apos;ll use it to improve their service.
        </motion.p>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <Heart className="w-8 h-8 text-[#EF4444] fill-[#EF4444] drop-shadow-[0_4px_12px_rgba(239,68,68,0.3)]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 px-5 pt-6 pb-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37]/12 to-[#C5A044]/12 flex items-center justify-center mb-5 border border-[#D4AF37]/10">
          <MessageCircle className="w-8 h-8 text-[#B8860B]" />
        </div>

        <h2 className="text-[20px] font-extrabold text-[#1A1A2E] mb-2">
          We&apos;d Love Your Feedback
        </h2>

        {/* Rating display */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-[13px] text-[#8B9A7E]">You rated</span>
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < starRating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#D6CFC0] fill-[#D6CFC0]"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-[13px] text-[#8B9A7E] mb-6 leading-relaxed">
          This feedback goes directly to {businessName} — it <strong>won&apos;t</strong> be posted publicly.
        </p>

        <textarea
          placeholder="What could be improved? Be specific — it helps!"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full min-h-[140px] px-4 py-4 rounded-2xl bg-white border border-[#E8E2D6] text-[#1A1A2E] text-[14px] placeholder:text-[#C4BBA8] focus:outline-none focus:border-[#166534]/30 focus:ring-3 focus:ring-[#166534]/8 transition-all resize-none shadow-sm leading-relaxed"
          autoFocus
        />

        <p className="text-[11px] text-[#C4BBA8] mt-2 text-right">
          {feedback.length > 0 ? `${feedback.length} characters` : ""}
        </p>
      </motion.div>

      <div className="pt-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onSubmit(feedback);
            setSubmitted(true);
          }}
          disabled={!feedback.trim()}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-[#166534] to-[#15803D] text-white text-[15px] font-bold disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#166534]/25"
        >
          <Send className="w-4.5 h-4.5" />
          Send Private Feedback
        </motion.button>
        <button
          onClick={() => setSubmitted(true)}
          className="w-full mt-3 py-3 text-[13px] text-[#8B9A7E] font-medium hover:text-[#374151] transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
