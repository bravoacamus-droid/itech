-- ============================================================
-- iTech Platform — Migración 0024: reabastecer stock al anular pedido
-- create_order/pos_checkout descuentan stock al confirmar la venta.
-- Aquí cerramos el ciclo: si un pedido pasa a 'anulado', se devuelve el stock
-- de sus ítems del catálogo y se registra un movimiento 'anulacion'.
-- ============================================================

create or replace function public.restock_on_order_cancel()
returns trigger language plpgsql security definer set search_path = public
as $$
declare it record; v_new int;
begin
  if new.status = 'anulado' and old.status is distinct from 'anulado' then
    for it in
      select product_id, sum(quantity) qty
      from order_items
      where order_id = new.id and product_id is not null
      group by product_id
    loop
      update products set stock = stock + it.qty
        where id = it.product_id
        returning stock into v_new;
      insert into stock_movements (product_id, delta, reason, note, resulting_stock, created_by)
      values (it.product_id, it.qty, 'anulacion', 'Anulación pedido ' || new.order_number, v_new, auth.uid());
    end loop;
  end if;
  return new;
end; $$;

drop trigger if exists trg_restock_on_cancel on public.orders;
create trigger trg_restock_on_cancel
  after update of status on public.orders
  for each row execute function public.restock_on_order_cancel();
