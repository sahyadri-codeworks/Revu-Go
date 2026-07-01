"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronDown, ArrowRight, ArrowLeft, X } from "lucide-react";
import { INDUSTRY_SEGMENTS, SUB_INDUSTRIES } from "@/lib/industries";

interface RegisterClientModalProps {
  open: boolean;
  onClose: () => void;
  onRegister: (data: {
    businessName: string;
    industrySegment: string;
    subIndustry: string;
    area: string;
    city: string;
    googleMapsUrl: string;
    logoUrl: string;
    instagram: string;
    website: string;
    phone: string;
    email: string;
    firstName: string;
    lastName: string;
  }) => void | Promise<void>;
}

const STEP_LABELS = ["Identity", "Location", "Branding"];

export function RegisterClientModal({ open, onClose, onRegister }: RegisterClientModalProps) {
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [industrySegment, setIndustrySegment] = useState("");
  const [subIndustry, setSubIndustry] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const selectedSegment = INDUSTRY_SEGMENTS.find((s) => s.value === industrySegment);
  const subOptions = industrySegment ? (SUB_INDUSTRIES[industrySegment] || []) : [];

  const canNext0 = businessName.trim() && industrySegment;
  const canNext1 = area.trim() && city.trim();

  const resetForm = () => {
    setStep(0);
    setBusinessName("");
    setIndustrySegment("");
    setSubIndustry("");
    setArea("");
    setCity("");
    setGoogleMapsUrl("");
    setLogoUrl("");
    setInstagram("");
    setWebsite("");
    setPhone("");
    setEmail("");
    setFirstName("");
    setLastName("");
  };

  const handleRegister = async () => {
    await onRegister({
      businessName,
      industrySegment,
      subIndustry,
      area,
      city,
      googleMapsUrl,
      logoUrl,
      instagram,
      website,
      phone,
      email,
      firstName,
      lastName,
    });
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#111] text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7C3AED]/30 focus:ring-1 focus:ring-[#7C3AED]/15 transition-all duration-200";

  const selectClass =
    "w-full px-4 py-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#111] text-sm focus:outline-none focus:border-[#7C3AED]/30 transition-all duration-200 appearance-none cursor-pointer";

  const labelClass = "block text-[10px] text-[#6B7280] uppercase tracking-[0.12em] font-medium mb-2";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={handleCancel}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-lg bg-white border border-[#E5E7EB] rounded-2xl shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-[15px] font-bold text-[#111] tracking-[-0.01em]">
                    Register Business
                  </h2>
                  <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">
                    Set up a new client with custom surveys, flyers, and rewards.
                  </p>
                </div>
                <button onClick={handleCancel} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#111] hover:bg-[#F3F4F6] transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="px-6 pb-4">
                <div className="flex items-center gap-3">
                  {STEP_LABELS.map((label, i) => (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all flex-shrink-0 ${
                          i === step
                            ? "bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] text-white shadow-[0_0_12px_rgba(124,58,237,0.2)]"
                            : i < step
                            ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"
                            : "bg-[#F3F4F6] text-[#9CA3AF] border border-[#E5E7EB]"
                        }`}
                      >
                        {i < step ? "✓" : i + 1}
                      </div>
                      <span
                        className={`text-[10px] uppercase tracking-[0.1em] font-medium whitespace-nowrap ${
                          i === step ? "text-[#7C3AED]" : i < step ? "text-[#10B981]" : "text-[#9CA3AF]"
                        }`}
                      >
                        {label}
                      </span>
                      {i < STEP_LABELS.length - 1 && (
                        <div className={`w-8 h-px mx-1 ${i < step ? "bg-[#10B981]" : "bg-[#E5E7EB]"}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-[#F3F4F6]" />

              {/* Step content */}
              <div className="px-6 py-5">
                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div
                      key="step0"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>First Name</label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="e.g. Rahul"
                            className={inputClass}
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Last Name</label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="e.g. Sharma"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Business Name</label>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Sahyadri Coffee Works"
                          className={inputClass}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Industry</label>
                          <div className="relative">
                            <select
                              value={industrySegment}
                              onChange={(e) => {
                                setIndustrySegment(e.target.value);
                                setSubIndustry("");
                              }}
                              className={`${selectClass} ${!industrySegment ? "text-[#9CA3AF]" : ""}`}
                            >
                              <option value="" disabled style={{ background: "#fff", color: "#111" }}>Select...</option>
                              {INDUSTRY_SEGMENTS.map((seg) => (
                                <option key={seg.value} value={seg.value} style={{ background: "#fff", color: "#111" }}>{seg.label}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Sub Industry</label>
                          <div className="relative">
                            <select
                              value={subIndustry}
                              onChange={(e) => setSubIndustry(e.target.value)}
                              disabled={!industrySegment}
                              className={`${selectClass} ${!subIndustry ? "text-[#9CA3AF]" : ""} ${!industrySegment ? "opacity-40 cursor-not-allowed" : ""}`}
                            >
                              <option value="" disabled style={{ background: "#fff", color: "#111" }}>Select...</option>
                              {subOptions.map((sub) => (
                                <option key={sub} value={sub} style={{ background: "#fff", color: "#111" }}>{sub}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Area</label>
                          <input
                            type="text"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            placeholder="e.g. Bandra"
                            className={inputClass}
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className={labelClass}>City</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. Mumbai"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Google Maps Link</label>
                        <input
                          type="text"
                          value={googleMapsUrl}
                          onChange={(e) => setGoogleMapsUrl(e.target.value)}
                          placeholder="https://maps.google.com/?cid=384729104"
                          className={inputClass}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Phone Number</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g. +91 98765 43210"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Business Email</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. hello@mybusiness.com"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] text-[#6B7280] uppercase tracking-[0.12em] font-medium">
                            Logo URL
                          </label>
                          <button
                            type="button"
                            onClick={() => setLogoUrl("generic")}
                            className="flex items-center gap-1.5 text-[10px] text-[#7C3AED] hover:text-[#6D28D9] transition-colors font-medium"
                          >
                            <Zap className="w-3 h-3" />
                            Use placeholder
                          </button>
                        </div>
                        <input
                          type="text"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          placeholder="URL of logo image"
                          className={inputClass}
                          autoFocus
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Instagram (Optional)</label>
                          <input
                            type="text"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="e.g. caferoyale_in"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Website (Optional)</label>
                          <input
                            type="text"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="e.g. www.caferoyale.in"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-px bg-[#F3F4F6]" />

              {/* Actions */}
              <div className="px-6 py-4 flex items-center gap-3">
                {step === 0 ? (
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-3 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[11px] text-[#6B7280] uppercase tracking-[0.12em] font-medium hover:text-[#111] hover:bg-[#E5E7EB] transition-all"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex-1 py-3 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[11px] text-[#6B7280] uppercase tracking-[0.12em] font-medium hover:text-[#111] hover:bg-[#E5E7EB] transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                )}

                {step < 2 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={step === 0 ? !canNext0 : !canNext1}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-[11px] uppercase tracking-[0.12em] font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-[11px] uppercase tracking-[0.12em] font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-all flex items-center justify-center gap-2"
                  >
                    Register Business
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
