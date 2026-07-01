export interface Business {
  id: string;
  owner_id: string;
  parent_id?: string | null;
  name: string;
  slug: string;
  logo_url: string;
  google_maps_url: string;
  google_place_id: string;
  category: BusinessCategory;
  location_city: string;
  location_area: string;
  website?: string;
  instagram_url?: string;
  plan: "starter" | "growth" | "pro";
  plan_expires_at?: string;
  is_active: boolean;
  created_at: string;
  business_description?: string;
  services_offered?: string;
  staff_info?: string;
  business_highlights?: string;
  industry_segment?: string;
  sub_industry?: string;
  phone?: string;
  email?: string;
}

export type BusinessCategory =
  | "cafe"
  | "restaurant"
  | "salon"
  | "spa"
  | "retail"
  | "clinic"
  | "hotel"
  | "gym"
  | "other";

export interface Campaign {
  id: string;
  business_id: string;
  title: string;
  offer_text: string;
  coupon_prefix: string;
  reward_type: "own_discount" | "brand_voucher" | "surprise";
  is_active: boolean;
  max_redemptions: number;
  redeemed_count: number;
  starts_at: string;
  expires_at: string;
  qr_url?: string;
  created_at: string;
}

export interface ReviewSession {
  id: string;
  business_id: string;
  campaign_id: string;
  star_rating: number;
  mcq_answers: Record<string, string>;
  selected_review_text: string;
  session_token: string;
  token_status: "PENDING" | "VERIFIED" | "EXPIRED" | "FRAUD";
  device_fingerprint?: string;
  ip_address?: string;
  user_agent?: string;
  google_account_id?: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  session_id: string;
  business_id: string;
  campaign_id: string;
  coupon_code: string;
  reward_type: string;
  reward_value: string;
  brand_name?: string;
  is_redeemed: boolean;
  redeemed_at?: string;
  issued_at: string;
  expires_at: string;
}

export interface PrivateFeedback {
  id: string;
  business_id: string;
  campaign_id: string;
  star_rating: number;
  feedback_text: string;
  is_read: boolean;
  created_at: string;
}

export interface Complaint {
  id: string;
  business_id: string;
  campaign_id?: string;
  star_rating: number;
  complaint_text: string;
  is_anonymous: boolean;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  consent_given: boolean;
  status: "open" | "in_progress" | "resolved" | "closed";
  business_notes?: string;
  session_token?: string;
  mcq_answers?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface ScrapeJob {
  id: string;
  session_id: string;
  google_maps_url: string;
  target_token: string;
  status: "QUEUED" | "RUNNING" | "FOUND" | "FAILED";
  attempts: number;
  last_checked_at?: string;
  verified_at?: string;
  created_at: string;
}

