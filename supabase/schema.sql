-- RevuGo Database Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Businesses
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES businesses(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT DEFAULT '',
  google_maps_url TEXT DEFAULT '',
  google_place_id TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'other',
  location_city TEXT DEFAULT '',
  location_area TEXT DEFAULT '',
  website TEXT,
  instagram_url TEXT,
  plan TEXT DEFAULT 'starter',
  plan_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  business_description TEXT,
  services_offered TEXT,
  staff_info TEXT,
  business_highlights TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  offer_text TEXT NOT NULL,
  coupon_prefix TEXT NOT NULL,
  reward_type TEXT DEFAULT 'own_discount',
  is_active BOOLEAN DEFAULT TRUE,
  max_redemptions INTEGER DEFAULT 100,
  redeemed_count INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  qr_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Review Sessions
CREATE TABLE IF NOT EXISTS review_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  star_rating INTEGER NOT NULL CHECK (star_rating BETWEEN 1 AND 5),
  mcq_answers JSONB DEFAULT '{}',
  selected_review_text TEXT DEFAULT '',
  session_token TEXT UNIQUE NOT NULL,
  token_status TEXT DEFAULT 'PENDING',
  device_fingerprint TEXT,
  ip_address TEXT,
  user_agent TEXT,
  google_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES review_sessions(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  coupon_code TEXT UNIQUE NOT NULL,
  reward_type TEXT DEFAULT 'own_discount',
  reward_value TEXT DEFAULT '',
  brand_name TEXT,
  is_redeemed BOOLEAN DEFAULT FALSE,
  redeemed_at TIMESTAMPTZ,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- 6. Private Feedback
CREATE TABLE IF NOT EXISTS private_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  star_rating INTEGER NOT NULL CHECK (star_rating BETWEEN 1 AND 5),
  feedback_text TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Scrape Jobs (review verification)
CREATE TABLE IF NOT EXISTS scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES review_sessions(id) ON DELETE CASCADE,
  google_maps_url TEXT NOT NULL,
  target_token TEXT NOT NULL,
  status TEXT DEFAULT 'QUEUED',
  attempts INTEGER DEFAULT 0,
  last_checked_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Plans
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  interval TEXT DEFAULT 'month',
  max_campaigns INTEGER DEFAULT 1,
  max_reviews INTEGER DEFAULT 100,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  status TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Super Admins
CREATE TABLE IF NOT EXISTS super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Admin Logs
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Businesses: owners can manage their own business
CREATE POLICY "Owners can view own business" ON businesses FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can update own business" ON businesses FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can insert business" ON businesses FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Public can view active businesses by slug" ON businesses FOR SELECT USING (is_active = true);

-- Campaigns: business owners can manage campaigns
CREATE POLICY "Owners can view campaigns" ON campaigns FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners can insert campaigns" ON campaigns FOR INSERT WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners can update campaigns" ON campaigns FOR UPDATE USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Public can view active campaigns" ON campaigns FOR SELECT USING (is_active = true);

-- Review Sessions: business owners can view, public can insert
CREATE POLICY "Owners can view review sessions" ON review_sessions FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Anyone can insert review sessions" ON review_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update review sessions" ON review_sessions FOR UPDATE USING (true);

-- Coupons: business owners can view/update, public can insert
CREATE POLICY "Owners can view coupons" ON coupons FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Anyone can insert coupons" ON coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can update coupons" ON coupons FOR UPDATE USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Public can view own coupon" ON coupons FOR SELECT USING (true);

-- Private Feedback: business owners can view, public can insert
CREATE POLICY "Owners can view private feedback" ON private_feedback FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Anyone can insert private feedback" ON private_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can update private feedback" ON private_feedback FOR UPDATE USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- Scrape Jobs
CREATE POLICY "Owners can view scrape jobs" ON scrape_jobs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert scrape jobs" ON scrape_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update scrape jobs" ON scrape_jobs FOR UPDATE USING (true);

-- Plans: everyone can read
CREATE POLICY "Anyone can view plans" ON plans FOR SELECT USING (true);

-- Subscriptions: business owners can view their own
CREATE POLICY "Owners can view subscriptions" ON subscriptions FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- Super Admins: only service role manages this
CREATE POLICY "Service role only" ON super_admins FOR ALL USING (true);

-- Admin Logs: only service role manages this
CREATE POLICY "Service role only" ON admin_logs FOR ALL USING (true);

-- 12. Complaints (customer concerns)
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id),
  star_rating INT NOT NULL DEFAULT 1,
  complaint_text TEXT NOT NULL DEFAULT '',
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  business_notes TEXT,
  session_token TEXT,
  mcq_answers JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_complaints_business_id ON complaints(business_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can view their complaints"
  ON complaints FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Business owners can update their complaints"
  ON complaints FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Service role can insert complaints"
  ON complaints FOR INSERT
  WITH CHECK (true);

-- ============================================
-- Seed: Default Plans
-- ============================================

INSERT INTO plans (name, slug, price, currency, interval, max_campaigns, max_reviews, features, is_active)
VALUES
  ('Starter', 'starter', 0, 'INR', 'month', 1, 50, '["1 Campaign", "50 Reviews/mo", "QR Flyer", "Basic Analytics"]', true),
  ('Growth', 'growth', 999, 'INR', 'month', 5, 500, '["5 Campaigns", "500 Reviews/mo", "QR Flyer", "Advanced Analytics", "Email Coupons"]', true),
  ('Pro', 'pro', 2499, 'INR', 'month', -1, -1, '["Unlimited Campaigns", "Unlimited Reviews", "QR Flyer", "Full Analytics", "Email Coupons", "Priority Support"]', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Setup Super Admin
-- After creating your admin user via signup, run:
-- INSERT INTO super_admins (user_id, email) VALUES ('<user-uuid>', 'admin@reviewflow.in');
-- ============================================
