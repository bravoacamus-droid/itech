-- ============================================================
-- iTech Platform — Migración 0032: recepción/confirmación de transferencias
-- Flujo: transfer_stock deja la mercadería "en_transito" (descuenta solo origen).
-- El destino confirma con receive_transfer (suma al destino) o el origen cancela
-- con cancel_transfer (reabastece origen). Mientras está en tránsito, el total
-- (products.stock) refleja la mercadería como fuera de las sedes.
-- ============================================================

alter table public.stock_transfers
  add column if not exists status text not null default 'recibido',
  add column if not exists received_at timestamptz,
  add column if not exists received_by uuid references auth.users (id);

-- transfer_stock: solo descuenta del origen y deja en tránsito --
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
  if not public.can_see_branch(p_from) then raise exception 'No autorizado para la sucursal de origen'; end if;

  select coalesce(stock,0) into v_from_stock from branch_stock where branch_id = p_from and product_id = p_product;
  if coalesce(v_from_stock,0) < p_qty then raise exception 'Stock insuficiente en la sucursal de origen'; end if;

  v_num := 'TRF-' || lpad(nextval('transfer_seq')::text, 6, '0');
  insert into stock_transfers (transfer_number, product_id, from_branch, to_branch, quantity, note, created_by, status)
  values (v_num, p_product, p_from, p_to, p_qty, nullif(p_note,''), auth.uid(), 'en_transito')
  returning id into v_id;

  v_new := public._apply_branch_stock(p_from, p_product, -p_qty);
  insert into stock_movements (product_id, delta, reason, note, resulting_stock, created_by, branch_id)
  values (p_product, -p_qty, 'transferencia_salida', 'Envío '||v_num, v_new, auth.uid(), p_from);

  return query select v_id, v_num;
end; $$;
grant execute on function public.transfer_stock(uuid, uuid, uuid, int, text) to authenticated;

-- receive_transfer: el destino confirma y suma su stock ------
create or replace function public.receive_transfer(p_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare t public.stock_transfers%rowtype; v_new int;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  select * into t from stock_transfers where id = p_id;
  if not found then raise exception 'Transferencia no encontrada'; end if;
  if t.status <> 'en_transito' then raise exception 'La transferencia no está en tránsito'; end if;
  if not public.can_see_branch(t.to_branch) then raise exception 'No autorizado para la sucursal de destino'; end if;

  v_new := public._apply_branch_stock(t.to_branch, t.product_id, t.quantity);
  insert into stock_movements (product_id, delta, reason, note, resulting_stock, created_by, branch_id)
  values (t.product_id, t.quantity, 'transferencia_entrada', 'Recepción '||t.transfer_number, v_new, auth.uid(), t.to_branch);

  update stock_transfers set status='recibido', received_at=now(), received_by=auth.uid() where id=p_id;
  return true;
end; $$;
grant execute on function public.receive_transfer(uuid) to authenticated;

-- cancel_transfer: el origen cancela y recupera su stock -----
create or replace function public.cancel_transfer(p_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare t public.stock_transfers%rowtype; v_new int;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  select * into t from stock_transfers where id = p_id;
  if not found then raise exception 'Transferencia no encontrada'; end if;
  if t.status <> 'en_transito' then raise exception 'Solo se puede cancelar una transferencia en tránsito'; end if;
  if not public.can_see_branch(t.from_branch) then raise exception 'No autorizado para la sucursal de origen'; end if;

  v_new := public._apply_branch_stock(t.from_branch, t.product_id, t.quantity);
  insert into stock_movements (product_id, delta, reason, note, resulting_stock, created_by, branch_id)
  values (t.product_id, t.quantity, 'transferencia_cancelada', 'Cancelación '||t.transfer_number, v_new, auth.uid(), t.from_branch);

  update stock_transfers set status='cancelado' where id=p_id;
  return true;
end; $$;
grant execute on function public.cancel_transfer(uuid) to authenticated;
