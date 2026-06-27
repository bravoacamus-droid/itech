-- ============================================================
-- iTech Platform — Migración 0025: Devoluciones parciales (RMA de venta)
-- Devuelve ítems puntuales de un pedido y reabastece su stock.
-- ============================================================

create sequence if not exists public.return_seq start 1000;

create table if not exists public.returns (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  return_number text unique not null,
  reason        text,
  total_refund  numeric(10,2) not null default 0,
  created_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now()
);

create table if not exists public.return_items (
  id            uuid primary key default gen_random_uuid(),
  return_id     uuid not null references public.returns (id) on delete cascade,
  order_item_id uuid references public.order_items (id) on delete set null,
  product_id    uuid references public.products (id) on delete set null,
  name          text not null,
  quantity      int not null,
  unit_price    numeric(10,2) not null,
  line_total    numeric(10,2) not null
);

create index if not exists idx_returns_order on public.returns (order_id);
create index if not exists idx_return_items on public.return_items (return_id);

alter table public.returns enable row level security;
alter table public.return_items enable row level security;

drop policy if exists returns_staff_all on public.returns;
create policy returns_staff_all on public.returns for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists return_items_staff_all on public.return_items;
create policy return_items_staff_all on public.return_items for all using (public.is_staff()) with check (public.is_staff());

grant select, insert on public.returns to authenticated;
grant select, insert on public.return_items to authenticated;

-- Crear devolución (staff): valida, reabastece y registra movimiento ----
create or replace function public.create_return(p_order uuid, p_items jsonb, p_reason text)
returns table (return_id uuid, return_number text)
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid; v_num text; v_item jsonb; oi public.order_items%rowtype;
  v_already int; v_qty int; v_total numeric(10,2) := 0; v_new int;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'No hay ítems para devolver';
  end if;

  v_num := 'DEV-' || lpad(nextval('return_seq')::text, 6, '0');
  insert into returns (order_id, return_number, reason, created_by)
  values (p_order, v_num, nullif(p_reason,''), auth.uid())
  returning returns.id into v_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := coalesce((v_item ->> 'quantity')::int, 0);
    if v_qty <= 0 then continue; end if;

    select * into oi from order_items where id = (v_item ->> 'order_item_id')::uuid and order_id = p_order;
    if not found then raise exception 'Un ítem no pertenece al pedido'; end if;

    select coalesce(sum(ri.quantity), 0) into v_already
      from return_items ri where ri.order_item_id = oi.id;
    if v_qty > oi.quantity - v_already then
      raise exception 'Cantidad a devolver excede lo comprado para %', oi.name;
    end if;

    insert into return_items (return_id, order_item_id, product_id, name, quantity, unit_price, line_total)
    values (v_id, oi.id, oi.product_id, oi.name, v_qty, oi.unit_price, oi.unit_price * v_qty);
    v_total := v_total + oi.unit_price * v_qty;

    if oi.product_id is not null then
      update products set stock = stock + v_qty where id = oi.product_id returning stock into v_new;
      insert into stock_movements (product_id, delta, reason, note, resulting_stock, created_by)
      values (oi.product_id, v_qty, 'devolucion', 'Devolución ' || v_num, v_new, auth.uid());
    end if;
  end loop;

  if v_total = 0 then raise exception 'No se devolvió ningún ítem'; end if;
  update returns set total_refund = v_total where returns.id = v_id;
  return query select v_id, v_num;
end; $$;

grant execute on function public.create_return(uuid, jsonb, text) to authenticated;
