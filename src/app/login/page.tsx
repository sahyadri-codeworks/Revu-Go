"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (isSignUp) {
      if (!fullName.trim()) {
        setError("Full name is required");
        setLoading(false);
        return;
      }
      const { error: err } = await signUpWithEmail(email, password, fullName);
      if (err) {
        setError(err);
        setLoading(false);
      } else {
        router.push(redirectTo);
      }
    } else {
      const { error: err } = await signInWithEmail(email, password);
      if (err) {
        setError(err);
        setLoading(false);
      } else {
        try {
          const res = await fetch("/api/super-admin?action=check-admin");
          const data = await res.json();
          if (data.isAdmin) {
            router.push("/super-admin");
            return;
          }
        } catch {}
        router.push(redirectTo);
      }
    }
  };

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-sm text-[#111] placeholder:text-[#9CA3AF] focus:outline-none input-premium transition-all duration-200";

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <img src="/logo-name.png" alt="RevuGo" className="h-16 object-contain mix-blend-multiply" />
          </Link>
          <h1 className="text-xl font-semibold text-[#111] tracking-[-0.02em]">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-[#6B7280] text-sm mt-1">
            {isSignUp
              ? "Sign up to start managing reviews"
              : "Sign in to your dashboard"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4 shadow-sm">
          {/* Google OAuth */}
          <Button
            variant="outline"
            className="w-full h-12 gap-3 text-[13px] font-medium border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111] rounded-xl transition-all"
            onClick={() => signInWithGoogle()}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-[#E5E7EB]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[#9CA3AF]">
                or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className={inputClass}
                autoFocus
                required
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className={inputClass}
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? "Create password (min 6 characters)" : "Password"}
                className={`${inputClass} pr-10`}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && <p className="text-[#EF4444] text-xs">{error}</p>}
            {success && <p className="text-[#10B981] text-xs">{success}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-[13px] font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl disabled:opacity-50 transition-all duration-300"
            >
              {loading
                ? isSignUp ? "Creating account..." : "Signing in..."
                : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          {/* Toggle */}
          <p className="text-center text-[13px] text-[#6B7280]">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              className="text-[#7C3AED] font-semibold hover:text-[#6D28D9] transition-colors"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>

          <p className="text-[10px] text-center text-[#9CA3AF]">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
}
