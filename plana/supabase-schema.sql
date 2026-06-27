-- Run this entire file in Supabase SQL Editor

create table if not exists otps (
  id uuid primary key default gen_random_uuid(),
  phone text,
  code text,
  expires_at timestamptz,
  used boolean default false,
  created_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text,
  created_at timestamptz default now()
);

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  phone text not null references users(phone),
  type text,
  location text,
  budget numeric,
  currency text default 'UGX',
  guest_count integer,
  event_date date,
  start_date date,
  total_saved numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  phone text,
  name text,
  category text,
  location text,
  price_min numeric,
  price_max numeric,
  currency text default 'UGX',
  description text,
  website text,
  verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists quote_requests (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null,
  provider_id uuid references providers(id) on delete set null,
  provider_phone text,
  client_phone text,
  plan_type text,
  location text,
  budget numeric,
  currency text default 'UGX',
  category text,
  status text default 'pending' check (status in ('pending', 'responded', 'closed')),
  created_at timestamptz default now()
);
