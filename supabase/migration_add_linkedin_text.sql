-- ========================================================
-- Migração: Adicionar coluna dedicada linkedin_text em creator_posts
-- Obs: O sistema já possui fallback transparente usando voice_check->>'linkedin_text',
-- mas esta coluna permite consultas SQL diretas e tipagem estrita no banco.
-- ========================================================

ALTER TABLE creator_posts ADD COLUMN IF NOT EXISTS linkedin_text text;

-- Atualizar posts existentes que possam ter a versão LinkedIn salva no JSON
UPDATE creator_posts 
SET linkedin_text = voice_check->>'linkedin_text'
WHERE linkedin_text IS NULL AND voice_check->>'linkedin_text' IS NOT NULL;
