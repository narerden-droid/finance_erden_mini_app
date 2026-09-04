-- =========================================================
-- Схема базы данных для Telegram Mini App "Финансы"
-- Выполни этот скрипт в Supabase: SQL Editor -> New query -> Run
-- =========================================================

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique not null,
  chat_id bigint not null,
  daily_limit numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  name text not null,
  icon text not null default '💰',
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  amount numeric not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_user_created on public.transactions (user_id, created_at);
create index if not exists idx_categories_user on public.categories (user_id);

-- RLS включён, но политик для анонимного доступа НЕТ.
-- Всё общение с базой идёт через серверные API-роуты Next.js,
-- которые используют Service Role Key (обходит RLS). Это безопасно,
-- т.к. Service Role Key никогда не попадает в браузер пользователя.
alter table public.app_users enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
