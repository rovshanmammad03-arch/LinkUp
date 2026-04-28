-- Run this in Supabase SQL Editor

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password text not null,
  name text not null,
  university text default '',
  field text default '',
  level text default 'Başlanğıc',
  bio text default '',
  avatar text default '',
  grad text default 'from-brand-500 to-purple-500',
  skills jsonb default '[]',
  links jsonb default '[]',
  views integer default 0,
  followers jsonb default '[]',
  following jsonb default '[]',
  onboarding_done boolean default false,
  created_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references users(id) on delete cascade,
  caption text not null,
  type text default 'other',
  image text default '',
  likes jsonb default '[]',
  comments jsonb default '[]',
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  from_id uuid references users(id) on delete cascade,
  to_id uuid references users(id) on delete cascade,
  text text not null,
  read boolean default false,
  created_at timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text not null,
  text text not null,
  from_id uuid,
  read boolean default false,
  project_id uuid,
  conn_id uuid,
  created_at timestamptz default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  desc text not null,
  author_id uuid references users(id) on delete cascade,
  skills jsonb default '[]',
  team text default '3-5 nəfər',
  status text default 'active',
  applicants jsonb default '[]',
  grad text default 'from-brand-500 to-purple-500',
  created_at timestamptz default now()
);

-- Disable RLS (we use service key from server)
alter table users disable row level security;
alter table posts disable row level security;
alter table messages disable row level security;
alter table notifications disable row level security;
alter table projects disable row level security;
