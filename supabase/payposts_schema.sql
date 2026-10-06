-- ========================================================
-- Schema do Hub de Conteúdo Pessoal (X & LinkedIn)
-- Baseado na arquitetura PayPosts / Creator Hub
-- ========================================================

-- 1. POSTS DO CRIADOR (creator_posts)
create table if not exists creator_posts (
  id text primary key,
  text text not null,
  thread jsonb default '[]'::jsonb not null,
  thread_style text default 'single' not null,
  platforms text[] default '{x}'::text[] not null,
  status text default 'DRAFT' not null check (status in ('AWAITING_APPROVAL', 'SCHEDULED', 'PUBLISHED', 'DRAFT', 'REJECTED')),
  pillar text,
  media_urls text[] default '{}'::text[] not null,
  scheduled_for timestamptz,
  published_at timestamptz,
  tweet_id text,
  linkedin_post_id text,
  rejection_reason text,
  voice_check jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_creator_posts_status on creator_posts(status);
create index if not exists idx_creator_posts_scheduled on creator_posts(scheduled_for);

-- 2. BANCO DE IDEIAS (ideas)
create table if not exists ideas (
  id text primary key,
  title text not null,
  note text,
  platforms text[] default '{x,linkedin}'::text[],
  pillar text,
  status text default 'NEW' not null check (status in ('NEW', 'IN_PROGRESS', 'USED', 'ARCHIVED')),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. TÓPICOS & ÂNGULOS (topics)
create table if not exists topics (
  id text primary key,
  title text not null,
  hook_angle text,
  pillar text,
  platforms text[] default '{x,linkedin}'::text[],
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. FATOS REAIS / NUMEROS (facts)
create table if not exists facts (
  id text primary key,
  statement text not null,
  category text default 'metric',
  verified boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 5. REFERÊNCIAS VIRAIS ANALISADAS (references)
create table if not exists content_references (
  id text primary key,
  original_text text not null,
  platform text default 'x' not null,
  author text,
  metrics jsonb,
  takeaways text[] default '{}'::text[],
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 6. PERFIL DE VOZ (voice_profile)
create table if not exists voice_profile (
  id text primary key check (id = 'main_profile'),
  rules text[] default '{}'::text[] not null,
  anti_patterns text[] default '{}'::text[] not null,
  preferred_terms text[] default '{}'::text[] not null,
  sample_posts text[] default '{}'::text[] not null,
  archetype text default 'Operador Técnico / Founder',
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 7. APRENDIZADOS DA IA COM FEEDBACK (ai_learnings)
create table if not exists ai_learnings (
  id text primary key,
  feedback text not null,
  rule_extracted text,
  category text default 'tone',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 8. CONEXÕES DAS REDES (connections_config)
create table if not exists connections_config (
  id text primary key check (id = 'main_config'),
  x_connected boolean default true,
  x_username text default 'gabolonhez',
  x_publish_mode text default 'manual',
  x_bearer_token text,
  linkedin_connected boolean default false,
  linkedin_name text,
  linkedin_profile_id text,
  linkedin_access_token text,
  linkedin_publish_mode text default 'manual',
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- SEED INICIAL DE PERFIL DE VOZ SE NÃO EXISTIR
insert into voice_profile (id, rules, anti_patterns, preferred_terms, sample_posts, archetype)
values (
  'main_profile',
  array[
    'Voz de Operador: Escreva como quem constrói na prática todos os dias, não como quem ensina teorias.',
    'Ritmo Staccato: Alterne frases curtas e diretas com quebras de linha cirúrgicas.',
    'Zero Hesitação: Proibido usar "talvez", "na minha opinião", "acho que", "vale a pena considerar".',
    'Fatos e Provas: Use números, tempos de execução e métricas antes de qualquer afirmação geral.'
  ],
  array[
    'Emojis excessivos ou decorativos',
    'Listas numeradas previsíveis de 1 a 5 com tópicos vazios',
    'Jargão corporativo vazio ("sinergia", "potencializar", "game changer")',
    'Perguntas fracas no final ("E você, o que acha disso?")'
  ],
  array['em produção', 'na prática', 'latência', 'conversão', 'zero ruído', 'arquitetura'],
  array[
    'O maior erro de 99% dos devs e founders ao construir com IA: Tentar automatizar o produto todo antes de validar se alguém realmente precisa do clique mais simples.',
    'A maioria dos agentes de IA falha em produção não pelo modelo, mas pelo contexto. Se você não fornecer fatos verificados e voz consistente, o resultado vai soar como um bot genérico.'
  ],
  'Operador Técnico / Founder'
)
on conflict (id) do nothing;

-- SEED INICIAL DE CONEXÕES
insert into connections_config (id, x_connected, x_username, x_publish_mode, linkedin_connected, linkedin_name, linkedin_publish_mode)
values (
  'main_config',
  true,
  'gabolonhez',
  'manual',
  false,
  'Gabriel Bolonhez',
  'manual'
)
on conflict (id) do nothing;
