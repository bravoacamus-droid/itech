-- ============================================================
-- iTech Platform — Migración 0010: ventas por día en dashboard_metrics
-- Agrega 'sales_by_day' (últimos 14 días, con días en cero).
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
      ), '[]'::jsonb),
    'sales_by_day',
      coalesce((
        select jsonb_agg(jsonb_build_object('day', d::date, 'total', coalesce(s.t, 0)) order by d)
        from generate_series(current_date - interval '13 days', current_date, interval '1 day') g(d)
        left join (
          select date_trunc('day', created_at)::date dd, sum(total) t
          from orders
          where status <> 'anulado'
            and created_at >= current_date - interval '13 days'
          group by 1
        ) s on s.dd = d::date
      ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

grant execute on function public.dashboard_metrics() to authenticated;
