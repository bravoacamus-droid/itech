-- ============================================================
-- iTech Platform — Migración 0008: inventario y alarmas de stock
-- - Punto de reorden por producto (low_stock_threshold)
-- - Historial de movimientos (stock_movements)
-- - RPC adjust_stock (entradas/salidas/ajustes) para staff
-- - create_order registra movimientos de tipo 'venta'
-- ============================================================

alter table public.products
  add column if not exists low_stock_threshold int not null default 5;

create table if not exists public.stock_movements (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid references public.products (id) on delete cascade,
  delta           int not null,
  reason          text not null default 'ajuste', -- entrada | salida | ajuste | venta
  note            text,
  resulting_stock int not null,
  created_by      uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_movements_product on public.stock_movements (product_id, created_at desc);

alter table public.stock_movements enable row level security;

drop policy if exists movements_staff_all on public.stock_movements;
create policy movements_staff_all on public.stock_movements
  for all using (public.is_staff()) with check (public.is_staff());

grant select, insert on public.stock_movements to authenticated;

-- RPC: ajuste de stock (solo staff) -------------------------
create or replace function public.adjust_stock(
  p_product_id uuid,
  p_delta int,
  p_reason text,
  p_note text
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new int;
begin
  if not public.is_staff() then
    raise exception 'No autorizado';
  end if;

  update public.products
    set stock = stock + p_delta
    where products.id = p_product_id
    returning stock into v_new;

  if not found then
    raise exception 'Producto no encontrado';
  end if;
  if v_new < 0 then
    raise exception 'El stock no puede quedar negativo';
  end if;

  insert into public.stock_movements (product_id, delta, reason, note, resulting_stock, created_by)
  values (p_product_id, p_delta, coalesce(nullif(p_reason, ''), 'ajuste'), nullif(p_note, ''), v_new, auth.uid());

  return v_new;
end;
$$;

grant execute on function public.adjust_stock(uuid, int, text, text) to authenticated;

-- create_order: registra movimientos 'venta' ---------------
create or replace function public.create_order(p_customer jsonb, p_items jsonb)
returns table (order_id uuid, order_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_num text;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty int;
  v_subtotal numeric(10, 2) := 0;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'El carrito está vacío';
  end if;

  v_num := 'ITC-' || lpad(nextval('public.order_seq')::text, 6, '0');

  insert into public.orders (
    order_number, user_id, customer_name, customer_phone,
    customer_email, address, payment_method
  ) values (
    v_num, auth.uid(),
    coalesce(p_customer ->> 'name', ''),
    coalesce(p_customer ->> 'phone', ''),
    nullif(p_customer ->> 'email', ''),
    nullif(p_customer ->> 'address', ''),
    coalesce(p_customer ->> 'payment_method', 'whatsapp')
  ) returning orders.id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product
      from public.products
      where products.id = (v_item ->> 'product_id')::uuid and products.is_active = true;
    if not found then
      raise exception 'Producto no disponible';
    end if;

    v_qty := greatest(1, coalesce((v_item ->> 'quantity')::int, 1));
    if v_product.stock < v_qty then
      raise exception 'Stock insuficiente para %', v_product.name;
    end if;

    insert into public.order_items (order_id, product_id, name, unit_price, quantity, line_total)
    values (v_order_id, v_product.id, v_product.name, v_product.price, v_qty, v_product.price * v_qty);

    update public.products set stock = public.products.stock - v_qty
      where public.products.id = v_product.id;

    insert into public.stock_movements (product_id, delta, reason, note, resulting_stock, created_by)
    values (v_product.id, -v_qty, 'venta', 'Pedido ' || v_num, v_product.stock - v_qty, auth.uid());

    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  update public.orders set subtotal = v_subtotal, total = v_subtotal
    where public.orders.id = v_order_id;

  return query select v_order_id, v_num;
end;
$$;

grant execute on function public.create_order(jsonb, jsonb) to anon, authenticated;
