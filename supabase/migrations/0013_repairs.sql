-- ============================================================
-- iTech Platform — Migración 0013: Soporte técnico y reparaciones
-- Tickets de reparación, historial (timeline) y seguimiento público
-- del cliente por número de ticket + teléfono.
-- ============================================================

create sequence if not exists public.repair_seq start 1000;

create table if not exists public.repair_tickets (
  id              uuid primary key default gen_random_uuid(),
  ticket_number   text unique not null,
  customer_name   text not null,
  customer_phone  text not null,
  customer_email  text,
  device_type     text,
  brand           text,
  model           text,
  imei_serial     text,
  reported_issue  text,
  diagnosis       text,
  technician_name text,
  status          text not null default 'recibido',
  estimated_cost  numeric(10, 2),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  delivered_at    timestamptz
);

create table if not exists public.repair_updates (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid not null references public.repair_tickets (id) on delete cascade,
  status     text not null,
  note       text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_repair_updates_ticket on public.repair_updates (ticket_id, created_at);

drop trigger if exists trg_repairs_updated on public.repair_tickets;
create trigger trg_repairs_updated
  before update on public.repair_tickets
  for each row execute function public.set_updated_at();

alter table public.repair_tickets enable row level security;
alter table public.repair_updates enable row level security;

drop policy if exists repairs_staff_all on public.repair_tickets;
create policy repairs_staff_all on public.repair_tickets
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists repair_updates_staff_all on public.repair_updates;
create policy repair_updates_staff_all on public.repair_updates
  for all using (public.is_staff()) with check (public.is_staff());

grant select, insert, update on public.repair_tickets to authenticated;
grant select, insert on public.repair_updates to authenticated;

-- Crear ticket (staff) ---------------------------------------
create or replace function public.create_repair_ticket(p jsonb)
returns table (id uuid, ticket_number text)
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
  v_num text;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  v_num := 'REP-' || lpad(nextval('repair_seq')::text, 6, '0');

  insert into repair_tickets (
    ticket_number, customer_name, customer_phone, customer_email,
    device_type, brand, model, imei_serial, reported_issue,
    technician_name, estimated_cost
  ) values (
    v_num,
    coalesce(p ->> 'customer_name', ''),
    coalesce(p ->> 'customer_phone', ''),
    nullif(p ->> 'customer_email', ''),
    nullif(p ->> 'device_type', ''),
    nullif(p ->> 'brand', ''),
    nullif(p ->> 'model', ''),
    nullif(p ->> 'imei_serial', ''),
    nullif(p ->> 'reported_issue', ''),
    nullif(p ->> 'technician_name', ''),
    nullif(p ->> 'estimated_cost', '')::numeric
  ) returning repair_tickets.id into v_id;

  insert into repair_updates (ticket_id, status, note, created_by)
  values (v_id, 'recibido', 'Equipo recibido', auth.uid());

  return query select v_id, v_num;
end; $$;

grant execute on function public.create_repair_ticket(jsonb) to authenticated;

-- Seguimiento público (cliente) ------------------------------
create or replace function public.track_repair(p_number text, p_phone text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_t repair_tickets%rowtype;
  v_clean text;
  result jsonb;
begin
  select * into v_t from repair_tickets
    where upper(ticket_number) = upper(trim(coalesce(p_number, '')));
  if not found then
    return jsonb_build_object('found', false);
  end if;

  -- valida por los últimos 4 dígitos del teléfono
  v_clean := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  if length(v_clean) < 4
     or right(regexp_replace(v_t.customer_phone, '\D', '', 'g'), 4) <> right(v_clean, 4) then
    return jsonb_build_object('found', false);
  end if;

  select jsonb_build_object(
    'found', true,
    'ticket', jsonb_build_object(
      'number', v_t.ticket_number,
      'status', v_t.status,
      'device', concat_ws(' ', v_t.device_type, v_t.brand, v_t.model),
      'estimated_cost', v_t.estimated_cost,
      'created_at', v_t.created_at,
      'delivered_at', v_t.delivered_at
    ),
    'timeline', coalesce((
      select jsonb_agg(jsonb_build_object('status', u.status, 'note', u.note, 'at', u.created_at) order by u.created_at)
      from repair_updates u where u.ticket_id = v_t.id
    ), '[]'::jsonb)
  ) into result;

  return result;
end; $$;

grant execute on function public.track_repair(text, text) to anon, authenticated;
