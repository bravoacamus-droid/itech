-- ============================================================
-- iTech Platform — Migración 0021: convertir cotización en pedido
-- ============================================================

alter table public.orders add column if not exists quote_id uuid references public.quotes (id) on delete set null;

create or replace function public.convert_quote_to_order(p_quote uuid)
returns table (order_id uuid, order_number text)
language plpgsql security definer set search_path = public
as $$
declare
  q public.quotes%rowtype;
  v_order uuid;
  v_num text;
  it record;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;

  select * into q from quotes where id = p_quote;
  if not found then raise exception 'Cotización no encontrada'; end if;
  if exists (select 1 from orders o where o.quote_id = p_quote) then
    raise exception 'Esta cotización ya fue convertida en pedido';
  end if;

  v_num := 'ITC-' || lpad(nextval('order_seq')::text, 6, '0');

  insert into orders (order_number, customer_name, customer_phone, customer_email,
    payment_method, status, channel, sold_by, quote_id, subtotal, total, currency)
  values (v_num, q.customer_name, coalesce(nullif(q.customer_phone,''), '-'),
    q.customer_email, 'whatsapp', 'pendiente', 'cotizacion', auth.uid(), p_quote,
    q.total, q.total, coalesce(q.currency,'PEN'))
  returning orders.id into v_order;

  for it in select * from quote_items where quote_id = p_quote loop
    insert into order_items (order_id, product_id, name, unit_price, quantity, line_total)
    values (v_order, null, it.description, it.unit_price, greatest(1, round(it.quantity)::int), it.line_total);
  end loop;

  update quotes set status = 'aceptada' where id = p_quote;

  return query select v_order, v_num;
end; $$;

grant execute on function public.convert_quote_to_order(uuid) to authenticated;
