-- Morning Intelligence Brief Supabase schema
-- Run in Supabase SQL editor. Uses public read only if you choose to expose archive.

create extension if not exists pgcrypto;

create table if not exists briefs (
  id text primary key,
  brief_date date not null,
  title text not null,
  threat_score numeric(3,1) not null check (threat_score >= 1 and threat_score <= 5),
  payload jsonb not null,
  generated_at timestamptz not null default now()
);

create index if not exists briefs_generated_at_idx on briefs (generated_at desc);
create index if not exists briefs_brief_date_idx on briefs (brief_date desc);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  delivery_time text not null default '07:00',
  timezone text not null default 'America/Los_Angeles',
  regions text[] not null default '{}',
  minimum_threat_level numeric(3,1) not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table briefs enable row level security;
alter table subscriptions enable row level security;

-- Serverless functions use SUPABASE_SERVICE_ROLE_KEY and bypass RLS.
-- Optional public archive policy for read-only frontend access:
-- create policy "Public can read brief archive" on briefs for select using (true);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists subscriptions_updated_at on subscriptions;
create trigger subscriptions_updated_at before update on subscriptions for each row execute function set_updated_at();
