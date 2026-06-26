-- ============================================================
-- iTech Platform — Migración 0001: identidad, roles y RLS base
-- Foundation de seguridad (ver DOCUMENTO-MAESTRO.md §5).
-- Aplicar con: supabase db push  (requiere Supabase CLI + link al proyecto)
-- ============================================================

-- Roles del sistema (RBAC) -----------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum (
      'customer',
      'b2b_member',
      'b2b_admin',
      'technician',
      'cashier',
      'warehouse_clerk',
      'accountant',
      'branch_manager',
      'org_admin',
      'super_admin'
    );
  end if;
end$$;

-- Perfiles (1:1 con auth.users) ------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  role        public.app_role not null default 'customer',
  company_id  uuid,                       -- empresa B2B (multi-tenant)
  branch_ids  uuid[] not null default '{}', -- sucursales permitidas
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Helpers de claims/identidad --------------------------------
create or replace function public.current_role()
returns public.app_role
language sql stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql stable
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid())
      in ('technician','cashier','warehouse_clerk','accountant',
          'branch_manager','org_admin','super_admin'),
    false
  );
$$;

-- Políticas RLS de profiles ----------------------------------
-- Cada usuario ve y edita su propio perfil.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- El staff administrativo puede ver todos los perfiles.
drop policy if exists "profiles_select_staff" on public.profiles;
create policy "profiles_select_staff"
  on public.profiles for select
  using (public.is_staff());

-- Alta automática de perfil al registrarse -------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- NOTA: el resto del esquema (catálogo, inventario, reparaciones, etc.)
-- se modela por contexto en migraciones siguientes (ver §6 del documento maestro).
