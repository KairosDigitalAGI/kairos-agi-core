-- =============================================================================
-- KAIROS COMMAND — Estúdio Kairos (Missão 006, Fase 16 do kairos-agi-core:
-- personagens, reels e cenas com aprovação de gasto — só a parte que NÃO gasta
-- dinheiro sozinha)
-- Projeto Supabase: mestre kairos (mesmo schema "command" de 0001-0024)
--
-- DESVIO DE CONVENÇÃO, registrado em MORNING.md (trabalho noturno autônomo,
-- 23/09/2026): toda migration deste schema historicamente mora em
-- kairos-command/supabase/migrations/ (seria 0025 lá também). Esta noite o
-- working tree do kairos-command tinha mudanças não commitadas de outra
-- pessoa/sessão (Nav.tsx, videos-editados) que não é seguro tocar sem o
-- Founder por perto — por isso este arquivo fica aqui, no próprio
-- kairos-agi-core, pronto para copiar para kairos-command/supabase/migrations/
-- (ou colar direto no SQL Editor do Supabase) quando o Founder revisar.
--
-- Quatro tabelas do Estúdio: personagem (aparência consistente via prompt de
-- referência), reel (o vídeo curto que o personagem protagoniza), cena (cada
-- corte do reel) e o ledger de gasto studio_spend — separado de
-- command.content_assets.custo_usd (0020) porque o orçamento do Estúdio é
-- teto próprio (STUDIO_BUDGET_USD, api/_studio.js), não o mesmo do Content
-- Engine genérico. Mesma regra de ouro de todo o schema (ver 0009/0020):
-- RLS ligada, sem policy de escrita — só service_role (backend) grava.
--
-- Idempotente: pode rodar de novo sem quebrar.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- command.characters — personagem do Estúdio (aparência/persona consistentes)
-- -----------------------------------------------------------------------------
create table if not exists command.characters (
  id                    uuid primary key default gen_random_uuid(),
  nome                  text not null,
  descricao             text,
  prompt_visual         text not null,
  imagem_referencia_path text,
  status                text not null default 'rascunho'
                          check (status in ('rascunho','ativo','arquivado')),
  criado_por            text,
  criado_em             timestamptz not null default now(),
  atualizado_em         timestamptz not null default now()
);
comment on table command.characters is
  'Personagem do Estúdio Kairos. prompt_visual = descrição usada em TODA geração de imagem/vídeo deste personagem, para manter a aparência consistente entre cenas. imagem_referencia_path = objeto no bucket "studio".';

drop trigger if exists characters_touch on command.characters;
create trigger characters_touch before update on command.characters
  for each row execute function command.touch_atualizado_em();

-- -----------------------------------------------------------------------------
-- command.reels — o reel/vídeo curto que um personagem protagoniza
-- -----------------------------------------------------------------------------
create table if not exists command.reels (
  id                  uuid primary key default gen_random_uuid(),
  titulo              text not null,
  character_id        uuid references command.characters(id),
  etapa               text not null default 'ideia'
                        check (etapa in ('ideia','roteiro','cenas','aprovacao','producao','pronto','publicado','rejeitado')),
  briefing            jsonb not null default '{}'::jsonb,
  aprovado            boolean not null default false,
  aprovado_por        text,
  aprovado_em         timestamptz,
  custo_estimado_usd  numeric(10,4),
  criado_por          text,
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now()
);
comment on table command.reels is
  'Estado do pipeline do Estúdio Kairos. etapa=aprovacao é o gate do Founder — igual a command.content_jobs (0020), mesma convenção de aprovado:true explícito antes de qualquer geração paga.';
comment on column command.reels.custo_estimado_usd is
  'Soma estimada ANTES de gerar — calculada por api/_studio.js a partir do número de cenas × custo médio por tipo de geração, mostrada no painel antes do Founder aprovar.';

drop trigger if exists reels_touch on command.reels;
create trigger reels_touch before update on command.reels
  for each row execute function command.touch_atualizado_em();

create index if not exists reels_etapa_idx on command.reels (etapa);
create index if not exists reels_character_idx on command.reels (character_id);

-- -----------------------------------------------------------------------------
-- command.scenes — cada corte/cena de um reel, na ordem de exibição
-- -----------------------------------------------------------------------------
create table if not exists command.scenes (
  id            uuid primary key default gen_random_uuid(),
  reel_id       uuid not null references command.reels(id) on delete cascade,
  ordem         int not null default 1,
  roteiro       text,
  prompt_video  text,
  imagem_path   text,
  video_path    text,
  status        text not null default 'rascunho'
                  check (status in ('rascunho','gerando_imagem','gerando_video','pronta','erro')),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
comment on table command.scenes is
  'Uma cena de um reel do Estúdio Kairos. imagem_path/video_path = objetos no bucket "studio" (mesmo padrão de command.content_assets.storage_path em 0020, mas separado por produto).';

drop trigger if exists scenes_touch on command.scenes;
create trigger scenes_touch before update on command.scenes
  for each row execute function command.touch_atualizado_em();

create unique index if not exists scenes_reel_ordem_idx on command.scenes (reel_id, ordem);

-- -----------------------------------------------------------------------------
-- command.studio_spend — ledger de gasto real do Estúdio (append-only)
-- -----------------------------------------------------------------------------
create table if not exists command.studio_spend (
  id            uuid primary key default gen_random_uuid(),
  reel_id       uuid references command.reels(id) on delete set null,
  scene_id      uuid references command.scenes(id) on delete set null,
  character_id  uuid references command.characters(id) on delete set null,
  tipo          text not null check (tipo in ('imagem','video','texto')),
  provedor      text not null,
  modelo        text,
  custo_usd     numeric(10,4) not null,
  criado_em     timestamptz not null default now()
);
comment on table command.studio_spend is
  'Ledger append-only de todo gasto real do Estúdio Kairos — nunca UPDATE/DELETE. api/_studio.js soma esta tabela para aplicar o teto STUDIO_BUDGET_USD antes de aprovar nova geração paga.';

create index if not exists studio_spend_reel_idx on command.studio_spend (reel_id);
create index if not exists studio_spend_criado_idx on command.studio_spend (criado_em);

-- -----------------------------------------------------------------------------
-- RLS — leitura do operador (dev/founder), escrita só service_role (backend)
-- -----------------------------------------------------------------------------
alter table command.characters   enable row level security;
alter table command.reels        enable row level security;
alter table command.scenes       enable row level security;
alter table command.studio_spend enable row level security;

drop policy if exists characters_leitura on command.characters;
create policy characters_leitura on command.characters
  for select to authenticated using (command.is_operador());

drop policy if exists reels_leitura on command.reels;
create policy reels_leitura on command.reels
  for select to authenticated using (command.is_operador());

drop policy if exists scenes_leitura on command.scenes;
create policy scenes_leitura on command.scenes
  for select to authenticated using (command.is_operador());

drop policy if exists studio_spend_leitura on command.studio_spend;
create policy studio_spend_leitura on command.studio_spend
  for select to authenticated using (command.is_operador());

-- Escrita: nenhuma policy de insert/update/delete => só service_role.
-- O backend (kairos-agi-core, atrás de Basic Auth própria) é quem escreve.

grant select on
  command.characters, command.reels, command.scenes, command.studio_spend
to authenticated;

-- -----------------------------------------------------------------------------
-- Bucket "studio" — mesmo padrão público de "content-assets" (0022): material
-- de marketing da própria Kairos Digital, não dado sensível.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('studio', 'studio', true)
on conflict (id) do nothing;
