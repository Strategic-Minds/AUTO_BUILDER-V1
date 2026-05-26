create table if not exists public.leads (
  lead_id uuid primary key default gen_random_uuid(),
  source text not null,
  campaign text,
  captured_at timestamptz not null default now(),
  status text not null default 'new',
  owner text,
  meta_json jsonb not null default '{}'::jsonb
);

create table if not exists public.opportunities (
  opportunity_id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(lead_id) on delete set null,
  offer text not null,
  stage text not null,
  value numeric(14,2) not null default 0,
  probability numeric(6,4) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.sales (
  sale_id uuid primary key default gen_random_uuid(),
  customer_id text not null,
  opportunity_id uuid references public.opportunities(opportunity_id) on delete set null,
  sale_date timestamptz not null default now(),
  revenue numeric(14,2) not null default 0,
  gross_margin numeric(6,4) not null default 0,
  source text,
  meta_json jsonb not null default '{}'::jsonb
);

create table if not exists public.spend (
  spend_id uuid primary key default gen_random_uuid(),
  channel text not null,
  campaign text,
  spend_date timestamptz not null default now(),
  amount numeric(14,2) not null default 0,
  meta_json jsonb not null default '{}'::jsonb
);

create table if not exists public.customers (
  customer_id text primary key,
  first_sale_date timestamptz,
  segment text,
  status text,
  meta_json jsonb not null default '{}'::jsonb
);

create table if not exists public.cohorts (
  cohort_id uuid primary key default gen_random_uuid(),
  period text not null,
  customers integer not null default 0,
  revenue numeric(14,2) not null default 0,
  churn numeric(6,4) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.forecasts (
  forecast_id uuid primary key default gen_random_uuid(),
  version text not null,
  owner text not null default 'AUTO BUILDER',
  inputs_json jsonb not null default '{}'::jsonb,
  output_json jsonb not null default '{}'::jsonb,
  confidence text not null default 'low',
  created_at timestamptz not null default now()
);

create table if not exists public.simulation_runs (
  run_id uuid primary key default gen_random_uuid(),
  seed integer not null,
  model_version text not null,
  inputs_hash text not null,
  outputs_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.decisions (
  decision_id uuid primary key default gen_random_uuid(),
  forecast_id uuid references public.forecasts(forecast_id) on delete set null,
  decision_type text not null,
  decision_signal text not null,
  approval_status text not null default 'needs_review',
  evidence_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_leads_source on public.leads(source, captured_at desc);
create index if not exists idx_opportunities_stage on public.opportunities(stage, created_at desc);
create index if not exists idx_sales_date on public.sales(sale_date desc);
create index if not exists idx_spend_date on public.spend(spend_date desc);
create index if not exists idx_forecasts_version on public.forecasts(version, created_at desc);
create index if not exists idx_simulation_runs_model on public.simulation_runs(model_version, created_at desc);

alter table public.leads enable row level security;
alter table public.opportunities enable row level security;
alter table public.sales enable row level security;
alter table public.spend enable row level security;
alter table public.customers enable row level security;
alter table public.cohorts enable row level security;
alter table public.forecasts enable row level security;
alter table public.simulation_runs enable row level security;
alter table public.decisions enable row level security;

do $$ begin create policy "read leads" on public.leads for select to authenticated using (true); exception when duplicate_object then null; end $$;
do $$ begin create policy "read opportunities" on public.opportunities for select to authenticated using (true); exception when duplicate_object then null; end $$;
do $$ begin create policy "read sales" on public.sales for select to authenticated using (true); exception when duplicate_object then null; end $$;
do $$ begin create policy "read spend" on public.spend for select to authenticated using (true); exception when duplicate_object then null; end $$;
do $$ begin create policy "read customers" on public.customers for select to authenticated using (true); exception when duplicate_object then null; end $$;
do $$ begin create policy "read cohorts" on public.cohorts for select to authenticated using (true); exception when duplicate_object then null; end $$;
do $$ begin create policy "read forecasts" on public.forecasts for select to authenticated using (true); exception when duplicate_object then null; end $$;
do $$ begin create policy "read simulation_runs" on public.simulation_runs for select to authenticated using (true); exception when duplicate_object then null; end $$;
do $$ begin create policy "read decisions" on public.decisions for select to authenticated using (true); exception when duplicate_object then null; end $$;
