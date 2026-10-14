-- ==============================================================================
-- CREATEFLOW AUTO-DM & GROWTH FUNNEL MULTI-PLATAFORMA SCHEMA
-- Suporta: Instagram, TikTok, X (Twitter), LinkedIn
-- ==============================================================================

-- 1. Campanhas de Auto-DM Multiplataforma
CREATE TABLE IF NOT EXISTS dm_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'x', 'linkedin')),
  account_id TEXT NOT NULL,
  account_username TEXT NOT NULL,
  post_id TEXT,
  post_url TEXT,
  post_thumbnail TEXT,
  scope TEXT DEFAULT 'any' CHECK (scope IN ('specific_post', 'all_posts', 'next_post', 'any')),
  keywords TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
  match_type TEXT DEFAULT 'exact' CHECK (match_type IN ('exact', 'contains', 'any')),
  dm_trigger_enabled BOOLEAN DEFAULT true NOT NULL,
  dm_message TEXT NOT NULL,
  dm_messages TEXT[] DEFAULT '{}'::TEXT[],
  opening_dm_enabled BOOLEAN DEFAULT false NOT NULL,
  opening_dm_message TEXT,
  opening_dm_button_label TEXT,
  card_image_url TEXT,
  card_title TEXT,
  card_subtitle TEXT,
  link_button_label TEXT DEFAULT 'Acessar Link',
  target_url TEXT,
  secondary_button_label TEXT,
  secondary_target_url TEXT,
  require_follow BOOLEAN DEFAULT false NOT NULL,
  follow_prompt_message TEXT,
  follow_prompt_button_label TEXT,
  follow_up_enabled BOOLEAN DEFAULT false NOT NULL,
  follow_up_message TEXT,
  follow_up_delay_minutes INTEGER DEFAULT 15,
  public_reply_enabled BOOLEAN DEFAULT true NOT NULL,
  public_reply_messages TEXT[] DEFAULT '{}'::TEXT[],
  is_active BOOLEAN DEFAULT true NOT NULL,
  dms_sent_count INTEGER DEFAULT 0 NOT NULL,
  clicks_count INTEGER DEFAULT 0 NOT NULL,
  ctr NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE dm_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dm_campaigns_access" ON dm_campaigns FOR ALL USING (true);

-- 2. Logs de Disparos de DM
CREATE TABLE IF NOT EXISTS dm_logs (
  id TEXT PRIMARY KEY,
  campaign_id TEXT REFERENCES dm_campaigns(id) ON DELETE SET NULL,
  campaign_name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'x', 'linkedin')),
  commenter_id TEXT NOT NULL,
  commenter_username TEXT NOT NULL,
  comment_text TEXT,
  status TEXT DEFAULT 'SENT' CHECK (status IN ('SENT', 'SKIPPED_WINDOW', 'FAILED', 'PENDING_FOLLOW')),
  error_message TEXT,
  public_reply_sent BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE dm_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dm_logs_access" ON dm_logs FOR ALL USING (true);

-- 3. Links Rastreados & Redirecionamentos (/r/[slug])
CREATE TABLE IF NOT EXISTS tracked_links (
  id TEXT PRIMARY KEY,
  campaign_id TEXT REFERENCES dm_campaigns(id) ON DELETE SET NULL,
  campaign_name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'x', 'linkedin')),
  label TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  short_slug TEXT UNIQUE NOT NULL,
  short_url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0 NOT NULL,
  unique_clicks INTEGER DEFAULT 0 NOT NULL,
  ctr NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE tracked_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tracked_links_access" ON tracked_links FOR ALL USING (true);

-- 4. Conversas Sociais & Inbox Unificado
CREATE TABLE IF NOT EXISTS social_conversations (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'x', 'linkedin')),
  contact_id TEXT NOT NULL,
  contact_username TEXT NOT NULL,
  contact_avatar TEXT,
  last_message_text TEXT NOT NULL,
  last_message_timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  unread BOOLEAN DEFAULT false NOT NULL,
  window_expires_at TIMESTAMPTZ,
  messages JSONB DEFAULT '[]'::JSONB NOT NULL
);

ALTER TABLE social_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social_conversations_access" ON social_conversations FOR ALL USING (true);
