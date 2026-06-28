"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { Business, Campaign, ReviewSession, Coupon, PrivateFeedback } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

interface AppState {
  business: Business | null;
  campaigns: Campaign[];
  sessions: ReviewSession[];
  coupons: Coupon[];
  privateFeedback: PrivateFeedback[];
  loading: boolean;
  needsOnboarding: boolean;
}

interface RegisterData {
  businessName: string;
  industrySegment: string;
  subIndustry: string;
  area: string;
  city: string;
  googleMapsUrl: string;
  logoUrl: string;
  instagram: string;
  website: string;
}

interface AppContextType extends AppState {
  addCampaign: (data: {
    title: string;
    offerText: string;
    couponPrefix: string;
    maxPayouts: number;
    expiry: string;
  }) => void;
  deleteCampaign: (id: string) => void;
  toggleCampaign: (id: string) => void;
  registerBusiness: (data: RegisterData) => Promise<void>;
  updateBusiness: (data: Partial<Business>) => void;
  toggleFeedbackRead: (id: string) => void;
  redeemCoupon: (id: string) => Promise<boolean>;
  purgeAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function mapCategory(segment: string): string {
  const map: Record<string, string> = {
    restaurants_cafes: "cafe",
    beauty_salon: "salon",
    retail_shopping: "retail",
    healthcare_medical: "clinic",
    travel_hospitality: "hotel",
    fitness_gym: "gym",
  };
  return map[segment] || "other";
}

function dbRowToBusiness(row: Record<string, unknown>): Business {
  return {
    id: row.id as string,
    owner_id: row.owner_id as string,
    name: row.name as string,
    slug: row.slug as string,
    logo_url: (row.logo_url as string) || "",
    google_maps_url: (row.google_maps_url as string) || "",
    google_place_id: (row.google_place_id as string) || "",
    category: ((row.category as string) || "other") as Business["category"],
    location_city: (row.location_city as string) || "",
    location_area: (row.location_area as string) || "",
    website: (row.website as string) || "",
    instagram_url: (row.instagram_url as string) || "",
    plan: ((row.plan as string) || "starter") as Business["plan"],
    is_active: (row.is_active as boolean) ?? true,
    created_at: (row.created_at as string) || "",
    business_description: (row.business_description as string) || "",
    services_offered: (row.services_offered as string) || "",
    staff_info: (row.staff_info as string) || "",
    business_highlights: (row.business_highlights as string) || "",
    industry_segment: (row.industry_segment as string) || "",
    sub_industry: (row.sub_industry as string) || "",
  };
}

function dbRowToCampaign(row: Record<string, unknown>): Campaign {
  return {
    id: row.id as string,
    business_id: row.business_id as string,
    title: row.title as string,
    offer_text: row.offer_text as string,
    coupon_prefix: row.coupon_prefix as string,
    reward_type: (row.reward_type as Campaign["reward_type"]) || "own_discount",
    is_active: (row.is_active as boolean) ?? true,
    max_redemptions: (row.max_redemptions as number) || 100,
    redeemed_count: (row.redeemed_count as number) || 0,
    starts_at: (row.starts_at as string) || "",
    expires_at: (row.expires_at as string) || "",
    qr_url: (row.qr_url as string) || undefined,
    created_at: (row.created_at as string) || "",
  };
}

function dbRowToCoupon(row: Record<string, unknown>): Coupon {
  return {
    id: row.id as string,
    session_id: row.session_id as string,
    business_id: row.business_id as string,
    campaign_id: row.campaign_id as string,
    coupon_code: row.coupon_code as string,
    reward_type: (row.reward_type as string) || "",
    reward_value: (row.reward_value as string) || "",
    brand_name: (row.brand_name as string) || undefined,
    is_redeemed: (row.is_redeemed as boolean) ?? false,
    redeemed_at: (row.redeemed_at as string) || undefined,
    issued_at: (row.issued_at as string) || "",
    expires_at: (row.expires_at as string) || "",
  };
}

function dbRowToSession(row: Record<string, unknown>): ReviewSession {
  return {
    id: row.id as string,
    business_id: row.business_id as string,
    campaign_id: row.campaign_id as string,
    star_rating: row.star_rating as number,
    mcq_answers: (row.mcq_answers as Record<string, string>) || {},
    selected_review_text: (row.selected_review_text as string) || "",
    session_token: row.session_token as string,
    token_status: (row.token_status as ReviewSession["token_status"]) || "PENDING",
    device_fingerprint: (row.device_fingerprint as string) || undefined,
    ip_address: (row.ip_address as string) || undefined,
    user_agent: (row.user_agent as string) || undefined,
    google_account_id: (row.google_account_id as string) || undefined,
    created_at: (row.created_at as string) || "",
  };
}

function dbRowToFeedback(row: Record<string, unknown>): PrivateFeedback {
  return {
    id: row.id as string,
    business_id: row.business_id as string,
    campaign_id: row.campaign_id as string,
    star_rating: row.star_rating as number,
    feedback_text: (row.feedback_text as string) || "",
    is_read: (row.is_read as boolean) ?? false,
    created_at: (row.created_at as string) || "",
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient());
  const { user } = useAuth();
  const userId = user?.id;
  const loadedUserIdRef = useRef<string | null>(null);
  const [state, setState] = useState<AppState>({
    business: null,
    campaigns: [],
    sessions: [],
    coupons: [],
    privateFeedback: [],
    loading: true,
    needsOnboarding: false,
  });

  const loadBusinessData = useCallback(
    async (businessId: string) => {
      const [campaignsRes, sessionsRes, couponsRes, feedbackRes] =
        await Promise.all([
          supabase
            .from("campaigns")
            .select("*")
            .eq("business_id", businessId)
            .order("created_at", { ascending: false }),
          supabase
            .from("review_sessions")
            .select("*")
            .eq("business_id", businessId)
            .order("created_at", { ascending: false }),
          supabase
            .from("coupons")
            .select("*")
            .eq("business_id", businessId)
            .order("issued_at", { ascending: false }),
          supabase
            .from("private_feedback")
            .select("*")
            .eq("business_id", businessId)
            .order("created_at", { ascending: false }),
        ]);

      const campaigns = (campaignsRes.data || []).map(dbRowToCampaign);
      const coupons = (couponsRes.data || []).map(dbRowToCoupon);

      const couponCountByCampaign: Record<string, number> = {};
      for (const c of coupons) {
        couponCountByCampaign[c.campaign_id] = (couponCountByCampaign[c.campaign_id] || 0) + 1;
      }
      for (const camp of campaigns) {
        const actualCount = couponCountByCampaign[camp.id] || 0;
        if (actualCount !== camp.redeemed_count) {
          camp.redeemed_count = actualCount;
        }
      }

      return {
        campaigns,
        sessions: (sessionsRes.data || []).map(dbRowToSession),
        coupons,
        privateFeedback: (feedbackRes.data || []).map(dbRowToFeedback),
      };
    },
    [supabase]
  );

  useEffect(() => {
    if (!userId) {
      loadedUserIdRef.current = null;
      setState({
        business: null,
        campaigns: [],
        sessions: [],
        coupons: [],
        privateFeedback: [],
        loading: false,
        needsOnboarding: false,
      });
      return;
    }

    if (loadedUserIdRef.current === userId) return;
    loadedUserIdRef.current = userId;

    setState((prev) => ({ ...prev, loading: true }));

    async function fetchAll() {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", userId!)
        .single();

      if (error || !data) {
        setState({
          business: null,
          campaigns: [],
          sessions: [],
          coupons: [],
          privateFeedback: [],
          loading: false,
          needsOnboarding: true,
        });
        return;
      }

      const business = dbRowToBusiness(data);
      const businessData = await loadBusinessData(business.id);

      setState({
        business,
        ...businessData,
        loading: false,
        needsOnboarding: false,
      });

      // Real-time subscriptions
      const channel = supabase
        .channel(`biz-${business.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "review_sessions", filter: `business_id=eq.${business.id}` },
          (payload) => {
            const newSession = dbRowToSession(payload.new as Record<string, unknown>);
            setState((prev) => ({
              ...prev,
              sessions: [newSession, ...prev.sessions],
            }));
          }
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "coupons", filter: `business_id=eq.${business.id}` },
          (payload) => {
            const newCoupon = dbRowToCoupon(payload.new as Record<string, unknown>);
            setState((prev) => ({
              ...prev,
              coupons: [newCoupon, ...prev.coupons],
            }));
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "coupons", filter: `business_id=eq.${business.id}` },
          (payload) => {
            const updated = dbRowToCoupon(payload.new as Record<string, unknown>);
            setState((prev) => {
              const coupons = prev.campaigns.length > 0
                ? prev.coupons.map((c) => (c.id === updated.id ? updated : c))
                : prev.coupons;
              const couponCountByCampaign: Record<string, number> = {};
              for (const c of coupons) {
                couponCountByCampaign[c.campaign_id] = (couponCountByCampaign[c.campaign_id] || 0) + 1;
              }
              const campaigns = prev.campaigns.map((camp) => ({
                ...camp,
                redeemed_count: couponCountByCampaign[camp.id] || 0,
              }));
              return { ...prev, coupons: coupons, campaigns };
            });
          }
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "private_feedback", filter: `business_id=eq.${business.id}` },
          (payload) => {
            const newFeedback = dbRowToFeedback(payload.new as Record<string, unknown>);
            setState((prev) => ({
              ...prev,
              privateFeedback: [newFeedback, ...prev.privateFeedback],
            }));
          }
        )
        .subscribe();

      channelRef.current = channel;
    }

    const channelRef: { current: ReturnType<typeof supabase.channel> | null } = { current: null };
    fetchAll();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [userId, supabase, loadBusinessData]);

  const addCampaign = useCallback(
    async (data: {
      title: string;
      offerText: string;
      couponPrefix: string;
      maxPayouts: number;
      expiry: string;
    }) => {
      if (!state.business) return;

      const now = new Date().toISOString();
      const { data: row, error } = await supabase
        .from("campaigns")
        .insert({
          business_id: state.business.id,
          title: data.title,
          offer_text: data.offerText,
          coupon_prefix: data.couponPrefix,
          reward_type: "own_discount",
          is_active: true,
          max_redemptions: data.maxPayouts,
          redeemed_count: 0,
          starts_at: now,
          expires_at: data.expiry
            ? new Date(data.expiry).toISOString()
            : new Date(Date.now() + 30 * 86400000).toISOString(),
        })
        .select("*")
        .single();

      if (error) {
        console.error("Campaign creation failed:", error.message);
        return;
      }

      if (row) {
        const newCampaign = dbRowToCampaign(row);
        setState((prev) => ({
          ...prev,
          campaigns: [newCampaign, ...prev.campaigns],
        }));
      }
    },
    [state.business, supabase]
  );

  const deleteCampaign = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) {
        console.error("Campaign deletion failed:", error.message);
        return;
      }
      setState((prev) => ({
        ...prev,
        campaigns: prev.campaigns.filter((c) => c.id !== id),
      }));
    },
    [supabase]
  );

  const toggleCampaign = useCallback(
    async (id: string) => {
      const campaign = state.campaigns.find((c) => c.id === id);
      if (!campaign) return;

      const { error } = await supabase
        .from("campaigns")
        .update({ is_active: !campaign.is_active })
        .eq("id", id);

      if (error) {
        console.error("Campaign toggle failed:", error.message);
        return;
      }

      setState((prev) => ({
        ...prev,
        campaigns: prev.campaigns.map((c) =>
          c.id === id ? { ...c, is_active: !c.is_active } : c
        ),
      }));
    },
    [state.campaigns, supabase]
  );

  const registerBusiness = useCallback(
    async (data: RegisterData) => {
      if (!user) return;

      const slug = slugify(data.businessName) + "-" + Date.now().toString(36);
      const category = mapCategory(data.industrySegment);

      const { data: row, error } = await supabase
        .from("businesses")
        .insert({
          owner_id: user.id,
          name: data.businessName,
          slug,
          industry_segment: data.industrySegment,
          sub_industry: data.subIndustry || null,
          category,
          location_area: data.area,
          location_city: data.city,
          google_maps_url: data.googleMapsUrl || "",
          logo_url: data.logoUrl || "",
          instagram_url: data.instagram || null,
          website: data.website || null,
        })
        .select("*")
        .single();

      if (error) {
        console.error("Business registration failed:", error.message);
        return;
      }

      if (row) {
        setState((prev) => ({
          ...prev,
          business: dbRowToBusiness(row),
          needsOnboarding: false,
        }));
      }
    },
    [user, supabase]
  );

  const updateBusiness = useCallback(
    async (data: Partial<Business>) => {
      if (!state.business) return;
      const id = state.business.id;

      const dbFields: Record<string, unknown> = {};
      if (data.name !== undefined) dbFields.name = data.name;
      if (data.logo_url !== undefined) dbFields.logo_url = data.logo_url;
      if (data.google_maps_url !== undefined)
        dbFields.google_maps_url = data.google_maps_url;
      if (data.website !== undefined) dbFields.website = data.website;
      if (data.instagram_url !== undefined)
        dbFields.instagram_url = data.instagram_url;
      if (data.location_area !== undefined)
        dbFields.location_area = data.location_area;
      if (data.location_city !== undefined)
        dbFields.location_city = data.location_city;
      if (data.industry_segment !== undefined)
        dbFields.industry_segment = data.industry_segment;
      if (data.sub_industry !== undefined)
        dbFields.sub_industry = data.sub_industry;
      if (data.business_description !== undefined)
        dbFields.business_description = data.business_description;
      if (data.services_offered !== undefined)
        dbFields.services_offered = data.services_offered;
      if (data.staff_info !== undefined)
        dbFields.staff_info = data.staff_info;
      if (data.business_highlights !== undefined)
        dbFields.business_highlights = data.business_highlights;

      if (Object.keys(dbFields).length > 0) {
        await supabase.from("businesses").update(dbFields).eq("id", id);
      }

      setState((prev) => ({
        ...prev,
        business: prev.business ? { ...prev.business, ...data } : prev.business,
      }));
    },
    [state.business, supabase]
  );

  const toggleFeedbackRead = useCallback(
    async (id: string) => {
      const feedback = state.privateFeedback.find((f) => f.id === id);
      if (!feedback) return;

      await supabase
        .from("private_feedback")
        .update({ is_read: !feedback.is_read })
        .eq("id", id);

      setState((prev) => ({
        ...prev,
        privateFeedback: prev.privateFeedback.map((f) =>
          f.id === id ? { ...f, is_read: !f.is_read } : f
        ),
      }));
    },
    [state.privateFeedback, supabase]
  );

  const redeemCoupon = useCallback(
    async (id: string): Promise<boolean> => {
      const coupon = state.coupons.find((c) => c.id === id);
      if (!coupon || coupon.is_redeemed) return false;

      const now = new Date().toISOString();
      const { error } = await supabase
        .from("coupons")
        .update({ is_redeemed: true, redeemed_at: now })
        .eq("id", id);

      if (error) {
        console.error("Coupon redeem failed:", error.message);
        return false;
      }

      setState((prev) => ({
        ...prev,
        coupons: prev.coupons.map((c) =>
          c.id === id ? { ...c, is_redeemed: true, redeemed_at: now } : c
        ),
      }));
      return true;
    },
    [state.coupons, supabase]
  );

  const purgeAllData = useCallback(async () => {
    if (!user || !state.business) return;

    const businessId = state.business.id;

    const sessionIds = (
      await supabase
        .from("review_sessions")
        .select("id")
        .eq("business_id", businessId)
    ).data?.map((r) => r.id) || [];

    if (sessionIds.length > 0) {
      await supabase.from("scrape_jobs").delete().in("session_id", sessionIds);
    }
    await supabase.from("coupons").delete().eq("business_id", businessId);
    await supabase.from("private_feedback").delete().eq("business_id", businessId);
    await supabase.from("review_sessions").delete().eq("business_id", businessId);
    await supabase.from("campaigns").delete().eq("business_id", businessId);
    await supabase.from("businesses").delete().eq("id", businessId);

    loadedUserIdRef.current = null;
    setState({
      business: null,
      campaigns: [],
      sessions: [],
      coupons: [],
      privateFeedback: [],
      loading: false,
      needsOnboarding: true,
    });
  }, [user, supabase, state.business]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        addCampaign,
        deleteCampaign,
        toggleCampaign,
        registerBusiness,
        updateBusiness,
        toggleFeedbackRead,
        redeemCoupon,
        purgeAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
