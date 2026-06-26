-- ============================================================
-- iTech Platform — Migración 0012: POS / Caja
-- Sesiones de caja (apertura/arqueo) y ventas presenciales que
-- descuentan stock y se enlazan a la sesión.
-- ============================================================

create table if not exists public.cash_sessions (
  id              uuid primary key default gen_random_uuid(),
  opened_by       uuid references auth.users (id) on delete set null,
  opened_at       timestamptz not null default now(),
  opening_amount  numeric(10, 2) not null default 0,
  status          text not null default 'abierta', -- abierta | cerrada
  closed_by       uuid references auth.users (id) on delete set null,
  closed_at       timestamptz,
  expected_amount numeric(10, 2),
  counted_amount  numeric(10, 2),
  difference      numeric(10, 2),
  note            text
);

alter table public.orders add column if not exists channel text not null default 'web';
alter table public.orders add column if not exists cash_session_id uuid references public.cash_sessions (id) on delete set null;
alter table public.orders add column if not exists sold_by uuid references auth.users (id) on delete set null;

alter table public.cash_sessions enable row level security;

drop policy if exists cash_sessions_staff_all on public.cash_sessions;
create policy cash_sessions_staff_all on public.cash_sessions
  for all using (public.is_staff()) with check (public.is_staff());

grant select, insert, update on public.cash_sessions to authenticated;

-- Abrir caja --------------------------------------------------
create or replace function public.open_cash_session(p_opening numeric)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare v_id uuid;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  if exists (select 1 from cash_sessions where status = 'abierta') then
    raise exception 'Ya hay una caja abierta';
  end if;
  insert into cash_sessions (opened_by, opening_amount)
  values (auth.uid(), coalesce(p_opening, 0))
  returning id into v_id;
  return v_id;
end; $$;

grant execute on function public.open_cash_session(numeric) to authenticated;

-- Venta POS ---------------------------------------------------
create or replace function public.pos_checkout(
  p_items jsonb,
  p_payment text,
  p_customer text
)
returns table (order_id uuid, order_number text)
language plpgsql security definer set search_path = public
as $$
declare
  v_sess uuid;
  v_order_id uuid;
  v_num text;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty int;
  v_subtotal numeric(10,2) := 0;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'No hay productos en la venta';
  end if;

  select id into v_sess from cash_sessions where status = 'abierta'
    order by opened_at desc limit 1;
  if v_sess is null then raise exception 'No hay una caja abierta'; end if;

  v_num := 'ITC-' || lpad(nextval('order_seq')::text, 6, '0');

  insert into orders (
    order_number, customer_name, customer_phone, payment_method, status,
    channel, cash_session_id, sold_by
  ) values (
    v_num, coalesce(nullif(p_customer, ''), 'Cliente mostrador'), '-',
    coalesce(nullif(p_payment, ''), 'efectivo'), 'pagado',
    'pos', v_sess, auth.uid()
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product from products
      where products.id = (v_item ->> 'product_id')::uuid and products.is_active = true;
    if not found then raise exception 'Producto no disponible'; end if;
    v_qty := greatest(1, coalesce((v_item ->> 'quantity')::int, 1));
    if v_product.stock < v_qty then
      raise exception 'Stock insuficiente para %', v_product.name;
    end if;

    insert into order_items (order_id, product_id, name, unit_price, quantity, line_total)
    values (v_order_id, v_product.id, v_product.name, v_product.price, v_qty, v_product.price * v_qty);

    update products set stock = products.stock - v_qty where products.id = v_product.id;

    insert into stock_movements (product_id, delta, reason, note, resulting_stock, created_by)
    values (v_product.id, -v_qty, 'venta', 'POS ' || v_num, v_product.stock - v_qty, auth.uid());

    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  update orders set subtotal = v_subtotal, total = v_subtotal where orders.id = v_order_id;
  return query select v_order_id, v_num;
end; $$;

grant execute on function public.pos_checkout(jsonb, text, text) to authenticated;

-- Cerrar caja (arqueo) ---------------------------------------
create or replace function public.close_cash_session(
  p_session uuid,
  p_counted numeric,
  p_note text
)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_session cash_sessions%rowtype;
  v_cash_sales numeric(10,2);
  v_expected numeric(10,2);
  v_diff numeric(10,2);
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;

  select * into v_session from cash_sessions where id = p_session;
  if not found then raise exception 'Sesión no encontrada'; end if;
  if v_session.status = 'cerrada' then raise exception 'La caja ya está cerrada'; end if;

  select coalesce(sum(total), 0) into v_cash_sales
    from orders
    where cash_session_id = p_session
      and status <> 'anulado'
      and payment_method = 'efectivo';

  v_expected := v_session.opening_amount + v_cash_sales;
  v_diff := coalesce(p_counted, 0) - v_expected;

  if v_diff <> 0 and coalesce(nullif(p_note, ''), '') = '' then
    raise exception 'Hay un descuadre: indica una nota para justificarlo';
  end if;

  update cash_sessions set
    status = 'cerrada',
    closed_by = auth.uid(),
    closed_at = now(),
    expected_amount = v_expected,
    counted_amount = coalesce(p_counted, 0),
    difference = v_diff,
    note = nullif(p_note, '')
  where id = p_session;

  return jsonb_build_object('expected', v_expected, 'counted', coalesce(p_counted,0), 'difference', v_diff);
end; $$;

grant execute on function public.close_cash_session(uuid, numeric, text) to authenticated;
