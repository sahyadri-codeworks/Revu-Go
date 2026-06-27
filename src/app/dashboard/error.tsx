"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-[#FEF2F2] flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-500 text-sm mb-6">Please try refreshing the page or sign in again.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9] transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/login")}
            className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:bg-[#F3F4F6] transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
