-- ============================================================
-- iTech Platform — Migración 0033: Web Push (VAPID)
-- Basado en receta probada (A.4): endpoint UNIQUE, RLS por usuario, push_log.
-- ============================================================

create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  endpoint     text not null unique,           -- UNIQUE evita duplicados
  p256dh       text not null,
  auth         text not null,
  user_agent   text,
  last_used_at timestamptz,                     -- se marca al enviar OK (diagnóstico)
  created_at   timestamptz not null default now()
);

create index if not exists idx_push_subs_user on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- Cada usuario gestiona solo sus propias suscripciones
drop policy if exists push_subs_own on public.push_subscriptions;
create policy push_subs_own on public.push_subscriptions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update, delete on public.push_subscriptions to authenticated;

-- Bitácora de envíos (sin esto, debuggear push es imposible)
create table if not exists public.push_log (
  id             uuid primary key default gen_random_uuid(),
  source         text,                          -- de dónde se disparó
  target_user_id uuid,
  title          text,
  status         text not null,                 -- attempt | ok | error
  detail         text,
  created_at     timestamptz not null default now()
);

create index if not exists idx_push_log_created on public.push_log (created_at desc);

alter table public.push_log enable row level security;
-- Solo admins consultan la bitácora; la escritura va por service_role (bypass).
drop policy if exists push_log_admin_read on public.push_log;
create policy push_log_admin_read on public.push_log for select using (public.is_branch_admin());
grant select on public.push_log to authenticated;
