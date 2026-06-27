"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { Check, Search, Shield, Wifi } from "lucide-react";

interface VerificationWaitProps {
  onVerified: () => void;
  sessionToken: string;
}

export function VerificationWait({ onVerified, sessionToken }: VerificationWaitProps) {
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 1.25;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const stableOnVerified = useCallback(onVerified, [onVerified]);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(stableOnVerified, 800);
      return () => clearTimeout(timer);
    }
  }, [progress, stableOnVerified]);

  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;

  const steps = [
    { label: "Scanning Google Maps", icon: Search, done: progress > 30 },
    { label: "Matching your review", icon: Wifi, done: progress > 60 },
    { label: "Verifying authenticity", icon: Shield, done: progress > 90 },
  ];

  return (
    <div className="flex flex-col items-center px-5 pt-8 pb-5 flex-1">
      {/* Progress ring */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-40 h-40 mb-8"
      >
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" stroke="#E8E2D6" strokeWidth="7" fill="none" />
          <motion.circle
            cx="60" cy="60" r="52"
            stroke="url(#verifyGradient)"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
          <defs>
            <linearGradient id="verifyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#166534" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[34px] font-extrabold bg-gradient-to-r from-[#166534] to-[#D4AF37] bg-clip-text text-transparent tabular-nums">
            {Math.round(Math.min(progress, 100))}%
          </span>
          <span className="text-[11px] text-[#166534] font-bold uppercase tracking-wider">Verifying</span>
        </div>
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-[#166534]/8 blur-xl"
        />
      </motion.div>

      {/* Title */}
      <h2 className="text-[20px] font-extrabold text-[#1A1A2E] mb-1.5">Verifying Your Review</h2>
      <p className="text-[13px] text-[#8B9A7E] text-center leading-relaxed mb-8">
        Please wait while we confirm your<br />review on Google Maps
      </p>

      {/* Step checklist */}
      <div className="w-full space-y-3 mb-8">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.12 }}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border transition-all duration-500 ${
              step.done
                ? "bg-[#166534]/[0.04] border-[#166534]/15"
                : "bg-white border-[#E8E2D6] shadow-sm"
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
              step.done ? "bg-[#166534] shadow-md shadow-[#166534]/25" : "bg-[#E8E2D6]"
            }`}>
              {step.done ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <step.icon className="w-3.5 h-3.5 text-[#8B9A7E]" />
                </motion.div>
              )}
            </div>
            <span className={`text-[13px] font-semibold flex-1 ${
              step.done ? "text-[#1A1A2E]" : "text-[#8B9A7E]"
            }`}>
              {step.label}
            </span>
            {step.done && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[11px] text-[#166534] font-bold"
              >
                Done ✓
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Timer & session */}
      <div className="mt-auto flex items-center gap-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8E2D6]/50">
          <div className="w-1.5 h-1.5 rounded-full bg-[#166534] animate-pulse" />
          <span className="text-[11px] text-[#6B7B68] font-medium">~{countdown}s remaining</span>
        </div>
        <span className="text-[10px] text-[#C4BBA8] font-mono bg-[#F7F3EB] px-2 py-1 rounded">{sessionToken}</span>
      </div>
    </div>
  );
}
