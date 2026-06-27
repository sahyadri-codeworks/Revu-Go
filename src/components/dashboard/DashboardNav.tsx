"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  BarChart3,
  QrCode,
  Settings,

  TicketCheck,
  LogOut,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAppState } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";

export function DashboardNav() {
  const pathname = usePathname();
  const { business } = useAppState();
  const { profile, signOut } = useAuth();
  const router = useRouter();

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
    { href: "/dashboard/reviews", label: "Review Inbox", icon: MessageSquare },
    { href: "/dashboard/coupons", label: "Verify Coupons", icon: TicketCheck },
    { href: "/dashboard/qr", label: "QR Flyer Manager", icon: QrCode },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const businessName = business?.name || "My Business";
  const businessArea = business?.location_area || "";
  const businessCity = business?.location_city || "";
  const businessInitial = businessName.charAt(0);
  const logoUrl = business?.logo_url || "";

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-[272px] glass-sidebar h-screen fixed left-0 top-0 z-40">
        {/* Brand */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <img src="/logo-name.png" alt="RevuGo" className="h-20 object-contain mix-blend-multiply" />
          </div>
        </div>

        {/* Current business card */}
        <div className="px-3 mb-4">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[#F8FAFB] border border-[#F3F4F6]">
            {logoUrl && logoUrl.startsWith("http") ? (
              <img
                src={logoUrl}
                alt={businessName}
                className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
                {businessInitial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#111] truncate">{businessName}</p>
              {(businessArea || businessCity) && (
                <p className="text-[10px] text-[#9CA3AF] truncate">
                  {[businessArea, businessCity].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="h-px bg-[#F3F4F6] mx-4 mb-3" />

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative ${
                  isActive
                    ? "bg-[#7C3AED]/8 text-[#7C3AED]"
                    : "text-[#6B7280] hover:text-[#111] hover:bg-[#F3F4F6]"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full bg-[#7C3AED]" />
                )}
                <item.icon className={`w-[17px] h-[17px] ${isActive ? "text-[#7C3AED]" : "text-[#9CA3AF] group-hover:text-[#6B7280]"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="px-3 pb-4 pt-2 relative" ref={profileRef}>
          <div className="h-px bg-[#F3F4F6] mb-3" />
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-[#F8FAFB] border border-[#F3F4F6] hover:border-[#E5E7EB] hover:bg-[#F3F4F6] transition-all duration-200 cursor-pointer group"
          >
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center text-white font-semibold text-sm">
                {(profile?.full_name || "U").charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] text-[#111] font-medium truncate group-hover:text-[#7C3AED] transition-colors">
                {profile?.full_name || "Account"}
              </p>
              <p className="text-[10px] text-[#9CA3AF] truncate">
                {profile?.email || ""}
              </p>
            </div>
            <div className="text-[#9CA3AF] group-hover:text-[#6B7280] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute left-3 right-3 bottom-full mb-2 z-50 bg-white border border-[#E5E7EB] rounded-xl shadow-xl overflow-hidden">
              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    router.push("/dashboard/settings");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F3F4F6] transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#9CA3AF]" />
                  <span className="text-[12px] text-[#374151] font-medium">Settings</span>
                </button>
                <div className="h-px bg-[#F3F4F6] mx-3 my-1" />
                <button
                  onClick={async () => {
                    setProfileDropdownOpen(false);
                    await signOut();
                    router.push("/login");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#FEF2F2] transition-colors"
                >
                  <LogOut className="w-4 h-4 text-[#EF4444]/70" />
                  <span className="text-[12px] text-[#EF4444]/80 font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#E5E7EB] h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <img src="/logo-name.png" alt="RevuGo" className="h-14 object-contain mix-blend-multiply" />
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 rounded-lg border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] hover:text-[#111] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div className="absolute left-0 top-14 bottom-0 w-[272px] bg-white border-r border-[#E5E7EB] p-3 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 p-3 rounded-xl bg-[#F8FAFB] border border-[#F3F4F6]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center text-white font-bold text-sm">
                  {businessInitial}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111]">{businessName}</p>
                  {(businessArea || businessCity) && (
                    <p className="text-[10px] text-[#9CA3AF]">
                      {[businessArea, businessCity].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                      isActive
                        ? "bg-[#7C3AED]/8 text-[#7C3AED]"
                        : "text-[#6B7280] hover:text-[#111] hover:bg-[#F3F4F6]"
                    }`}
                  >
                    <item.icon className={`w-[17px] h-[17px] ${isActive ? "text-[#7C3AED]" : "text-[#9CA3AF]"}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Settings & Sign Out */}
            <div className="mt-auto pt-4">
              <div className="h-px bg-[#F3F4F6] mb-3" />
              <Link
                href="/dashboard/settings"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  pathname === "/dashboard/settings"
                    ? "bg-[#7C3AED]/8 text-[#7C3AED]"
                    : "text-[#6B7280] hover:text-[#111] hover:bg-[#F3F4F6]"
                }`}
              >
                <Settings className={`w-[17px] h-[17px] ${pathname === "/dashboard/settings" ? "text-[#7C3AED]" : "text-[#9CA3AF]"}`} />
                Profile Settings
              </Link>
              <button
                onClick={async () => {
                  setMobileOpen(false);
                  await signOut();
                  router.push("/login");
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[#EF4444]/80 hover:bg-[#FEF2F2] transition-all"
              >
                <LogOut className="w-[17px] h-[17px] text-[#EF4444]/60" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
