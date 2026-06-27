-- ============================================================
-- iTech Platform — Migración 0022: Garantías / RMA
-- Contador de garantía y reapertura sin costo (ticket ligado al original).
-- ============================================================

alter table public.repair_tickets add column if not exists warranty_days int not null default 90;
alter table public.repair_tickets add column if not exists parent_ticket_id uuid references public.repair_tickets (id) on delete set null;
alter table public.repair_tickets add column if not exists is_warranty boolean not null default false;

-- Recrear create_repair_ticket para incluir warranty_days
create or replace function public.create_repair_ticket(p jsonb)
returns table (id uuid, ticket_number text)
language plpgsql security definer set search_path = public
as $$
declare v_id uuid; v_num text;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  v_num := 'REP-' || lpad(nextval('repair_seq')::text, 6, '0');
  insert into repair_tickets (
    ticket_number, customer_name, customer_phone, customer_email,
    device_type, brand, model, imei_serial, reported_issue,
    technician_name, estimated_cost, warranty_days
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
    nullif(p ->> 'estimated_cost', '')::numeric,
    coalesce(nullif(p ->> 'warranty_days','')::int, 90)
  ) returning repair_tickets.id into v_id;

  insert into repair_updates (ticket_id, status, note, created_by)
  values (v_id, 'recibido', 'Equipo recibido', auth.uid());
  return query select v_id, v_num;
end; $$;

grant execute on function public.create_repair_ticket(jsonb) to authenticated;

-- Reabrir por garantía (sin costo) ---------------------------
create or replace function public.reopen_warranty(p_ticket uuid, p_note text)
returns table (ticket_id uuid, ticket_number text)
language plpgsql security definer set search_path = public
as $$
declare t public.repair_tickets%rowtype; v_id uuid; v_num text;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  select * into t from repair_tickets where id = p_ticket;
  if not found then raise exception 'Ticket no encontrado'; end if;

  v_num := 'REP-' || lpad(nextval('repair_seq')::text, 6, '0');
  insert into repair_tickets (
    ticket_number, customer_name, customer_phone, customer_email,
    device_type, brand, model, imei_serial, reported_issue,
    technician_name, status, estimated_cost, warranty_days,
    parent_ticket_id, is_warranty, company_id
  ) values (
    v_num, t.customer_name, t.customer_phone, t.customer_email,
    t.device_type, t.brand, t.model, t.imei_serial,
    coalesce(nullif(p_note,''), 'Reapertura por garantía'),
    'recibido', 0, t.warranty_days, t.id, true, t.company_id
  ) returning repair_tickets.id into v_id;

  insert into repair_updates (ticket_id, status, note, created_by)
  values (v_id, 'recibido', 'Reapertura por garantía de ' || t.ticket_number, auth.uid());
  return query select v_id, v_num;
end; $$;

grant execute on function public.reopen_warranty(uuid, text) to authenticated;

-- Actualizar track_repair para incluir el contador de garantía
create or replace function public.track_repair(p_number text, p_phone text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_t public.repair_tickets%rowtype; v_clean text; v_until date; v_left int; result jsonb;
begin
  select * into v_t from repair_tickets where upper(ticket_number) = upper(trim(coalesce(p_number,'')));
  if not found then return jsonb_build_object('found', false); end if;

  v_clean := regexp_replace(coalesce(p_phone,''), '\D', '', 'g');
  if length(v_clean) < 4
     or right(regexp_replace(v_t.customer_phone, '\D', '', 'g'), 4) <> right(v_clean, 4) then
    return jsonb_build_object('found', false);
  end if;

  if v_t.delivered_at is not null and coalesce(v_t.warranty_days,0) > 0 then
    v_until := (v_t.delivered_at::date + v_t.warranty_days);
    v_left := greatest(0, v_until - current_date);
  end if;

  select jsonb_build_object(
    'found', true,
    'ticket', jsonb_build_object(
      'number', v_t.ticket_number,
      'status', v_t.status,
      'device', concat_ws(' ', v_t.device_type, v_t.brand, v_t.model),
      'estimated_cost', v_t.estimated_cost,
      'created_at', v_t.created_at,
      'delivered_at', v_t.delivered_at,
      'warranty_until', v_until,
      'warranty_days_left', v_left
    ),
    'timeline', coalesce((
      select jsonb_agg(jsonb_build_object('status', u.status, 'note', u.note, 'at', u.created_at) order by u.created_at)
      from repair_updates u where u.ticket_id = v_t.id
    ), '[]'::jsonb)
  ) into result;
  return result;
end; $$;

grant execute on function public.track_repair(text, text) to anon, authenticated;
