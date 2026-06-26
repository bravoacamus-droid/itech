-- ============================================================
-- iTech Platform — Migración 0007: configuración de tienda (settings)
-- Clave-valor con lectura pública (config no sensible) y escritura staff.
-- ============================================================

create table if not exists public.settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

drop policy if exists settings_public_read on public.settings;
create policy settings_public_read on public.settings
  for select using (true);

drop policy if exists settings_staff_write on public.settings;
create policy settings_staff_write on public.settings
  for all using (public.is_staff()) with check (public.is_staff());

grant select on public.settings to anon, authenticated;
grant insert, update, delete on public.settings to authenticated;

insert into public.settings (key, value) values
  ('whatsapp_number', '51916854842'),
  ('store_name',      'iTech Import Perú'),
  ('contact_phone',   '916854842'),
  ('contact_email',   'ventas@itech.pe')
on conflict (key) do nothing;
