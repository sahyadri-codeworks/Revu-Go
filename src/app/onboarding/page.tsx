"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Upload, ArrowRight, Check, MapPin, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { BusinessCategory } from "@/types";

const categories: { value: BusinessCategory; label: string; emoji: string }[] = [
  { value: "cafe", label: "Cafe", emoji: "☕" },
  { value: "restaurant", label: "Restaurant", emoji: "🍽️" },
  { value: "salon", label: "Salon", emoji: "💇" },
  { value: "spa", label: "Spa", emoji: "💆" },
  { value: "retail", label: "Retail", emoji: "🛍️" },
  { value: "clinic", label: "Clinic", emoji: "🏥" },
  { value: "hotel", label: "Hotel", emoji: "🏨" },
  { value: "gym", label: "Gym", emoji: "💪" },
  { value: "other", label: "Other", emoji: "🏢" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<BusinessCategory | "">("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");

  const steps = [
    {
      title: "What's your business name?",
      subtitle: "This will appear on your QR codes and review pages",
      icon: Store,
    },
    {
      title: "What type of business?",
      subtitle: "This helps us customize review questions for your customers",
      icon: Store,
    },
    {
      title: "Where are you located?",
      subtitle: "Your city and area help with local SEO in reviews",
      icon: MapPin,
    },
    {
      title: "Your Google Maps link",
      subtitle: "We'll use this to verify reviews and generate deep links",
      icon: MapPin,
    },
  ];

  const canProceed = () => {
    switch (step) {
      case 0: return name.trim().length > 0;
      case 1: return category !== "";
      case 2: return city.trim().length > 0 && area.trim().length > 0;
      case 3: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EFF6FF] to-white flex flex-col">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <img src="/logo-name.png" alt="RevuGo" className="h-20 object-contain mix-blend-multiply" />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex gap-1.5 mb-8">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-[#1A56DB]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="text-2xl font-bold text-[#111928] mb-1">{steps[step].title}</h1>
              <p className="text-[#6B7280] mb-8">{steps[step].subtitle}</p>

              {step === 0 && (
                <div className="space-y-4">
                  <Input
                    placeholder="e.g. Cafe Royale"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 text-lg rounded-xl"
                    autoFocus
                  />
                  <div className="flex items-center gap-4 pt-2">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-[#6B7280]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#374151]">Upload logo (optional)</p>
                      <p className="text-xs text-[#6B7280]">You can add this later</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        category === cat.value
                          ? "border-[#1A56DB] bg-[#1A56DB]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-2xl">{cat.emoji}</span>
                      <p className="text-xs font-medium text-[#374151] mt-1">{cat.label}</p>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      placeholder="e.g. Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="h-12 rounded-xl mt-1.5"
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label>Area / Neighbourhood</Label>
                    <Input
                      placeholder="e.g. Bandra West"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="h-12 rounded-xl mt-1.5"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <Input
                    placeholder="https://maps.google.com/..."
                    value={mapsUrl}
                    onChange={(e) => setMapsUrl(e.target.value)}
                    className="h-14 text-sm rounded-xl"
                    autoFocus
                  />
                  <div className="bg-[#1A56DB]/5 rounded-xl p-4">
                    <p className="text-sm text-[#374151]">
                      <strong>How to find it:</strong> Search your business on Google Maps → Click Share → Copy link
                    </p>
                  </div>
                  <p className="text-xs text-[#6B7280]">
                    You can skip this and add it later from Settings
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8">
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="w-full h-14 text-base bg-[#1A56DB] hover:bg-[#1A56DB]/90 text-white rounded-xl disabled:opacity-40 gap-2"
            >
              {step === steps.length - 1 ? (
                <>
                  <Check className="w-5 h-5" />
                  Complete Setup
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
