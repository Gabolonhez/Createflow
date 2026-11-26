-- ==============================================================================
-- CREATEFLOW RADAR VIRAL DE PERFIS & POSTS SALVOS SCHEMA
-- Suporta: Instagram, LinkedIn, X (Twitter), TikTok
-- ==============================================================================

-- 1. Perfis Monitorados no Radar Viral
CREATE TABLE IF NOT EXISTS monitored_profiles (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'linkedin', 'x', 'tiktok')),
  handle TEXT NOT NULL,
  display_name TEXT,
  profile_url TEXT,
  avatar_url TEXT,
  niche_tag TEXT,
  followers_count INTEGER DEFAULT 0 NOT NULL,
  avg_engagement NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
  posts_captured_count INTEGER DEFAULT 0 NOT NULL,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_monitored_profiles_platform
  ON monitored_profiles (platform, handle);

ALTER TABLE monitored_profiles ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'monitored_profiles' AND policyname = 'monitored_profiles_access'
  ) THEN
    CREATE POLICY "monitored_profiles_access" ON monitored_profiles FOR ALL USING (true);
  END IF;
END $$;

-- 2. Posts Capturados (Salvos, Radar Viral & DM Share)
CREATE TABLE IF NOT EXISTS captured_posts (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('saved', 'radar', 'dm_share')),
  profile_id TEXT REFERENCES monitored_profiles(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'linkedin', 'x', 'tiktok')),
  post_url TEXT,
  external_id TEXT,
  author_name TEXT,
  author_handle TEXT,
  caption_text TEXT NOT NULL,
  media_type TEXT DEFAULT 'text' NOT NULL CHECK (media_type IN ('reel', 'carousel', 'image', 'text', 'video')),
  media_url TEXT,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  views_count INTEGER DEFAULT 0 NOT NULL,
  shares_count INTEGER DEFAULT 0 NOT NULL,
  engagement_score NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
  outlier_score NUMERIC(6,2) DEFAULT 1.00 NOT NULL,
  ai_hook_summary TEXT,
  status TEXT DEFAULT 'new' NOT NULL CHECK (status IN ('new', 'saved_idea', 'used', 'archived')),
  published_at TIMESTAMPTZ,
  captured_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_captured_posts_radar_ranking
  ON captured_posts (source, platform, outlier_score DESC);

CREATE INDEX IF NOT EXISTS idx_captured_posts_post_url
  ON captured_posts (post_url);

ALTER TABLE captured_posts ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'captured_posts' AND policyname = 'captured_posts_access'
  ) THEN
    CREATE POLICY "captured_posts_access" ON captured_posts FOR ALL USING (true);
  END IF;
END $$;
