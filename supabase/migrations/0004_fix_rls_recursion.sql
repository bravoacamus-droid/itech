-- ============================================================
-- iTech Platform — Migración 0004: corrige recursión en RLS
-- is_staff()/current_role() consultaban profiles, cuya política
-- volvía a llamar is_staff() → recursión ("stack depth limit exceeded").
-- Solución: SECURITY DEFINER para que lean profiles sin disparar RLS.
-- ============================================================

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid())
      in ('technician','cashier','warehouse_clerk','accountant',
          'branch_manager','org_admin','super_admin'),
    false
  );
$$;

create or replace function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;
