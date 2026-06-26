-- ============================================================
-- iTech Platform — Migración 0011: proyección de reposición
-- Estima velocidad de venta (ventana en días), días de cobertura y
-- sugiere cantidad a comprar para alcanzar una meta de días de stock.
-- ============================================================

create or replace function public.replenishment_report(
  p_window int default 30,
  p_target_days int default 30
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  res jsonb;
begin
  if not public.is_staff() then
    raise exception 'No autorizado';
  end if;

  select coalesce(
    jsonb_agg(to_jsonb(t) order by t.suggested_qty desc, t.days_cover asc nulls last),
    '[]'::jsonb
  )
  into res
  from (
    select
      p.id                                  as product_id,
      p.name                                as name,
      p.brand                               as brand,
      p.stock                               as stock,
      p.low_stock_threshold                 as low_stock_threshold,
      coalesce(s.qty, 0)                    as sold,
      round(coalesce(s.qty, 0)::numeric / nullif(p_window, 0), 2) as daily_avg,
      case
        when coalesce(s.qty, 0) = 0 then null
        else round(p.stock::numeric / (coalesce(s.qty, 0)::numeric / p_window), 1)
      end                                   as days_cover,
      greatest(
        0,
        ceil(coalesce(s.qty, 0)::numeric / p_window * p_target_days) - p.stock
      )::int                                as suggested_qty
    from public.products p
    left join (
      select oi.product_id, sum(oi.quantity) qty
      from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where o.status <> 'anulado'
        and o.created_at >= now() - (p_window || ' days')::interval
      group by oi.product_id
    ) s on s.product_id = p.id
    where p.is_active = true
  ) t;

  return res;
end;
$$;

grant execute on function public.replenishment_report(int, int) to authenticated;
