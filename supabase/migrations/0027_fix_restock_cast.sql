-- ============================================================
-- iTech Platform — Migración 0027: corrige cast en restock_on_order_cancel
-- sum(quantity) es bigint; _apply_branch_stock espera int.
-- ============================================================

create or replace function public.restock_on_order_cancel()
returns trigger language plpgsql security definer set search_path = public as $$
declare it record; v_branch uuid; v_new int;
begin
  if new.status = 'anulado' and old.status is distinct from 'anulado' then
    v_branch := coalesce(new.branch_id, public.default_branch());
    for it in select product_id, sum(quantity)::int qty from order_items
              where order_id = new.id and product_id is not null group by product_id loop
      v_new := public._apply_branch_stock(v_branch, it.product_id, it.qty);
      insert into stock_movements (product_id, delta, reason, note, resulting_stock, created_by, branch_id)
      values (it.product_id, it.qty, 'anulacion', 'Anulación pedido ' || new.order_number, v_new, auth.uid(), v_branch);
    end loop;
  end if;
  return new;
end; $$;
