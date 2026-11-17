-- Budapest Luxury Apartments concept site. Idempotent: applied on first DB access.

create table if not exists agents (
  id         uuid primary key,
  slug       text not null unique,
  name       text not null,
  role       text not null,
  focus      text not null,
  phone      text not null,
  photo_url  text not null
);

create table if not exists listings (
  id               text primary key,                 -- "rent-104713" / "sale-4314"
  ref              text not null,                    -- the agency's reference number
  kind             text not null check (kind in ('rent','sale')),
  slug             text not null unique,
  position         integer not null,                 -- order on the agency's own site
  type             text not null check (type in ('apartment','house')),
  street           text not null,
  district         text not null,
  neighbourhood    text not null,
  price_eur        integer not null check (price_eur > 0),  -- monthly rent or sale price
  size_m2          integer not null check (size_m2 > 0),
  bedrooms         integer not null,
  bathrooms        integer not null,
  view             text,
  furnished        text check (furnished in ('yes','no','optional','partly')),
  pet_friendly     boolean,
  garage           boolean,
  elevator         boolean,
  air_conditioning boolean,
  alarm            boolean,
  sauna            boolean,
  pool             boolean,
  description      text not null,
  agent_id         uuid references agents(id),
  source_url       text not null,
  status           text not null default 'active' check (status in ('active','let','sold','hidden')),
  updated_at       timestamptz not null default now(),
  unique (kind, ref)
);
create index if not exists listings_search_idx on listings (kind, status, district, price_eur);

create table if not exists listing_photos (
  listing_id  text not null references listings(id) on delete cascade,
  position    integer not null,
  url         text not null,
  primary key (listing_id, position)
);

create table if not exists leads (
  id               uuid primary key default gen_random_uuid(),
  kind             text not null check (kind in ('viewing','valuation')),
  listing_id       text references listings(id),
  name             text not null,
  email            text not null,
  phone            text,
  answers          jsonb not null,
  estimate_eur     integer,                          -- valuation leads: the mid estimate shown
  lead_score       integer not null check (lead_score between 0 and 100),
  lead_tier        text not null check (lead_tier in ('hot','warm','cold')),
  score_breakdown  jsonb not null,
  utm_source       text,
  utm_campaign     text,
  created_at       timestamptz not null default now()
);
create index if not exists leads_tier_idx on leads (lead_tier, created_at desc);
