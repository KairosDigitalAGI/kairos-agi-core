-- Commercial Runtime: ledger append-only de ciclos, propostas e confirmações remotas.
create table if not exists command.commercial_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  channel text not null,
  step text not null check (step in ('discover','qualify','draft','send','follow_up')),
  state text not null check (state in ('ready','running','paused_auth','paused_policy','failed','completed')),
  source_url text,
  opportunity_id text,
  proposal_text text,
  remote_id text,
  reason text,
  constraint commercial_runs_remote_confirmation check (state <> 'completed' or remote_id is not null)
);
alter table command.commercial_runs enable row level security;
create index if not exists commercial_runs_channel_state_idx on command.commercial_runs(channel,state,updated_at desc);
