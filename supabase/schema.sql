-- Schema de banco de dados para Automação do Instagram (tipo ManyChat)

-- 1. Config (1 linha: armazena token de acesso longo, id do Instagram, nome de usuário, foto de perfil, etc.)
create table config (
  id text primary key check (id = 'instagram_config'),
  instagram_user_id text,
  instagram_username text,
  instagram_name text,
  profile_picture_url text,
  access_token text not null,
  token_expires_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS sem políticas (acesso restrito apenas com service key)
alter table config enable row level security;

-- 2. Automations: Configuração das automações
create table automations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  active boolean default true not null,
  trigger_comment boolean default false not null,
  trigger_story boolean default false not null,
  trigger_dm boolean default false not null,
  keywords text[] default '{}'::text[] not null,
  match_type text default 'contains' not null check (match_type in ('contains', 'exact', 'any')),
  post_id text, -- Opcional: Post específico
  post_permalink text, -- Metadado útil
  post_media_url text, -- Metadado útil
  public_replies text[] default '{}'::text[] not null, -- Variações de respostas públicas no comentário
  welcome_dm text not null, -- Mensagem direta inicial de boas-vindas
  quick_reply_button text, -- Texto do botão de resposta rápida
  link_text text, -- Mensagem secundária (com o link) que vem após a pessoa tocar no botão
  link_button_label text, -- Rótulo do botão do link
  link_url text, -- URL de destino do link
  reminder_text text, -- Texto do lembrete (opcional)
  reminder_delay_minutes integer, -- Delay do lembrete em minutos (nulo se desativado)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table automations enable row level security;

-- 3. Contacts: Cadastro de contatos do Instagram
create table contacts (
  id uuid default gen_random_uuid() primary key,
  instagram_scoped_id text not null unique, -- ID único do usuário no Instagram
  username text,
  first_contact_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_response_at timestamp with time zone, -- Abertura da janela de 24h
  last_automation_id uuid references automations(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table contacts enable row level security;

-- 4. Followups: Sequência planejada de envio derivada da automação
create table followups (
  id uuid default gen_random_uuid() primary key,
  automation_id uuid references automations(id) on delete cascade not null,
  contact_id uuid references contacts(id) on delete cascade not null,
  step text not null check (step in ('link', 'reminder')),
  scheduled_for timestamp with time zone not null,
  status text default 'pending' not null check (status in ('pending', 'queued', 'sent', 'failed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table followups enable row level security;

-- 5. Queue: Fila de envio com trava atômica
create table queue (
  id uuid default gen_random_uuid() primary key,
  contact_id uuid references contacts(id) on delete cascade not null,
  automation_id uuid references automations(id) on delete cascade,
  message_type text not null check (message_type in ('private_reply', 'public_reply', 'welcome', 'link', 'reminder')),
  recipient_instagram_id text not null, -- ID do comentário ou ID do contato
  comment_id text, -- ID do comentário (se aplicável)
  message_payload jsonb not null, -- Conteúdo pronto para enviar à API da Meta
  status text default 'pending' not null check (status in ('pending', 'sending', 'sent', 'failed', 'skipped')),
  error_message text,
  claimed_at timestamp with time zone, -- Trava atômica
  scheduled_for timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table queue enable row level security;

-- Indexações importantes para performance e concorrência
create index idx_queue_status_scheduled_for on queue (status, scheduled_for) where status = 'pending';
create index idx_queue_claimed_at on queue (claimed_at) where claimed_at is not null;
create index idx_followups_status_scheduled_for on followups (status, scheduled_for) where status = 'pending';

-- 6. Events: Registro de payloads brutos recebidos dos Webhooks
create table events (
  id uuid default gen_random_uuid() primary key,
  payload jsonb not null,
  processed boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table events enable row level security;

-- 7. Função RPC para trava atômica da fila de envio (claim_queue_items)
create or replace function claim_queue_items(max_items int)
returns table (
  id uuid,
  contact_id uuid,
  automation_id uuid,
  message_type text,
  recipient_instagram_id text,
  comment_id text,
  message_payload jsonb
) as $$
begin
  return query
  update queue
  set status = 'sending',
      claimed_at = timezone('utc'::text, now()),
      updated_at = timezone('utc'::text, now())
  where queue.id in (
    select q.id
    from queue q
    where q.status = 'pending'
      and q.scheduled_for <= timezone('utc'::text, now())
    order by q.scheduled_for asc
    limit max_items
    for update skip locked
  )
  returning queue.id, queue.contact_id, queue.automation_id, queue.message_type, queue.recipient_instagram_id, queue.comment_id, queue.message_payload;
end;
$$ language plpgsql;

