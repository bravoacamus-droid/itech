-- ============================================================
-- iTech Platform — Migración 0026: Multi-sucursal
-- Stock por sucursal (branch_stock) como fuente de verdad; products.stock se
-- mantiene como TOTAL (suma de sedes) para no romper alarmas/reposición/tienda.
-- Ventas (orders), cajas y movimientos quedan etiquetados por sucursal.
-- ============================================================

create table if not exists public.branches (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  address    text,
  is_default boolean not null default false, -- sede física por defecto (POS)
  is_online  boolean not null default false, -- recibe ventas de la tienda web
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.branch_stock (
  branch_id           uuid not null references public.branches (id) on delete cascade,
  product_id          uuid not null references public.products (id) on delete cascade,
  stock               int not null default 0,
  low_stock_threshold int not null default 5,
  primary key (branch_id, product_id)
);

alter table public.orders add column if not exists branch_id uuid references public.branches (id);
alter table public.cash_sessions add column if not exists branch_id uuid references public.branches (id);
alter table public.stock_movements add column if not exists branch_id uuid references public.branches (id);

alter table public.branches enable row level security;
alter table public.branch_stock enable row level security;

drop policy if exists branches_staff_all on public.branches;
create policy branches_staff_all on public.branches for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists branches_public_read on public.branches;
create policy branches_public_read on public.branches for select using (is_active = true);
drop policy if exists branch_stock_staff_all on public.branch_stock;
create policy branch_stock_staff_all on public.branch_stock for all using (public.is_staff()) with check (public.is_staff());

grant select on public.branches to anon, authenticated;
grant insert, update, delete on public.branches to authenticated;
grant select, insert, update, delete on public.branch_stock to authenticated;

-- Sede inicial + backfill del stock actual --------------------
do $$
declare v_branch uuid;
begin
  if not exists (select 1 from public.branches) then
    insert into public.branches (name, is_default, is_online)
    values ('Tienda Principal', true, true) returning id into v_branch;
    insert into public.branch_stock (branch_id, product_id, stock, low_stock_threshold)
    select v_branch, id, stock, low_stock_threshold from public.products;
  end if;
end$$;

-- Helpers -----------------------------------------------------
create or replace function public.default_branch() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.branches where is_default order by created_at limit 1
$$;

create or replace function public.online_branch() returns uuid
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select id from public.branches where is_online and is_active order by created_at limit 1),
    (select id from public.branches where is_default order by created_at limit 1)
  )
$$;

create or replace function public.recalc_product_stock(p_product uuid) returns void
language sql security definer set search_path = public as $$
  update public.products set stock = coalesce((select sum(s.stock) from public.branch_stock s where s.product_id = p_product), 0)
  where id = p_product;
$$;

-- Mueve stock de una sucursal y mantiene el total -------------
create or replace function public._apply_branch_stock(p_branch uuid, p_product uuid, p_delta int)
returns int language plpgsql security definer set search_path = public as $$
declare v_new int;
begin
  insert into branch_stock (branch_id, product_id, stock) values (p_branch, p_product, 0)
    on conflict (branch_id, product_id) do nothing;
  update branch_stock set stock = stock + p_delta
    where branch_id = p_branch and product_id = p_product
    returning stock into v_new;
  perform public.recalc_product_stock(p_product);
  return v_new;
end; $$;

-- adjust_stock con sucursal (reemplaza la versión de 4 args) --
drop function if exists public.adjust_stock(uuid, int, text, text);
create or replace function public.adjust_stock(p_product_id uuid, p_delta int, p_reason text, p_note text, p_branch uuid default null)
returns int language plpgsql security definer set search_path = public as $$
declare v_branch uuid; v_new int;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  v_branch := coalesce(p_branch, public.default_branch());
  if v_branch is null then raise exception 'No hay sucursal configurada'; end if;
  v_new := public._apply_branch_stock(v_branch, p_product_id, p_delta);
  if v_new < 0 then raise exception 'El stock no puede quedar negativo'; end if;
  insert into stock_movements (product_id, delta, reason, note, resulting_stock, created_by, branch_id)
  values (p_product_id, p_delta, coalesce(nullif(p_reason,''),'ajuste'), nullif(p_note,''), v_new, auth.uid(), v_branch);
  return v_new;
end; $$;
grant execute on function public.adjust_stock(uuid, int, text, text, uuid) to authenticated;

-- open_cash_session con sucursal ------------------------------
drop function if exists public.open_cash_session(numeric);
create or replace function public.open_cash_session(p_opening numeric, p_branch uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_branch uuid;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  v_branch := coalesce(p_branch, public.default_branch());
  if exists (select 1 from cash_sessions where status = 'abierta' and branch_id is not distinct from v_branch) then
    raise exception 'Ya hay una caja abierta en esta sucursal';
  end if;
  insert into cash_sessions (opened_by, opening_amount, branch_id)
  values (auth.uid(), coalesce(p_opening,0), v_branch) returning id into v_id;
  return v_id;
end; $$;
grant execute on function public.open_cash_session(numeric, uuid) to authenticated;

-- pos_checkout descuenta del stock de la sucursal de la caja --
create or replace function public.pos_checkout(p_items jsonb, p_payment text, p_customer text)
returns table (order_id uuid, order_number text)
language plpgsql security definer set search_path = public as $$
declare
  v_sess uuid; v_branch uuid; v_order_id uuid; v_num text; v_item jsonb;
  v_product public.products%rowtype; v_qty int; v_bstock int; v_subtotal numeric(10,2) := 0;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'No hay productos en la venta'; end if;

  select id, branch_id into v_sess, v_branch from cash_sessions where status='abierta' order by opened_at desc limit 1;
  if v_sess is null then raise exception 'No hay una caja abierta'; end if;
  v_branch := coalesce(v_branch, public.default_branch());

  v_num := 'ITC-' || lpad(nextval('order_seq')::text, 6, '0');
  insert into orders (order_number, customer_name, customer_phone, payment_method, status, channel, cash_session_id, sold_by, branch_id)
  values (v_num, coalesce(nullif(p_customer,''),'Cliente mostrador'), '-', coalesce(nullif(p_payment,''),'efectivo'),
          'pagado', 'pos', v_sess, auth.uid(), v_branch)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product from products where products.id = (v_item->>'product_id')::uuid and is_active = true;
    if not found then raise exception 'Producto no disponible'; end if;
    v_qty := greatest(1, coalesce((v_item->>'quantity')::int, 1));
    select coalesce(stock,0) into v_bstock from branch_stock where branch_id=v_branch and product_id=v_product.id;
    if coalesce(v_bstock,0) < v_qty then raise exception 'Stock insuficiente en la sucursal para %', v_product.name; end if;

    insert into order_items (order_id, product_id, name, unit_price, quantity, line_total)
    values (v_order_id, v_product.id, v_product.name, v_product.price, v_qty, v_product.price*v_qty);
    perform public._apply_branch_stock(v_branch, v_product.id, -v_qty);
    insert into stock_movements (product_id, delta, reason, note, resulting_stock, created_by, branch_id)
    values (v_product.id, -v_qty, 'venta', 'POS '||v_num, (select stock from branch_stock where branch_id=v_branch and product_id=v_product.id), auth.uid(), v_branch);
    v_subtotal := v_subtotal + v_product.price*v_qty;
  end loop;

  update orders set subtotal=v_subtotal, total=v_subtotal where orders.id=v_order_id;
  return query select v_order_id, v_num;
end; $$;
grant execute on function public.pos_checkout(jsonb, text, text) to authenticated;

-- create_order (web) descuenta de la sucursal online ----------
create or replace function public.create_order(p_customer jsonb, p_items jsonb)
returns table (order_id uuid, order_number text)
language plpgsql security definer set search_path = public as $$
declare
  v_order_id uuid; v_num text; v_item jsonb; v_product public.products%rowtype;
  v_qty int; v_bstock int; v_subtotal numeric(10,2) := 0; v_branch uuid;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'El carrito está vacío'; end if;
  v_branch := public.online_branch();

  v_num := 'ITC-' || lpad(nextval('order_seq')::text, 6, '0');
  insert into orders (order_number, user_id, customer_name, customer_phone, customer_email, address, payment_method, channel, branch_id)
  values (v_num, auth.uid(), coalesce(p_customer->>'name',''), coalesce(p_customer->>'phone',''),
          nullif(p_customer->>'email',''), nullif(p_customer->>'address',''),
          coalesce(p_customer->>'payment_method','whatsapp'), 'web', v_branch)
  returning orders.id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product from products where products.id = (v_item->>'product_id')::uuid and is_active = true;
    if not found then raise exception 'Producto no disponible'; end if;
    v_qty := greatest(1, coalesce((v_item->>'quantity')::int, 1));
    select coalesce(stock,0) into v_bstock from branch_stock where branch_id=v_branch and product_id=v_product.id;
    if coalesce(v_bstock,0) < v_qty then raise exception 'Stock insuficiente para %', v_product.name; end if;

    insert into order_items (order_id, product_id, name, unit_price, quantity, line_total)
    values (v_order_id, v_product.id, v_product.name, v_product.price, v_qty, v_product.price*v_qty);
    perform public._apply_branch_stock(v_branch, v_product.id, -v_qty);
    insert into stock_movements (product_id, delta, reason, note, resulting_stock, created_by, branch_id)
    values (v_product.id, -v_qty, 'venta', 'Pedido '||v_num, (select stock from branch_stock where branch_id=v_branch and product_id=v_product.id), auth.uid(), v_branch);
    v_subtotal := v_subtotal + v_product.price*v_qty;
  end loop;

  update orders set subtotal=v_subtotal, total=v_subtotal where orders.id=v_order_id;
  return query select v_order_id, v_num;
end; $$;
grant execute on function public.create_order(jsonb, jsonb) to anon, authenticated;

-- Reabastecer a la sucursal del pedido al anular --------------
create or replace function public.restock_on_order_cancel()
returns trigger language plpgsql security definer set search_path = public as $$
declare it record; v_branch uuid; v_new int;
begin
  if new.status = 'anulado' and old.status is distinct from 'anulado' then
    v_branch := coalesce(new.branch_id, public.default_branch());
    for it in select product_id, sum(quantity) qty from order_items where order_id=new.id and product_id is not null group by product_id loop
      v_new := public._apply_branch_stock(v_branch, it.product_id, it.qty);
      insert into stock_movements (product_id, delta, reason, note, resulting_stock, created_by, branch_id)
      values (it.product_id, it.qty, 'anulacion', 'Anulación pedido '||new.order_number, v_new, auth.uid(), v_branch);
    end loop;
  end if;
  return new;
end; $$;

-- create_return reabastece a la sucursal del pedido -----------
create or replace function public.create_return(p_order uuid, p_items jsonb, p_reason text)
returns table (return_id uuid, return_number text)
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid; v_num text; v_item jsonb; oi public.order_items%rowtype;
  v_already int; v_qty int; v_total numeric(10,2) := 0; v_new int; v_branch uuid;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'No hay ítems para devolver'; end if;
  select coalesce(branch_id, public.default_branch()) into v_branch from orders where id = p_order;

  v_num := 'DEV-' || lpad(nextval('return_seq')::text, 6, '0');
  insert into returns (order_id, return_number, reason, created_by) values (p_order, v_num, nullif(p_reason,''), auth.uid())
  returning returns.id into v_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := coalesce((v_item->>'quantity')::int, 0);
    if v_qty <= 0 then continue; end if;
    select * into oi from order_items where id = (v_item->>'order_item_id')::uuid and order_id = p_order;
    if not found then raise exception 'Un ítem no pertenece al pedido'; end if;
    select coalesce(sum(ri.quantity),0) into v_already from return_items ri where ri.order_item_id = oi.id;
    if v_qty > oi.quantity - v_already then raise exception 'Cantidad a devolver excede lo comprado para %', oi.name; end if;

    insert into return_items (return_id, order_item_id, product_id, name, quantity, unit_price, line_total)
    values (v_id, oi.id, oi.product_id, oi.name, v_qty, oi.unit_price, oi.unit_price*v_qty);
    v_total := v_total + oi.unit_price*v_qty;
    if oi.product_id is not null then
      v_new := public._apply_branch_stock(v_branch, oi.product_id, v_qty);
      insert into stock_movements (product_id, delta, reason, note, resulting_stock, created_by, branch_id)
      values (oi.product_id, v_qty, 'devolucion', 'Devolución '||v_num, v_new, auth.uid(), v_branch);
    end if;
  end loop;

  if v_total = 0 then raise exception 'No se devolvió ningún ítem'; end if;
  update returns set total_refund = v_total where returns.id = v_id;
  return query select v_id, v_num;
end; $$;
grant execute on function public.create_return(uuid, jsonb, text) to authenticated;

-- Métricas comparativas por sucursal --------------------------
create or replace function public.branch_metrics()
returns jsonb language plpgsql security definer set search_path = public as $$
declare result jsonb;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'name', b.name,
    'is_default', b.is_default,
    'is_online', b.is_online,
    'sales', coalesce((select sum(o.total) from orders o where o.branch_id=b.id and o.status<>'anulado'),0),
    'orders', (select count(*) from orders o where o.branch_id=b.id),
    'stock', coalesce((select sum(s.stock) from branch_stock s where s.branch_id=b.id),0)
  ) order by b.name), '[]'::jsonb)
  into result from branches b;
  return result;
end; $$;
grant execute on function public.branch_metrics() to authenticated;
