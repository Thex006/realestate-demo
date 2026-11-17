-- Lakáspont concept site schema. Idempotent: applied on first DB access.

create table if not exists agents (
  id          uuid primary key,
  slug        text not null unique,
  name        text not null,
  role        text not null,
  phone       text not null,
  email       text not null,
  bio         text not null,
  created_at  timestamptz not null default now()
);

create table if not exists listings (
  id                 uuid primary key,
  external_ref       text not null unique,          -- alberlet.hu ad number
  slug               text not null unique,
  title              text not null,
  property_type      text not null check (property_type in ('flat','house','studio','commercial-ready')),
  district           text not null,                 -- Roman numeral
  neighbourhood      text not null,
  street             text not null,
  size_m2            integer not null check (size_m2 > 0),
  rooms              integer not null check (rooms >= 0),
  half_rooms         integer not null default 0,
  floor              text,
  elevator           boolean,
  heating            text,
  furnished          text not null check (furnished in ('furnished','partly','unfurnished')),
  condition          text,
  balcony            text,
  parking            text,
  pets_allowed       boolean,                       -- null = not stated
  air_conditioning   boolean not null default false,
  available_from     date,
  available_now      boolean not null default false,
  rent_huf           integer not null check (rent_huf > 0),
  common_charge_huf  integer,
  utilities_est_huf  integer,
  deposit_months     integer,
  min_lease_months   integer,
  summary            text not null,
  highlights         jsonb not null default '[]',
  nearby             jsonb not null default '[]',
  image_url          text,
  source_url         text not null,
  source_issues      jsonb not null default '[]',
  agent_id           uuid not null references agents(id),
  status             text not null default 'active' check (status in ('active','let','hidden')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists listings_search_idx on listings (status, district, rent_huf);

create table if not exists leads (
  id               uuid primary key default gen_random_uuid(),
  kind             text not null check (kind in ('viewing','owner')),
  listing_id       uuid references listings(id),
  name             text not null,
  email            text not null,
  phone            text,
  answers          jsonb not null,                  -- the full validated form
  estimate_huf     integer,                         -- owner leads: the mid estimate we showed
  lead_score       integer not null check (lead_score between 0 and 100),
  lead_tier        text not null check (lead_tier in ('hot','warm','cold')),
  score_breakdown  jsonb not null,
  utm_source       text,
  utm_campaign     text,
  created_at       timestamptz not null default now()
);
create index if not exists leads_tier_idx on leads (lead_tier, created_at desc);
