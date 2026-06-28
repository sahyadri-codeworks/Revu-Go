"use client";

import { motion } from "framer-motion";
import { CheckCircle, Copy, Mail, Gift, Loader2 } from "lucide-react";
import { useState } from "react";

interface FinalRewardProps {
  couponCode: string;
  rewardText: string;
  businessName: string;
  expiryDate: string;
  hasCoupon?: boolean;
}

export function FinalReward({ couponCode, rewardText, businessName, expiryDate, hasCoupon = true }: FinalRewardProps) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const daysUntilExpiry = Math.max(
    0,
    Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  if (!hasCoupon) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pt-8 pb-5 flex-1">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center shadow-xl shadow-[#7C3AED]/25 mb-5"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[24px] font-extrabold text-[#1A1A2E] mb-2 text-center"
        >
          Thank You! 🙏
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[14px] text-[#6B7280] text-center leading-relaxed max-w-[280px]"
        >
          Your feedback means a lot to <span className="text-[#7C3AED] font-semibold">{businessName}</span>. We truly appreciate you taking the time to share your experience.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-[11px] text-[#9CA3AF] text-center"
        >
          You can close this page now
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-6 pt-8 pb-5 flex-1">
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="relative mb-4"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#166534] to-[#15803D] flex items-center justify-center shadow-xl shadow-[#166534]/25">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <motion.div
          initial={{ scale: 1.5, opacity: 0.5 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 1, repeat: 2 }}
          className="absolute inset-0 rounded-full bg-[#166534]/15"
        />
      </motion.div>

      {/* Badge */}
      <motion.span
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[12px] text-[#8B6914] font-bold mb-4"
      >
        <Gift className="w-3.5 h-3.5" />
        Reward Unlocked
      </motion.span>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-[24px] font-extrabold text-[#1A1A2E] mb-1.5"
      >
        Congratulations! 🎉
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-[13px] text-[#8B9A7E] text-center leading-relaxed mb-6"
      >
        Your reward from <span className="text-[#166534] font-semibold">{businessName}</span> is ready
      </motion.p>

      {/* Coupon card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full rounded-3xl overflow-hidden shadow-xl shadow-[#166534]/10 mb-5"
      >
        {/* Top section */}
        <div className="bg-gradient-to-r from-[#166534] to-[#15803D] px-6 py-5 text-center text-white relative overflow-hidden">
          <div className="absolute top-2 right-4 opacity-10">
            <svg viewBox="0 0 60 60" className="w-12 h-12 text-white" fill="currentColor">
              <path d="M30 3C30 3 12 18 12 35C12 48 20 57 30 57C40 57 48 48 48 35C48 18 30 3 30 3Z" />
            </svg>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70 mb-2 relative">
            Your Coupon Code
          </p>
          <p className="text-[32px] font-extrabold tracking-[0.12em] font-mono relative">
            {couponCode}
          </p>
        </div>
        {/* Zigzag divider */}
        <div className="relative h-3 bg-white">
          <div className="absolute -top-1.5 left-0 right-0 flex justify-between px-2">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-gradient-to-b from-[#F7F3EB] to-white" />
            ))}
          </div>
        </div>
        {/* Bottom section */}
        <div className="bg-white px-6 py-5 text-center border-t border-[#E8E2D6]">
          <p className="text-[15px] text-[#166534] font-bold leading-relaxed mb-3">
            {rewardText}
          </p>
          <div className="flex items-center justify-center gap-2 text-[12px] text-[#8B9A7E]">
            <span>Expires in <strong className="text-[#6B7B68]">{daysUntilExpiry} days</strong></span>
            <span className="text-[#D6CFC0]">|</span>
            <span>{expiryDate}</span>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="w-full mt-auto space-y-3"
      >
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleCopy}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[15px] font-bold transition-all shadow-lg ${
            copied
              ? "bg-[#D4AF37] text-white shadow-[#D4AF37]/25"
              : "bg-gradient-to-r from-[#166534] to-[#15803D] text-white shadow-[#166534]/25"
          }`}
        >
          {copied ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copy Coupon Code
            </>
          )}
        </motion.button>

        {/* Send to Email */}
        {!showEmailInput ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowEmailInput(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[15px] font-bold border-2 border-[#166534] text-[#166534] bg-white hover:bg-[#F0FDF4] transition-all"
          >
            <Mail className="w-5 h-5" />
            Send to My Email
          </motion.button>
        ) : emailSent ? (
          <div className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[15px] font-bold bg-[#F0FDF4] border-2 border-[#166534]/20 text-[#166534]">
            <CheckCircle className="w-5 h-5" />
            Sent to {email}
          </div>
        ) : (
          <div className="w-full space-y-2">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3.5 rounded-xl bg-white border-2 border-[#E8E2D6] text-[#1A1A2E] text-[14px] placeholder:text-[#C4BBA8] focus:outline-none focus:border-[#166534] transition-colors"
              />
              <button
                onClick={async () => {
                  if (!email || !email.includes("@")) return;
                  setEmailSending(true);
                  try {
                    const res = await fetch("/api/email/send-coupon", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        email,
                        couponCode,
                        rewardText,
                        businessName,
                        expiryDate,
                      }),
                    });
                    if (res.ok) {
                      setEmailSent(true);
                    }
                  } catch {
                    // silently fail
                  } finally {
                    setEmailSending(false);
                  }
                }}
                disabled={emailSending || !email.includes("@")}
                className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#166534] to-[#15803D] text-white text-[14px] font-bold disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                {emailSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Send
              </button>
            </div>
          </div>
        )}

        <p className="text-[11px] text-[#C4BBA8] text-center pt-2">
          Show this code to the cashier at {businessName}
        </p>
      </motion.div>
    </div>
  );
}
