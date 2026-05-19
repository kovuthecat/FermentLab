-- FermentLab — Supabase schema
-- Run in: Supabase dashboard → SQL Editor → New query → paste → Run
-- All tables use UUID primary keys and reference auth.users(id) via user_id.
-- RLS is enabled on every table with owner-only policies.

-- ─────────────────────────────────────────────
-- batches
-- ─────────────────────────────────────────────
create table if not exists public.batches (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  schema_version text not null default '1.0',
  profile_id     text not null,
  name           text not null,
  status         text not null check (status in ('active', 'completed', 'abandoned')),
  started_at     timestamptz not null,
  ended_at       timestamptz,
  initial_parameters jsonb not null default '{}'::jsonb,
  container      jsonb not null default '{}'::jsonb,
  culture_snapshot jsonb,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.batches enable row level security;

create policy "batches: owner select"  on public.batches for select  using (auth.uid() = user_id);
create policy "batches: owner insert"  on public.batches for insert  with check (auth.uid() = user_id);
create policy "batches: owner update"  on public.batches for update  using (auth.uid() = user_id);
create policy "batches: owner delete"  on public.batches for delete  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- phases
-- ─────────────────────────────────────────────
create table if not exists public.phases (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  batch_id   uuid not null references public.batches(id) on delete cascade,
  type       text not null check (type in ('primary','secondary','refrigeration','feeding','rise','rest','bulk_fermentation','proofing','other')),
  label      text not null,
  started_at timestamptz not null,
  ended_at   timestamptz,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.phases enable row level security;

create policy "phases: owner select"  on public.phases for select  using (auth.uid() = user_id);
create policy "phases: owner insert"  on public.phases for insert  with check (auth.uid() = user_id);
create policy "phases: owner update"  on public.phases for update  using (auth.uid() = user_id);
create policy "phases: owner delete"  on public.phases for delete  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- ingredients
-- ─────────────────────────────────────────────
create table if not exists public.ingredients (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  batch_id        uuid not null references public.batches(id) on delete cascade,
  ingredient_type text not null check (ingredient_type in ('water','sugar','tea','milk','flour','starter','fruit','flavoring','salt','other')),
  name            text not null,
  quantity        numeric not null,
  unit            text not null check (unit in ('g','ml','l','tsp','tbsp','unit')),
  role            text not null check (role in ('base','substrate','inoculum','flavoring','additive','other')),
  notes           text,
  created_at      timestamptz not null default now()
);

alter table public.ingredients enable row level security;

create policy "ingredients: owner select"  on public.ingredients for select  using (auth.uid() = user_id);
create policy "ingredients: owner insert"  on public.ingredients for insert  with check (auth.uid() = user_id);
create policy "ingredients: owner update"  on public.ingredients for update  using (auth.uid() = user_id);
create policy "ingredients: owner delete"  on public.ingredients for delete  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- measurements
-- ─────────────────────────────────────────────
create table if not exists public.measurements (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  batch_id   uuid not null references public.batches(id) on delete cascade,
  phase_id   uuid references public.phases(id) on delete set null,
  timestamp  timestamptz not null,
  metric     text not null check (metric in ('temperature','ph','density_sg','brix','volume','weight','rise_percent','ambient_temperature','humidity')),
  value      numeric not null,
  unit       text not null,
  source     text not null check (source in ('manual','calculated','sensor')),
  note       text,
  created_at timestamptz not null default now()
);

alter table public.measurements enable row level security;

create policy "measurements: owner select"  on public.measurements for select  using (auth.uid() = user_id);
create policy "measurements: owner insert"  on public.measurements for insert  with check (auth.uid() = user_id);
create policy "measurements: owner update"  on public.measurements for update  using (auth.uid() = user_id);
create policy "measurements: owner delete"  on public.measurements for delete  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- observations
-- ─────────────────────────────────────────────
create table if not exists public.observations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  batch_id    uuid not null references public.batches(id) on delete cascade,
  phase_id    uuid references public.phases(id) on delete set null,
  timestamp   timestamptz not null,
  category    text not null check (category in ('visual','smell','taste','texture','activity','problem')),
  descriptor  text not null,
  intensity   smallint check (intensity between 1 and 5),
  note        text,
  created_at  timestamptz not null default now()
);

alter table public.observations enable row level security;

create policy "observations: owner select"  on public.observations for select  using (auth.uid() = user_id);
create policy "observations: owner insert"  on public.observations for insert  with check (auth.uid() = user_id);
create policy "observations: owner update"  on public.observations for update  using (auth.uid() = user_id);
create policy "observations: owner delete"  on public.observations for delete  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- process_events
-- ─────────────────────────────────────────────
create table if not exists public.process_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  batch_id   uuid not null references public.batches(id) on delete cascade,
  phase_id   uuid references public.phases(id) on delete set null,
  timestamp  timestamptz not null,
  event_type text not null check (event_type in ('bottling','filtering','ingredient_added','burping','mixing','discard','feeding','container_changed','other')),
  label      text not null,
  metadata   jsonb,
  note       text,
  created_at timestamptz not null default now()
);

alter table public.process_events enable row level security;

create policy "process_events: owner select"  on public.process_events for select  using (auth.uid() = user_id);
create policy "process_events: owner insert"  on public.process_events for insert  with check (auth.uid() = user_id);
create policy "process_events: owner update"  on public.process_events for update  using (auth.uid() = user_id);
create policy "process_events: owner delete"  on public.process_events for delete  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- final_evaluations
-- ─────────────────────────────────────────────
create table if not exists public.final_evaluations (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  batch_id                uuid not null unique references public.batches(id) on delete cascade,
  completed_at            timestamptz not null,
  acidity_score           smallint check (acidity_score between 1 and 5),
  sweetness_score         smallint check (sweetness_score between 1 and 5),
  carbonation_score       smallint check (carbonation_score between 1 and 5),
  alcohol_perception_score smallint check (alcohol_perception_score between 1 and 5),
  texture_score           smallint check (texture_score between 1 and 5),
  overall_score           smallint check (overall_score between 1 and 5),
  success                 boolean not null,
  would_repeat            boolean not null,
  problem_summary         text,
  final_notes             text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

alter table public.final_evaluations enable row level security;

create policy "final_evaluations: owner select"  on public.final_evaluations for select  using (auth.uid() = user_id);
create policy "final_evaluations: owner insert"  on public.final_evaluations for insert  with check (auth.uid() = user_id);
create policy "final_evaluations: owner update"  on public.final_evaluations for update  using (auth.uid() = user_id);
create policy "final_evaluations: owner delete"  on public.final_evaluations for delete  using (auth.uid() = user_id);
