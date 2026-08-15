-- Add platform_key to campaigns so each campaign can target a specific review platform
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS platform_key TEXT DEFAULT 'revugo';

-- Add index for filtering campaigns by platform
CREATE INDEX IF NOT EXISTS idx_campaigns_platform_key ON campaigns(platform_key);
