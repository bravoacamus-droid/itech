-- ============================================================
-- iTech Platform — Migración 0009: métricas del dashboard
-- Función agregada (solo staff) con KPIs, pedidos por estado y top productos.
-- ============================================================

create or replace function public.dashboard_metrics()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_staff() then
    raise exception 'No autorizado';
  end if;

  select jsonb_build_object(
    'total_sales',
      coalesce((select sum(total) from orders where status <> 'anulado'), 0),
    'sales_30d',
      coalesce((select sum(total) from orders
                where status <> 'anulado'
                  and created_at >= now() - interval '30 days'), 0),
    'orders_count',
      (select count(*) from orders),
    'pending_count',
      (select count(*) from orders where status = 'pendiente'),
    'avg_ticket',
      coalesce((select avg(total) from orders where status <> 'anulado'), 0),
    'low_stock_count',
      (select count(*) from products where stock <= low_stock_threshold and is_active),
    'by_status',
      coalesce((
        select jsonb_agg(jsonb_build_object('status', status, 'count', c, 'total', t) order by status)
        from (
          select status, count(*) c, coalesce(sum(total), 0) t
          from orders group by status
        ) s
      ), '[]'::jsonb),
    'top_products',
      coalesce((
        select jsonb_agg(t)
        from (
          select jsonb_build_object(
                   'name', oi.name,
                   'qty', sum(oi.quantity),
                   'revenue', sum(oi.line_total)
                 ) as t
          from order_items oi
          join orders o on o.id = oi.order_id
          where o.status <> 'anulado'
          group by oi.name
          order by sum(oi.quantity) desc
          limit 5
        ) sub
      ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

grant execute on function public.dashboard_metrics() to authenticated;
