-- ============================================================
-- iTech Platform — Migración 0005: pedidos (orders + order_items)
-- Creación de pedidos vía RPC SECURITY DEFINER: valida stock, calcula
-- totales con precios de la BD (no del cliente) y descuenta inventario.
-- ============================================================

create sequence if not exists public.order_seq start 1000;

create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   text unique not null,
  user_id        uuid references auth.users (id) on delete set null,
  customer_name  text not null,
  customer_phone text not null,
  customer_email text,
  address        text,
  payment_method text not null default 'whatsapp',
  status         text not null default 'pendiente',
  subtotal       numeric(10, 2) not null default 0,
  total          numeric(10, 2) not null default 0,
  currency       text not null default 'PEN',
  created_at     timestamptz not null default now()
);

create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  name       text not null,
  unit_price numeric(10, 2) not null,
  quantity   int not null,
  line_total numeric(10, 2) not null
);

create index if not exists idx_order_items_order on public.order_items (order_id);
create index if not exists idx_orders_user on public.orders (user_id);

-- RLS -------------------------------------------------------
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders
  for select using (user_id = auth.uid() or public.is_staff());

drop policy if exists orders_staff_write on public.orders;
create policy orders_staff_write on public.orders
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists order_items_select on public.order_items;
create policy order_items_select on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())
    )
  );

drop policy if exists order_items_staff_write on public.order_items;
create policy order_items_staff_write on public.order_items
  for all using (public.is_staff()) with check (public.is_staff());

grant select on public.orders, public.order_items to authenticated;

-- RPC de creación de pedido ---------------------------------
create or replace function public.create_order(p_customer jsonb, p_items jsonb)
returns table (id uuid, order_number text)
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
      where products.id = (v_item ->> 'product_id')::uuid and is_active = true;
    if not found then
      raise exception 'Producto no disponible';
    end if;

    v_qty := greatest(1, coalesce((v_item ->> 'quantity')::int, 1));
    if v_product.stock < v_qty then
      raise exception 'Stock insuficiente para %', v_product.name;
    end if;

    insert into public.order_items (order_id, product_id, name, unit_price, quantity, line_total)
    values (v_order_id, v_product.id, v_product.name, v_product.price, v_qty, v_product.price * v_qty);

    update public.products set stock = stock - v_qty where id = v_product.id;
    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  update public.orders set subtotal = v_subtotal, total = v_subtotal where orders.id = v_order_id;

  return query select v_order_id, v_num;
end;
$$;

grant execute on function public.create_order(jsonb, jsonb) to anon, authenticated;
