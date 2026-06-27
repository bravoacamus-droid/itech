-- ============================================================
-- iTech Platform — Migración 0019: corrige create_invoice_from_order
-- "column reference id is ambiguous": el OUT param 'id' chocaba con columnas.
-- Se renombra el retorno a invoice_id.
-- ============================================================

drop function if exists public.create_invoice_from_order(uuid, text, jsonb);

create or replace function public.create_invoice_from_order(p_order uuid, p_doc_type text, p_customer jsonb)
returns table (invoice_id uuid, full_number text)
language plpgsql security definer set search_path = public
as $$
declare
  v_cfg public.fiscal_config%rowtype;
  v_order public.orders%rowtype;
  v_serie text;
  v_corr int;
  v_id uuid;
  v_num text;
  v_rate numeric := 18.00;
  v_total numeric(10,2);
  v_grav numeric(10,2);
  v_igv numeric(10,2);
  it record;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  select * into v_cfg from fiscal_config where id = 'default';
  v_rate := coalesce(v_cfg.igv_rate, 18.00);

  select * into v_order from orders where orders.id = p_order;
  if not found then raise exception 'Pedido no encontrado'; end if;

  if exists (select 1 from invoices i where i.order_id = p_order and i.status <> 'anulado') then
    raise exception 'El pedido ya tiene un comprobante';
  end if;

  v_serie := case when p_doc_type = '01' then coalesce(v_cfg.factura_serie,'F001')
                  else coalesce(v_cfg.boleta_serie,'B001') end;
  select coalesce(max(i.correlativo),0) + 1 into v_corr from invoices i where i.doc_type = p_doc_type and i.serie = v_serie;
  v_num := v_serie || '-' || lpad(v_corr::text, 8, '0');

  v_total := coalesce(v_order.total, 0);
  v_grav := round(v_total / (1 + v_rate/100.0), 2);
  v_igv := v_total - v_grav;

  insert into invoices (order_id, doc_type, serie, correlativo, full_number,
    customer_doc_type, customer_doc, customer_name, currency, op_gravada, igv, total)
  values (p_order, p_doc_type, v_serie, v_corr, v_num,
    coalesce(p_customer->>'doc_type','0'), nullif(p_customer->>'doc',''),
    coalesce(nullif(p_customer->>'name',''), v_order.customer_name, 'Cliente'),
    coalesce(v_order.currency,'PEN'), v_grav, v_igv, v_total)
  returning invoices.id into v_id;

  for it in select oi.* from order_items oi where oi.order_id = p_order loop
    insert into invoice_items (invoice_id, description, quantity, unit_price, igv, line_total)
    values (v_id, it.name, it.quantity, it.unit_price,
      round(it.line_total - it.line_total/(1+v_rate/100.0), 2), it.line_total);
  end loop;

  return query select v_id, v_num;
end; $$;

grant execute on function public.create_invoice_from_order(uuid, text, jsonb) to authenticated;
