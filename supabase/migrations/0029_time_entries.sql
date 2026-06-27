-- ============================================================
-- iTech Platform — Migración 0029: Control de horario (empleados)
-- Marcaje de entrada/salida desde el POS, por sucursal.
-- ============================================================

create table if not exists public.time_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  branch_id  uuid references public.branches (id) on delete set null,
  clock_in   timestamptz not null default now(),
  clock_out  timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_time_entries_user on public.time_entries (user_id, clock_in desc);

alter table public.time_entries enable row level security;

-- El staff puede ver los registros (asistencia interna)
drop policy if exists time_entries_staff_read on public.time_entries;
create policy time_entries_staff_read on public.time_entries
  for select using (public.is_staff());

grant select on public.time_entries to authenticated;

-- Marcar entrada
create or replace function public.clock_in(p_branch uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  if exists (select 1 from time_entries where user_id = auth.uid() and clock_out is null) then
    raise exception 'Ya tienes una entrada abierta';
  end if;
  insert into time_entries (user_id, branch_id)
  values (auth.uid(), coalesce(p_branch, public.default_branch()))
  returning id into v_id;
  return v_id;
end; $$;
grant execute on function public.clock_in(uuid) to authenticated;

-- Marcar salida
create or replace function public.clock_out()
returns boolean language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  select id into v_id from time_entries where user_id = auth.uid() and clock_out is null
    order by clock_in desc limit 1;
  if v_id is null then raise exception 'No tienes una entrada abierta'; end if;
  update time_entries set clock_out = now() where id = v_id;
  return true;
end; $$;
grant execute on function public.clock_out() to authenticated;
