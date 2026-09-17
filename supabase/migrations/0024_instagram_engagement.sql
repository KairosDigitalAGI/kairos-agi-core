-- Kairos AGI Core: inbox e regras de atendimento Instagram (Founder Edition).
-- Aplicar no mesmo Supabase mestre que contém command.integracoes_tokens.
-- A API do Core acessa apenas com service_role no servidor; nunca no frontend.
create schema if not exists command;

create table if not exists command.instagram_engagement_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  kind text not null check (kind in ('comment', 'message')),
  account_id text not null,
  source_id text not null,
  sender_id text not null,
  sender_username text,
  content text not null,
  media_id text,
  event_time timestamptz,
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'review')),
  reply_text text,
  rule_id uuid,
  remote_reply_id text,
  sent_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);
create index if not exists instagram_engagement_events_created_idx
  on command.instagram_engagement_events (created_at desc);

create table if not exists command.instagram_automation_rules (
  id uuid primary key default gen_random_uuid(),
  account_id text not null,
  kind text not null check (kind in ('comment', 'message')),
  keyword text not null check (char_length(keyword) between 2 and 80),
  response_text text not null check (char_length(response_text) between 1 and 500),
  enabled boolean not null default false,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint enabled_requires_approval check (not enabled or approved_at is not null)
);

create table if not exists command.instagram_engagement_cooldowns (
  account_id text not null,
  sender_id text not null,
  kind text not null check (kind in ('comment', 'message')),
  day date not null,
  created_at timestamptz not null default now(),
  primary key (account_id, sender_id, kind, day)
);

alter table command.instagram_engagement_events enable row level security;
alter table command.instagram_automation_rules enable row level security;
alter table command.instagram_engagement_cooldowns enable row level security;

revoke all on command.instagram_engagement_events from anon, authenticated;
revoke all on command.instagram_automation_rules from anon, authenticated;
revoke all on command.instagram_engagement_cooldowns from anon, authenticated;
grant usage on schema command to service_role;
grant select, insert, update on command.instagram_engagement_events to service_role;
grant select, insert, update on command.instagram_automation_rules to service_role;
grant select, insert on command.instagram_engagement_cooldowns to service_role;

notify pgrst, 'reload schema';
