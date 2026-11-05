-- ==============================================================================
-- Script de Correção de RLS (Row Level Security) para CreateFlow / AutoDM
-- Execute este script no SQL Editor do painel do Supabase (https://supabase.com/dashboard)
-- ==============================================================================

-- Função auxiliar para aplicar política permissiva se a tabela existir
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'ideas',
    'creator_posts',
    'topics',
    'facts',
    'content_references',
    'voice_profile',
    'ai_learnings',
    'connections_config',
    'dm_campaigns',
    'dm_logs',
    'tracked_links',
    'social_conversations',
    'config',
    'automations'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', tbl || '_all_access', tbl);
      EXECUTE format('CREATE POLICY %I ON %I FOR ALL USING (true) WITH CHECK (true);', tbl || '_all_access', tbl);
    END IF;
  END LOOP;
END $$;
