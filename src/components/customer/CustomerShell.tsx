"use client";

import { ChevronLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface CustomerShellProps {
  businessName: string;
  businessLogo?: string;
  onBack?: () => void;
  showBack?: boolean;
  children: React.ReactNode;
}

export function CustomerShell({ businessName, businessLogo, onBack, showBack = false, children }: CustomerShellProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-[#F8F7FF] via-[#FDFAFE] to-[#F3F0FF] flex flex-col max-w-lg mx-auto relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#7C3AED]/[0.04] rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute top-60 left-0 w-64 h-64 bg-[#2563EB]/[0.04] rounded-full blur-3xl -translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-32 right-0 w-56 h-56 bg-[#7C3AED]/[0.03] rounded-full blur-3xl translate-x-1/4 pointer-events-none" />

      {/* Top bar — business branding + secure badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center justify-between px-4 py-3 safe-top"
      >
        <div className="flex items-center gap-2">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-[#E5E7EB]/60 flex items-center justify-center text-[#6B7280] hover:text-[#1A1A2E] active:scale-90 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {/* Business name in top bar */}
          <div className="flex items-center gap-2">
            {businessLogo && businessLogo.startsWith("http") ? (
              <img src={businessLogo} alt={businessName} className="w-16 h-16 rounded-full object-cover border-2 border-[#E5E7EB]" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center">
                <span className="text-white text-[22px] font-bold">{businessName.charAt(0)}</span>
              </div>
            )}
            <span className="text-[18px] font-bold text-[#1A1A2E] truncate max-w-[200px]">{businessName}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-[#7C3AED]/10 shadow-sm">
          <Shield className="w-3 h-3 text-[#7C3AED]" />
          <span className="text-[10px] text-[#7C3AED] font-semibold tracking-wide">SECURE</span>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex flex-col relative z-10">
        {children}
      </div>

      {/* Footer — RevuGo branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 flex items-center justify-center px-4 py-4 gap-2 safe-bottom"
      >
        <span className="text-[11px] text-[#9CA3AF] font-medium">Powered by</span>
        <img src="/logo-name.png" alt="RevuGo" className="h-7 object-contain mix-blend-multiply" />
      </motion.div>
    </div>
  );
}
