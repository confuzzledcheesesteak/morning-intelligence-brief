create extension if not exists pgcrypto;

create table if not exists public.briefs (
  id text primary key,
  brief_date date not null,
  title text not null,
  executive_summary text not null,
  overall_threat_score numeric(3,1) not null default 0,
  payload jsonb not null,
  pdf_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  delivery_time text not null default '07:00',
  timezone text not null default 'America/New_York',
  region_filters text[] not null default array['Global','Europe','Middle East','Indo-Pacific','Americas','Africa'],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source text not null,
  url text unique not null,
  published_at timestamptz,
  region text,
  relevance_score numeric(3,2),
  created_at timestamptz not null default now()
);

alter table public.briefs enable row level security;
alter table public.subscribers enable row level security;
alter table public.news_articles enable row level security;

create policy "Public can read brief archive" on public.briefs for select using (true);
create policy "Service role manages briefs" on public.briefs for all using (auth.role() = 'service_role');
create policy "Service role manages subscribers" on public.subscribers for all using (auth.role() = 'service_role');
create policy "Service role manages news" on public.news_articles for all using (auth.role() = 'service_role');
