"use client";

import { useState } from "react";
import { useAppState } from "@/lib/app-context";
import type { Business } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, AlertTriangle, Loader2 } from "lucide-react";
import { INDUSTRY_SEGMENTS, SUB_INDUSTRIES } from "@/lib/industries";

const toastStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  color: "#111",
};

export default function SettingsPage() {
  const { business, updateBusiness, purgeAllData, campaigns, sessions } = useAppState();
  const { signOut } = useAuth();
  const router = useRouter();

  const [businessName, setBusinessName] = useState(business?.name || "");
  const [industry, setIndustry] = useState(business?.industry_segment || "");
  const [subIndustry, setSubIndustry] = useState(business?.sub_industry || "");
  const [area, setArea] = useState(business?.location_area || "");
  const [city, setCity] = useState(business?.location_city || "");
  const [logoUrl, setLogoUrl] = useState(business?.logo_url || "");
  const [googleMapsUrl, setGoogleMapsUrl] = useState(business?.google_maps_url || "");
  const [website, setWebsite] = useState(business?.website || "");
  const [instagram, setInstagram] = useState(business?.instagram_url || "");
  const [businessDescription, setBusinessDescription] = useState(business?.business_description || "");
  const [servicesOffered, setServicesOffered] = useState(business?.services_offered || "");
  const [staffInfo, setStaffInfo] = useState(business?.staff_info || "");
  const [businessHighlights, setBusinessHighlights] = useState(business?.business_highlights || "");
  const [phone, setPhone] = useState(business?.phone || "");
  const [email, setEmail] = useState(business?.email || "");
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [purging, setPurging] = useState(false);

  const handleCommit = () => {
    updateBusiness({
      name: businessName,
      logo_url: logoUrl,
      location_area: area,
      location_city: city,
      google_maps_url: googleMapsUrl,
      website,
      instagram_url: instagram,
      industry_segment: industry,
      sub_industry: subIndustry,
      business_description: businessDescription,
      services_offered: servicesOffered,
      staff_info: staffInfo,
      business_highlights: businessHighlights,
      phone,
      email,
    });
    toast.success("Profile changes saved", { style: toastStyle });
  };

  const handlePurge = async () => {
    setPurging(true);
    try {
      await purgeAllData();
      await signOut();
      router.push("/login");
    } catch {
      toast.error("Failed to delete data. Try again.", { style: toastStyle });
    } finally {
      setPurging(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#111] text-sm placeholder:text-[#9CA3AF] focus:outline-none input-premium transition-all duration-200";

  const selectClass =
    "w-full px-4 py-3.5 rounded-xl bg-white border border-[#E5E7EB] text-[#111] text-sm focus:outline-none input-premium transition-all duration-200 appearance-none cursor-pointer";

  const labelClass =
    "block text-[10px] text-[#6B7280] uppercase tracking-[0.12em] font-medium mb-2";

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#111] tracking-[-0.01em]">Profile Settings</h2>
        <p className="text-[13px] text-[#6B7280] mt-0.5">
          Manage your business profile and preferences
        </p>
      </div>

      {/* Form */}
      <div className="space-y-5">
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
            <label className={labelClass}>Industry Segment</label>
            <div className="relative">
              <select
                value={industry}
                onChange={(e) => {
                  setIndustry(e.target.value);
                  setSubIndustry("");
                }}
                className={`${selectClass} ${!industry ? "text-[#9CA3AF]" : ""}`}
              >
                <option value="" disabled>Select...</option>
                {INDUSTRY_SEGMENTS.map((seg) => (
                  <option key={seg.value} value={seg.value}>{seg.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Sub Industry</label>
            <div className="relative">
              <select
                value={subIndustry}
                onChange={(e) => setSubIndustry(e.target.value)}
                className={`${selectClass} ${!subIndustry ? "text-[#9CA3AF]" : ""}`}
              >
                <option value="" disabled>Select...</option>
                {(SUB_INDUSTRIES[industry] || []).map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Area / Location</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Bandra"
              className={inputClass}
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
          <label className={labelClass}>Google Maps Review Link / CID</label>
          <input
            type="text"
            value={googleMapsUrl}
            onChange={(e) => setGoogleMapsUrl(e.target.value)}
            placeholder="https://maps.google.com/?cid=384729104"
            className={inputClass}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] text-[#6B7280] uppercase tracking-[0.12em] font-medium">Brand Logo URL</label>
            <button
              onClick={() => setLogoUrl("")}
              className="text-[10px] text-[#7C3AED] hover:text-[#6D28D9] transition-colors font-medium"
            >
              Use placeholder
            </button>
          </div>
          <input
            type="text"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="URL of logo image"
            className={inputClass}
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

        <div>
          <label className={labelClass}>Business Description</label>
          <textarea
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
            placeholder="Describe your business in detail — what you do, your specialties, your approach, facilities, and what makes you unique..."
            className={`${inputClass} min-h-[120px] resize-y`}
            maxLength={2000}
          />
          <p className="text-[10px] text-[#9CA3AF] mt-1 text-right">{businessDescription.length} / 2000</p>
        </div>

        <div>
          <label className={labelClass}>Services Offered</label>
          <textarea
            value={servicesOffered}
            onChange={(e) => setServicesOffered(e.target.value)}
            placeholder="List your key services, one per line:&#10;e.g. Emergency Care&#10;General Surgery&#10;Pediatrics&#10;Diagnostic Lab"
            className={`${inputClass} min-h-[100px] resize-y`}
            maxLength={1500}
          />
        </div>

        <div>
          <label className={labelClass}>Staff Information</label>
          <textarea
            value={staffInfo}
            onChange={(e) => setStaffInfo(e.target.value)}
            placeholder="Describe your team — number of staff, expertise, specializations, notable team members..."
            className={`${inputClass} min-h-[80px] resize-y`}
            maxLength={1000}
          />
        </div>

        <div>
          <label className={labelClass}>Business Highlights</label>
          <textarea
            value={businessHighlights}
            onChange={(e) => setBusinessHighlights(e.target.value)}
            placeholder="Special features, awards, unique selling points, customer guarantees, certifications..."
            className={`${inputClass} min-h-[80px] resize-y`}
            maxLength={1000}
          />
        </div>

        <button
          onClick={handleCommit}
          className="w-full py-4 rounded-xl bg-[#7C3AED] text-white text-[11px] uppercase tracking-[0.15em] font-bold hover:bg-[#6D28D9] transition-all duration-300"
        >
          Save Changes
        </button>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 glass-card rounded-2xl p-6 border-[#EF4444]/10">
        <h3 className="text-[12px] text-[#EF4444] uppercase tracking-[0.1em] font-semibold flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4" />
          Danger Zone
        </h3>
        <p className="text-[13px] text-[#6B7280] mb-2">
          Permanently delete your business, campaigns, sessions, coupons, feedback, and all associated data. You will be signed out after deletion.
        </p>
        <p className="text-[11px] text-[#9CA3AF] mb-5">
          This will remove your business, {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}, {sessions.length} session{sessions.length !== 1 ? "s" : ""}, and all associated data.
        </p>

        {!showPurgeConfirm ? (
          <button
            onClick={() => setShowPurgeConfirm(true)}
            className="px-5 py-2.5 rounded-xl border border-[#EF4444]/15 text-[10px] text-[#EF4444]/70 uppercase tracking-[0.15em] font-semibold hover:bg-[#FEF2F2] hover:text-[#EF4444] transition-all"
          >
            Delete All Data
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handlePurge}
              disabled={purging}
              className="px-5 py-2.5 rounded-xl bg-[#EF4444] text-white text-[10px] uppercase tracking-[0.15em] font-bold hover:bg-[#DC2626] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {purging && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {purging ? "Deleting..." : "Confirm Delete"}
            </button>
            <button
              onClick={() => setShowPurgeConfirm(false)}
              disabled={purging}
              className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-[10px] text-[#6B7280] uppercase tracking-[0.15em] font-semibold hover:text-[#111] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
