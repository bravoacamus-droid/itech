-- ============================================================
-- iTech Platform — Migración 0016: métricas gerenciales B2B
-- SLA global y desglose por empresa (tickets abiertos/vencidos, reparaciones).
-- ============================================================

create or replace function public.b2b_metrics()
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare result jsonb;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;

  select jsonb_build_object(
    'companies', (select count(*) from companies),
    'open_tickets', (select count(*) from support_tickets where status not in ('resuelto','cerrado')),
    'overdue', (select count(*) from support_tickets
                where status not in ('resuelto','cerrado')
                  and sla_due_at is not null and sla_due_at < now()),
    'resolved', (select count(*) from support_tickets where status in ('resuelto','cerrado')),
    'sla_compliance', coalesce((
      select round(100.0 * count(*) filter (where resolved_at is not null and sla_due_at is not null and resolved_at <= sla_due_at)
        / nullif(count(*) filter (where status in ('resuelto','cerrado') and sla_due_at is not null), 0), 0)
      from support_tickets
    ), 0),
    'by_company', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', c.name,
        'plan', c.plan,
        'open', (select count(*) from support_tickets s where s.company_id = c.id and s.status not in ('resuelto','cerrado')),
        'total', (select count(*) from support_tickets s where s.company_id = c.id),
        'overdue', (select count(*) from support_tickets s where s.company_id = c.id and s.status not in ('resuelto','cerrado') and s.sla_due_at is not null and s.sla_due_at < now()),
        'repairs', (select count(*) from repair_tickets r where r.company_id = c.id)
      ) order by c.name)
      from companies c
    ), '[]'::jsonb)
  ) into result;

  return result;
end; $$;

grant execute on function public.b2b_metrics() to authenticated;
