-- Rodadas reais do runtime KAIROS: campanha das 07h e reposições noturnas.
create table if not exists command.crm_runtime_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'kairos_whatsapp',
  run_ref text not null,
  run_type text not null check (run_type in ('campaign','replenishment','recovery')),
  state text not null check (state in ('running','completed','partial','failed')),
  scheduled_for timestamptz,
  started_at timestamptz not null,
  finished_at timestamptz,
  target_count integer not null default 0 check (target_count >= 0),
  eligible_before integer not null default 0 check (eligible_before >= 0),
  discovered integer not null default 0 check (discovered >= 0),
  qualified integer not null default 0 check (qualified >= 0),
  attempted integer not null default 0 check (attempted >= 0),
  delivered integer not null default 0 check (delivered >= 0),
  responses integer not null default 0 check (responses >= 0),
  opt_outs integer not null default 0 check (opt_outs >= 0),
  invalid integer not null default 0 check (invalid >= 0),
  eligible_after integer not null default 0 check (eligible_after >= 0),
  strategy text,
  error_summary text,
  synced_at timestamptz not null default now(),
  unique (source, run_ref),
  constraint crm_runtime_runs_finished check (state = 'running' or finished_at is not null)
);

create index if not exists crm_runtime_runs_type_time_idx
  on command.crm_runtime_runs (run_type, started_at desc);

alter table command.crm_runtime_runs enable row level security;
revoke all on command.crm_runtime_runs from anon, authenticated;
grant usage on schema command to service_role;
grant select, insert, update on command.crm_runtime_runs to service_role;

comment on table command.crm_runtime_runs is
  'Ledger idempotente das rodadas reais de campanha e reposição do KAIROS WhatsApp.';
