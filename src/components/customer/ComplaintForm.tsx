"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Send, User, Eye, EyeOff, CheckCircle } from "lucide-react";

interface ComplaintFormProps {
  businessName: string;
  starRating: number;
  onSubmit: (data: {
    complaint_text: string;
    is_anonymous: boolean;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    consent_given: boolean;
  }) => Promise<void>;
  onSkip: () => void;
}

export function ComplaintForm({ businessName, starRating, onSubmit, onSkip }: ComplaintFormProps) {
  const [phase, setPhase] = useState<"intro" | "form" | "submitting" | "done">("intro");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [complaintText, setComplaintText] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [consent, setConsent] = useState(false);

  const handleSubmit = async () => {
    if (!complaintText.trim()) return;
    setPhase("submitting");
    await onSubmit({
      complaint_text: complaintText.trim(),
      is_anonymous: isAnonymous,
      contact_name: isAnonymous ? undefined : contactName,
      contact_email: isAnonymous ? undefined : contactEmail,
      contact_phone: isAnonymous ? undefined : contactPhone,
      consent_given: consent,
    });
    setPhase("done");
  };

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-5">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-[#FEF3C7] flex items-center justify-center mb-5"
        >
          <span className="text-[36px]">😔</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-[20px] font-extrabold text-[#1A1A2E] mb-2 text-center">
            We&apos;re sorry to hear this
          </h2>
          <p className="text-[14px] text-[#6B7280] text-center leading-relaxed max-w-[300px] mx-auto mb-2">
            This is not the experience <strong className="text-[#1A1A2E]">{businessName}</strong> wants to give you. Your feedback truly matters.
          </p>
          <p className="text-[13px] text-[#9CA3AF] text-center max-w-[280px] mx-auto mb-8">
            Would you like to raise a concern? The business will review it and work to make things right.
          </p>
        </motion.div>

        <div className="w-full max-w-[300px] space-y-3">
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => setPhase("form")}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-[15px] font-bold shadow-lg shadow-[#7C3AED]/25 flex items-center justify-center gap-2">
            <Send className="w-5 h-5" /> Raise a Concern
          </motion.button>

          <motion.button whileTap={{ scale: 0.98 }} onClick={onSkip}
            className="w-full py-4 rounded-2xl border-2 border-[#E5E7EB] text-[15px] text-[#6B7280] font-semibold hover:border-[#D1D5DB] transition-colors">
            No thanks, continue
          </motion.button>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-5">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="w-20 h-20 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-5"
        >
          <CheckCircle className="w-10 h-10 text-[#10B981]" />
        </motion.div>

        <h2 className="text-[20px] font-extrabold text-[#1A1A2E] mb-2 text-center">
          Thank You for Sharing
        </h2>
        <p className="text-[14px] text-[#6B7280] text-center leading-relaxed max-w-[300px] mx-auto mb-2">
          Your concern has been recorded. <strong className="text-[#1A1A2E]">{businessName}</strong> will review it and take appropriate action.
        </p>
        <p className="text-[12px] text-[#9CA3AF] text-center max-w-[280px] mx-auto mb-8">
          Your honest feedback helps businesses improve their service.
        </p>

        <div className="w-full max-w-[300px] space-y-3">
          <motion.button whileTap={{ scale: 0.98 }} onClick={onSkip}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-[15px] font-bold shadow-lg shadow-[#7C3AED]/25">
            Continue
          </motion.button>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[14px] text-[#111] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7C3AED]/40 transition-colors";

  return (
    <div className="flex-1 flex flex-col px-5 pt-5 pb-5 overflow-y-auto">
      <h2 className="text-[18px] font-extrabold text-[#1A1A2E] mb-1">Share Your Concern</h2>
      <p className="text-[12px] text-[#6B7280] mb-5">Help {businessName} understand what went wrong</p>

      {/* Complaint text */}
      <textarea
        value={complaintText}
        onChange={(e) => setComplaintText(e.target.value)}
        placeholder="Please describe the issue you experienced..."
        className={`${inputClass} min-h-[120px] resize-none mb-4`}
        autoFocus
      />

      {/* Anonymous toggle */}
      <div className="mb-4">
        <p className="text-[13px] font-semibold text-[#1A1A2E] mb-3">How would you like to share?</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setIsAnonymous(true)}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-[13px] font-semibold transition-all ${
              isAnonymous
                ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED]"
                : "border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]"
            }`}
          >
            <EyeOff className="w-4 h-4" /> Anonymous
          </button>
          <button
            onClick={() => setIsAnonymous(false)}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-[13px] font-semibold transition-all ${
              !isAnonymous
                ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED]"
                : "border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]"
            }`}
          >
            <User className="w-4 h-4" /> Share Details
          </button>
        </div>
      </div>

      {/* Contact details if not anonymous */}
      {!isAnonymous && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 mb-4">
          <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)}
            placeholder="Your name" className={inputClass} />
          <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
            placeholder="Email address (optional)" className={inputClass} />
          <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
            placeholder="Phone number (optional)" className={inputClass} />

          {/* Consent */}
          <label className="flex items-start gap-3 px-3 py-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] cursor-pointer">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#D1D5DB] text-[#7C3AED] focus:ring-[#7C3AED]" />
            <span className="text-[12px] text-[#6B7280] leading-relaxed">
              I consent to sharing my contact details with <strong className="text-[#1A1A2E]">{businessName}</strong> so they can follow up on my concern.
            </span>
          </label>
        </motion.div>
      )}

      {/* Privacy note */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] mb-5">
        <Shield className="w-4 h-4 text-[#10B981] flex-shrink-0" />
        <span className="text-[11px] text-[#15803D]">
          {isAnonymous
            ? "Your identity will remain completely anonymous. Only your concern will be shared."
            : "Your details will only be shared with the business for follow-up purposes."}
        </span>
      </div>

      {/* Submit */}
      <div className="mt-auto pt-2 space-y-3">
        <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmit}
          disabled={!complaintText.trim() || phase === "submitting" || (!isAnonymous && !consent)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-[15px] font-bold disabled:opacity-30 shadow-lg shadow-[#7C3AED]/25 flex items-center justify-center gap-2 transition-all">
          {phase === "submitting" ? (
            <>
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" /> Submit Concern
            </>
          )}
        </motion.button>

        <button onClick={onSkip}
          className="w-full py-3 text-[13px] text-[#9CA3AF] font-medium hover:text-[#6B7280] transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
