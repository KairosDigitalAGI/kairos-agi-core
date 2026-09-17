-- Migration 0024: Instagram Automation
-- Tabelas para automação de comentários e DMs do Instagram.
-- Aplicar no Supabase SQL Editor (schema: command).

-- Config de automação (uma linha única, id=1)
CREATE TABLE IF NOT EXISTS command.instagram_automation (
  id          INTEGER PRIMARY KEY DEFAULT 1,
  enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  prompt_base TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Log append-only de respostas enviadas
CREATE TABLE IF NOT EXISTS command.instagram_automation_log (
  id             BIGSERIAL PRIMARY KEY,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type           TEXT NOT NULL CHECK (type IN ('comment', 'dm')),
  incoming_id    TEXT NOT NULL,
  incoming_text  TEXT,
  response_text  TEXT,
  error          TEXT
);

CREATE INDEX IF NOT EXISTS instagram_automation_log_created_at_idx
  ON command.instagram_automation_log (created_at DESC);
