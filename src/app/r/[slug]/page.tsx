"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CustomerShell } from "@/components/customer/CustomerShell";
import { StarRating } from "@/components/customer/StarRating";
import { MCQChips } from "@/components/customer/MCQChips";
import { ReviewCards } from "@/components/customer/ReviewCards";
import { ScratchCard } from "@/components/customer/ScratchCard";
import { FinalReward } from "@/components/customer/FinalReward";
import { PrivateFeedbackForm } from "@/components/customer/PrivateFeedbackForm";
import { ComplaintForm } from "@/components/customer/ComplaintForm";
import { getMCQQuestions, generateIndustryReviews } from "@/lib/mcq-templates";
import type { Business, Campaign } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { Loader2, ExternalLink, CheckCircle, Copy, MessageSquare } from "lucide-react";

type FlowStep =
  | "rating"
  | "mcq"
  | "generating"
  | "reviews"
  | "complaint"
  | "complaint-offer-review"
  | "google-redirect"
  | "did-you-post"
  | "ask-again"
  | "scratch"
  | "final"
  | "private-feedback";

export default function CustomerReviewPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [industrySegment, setIndustrySegment] = useState("");
  const [subIndustry, setSubIndustry] = useState("");
  const [businessProfile, setBusinessProfile] = useState({
    businessDescription: "",
    servicesOffered: "",
    staffInfo: "",
    businessHighlights: "",
  });

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: biz, error: bizErr } = await supabase
        .from("businesses")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (bizErr || !biz) { setError("Business not found"); setLoading(false); return; }

      const mappedBusiness: Business = {
        id: biz.id, owner_id: biz.owner_id, name: biz.name, slug: biz.slug,
        logo_url: biz.logo_url || "", google_maps_url: biz.google_maps_url || "",
        google_place_id: biz.google_place_id || "", category: biz.category || "other",
        location_city: biz.location_city || "", location_area: biz.location_area || "",
        website: biz.website || "", instagram_url: biz.instagram_url || "",
        plan: biz.plan || "starter", is_active: biz.is_active, created_at: biz.created_at,
      };
      setBusiness(mappedBusiness);
      setIndustrySegment(biz.industry_segment || "");
      setSubIndustry(biz.sub_industry || "");
      setBusinessProfile({
        businessDescription: biz.business_description || "",
        servicesOffered: biz.services_offered || "",
        staffInfo: biz.staff_info || "",
        businessHighlights: biz.business_highlights || "",
      });

      const { data: camp } = await supabase
        .from("campaigns").select("*")
        .eq("business_id", biz.id).eq("is_active", true)
        .order("created_at", { ascending: false }).limit(1).single();

      if (camp) {
        setCampaign({
          id: camp.id, business_id: camp.business_id, title: camp.title,
          offer_text: camp.offer_text, coupon_prefix: camp.coupon_prefix,
          reward_type: camp.reward_type || "own_discount", is_active: camp.is_active,
          max_redemptions: camp.max_redemptions, redeemed_count: camp.redeemed_count || 0,
          starts_at: camp.starts_at, expires_at: camp.expires_at, created_at: camp.created_at,
        });
      }
      setLoading(false);
    }
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F8F7FF] to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin mx-auto mb-3" />
          <p className="text-[#6B7280] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F8F7FF] to-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😕</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Business Not Found</h1>
          <p className="text-gray-500 text-sm">This review link is invalid or the business is no longer active.</p>
        </div>
      </div>
    );
  }

  return (
    <CustomerFlow
      business={business} campaign={campaign}
      industrySegment={industrySegment} subIndustry={subIndustry}
      businessProfile={businessProfile}
    />
  );
}

interface BusinessProfile {
  businessDescription: string; servicesOffered: string;
  staffInfo: string; businessHighlights: string;
}

function CustomerFlow({
  business, campaign, industrySegment, subIndustry, businessProfile,
}: {
  business: Business; campaign: Campaign | null;
  industrySegment: string; subIndustry: string; businessProfile: BusinessProfile;
}) {
  const templateQuestions = getMCQQuestions(industrySegment, subIndustry);
  const [questions, setQuestions] = useState(templateQuestions);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [loadingNextQ, setLoadingNextQ] = useState(false);
  const [sessionToken] = useState(() => `rf-${Date.now().toString(36)}`);

  const [step, setStep] = useState<FlowStep>("rating");
  const [starRating, setStarRating] = useState(0);
  const [mcqStep, setMcqStep] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [mcqNotes, setMcqNotes] = useState<Record<string, string>>({});
  const [reviews, setReviews] = useState<string[]>([]);
  const [selectedReview, setSelectedReview] = useState<number | null>(null);
  const [finalReviewText, setFinalReviewText] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isNegativeFeedback, setIsNegativeFeedback] = useState(false);
  const [couponCode] = useState(() => {
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    return campaign ? `${campaign.coupon_prefix}-${suffix}` : `RF-${suffix}`;
  });

  const canGoBack = ["mcq", "reviews"].includes(step);

  const handleBack = () => {
    if (step === "mcq" && mcqStep > 0) setMcqStep((prev) => prev - 1);
    else if (step === "mcq" && mcqStep === 0) { setStep("rating"); setStarRating(0); }
    else if (step === "reviews") { setStep("mcq"); setMcqStep(questions.length - 1); }
  };

  const fetchDynamicQuestion = async (index: number, prevQA: { question: string; answer: string; note?: string }[]) => {
    try {
      const res = await fetch("/api/ai/generate-mcq", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industrySegment, subIndustry, businessName: business.name,
          businessDescription: businessProfile.businessDescription,
          servicesOffered: businessProfile.servicesOffered,
          staffInfo: businessProfile.staffInfo,
          businessHighlights: businessProfile.businessHighlights,
          starRating,
          questionIndex: index,
          previousQA: prevQA,
        }),
      });
      const data = await res.json();
      if (data.question?.question && data.question?.options) return data.question;
    } catch {}
    return templateQuestions[index] || templateQuestions[0];
  };

  const handleRatingNext = async () => {
    if (starRating === 0) return;
    setLoadingNextQ(true);
    if (!questionsLoaded) {
      const firstQ = await fetchDynamicQuestion(0, []);
      setQuestions([firstQ, templateQuestions[1], templateQuestions[2]]);
      setQuestionsLoaded(true);
    }
    setLoadingNextQ(false);
    setStep("mcq");
  };

  const handleMCQNext = async () => {
    if (mcqStep < questions.length - 1) {
      const nextIndex = mcqStep + 1;
      setLoadingNextQ(true);

      // Build previous Q&A context for dynamic question generation
      const prevQA = questions.slice(0, mcqStep + 1).map((q) => ({
        question: q.question,
        answer: mcqAnswers[q.question] || "",
        note: mcqNotes[q.question] || undefined,
      }));

      const nextQ = await fetchDynamicQuestion(nextIndex, prevQA);
      setQuestions((prev) => {
        const updated = [...prev];
        updated[nextIndex] = nextQ;
        return updated;
      });

      setLoadingNextQ(false);
      setMcqStep(nextIndex);
    } else {
      setStep("generating");
      (async () => {
        // Run sentiment analysis and review generation in parallel
        const [sentimentRes, reviewsData] = await Promise.all([
          fetch("/api/ai/analyze-sentiment", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ starRating, mcqAnswers, mcqNotes }),
          }).then(r => r.json()).catch(() => ({ isNegative: false })),

          (async () => {
            try {
              const res = await fetch("/api/ai/generate-reviews", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  businessName: business.name, locationArea: business.location_area,
                  locationCity: business.location_city, industrySegment, subIndustry,
                  businessDescription: businessProfile.businessDescription,
                  servicesOffered: businessProfile.servicesOffered,
                  staffInfo: businessProfile.staffInfo,
                  businessHighlights: businessProfile.businessHighlights,
                  mcqAnswers, mcqNotes, starRating,
                  businessId: business.id,
                }),
              });
              const data = await res.json();
              if (data.reviews && data.reviews.length >= 3) return data.reviews;
            } catch {}
            return generateIndustryReviews(business.name, business.location_area, business.location_city, industrySegment, mcqAnswers);
          })(),
        ]);

        setReviews(reviewsData);
        if (sentimentRes.isNegative) {
          setIsNegativeFeedback(true);
        }
      })();
    }
  };

  // Save review to system as soon as user selects one
  const handleReviewSelected = async (reviewText: string) => {
    setFinalReviewText(reviewText);

    if (campaign && !sessionId) {
      try {
        const res = await fetch("/api/review/submit", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create-session",
            business_id: business.id, campaign_id: campaign.id,
            star_rating: starRating, mcq_answers: mcqAnswers,
            selected_review_text: reviewText, session_token: sessionToken,
          }),
        });
        const data = await res.json();
        if (data.id) setSessionId(data.id);
      } catch {}
    }

    try { await navigator.clipboard.writeText(reviewText); } catch {}
    setStep("google-redirect");
  };

  // Open Google Maps and go to "Did you post?" screen
  const openGoogleMaps = () => {
    try { navigator.clipboard.writeText(finalReviewText); } catch {}
    if (business.google_maps_url) {
      window.open(business.google_maps_url, "_blank");
    }
    setTimeout(() => setStep("did-you-post"), 2000);
  };

  // Create coupon and show scratch card
  const showReward = useCallback(async () => {
    setStep("scratch");
  }, []);

  const handleScratchRevealed = useCallback(async () => {
    if (campaign && sessionId) {
      try {
        await fetch("/api/review/submit", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create-coupon",
            session_id: sessionId, business_id: business.id,
            campaign_id: campaign.id, coupon_code: couponCode,
            reward_type: campaign.reward_type || "own_discount",
            reward_value: campaign.offer_text, expires_at: campaign.expires_at,
          }),
        });
      } catch {}
    }
    setTimeout(() => setStep("final"), 1200);
  }, [campaign, sessionId, business.id, couponCode]);

  const offerText = campaign?.offer_text || "Leave a review and get a reward!";
  const expiryDate = campaign?.expires_at?.split("T")[0] || "2026-12-31";

  return (
    <CustomerShell businessName={business.name} businessLogo={business.logo_url || undefined} showBack={canGoBack} onBack={handleBack}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step + (step === "mcq" ? `-${mcqStep}` : "")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col"
        >
          {step === "rating" && (
            <StarRating
              rating={starRating} onRate={setStarRating} onNext={handleRatingNext}
              businessName={business.name} businessLogo={business.logo_url || undefined}
              locationArea={business.location_area} locationCity={business.location_city}
              offerText={offerText} loading={loadingNextQ}
            />
          )}

          {step === "private-feedback" && (
            <PrivateFeedbackForm starRating={starRating} businessName={business.name}
              onSubmit={async (feedbackText) => {
                if (campaign) {
                  await fetch("/api/review/submit", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "submit-feedback", business_id: business.id,
                      campaign_id: campaign.id, star_rating: starRating, feedback_text: feedbackText,
                    }),
                  }).catch(() => {});
                }
              }}
            />
          )}

          {step === "mcq" && (
            <MCQChips
              questions={questions} currentStep={mcqStep}
              answers={mcqAnswers} notes={mcqNotes}
              onAnswer={(q, a) => setMcqAnswers((p) => ({ ...p, [q]: a }))}
              onNote={(q, n) => setMcqNotes((p) => ({ ...p, [q]: n }))}
              onNext={handleMCQNext}
              loadingNext={loadingNextQ}
            />
          )}

          {(step === "generating" || step === "reviews") && (
            <ReviewCards
              reviews={reviews} selectedIndex={selectedReview}
              onSelect={setSelectedReview}
              onPostToGoogle={handleReviewSelected}
              isGenerating={step === "generating"} sessionToken={sessionToken}
              onGeneratingDone={() => setStep(isNegativeFeedback ? "complaint" : "reviews")}
            />
          )}

          {step === "complaint" && (
            <ComplaintForm
              businessName={business.name}
              starRating={starRating}
              onSubmit={async (data) => {
                await fetch("/api/review/submit", {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "submit-complaint",
                    business_id: business.id,
                    campaign_id: campaign?.id,
                    star_rating: starRating,
                    complaint_text: data.complaint_text,
                    is_anonymous: data.is_anonymous,
                    contact_name: data.contact_name,
                    contact_email: data.contact_email,
                    contact_phone: data.contact_phone,
                    consent_given: data.consent_given,
                    session_token: sessionToken,
                    mcq_answers: mcqAnswers,
                  }),
                }).catch(() => {});
              }}
              onSkip={() => setStep("complaint-offer-review")}
            />
          )}

          {step === "complaint-offer-review" && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-5">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                <div className="text-[48px] mb-4">💬</div>
                <h2 className="text-[20px] font-extrabold text-[#1A1A2E] mb-2">
                  Would you like to share a review?
                </h2>
                <p className="text-[14px] text-[#6B7280] leading-relaxed max-w-[300px] mx-auto">
                  If you&apos;d still like to share your experience on Google, we have some reviews ready for you. No pressure at all!
                </p>
              </motion.div>

              <div className="w-full max-w-[300px] space-y-3">
                <motion.button whileTap={{ scale: 0.98 }}
                  onClick={() => setStep("reviews")}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-[15px] font-bold shadow-lg shadow-[#7C3AED]/25 flex items-center justify-center gap-2">
                  Yes, show me reviews
                </motion.button>

                <motion.button whileTap={{ scale: 0.98 }}
                  onClick={showReward}
                  className="w-full py-4 rounded-2xl border-2 border-[#E5E7EB] text-[15px] text-[#6B7280] font-semibold hover:border-[#D1D5DB] transition-colors">
                  No thanks, show my reward
                </motion.button>

                <p className="text-[11px] text-[#9CA3AF] text-center mt-2">
                  Thank you for your honest feedback! 💜
                </p>
              </div>
            </div>
          )}

          {/* ===== GOOGLE REDIRECT SCREEN ===== */}
          {step === "google-redirect" && (
            <div className="flex-1 flex flex-col px-6 pt-8 pb-5">
              <div className="flex flex-col items-center mb-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-[#10B981]" />
                </motion.div>
                <h2 className="text-[20px] font-extrabold text-[#1A1A2E] mb-1">Review Saved!</h2>
                <p className="text-[13px] text-[#6B7280] text-center max-w-[280px]">
                  Your review has been recorded. Would you also like to post it on Google?
                </p>
              </div>

              {/* Review preview */}
              <div className="bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] p-4 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Copy className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[11px] text-[#10B981] font-bold">Copied to clipboard</span>
                </div>
                <p className="text-[12px] text-[#6B7280] leading-relaxed line-clamp-3">&ldquo;{finalReviewText}&rdquo;</p>
              </div>

              {/* Steps */}
              <div className="space-y-2.5 mb-6">
                {[
                  { num: "1", text: "Tap the button below to open Google" },
                  { num: "2", text: "Long press to paste your review" },
                  { num: "3", text: "Submit and come back for your reward!" },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-[#E5E7EB]">
                    <div className="w-7 h-7 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
                      {s.num}
                    </div>
                    <p className="text-[13px] text-[#374151] font-medium">{s.text}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto space-y-3">
                <motion.button whileTap={{ scale: 0.98 }} onClick={openGoogleMaps}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-[15px] font-bold shadow-lg shadow-[#7C3AED]/25">
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#fff" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" fillOpacity="0.8" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" fillOpacity="0.6" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" fillOpacity="0.9" />
                  </svg>
                  Post on Google Maps
                  <ExternalLink className="w-4 h-4" />
                </motion.button>

                <motion.button whileTap={{ scale: 0.98 }} onClick={showReward}
                  className="w-full py-3.5 rounded-2xl border-2 border-[#E5E7EB] text-[14px] text-[#6B7280] font-semibold hover:border-[#D1D5DB] transition-colors">
                  Skip, show my reward
                </motion.button>

                <button onClick={() => { try { navigator.clipboard.writeText(finalReviewText); } catch {} }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-[12px] text-[#9CA3AF] font-medium hover:text-[#6B7280] transition-colors">
                  <Copy className="w-3.5 h-3.5" /> Copy Review Again
                </button>
              </div>
            </div>
          )}

          {/* ===== DID YOU POST? ===== */}
          {step === "did-you-post" && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-5">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mb-5">
                <MessageSquare className="w-10 h-10 text-[#7C3AED]" />
              </motion.div>

              <h2 className="text-[22px] font-extrabold text-[#1A1A2E] mb-2 text-center">
                Did you post your review on Google?
              </h2>
              <p className="text-[13px] text-[#6B7280] text-center mb-8 max-w-[280px]">
                We&apos;d love to know! Your reward is waiting for you either way 🎉
              </p>

              <div className="w-full max-w-[300px] space-y-3">
                <motion.button whileTap={{ scale: 0.98 }} onClick={showReward}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-[15px] font-bold shadow-lg shadow-[#10B981]/25 flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Yes, I posted it!
                </motion.button>

                <motion.button whileTap={{ scale: 0.98 }} onClick={() => setStep("ask-again")}
                  className="w-full py-4 rounded-2xl border-2 border-[#E5E7EB] text-[15px] text-[#6B7280] font-semibold hover:border-[#D1D5DB] transition-colors">
                  Not yet
                </motion.button>
              </div>
            </div>
          )}

          {/* ===== ASK AGAIN POLITELY ===== */}
          {step === "ask-again" && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-5">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8">
                <div className="text-[48px] mb-4">🙏</div>
                <h2 className="text-[20px] font-extrabold text-[#1A1A2E] mb-2">
                  No worries at all!
                </h2>
                <p className="text-[14px] text-[#6B7280] leading-relaxed max-w-[300px] mx-auto">
                  Your review is still copied. Would you like to take a moment to post it? It really helps <strong className="text-[#1A1A2E]">{business.name}</strong> grow!
                </p>
              </motion.div>

              <div className="w-full max-w-[300px] space-y-3">
                <motion.button whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    try { navigator.clipboard.writeText(finalReviewText); } catch {}
                    if (business.google_maps_url) window.open(business.google_maps_url, "_blank");
                    setTimeout(() => setStep("did-you-post"), 2000);
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-[15px] font-bold shadow-lg shadow-[#7C3AED]/25 flex items-center justify-center gap-2">
                  <ExternalLink className="w-5 h-5" /> Yes, take me to Google
                </motion.button>

                <motion.button whileTap={{ scale: 0.98 }} onClick={showReward}
                  className="w-full py-4 rounded-2xl border-2 border-[#E5E7EB] text-[15px] text-[#6B7280] font-semibold hover:border-[#D1D5DB] transition-colors">
                  Maybe later, show my reward
                </motion.button>

                <p className="text-[11px] text-[#9CA3AF] text-center mt-2">
                  Thank you for your time! You&apos;ll still get your reward 💜
                </p>
              </div>
            </div>
          )}

          {step === "scratch" && (
            <ScratchCard couponCode={couponCode} rewardText={offerText}
              businessName={business.name} logoUrl={business.logo_url || ""}
              sessionToken={sessionToken} onRevealed={handleScratchRevealed}
            />
          )}

          {step === "final" && (
            <FinalReward couponCode={couponCode} rewardText={offerText}
              businessName={business.name} expiryDate={expiryDate}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </CustomerShell>
  );
}
