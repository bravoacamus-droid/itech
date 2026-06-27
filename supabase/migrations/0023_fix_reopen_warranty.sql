-- ============================================================
-- iTech Platform — Migración 0023: corrige reopen_warranty
-- Faltaba el valor technician_name (columnas != expresiones).
-- ============================================================

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
    t.technician_name, 'recibido', 0, t.warranty_days,
    t.id, true, t.company_id
  ) returning repair_tickets.id into v_id;

  insert into repair_updates (ticket_id, status, note, created_by)
  values (v_id, 'recibido', 'Reapertura por garantía de ' || t.ticket_number, auth.uid());
  return query select v_id, v_num;
end; $$;

grant execute on function public.reopen_warranty(uuid, text) to authenticated;
