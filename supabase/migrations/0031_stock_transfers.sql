-- ============================================================
-- iTech Platform — Migración 0031: transferencias de stock entre sedes
-- Mueve unidades de una sucursal a otra; el total (products.stock) no cambia.
-- ============================================================

create sequence if not exists transfer_seq start 1;

create table if not exists public.stock_transfers (
  id              uuid primary key default gen_random_uuid(),
  transfer_number text not null unique,
  product_id      uuid not null references public.products (id),
  from_branch     uuid not null references public.branches (id),
  to_branch       uuid not null references public.branches (id),
  quantity        int not null check (quantity > 0),
  note            text,
  created_by      uuid references auth.users (id),
  created_at      timestamptz not null default now()
);

create index if not exists idx_transfers_created on public.stock_transfers (created_at desc);

alter table public.stock_transfers enable row level security;

-- Visible si el usuario puede ver la sede origen o destino
drop policy if exists transfers_read on public.stock_transfers;
create policy transfers_read on public.stock_transfers for select
  using (public.is_staff() and (public.can_see_branch(from_branch) or public.can_see_branch(to_branch)));

grant select on public.stock_transfers to authenticated;

create or replace function public.transfer_stock(
  p_product uuid, p_from uuid, p_to uuid, p_qty int, p_note text default null
)
returns table (transfer_id uuid, transfer_number text)
language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_num text; v_from_stock int; v_new int;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  if p_from = p_to then raise exception 'Las sucursales de origen y destino deben ser distintas'; end if;
  if coalesce(p_qty,0) <= 0 then raise exception 'La cantidad debe ser mayor a 0'; end if;
  -- El cajero debe poder operar la sede de origen
  if not public.can_see_branch(p_from) then raise exception 'No autorizado para la sucursal de origen'; end if;

  select coalesce(stock,0) into v_from_stock from branch_stock where branch_id = p_from and product_id = p_product;
  if coalesce(v_from_stock,0) < p_qty then raise exception 'Stock insuficiente en la sucursal de origen'; end if;

  v_num := 'TRF-' || lpad(nextval('transfer_seq')::text, 6, '0');
  insert into stock_transfers (transfer_number, product_id, from_branch, to_branch, quantity, note, created_by)
  values (v_num, p_product, p_from, p_to, p_qty, nullif(p_note,''), auth.uid())
  returning id into v_id;

  -- Salida del origen
  v_new := public._apply_branch_stock(p_from, p_product, -p_qty);
  insert into stock_movements (product_id, delta, reason, note, resulting_stock, created_by, branch_id)
  values (p_product, -p_qty, 'transferencia_salida', 'Transferencia '||v_num, v_new, auth.uid(), p_from);

  -- Entrada al destino
  v_new := public._apply_branch_stock(p_to, p_product, p_qty);
  insert into stock_movements (product_id, delta, reason, note, resulting_stock, created_by, branch_id)
  values (p_product, p_qty, 'transferencia_entrada', 'Transferencia '||v_num, v_new, auth.uid(), p_to);

  return query select v_id, v_num;
end; $$;
grant execute on function public.transfer_stock(uuid, uuid, uuid, int, text) to authenticated;
