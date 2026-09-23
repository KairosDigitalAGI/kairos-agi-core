-- =============================================================================
-- KAIROS COMMAND — Instagram DM + comentários: recepção via webhook, resposta
-- sugerida por IA (rascunho, NUNCA enviada automaticamente esta noite)
-- (Missão 006, Fase 17 do kairos-agi-core — trabalho noturno autônomo, item 4
-- do backlog: "webhook, resposta de IA, toggle OFF por padrão, log Supabase")
-- Projeto Supabase: mestre kairos (mesmo schema "command" de 0001-0025)
--
-- MESMO DESVIO DE CONVENÇÃO da migration 0025, mesmo motivo (registrado em
-- MORNING.md): fica em kairos-agi-core em vez de kairos-command porque a
-- árvore de trabalho de lá tinha mudanças não commitadas de outra sessão
-- nesta mesma noite. Founder deve copiar para
-- kairos-command/supabase/migrations/ quando revisar.
--
-- Duas tabelas:
--  - command.integration_settings: um interruptor por provedor, ON/OFF, lido
--    pelo painel e pelo webhook antes de qualquer resposta automática.
--    Genérico (não só Instagram) para reaproveitar em X/outras integrações
--    futuras sem nova tabela.
--  - command.instagram_webhook_events: log append-only de toda mensagem/
--    comentário recebido + a resposta que a IA sugeriu (texto puro, nunca
--    enviado à Meta por este Core — `respondido` fica sempre false até um
--    fluxo de envio real ser implementado e aprovado em sessão futura).
--
-- Mesma regra de ouro do schema: RLS ligada, sem policy de escrita — só
-- service_role grava. Idempotente.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- command.integration_settings — um interruptor por provedor (ex.: resposta
-- automática por IA), OFF por padrão até o Founder ligar no painel.
-- -----------------------------------------------------------------------------
create table if not exists command.integration_settings (
  provider           text primary key,
  auto_reply_enabled boolean not null default false,
  atualizado_em      timestamptz not null default now()
);
comment on table command.integration_settings is
  'Interruptores de comportamento automático por provedor de integração. auto_reply_enabled controla só a GERAÇÃO de um rascunho de resposta por IA — nunca o envio real, que não existe neste Core ainda.';

drop trigger if exists integration_settings_touch on command.integration_settings;
create trigger integration_settings_touch before update on command.integration_settings
  for each row execute function command.touch_atualizado_em();

-- -----------------------------------------------------------------------------
-- command.instagram_webhook_events — log append-only de DM/comentário recebido
-- -----------------------------------------------------------------------------
create table if not exists command.instagram_webhook_events (
  id                  uuid primary key default gen_random_uuid(),
  tipo                text not null check (tipo in ('mensagem','comentario')),
  remetente_id        text,
  remetente_username  text,
  conteudo            text,
  referencia_externa  text,
  resposta_sugerida   text,
  resposta_prompt_versao text,
  respondido          boolean not null default false,
  recebido_em         timestamptz not null default now()
);
comment on table command.instagram_webhook_events is
  'Log append-only (nunca UPDATE/DELETE pelo Core) de toda mensagem direta ou comentário recebido via webhook do Instagram. resposta_sugerida = rascunho gerado por IA quando integration_settings.auto_reply_enabled=true; respondido fica sempre false nesta fase — nenhuma resposta é enviada à Meta automaticamente.';

create index if not exists instagram_webhook_events_recebido_idx on command.instagram_webhook_events (recebido_em desc);
create index if not exists instagram_webhook_events_tipo_idx on command.instagram_webhook_events (tipo);

-- -----------------------------------------------------------------------------
-- RLS — leitura do operador, escrita só service_role (backend)
-- -----------------------------------------------------------------------------
alter table command.integration_settings       enable row level security;
alter table command.instagram_webhook_events   enable row level security;

drop policy if exists integration_settings_leitura on command.integration_settings;
create policy integration_settings_leitura on command.integration_settings
  for select to authenticated using (command.is_operador());

drop policy if exists instagram_webhook_events_leitura on command.instagram_webhook_events;
create policy instagram_webhook_events_leitura on command.instagram_webhook_events
  for select to authenticated using (command.is_operador());

-- Escrita: nenhuma policy de insert/update/delete => só service_role.

grant select on
  command.integration_settings, command.instagram_webhook_events
to authenticated;
