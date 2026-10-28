-- ==============================================================================
-- Script de Correção de RLS (Row Level Security) para CreateFlow / AutoDM
-- Execute este script no SQL Editor do painel do Supabase (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Tabela 'config' (armazenamento de tokens OAuth do Instagram, TikTok, LinkedIn)
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "config_all_access" ON config;
CREATE POLICY "config_all_access" ON config FOR ALL USING (true) WITH CHECK (true);

-- 2. Tabela 'connections_config' (status de conexão e flags das redes sociais)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'connections_config') THEN
    ALTER TABLE connections_config ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "connections_config_all_access" ON connections_config;
    CREATE POLICY "connections_config_all_access" ON connections_config FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 3. Tabela 'automations'
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'automations') THEN
    ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "automations_all_access" ON automations;
    CREATE POLICY "automations_all_access" ON automations FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 4. Tabela 'ideas'
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ideas') THEN
    ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "ideas_all_access" ON ideas;
    CREATE POLICY "ideas_all_access" ON ideas FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
