-- ============================================================
-- iTech Platform — Migración 0034: centro de notificaciones in-app
-- Bandeja por usuario (campana + no leídas). Se llena desde notifyUser (mismo
-- punto que dispara el push), así push y bandeja quedan sincronizados.
-- ============================================================

create table if not exists public.user_notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null,
  body       text,
  url        text,
  tag        text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_notifs_user on public.user_notifications (user_id, created_at desc);
create index if not exists idx_user_notifs_unread on public.user_notifications (user_id) where read_at is null;

alter table public.user_notifications enable row level security;

-- Cada usuario ve y marca como leídas SOLO las suyas (la inserción la hace el
-- service_role desde notifyUser, que hace bypass de RLS).
drop policy if exists user_notifs_own on public.user_notifications;
create policy user_notifs_own on public.user_notifications for select
  using (user_id = auth.uid());
drop policy if exists user_notifs_update_own on public.user_notifications;
create policy user_notifs_update_own on public.user_notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, update on public.user_notifications to authenticated;
