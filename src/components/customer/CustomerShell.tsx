"use client";

import { ChevronLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface CustomerShellProps {
  businessName: string;
  onBack?: () => void;
  showBack?: boolean;
  children: React.ReactNode;
}

export function CustomerShell({ businessName, onBack, showBack = false, children }: CustomerShellProps) {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#F7F3EB] via-[#FDFAF4] to-[#F0EDE4] flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Nature-inspired decorative elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#166534]/[0.04] rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute top-60 left-0 w-64 h-64 bg-[#C5A044]/[0.06] rounded-full blur-3xl -translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-32 right-0 w-56 h-56 bg-[#166534]/[0.03] rounded-full blur-3xl translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-[#D4AF37]/[0.04] rounded-full blur-3xl -translate-x-1/2 translate-y-1/3 pointer-events-none" />

      {/* Subtle leaf pattern overlay */}
      <div className="absolute top-16 right-6 w-20 h-20 opacity-[0.035] pointer-events-none">
        <svg viewBox="0 0 100 100" fill="currentColor" className="text-[#166534] w-full h-full">
          <path d="M50 5C50 5 20 30 20 60C20 80 35 95 50 95C65 95 80 80 80 60C80 30 50 5 50 5Z" />
          <line x1="50" y1="95" x2="50" y2="30" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
      <div className="absolute bottom-40 left-4 w-16 h-16 opacity-[0.03] pointer-events-none rotate-[-30deg]">
        <svg viewBox="0 0 100 100" fill="currentColor" className="text-[#166534] w-full h-full">
          <path d="M50 5C50 5 20 30 20 60C20 80 35 95 50 95C65 95 80 80 80 60C80 30 50 5 50 5Z" />
        </svg>
      </div>

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center justify-between px-4 py-3 safe-top"
      >
        <div className="flex items-center gap-2">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-[#E8E2D6]/60 flex items-center justify-center text-[#5C6B52] hover:text-[#1A1A2E] active:scale-90 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-[#D4EDDA]/50 shadow-sm">
          <Shield className="w-3 h-3 text-[#166534]" />
          <span className="text-[10px] text-[#5C6B52] font-semibold tracking-wide">SECURE</span>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex flex-col relative z-10">
        {children}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 flex items-center justify-center px-4 py-4 gap-1.5 safe-bottom"
      >
        <span className="text-[10px] text-[#8B9A7E] font-medium">Powered by</span>
        <span className="text-[10px] text-[#166534] font-bold tracking-wide">RevuGo</span>
        <span className="text-[10px]">🌿</span>
      </motion.div>
    </div>
  );
}
