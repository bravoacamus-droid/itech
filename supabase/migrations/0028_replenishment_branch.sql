-- ============================================================
-- iTech Platform — Migración 0028: reposición por sucursal
-- replenishment_report ahora acepta p_branch: si es null usa el total
-- (products.stock + ventas globales); si se indica, usa el stock y las ventas
-- de esa sede (branch_stock + orders.branch_id).
-- ============================================================

drop function if exists public.replenishment_report(int, int);

create or replace function public.replenishment_report(
  p_branch uuid default null,
  p_window int default 30,
  p_target_days int default 30
)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare res jsonb;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;

  with base as (
    select
      p.id as product_id, p.name, p.brand,
      (case when p_branch is null then p.stock else coalesce(bs.stock, 0) end) as stock,
      (case when p_branch is null then p.low_stock_threshold else coalesce(bs.low_stock_threshold, 5) end) as low_stock_threshold,
      coalesce(s.qty, 0) as sold
    from public.products p
    left join public.branch_stock bs
      on p_branch is not null and bs.branch_id = p_branch and bs.product_id = p.id
    left join (
      select oi.product_id, sum(oi.quantity) qty
      from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where o.status <> 'anulado'
        and o.created_at >= now() - (p_window || ' days')::interval
        and (p_branch is null or o.branch_id = p_branch)
      group by oi.product_id
    ) s on s.product_id = p.id
    where p.is_active = true
  )
  select coalesce(jsonb_agg(to_jsonb(x) order by x.suggested_qty desc, x.days_cover asc nulls last), '[]'::jsonb)
  into res
  from (
    select
      product_id, name, brand, stock, low_stock_threshold, sold,
      round(sold::numeric / nullif(p_window,0), 2) as daily_avg,
      case when sold = 0 then null else round(stock::numeric / (sold::numeric / p_window), 1) end as days_cover,
      greatest(0, ceil(sold::numeric / p_window * p_target_days) - stock)::int as suggested_qty
    from base
  ) x;

  return res;
end; $$;

grant execute on function public.replenishment_report(uuid, int, int) to authenticated;
