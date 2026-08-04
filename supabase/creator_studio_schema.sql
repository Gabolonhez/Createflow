-- Tabelas para o Estúdio de Criação

-- 1. Creator Profile (Configuração de Nicho e Marca, linha única)
create table if not exists creator_profiles (
  id text primary key check (id = 'creator_config'),
  niche text not null,
  target_audience text not null,
  objectives text not null,
  voice_tone text not null,
  content_pillars text[] default '{}'::text[] not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table creator_profiles enable row level security;

-- 2. Ideas Backlog (Banco de Ideias)
create table if not exists ideas (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  reference_url text,
  pillar text,
  status text default 'idea' not null check (status in ('idea', 'drafted', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table ideas enable row level security;

-- 3. Content Drafts (Roteiros e Posts prontos ou em andamento)
create table if not exists content_drafts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  platform text not null check (platform in ('linkedin', 'instagram', 'tiktok')),
  format text not null check (format in ('reels', 'carousel', 'post', 'text')),
  content text not null,
  visual_script text, -- Cenários/cenas do Reels ou slides do carrossel
  status text default 'draft' not null check (status in ('draft', 'ready', 'published')),
  idea_id uuid references ideas(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table content_drafts enable row level security;


-- =======================================================
-- ADIÇÕES DO SEGUNDO CÉREBRO & PUBLICADOR
-- =======================================================

-- 4. Chat Sessions (Sessões de Brainstorming do Segundo Cérebro)
create table if not exists chat_sessions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table chat_sessions enable row level security;

-- 5. Chat Messages (Histórico de Mensagens)
create table if not exists chat_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references chat_sessions(id) on delete cascade not null,
  role text not null check (role in ('user', 'model')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table chat_messages enable row level security;

-- 6. Analyzed Templates (Estruturas de posts bem sucedidos desconstruídos por IA)
create table if not exists analyzed_templates (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  original_content text not null,
  hook text,
  structure text,
  key_takeaways text,
  reusable_template text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table analyzed_templates enable row level security;

-- Alterações na tabela config existente para suportar LinkedIn OAuth
alter table config add column if not exists linkedin_access_token text;
alter table config add column if not exists linkedin_profile_id text;
alter table config add column if not exists linkedin_name text;
alter table config add column if not exists linkedin_expires_at timestamp with time zone;

-- Alterações na tabela content_drafts para suportar links de mídia, agendamento e registro de publicação
alter table content_drafts add column if not exists media_url text;
alter table content_drafts add column if not exists scheduled_at timestamp with time zone;
alter table content_drafts add column if not exists published_at timestamp with time zone;
