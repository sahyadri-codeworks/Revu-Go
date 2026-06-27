"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CustomerShell } from "@/components/customer/CustomerShell";
import { StarRating } from "@/components/customer/StarRating";
import { MCQChips } from "@/components/customer/MCQChips";
import { ReviewCards } from "@/components/customer/ReviewCards";
import { PublishReview } from "@/components/customer/PublishReview";
import { VerificationWait } from "@/components/customer/VerificationWait";
import { ScratchCard } from "@/components/customer/ScratchCard";
import { FinalReward } from "@/components/customer/FinalReward";
import { PrivateFeedbackForm } from "@/components/customer/PrivateFeedbackForm";
import { getMCQQuestions, generateIndustryReviews } from "@/lib/mcq-templates";
import type { Business, Campaign } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

type FlowStep =
  | "rating"
  | "mcq"
  | "generating"
  | "reviews"
  | "publish"
  | "verifying"
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

      if (bizErr || !biz) {
        setError("Business not found");
        setLoading(false);
        return;
      }

      const mappedBusiness: Business = {
        id: biz.id,
        owner_id: biz.owner_id,
        name: biz.name,
        slug: biz.slug,
        logo_url: biz.logo_url || "",
        google_maps_url: biz.google_maps_url || "",
        google_place_id: biz.google_place_id || "",
        category: biz.category || "other",
        location_city: biz.location_city || "",
        location_area: biz.location_area || "",
        website: biz.website || "",
        instagram_url: biz.instagram_url || "",
        plan: biz.plan || "starter",
        is_active: biz.is_active,
        created_at: biz.created_at,
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
        .from("campaigns")
        .select("*")
        .eq("business_id", biz.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (camp) {
        setCampaign({
          id: camp.id,
          business_id: camp.business_id,
          title: camp.title,
          offer_text: camp.offer_text,
          coupon_prefix: camp.coupon_prefix,
          reward_type: camp.reward_type || "own_discount",
          is_active: camp.is_active,
          max_redemptions: camp.max_redemptions,
          redeemed_count: camp.redeemed_count || 0,
          starts_at: camp.starts_at,
          expires_at: camp.expires_at,
          created_at: camp.created_at,
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
          <Loader2 className="w-8 h-8 text-[#6C3CE1] animate-spin mx-auto mb-3" />
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
          <p className="text-gray-500 text-sm">
            This review link is invalid or the business is no longer active.
          </p>
        </div>
      </div>
    );
  }

  return (
    <CustomerFlow
      business={business}
      campaign={campaign}
      industrySegment={industrySegment}
      subIndustry={subIndustry}
      businessProfile={businessProfile}
    />
  );
}

interface BusinessProfile {
  businessDescription: string;
  servicesOffered: string;
  staffInfo: string;
  businessHighlights: string;
}

function CustomerFlow({
  business,
  campaign,
  industrySegment,
  subIndustry,
  businessProfile,
}: {
  business: Business;
  campaign: Campaign | null;
  industrySegment: string;
  subIndustry: string;
  businessProfile: BusinessProfile;
}) {
  const supabase = createClient();
  const templateQuestions = getMCQQuestions(industrySegment, subIndustry);
  const [questions, setQuestions] = useState(templateQuestions);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [sessionToken] = useState(() => `rf-${Date.now().toString(36)}`);

  const [step, setStep] = useState<FlowStep>("rating");
  const [starRating, setStarRating] = useState(0);
  const [mcqStep, setMcqStep] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [mcqNotes, setMcqNotes] = useState<Record<string, string>>({});
  const [reviews, setReviews] = useState<string[]>([]);
  const [selectedReview, setSelectedReview] = useState<number | null>(null);
  const [couponCode] = useState(() => {
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    return campaign ? `${campaign.coupon_prefix}-${suffix}` : `RF-${suffix}`;
  });

  const canGoBack = ["mcq", "reviews", "publish"].includes(step);

  const handleBack = () => {
    if (step === "mcq" && mcqStep > 0) {
      setMcqStep((prev) => prev - 1);
    } else if (step === "mcq" && mcqStep === 0) {
      setStep("rating");
      setStarRating(0);
    } else if (step === "reviews") {
      setStep("mcq");
      setMcqStep(questions.length - 1);
    } else if (step === "publish") {
      setStep("reviews");
    }
  };

  const handleRate = (rating: number) => {
    setStarRating(rating);
  };

  const handleRatingNext = async () => {
    if (starRating === 0) return;

    if (!questionsLoaded) {
      try {
        const res = await fetch("/api/ai/generate-mcq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            industrySegment,
            subIndustry,
            businessName: business.name,
            businessDescription: businessProfile.businessDescription,
            servicesOffered: businessProfile.servicesOffered,
            staffInfo: businessProfile.staffInfo,
            businessHighlights: businessProfile.businessHighlights,
          }),
        });
        const data = await res.json();
        if (data.questions && data.questions.length >= 3) {
          setQuestions(data.questions);
        }
      } catch {
        // fallback to template questions already set
      }
      setQuestionsLoaded(true);
    }

    setStep("mcq");
  };

  const handleMCQAnswer = (question: string, answer: string) => {
    setMcqAnswers((prev) => ({ ...prev, [question]: answer }));
  };

  const handleMCQNote = (question: string, note: string) => {
    setMcqNotes((prev) => ({ ...prev, [question]: note }));
  };

  const handleMCQNext = () => {
    if (mcqStep < questions.length - 1) {
      setMcqStep((prev) => prev + 1);
    } else {
      setStep("generating");

      (async () => {
        try {
          const res = await fetch("/api/ai/generate-reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              businessName: business.name,
              locationArea: business.location_area,
              locationCity: business.location_city,
              industrySegment,
              subIndustry,
              businessDescription: businessProfile.businessDescription,
              servicesOffered: businessProfile.servicesOffered,
              staffInfo: businessProfile.staffInfo,
              businessHighlights: businessProfile.businessHighlights,
              mcqAnswers,
              mcqNotes,
              starRating,
            }),
          });
          const data = await res.json();
          if (data.reviews && data.reviews.length >= 3) {
            setReviews(data.reviews);
            return;
          }
        } catch {
          // fallback below
        }
        setReviews(generateIndustryReviews(business.name, business.location_area, business.location_city, industrySegment, mcqAnswers));
      })();
    }
  };

  const handleSelectReview = (index: number) => {
    setSelectedReview(index);
    if (reviews[index]) {
      navigator.clipboard.writeText(reviews[index]).catch(() => {});
    }
  };

  const handleUseTemplate = () => {
    if (selectedReview === null) return;
    setStep("publish");
  };

  const [sessionId, setSessionId] = useState<string | null>(null);

  const handlePublished = async () => {
    if (campaign) {
      const { data: row } = await supabase
        .from("review_sessions")
        .insert({
          business_id: business.id,
          campaign_id: campaign.id,
          star_rating: starRating,
          mcq_answers: mcqAnswers,
          selected_review_text: selectedReview !== null ? reviews[selectedReview] : "",
          session_token: sessionToken,
          token_status: "PENDING",
        })
        .select("id")
        .single();
      if (row) setSessionId(row.id);
    }
    setStep("verifying");
  };

  const handleVerified = useCallback(() => {
    setStep("scratch");
  }, []);

  const handleScratchRevealed = useCallback(async () => {
    if (campaign && sessionId) {
      await supabase.from("coupons").insert({
        session_id: sessionId,
        business_id: business.id,
        campaign_id: campaign.id,
        coupon_code: couponCode,
        reward_type: campaign.reward_type || "own_discount",
        reward_value: campaign.offer_text,
        is_redeemed: false,
        issued_at: new Date().toISOString(),
        expires_at: campaign.expires_at,
      });
      const { count } = await supabase
        .from("coupons")
        .select("*", { count: "exact", head: true })
        .eq("campaign_id", campaign.id);
      await supabase
        .from("campaigns")
        .update({ redeemed_count: (count ?? 0) })
        .eq("id", campaign.id);
    }
    setTimeout(() => {
      setStep("final");
    }, 1200);
  }, [campaign, sessionId, business.id, couponCode, supabase]);

  const offerText = campaign?.offer_text || "Leave a review and get a reward!";
  const expiryDate = campaign?.expires_at?.split("T")[0] || "2026-12-31";

  return (
    <CustomerShell
      businessName={business.name}
      showBack={canGoBack}
      onBack={handleBack}
    >
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
              rating={starRating}
              onRate={handleRate}
              onNext={handleRatingNext}
              businessName={business.name}
              businessLogo={business.logo_url || undefined}
              locationArea={business.location_area}
              locationCity={business.location_city}
              offerText={offerText}
            />
          )}

          {step === "private-feedback" && (
            <PrivateFeedbackForm
              starRating={starRating}
              businessName={business.name}
              onSubmit={async (feedbackText) => {
                if (campaign) {
                  await supabase.from("private_feedback").insert({
                    business_id: business.id,
                    campaign_id: campaign.id,
                    star_rating: starRating,
                    feedback_text: feedbackText,
                    is_read: false,
                  });
                }
              }}
            />
          )}

          {step === "mcq" && (
            <MCQChips
              questions={questions}
              currentStep={mcqStep}
              answers={mcqAnswers}
              notes={mcqNotes}
              onAnswer={handleMCQAnswer}
              onNote={handleMCQNote}
              onNext={handleMCQNext}
            />
          )}

          {(step === "generating" || step === "reviews") && (
            <ReviewCards
              reviews={reviews}
              selectedIndex={selectedReview}
              onSelect={handleSelectReview}
              onPostToGoogle={handleUseTemplate}
              isGenerating={step === "generating"}
              sessionToken={sessionToken}
              onGeneratingDone={() => setStep("reviews")}
            />
          )}

          {step === "publish" && selectedReview !== null && (
            <PublishReview
              reviewText={reviews[selectedReview]}
              googleMapsUrl={business.google_maps_url}
              onPublished={handlePublished}
            />
          )}

          {step === "verifying" && (
            <VerificationWait
              onVerified={handleVerified}
              sessionToken={sessionToken}
            />
          )}

          {step === "scratch" && (
            <ScratchCard
              couponCode={couponCode}
              rewardText={offerText}
              businessName={business.name}
              logoUrl={business.logo_url || ""}
              sessionToken={sessionToken}
              onRevealed={handleScratchRevealed}
            />
          )}

          {step === "final" && (
            <FinalReward
              couponCode={couponCode}
              rewardText={offerText}
              businessName={business.name}
              expiryDate={expiryDate}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </CustomerShell>
  );
}
