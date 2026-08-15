-- Multi-Platform Review Management
-- Tables for connecting businesses to external review platforms

CREATE TABLE IF NOT EXISTS business_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  platform_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  review_url TEXT NOT NULL DEFAULT '',
  is_connected BOOLEAN NOT NULL DEFAULT true,
  qr_code_id TEXT UNIQUE NOT NULL,
  qr_enabled BOOLEAN NOT NULL DEFAULT true,
  avg_rating NUMERIC(3,1),
  total_reviews INTEGER NOT NULL DEFAULT 0,
  total_qr_scans INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, platform_key)
);

CREATE TABLE IF NOT EXISTS platform_qr_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_platform_id UUID NOT NULL REFERENCES business_platforms(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_business_platforms_business_id ON business_platforms(business_id);
CREATE INDEX idx_platform_qr_scans_bp_id ON platform_qr_scans(business_platform_id);
CREATE INDEX idx_platform_qr_scans_scanned_at ON platform_qr_scans(scanned_at);
CREATE INDEX idx_business_platforms_qr_code_id ON business_platforms(qr_code_id);

-- RLS
ALTER TABLE business_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_qr_scans ENABLE ROW LEVEL SECURITY;

-- Business owners can manage their own platforms
CREATE POLICY "Owners manage their platforms"
  ON business_platforms
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Business owners can read their QR scans
CREATE POLICY "Owners read their QR scans"
  ON platform_qr_scans
  FOR SELECT
  USING (
    business_platform_id IN (
      SELECT bp.id FROM business_platforms bp
      JOIN businesses b ON bp.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
  );

-- RPC to look up a platform by QR code ID and increment scan count (for the redirect handler)
CREATE OR REPLACE FUNCTION get_platform_by_qr_code(p_qr_code_id TEXT)
RETURNS TABLE(id UUID, review_url TEXT, platform_key TEXT, business_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT bp.id, bp.review_url, bp.platform_key, bp.business_id
  FROM business_platforms bp
  WHERE bp.qr_code_id = p_qr_code_id
    AND bp.is_connected = true
    AND bp.qr_enabled = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_platform_by_qr_code(TEXT) TO anon, authenticated;

-- RPC to get QR scan counts grouped by day for a business platform
CREATE OR REPLACE FUNCTION get_platform_qr_scan_stats(p_business_platform_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(scan_date DATE, scan_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT DATE(scanned_at) AS scan_date, COUNT(*) AS scan_count
  FROM platform_qr_scans
  WHERE business_platform_id = p_business_platform_id
    AND scanned_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(scanned_at)
  ORDER BY scan_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_platform_qr_scan_stats(UUID, INTEGER) TO authenticated;
