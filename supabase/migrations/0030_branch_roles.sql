-- ============================================================
-- iTech Platform — Migración 0030: roles/permisos finos por sede
-- Un cajero (rol no-admin) solo ve/opera su(s) sucursal(es) (profiles.branch_ids).
-- Admins (super_admin/org_admin) ven todo.
-- ============================================================

create or replace function public.is_branch_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('super_admin','org_admin') from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.user_branch_ids()
returns uuid[] language sql stable security definer set search_path = public as $$
  select coalesce((select branch_ids from public.profiles where id = auth.uid()), '{}');
$$;

create or replace function public.can_see_branch(b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_branch_admin() or (b is not null and b = any(public.user_branch_ids()));
$$;

-- RLS por sede -----------------------------------------------
drop policy if exists branch_stock_staff_all on public.branch_stock;
create policy branch_stock_scoped on public.branch_stock for all
  using (public.is_staff() and public.can_see_branch(branch_id))
  with check (public.is_staff() and public.can_see_branch(branch_id));

drop policy if exists orders_select_own on public.orders;
drop policy if exists orders_staff_write on public.orders;
create policy orders_select on public.orders for select using (
  user_id = auth.uid() or public.is_branch_admin()
  or (public.is_staff() and public.can_see_branch(branch_id))
);
create policy orders_staff_write on public.orders for all using (
  public.is_staff() and (public.is_branch_admin() or public.can_see_branch(branch_id))
) with check (
  public.is_staff() and (public.is_branch_admin() or public.can_see_branch(branch_id))
);

drop policy if exists cash_sessions_staff_all on public.cash_sessions;
create policy cash_sessions_scoped on public.cash_sessions for all
  using (public.is_staff() and (public.is_branch_admin() or public.can_see_branch(branch_id)))
  with check (public.is_staff() and (public.is_branch_admin() or public.can_see_branch(branch_id)));

drop policy if exists time_entries_staff_read on public.time_entries;
create policy time_entries_read on public.time_entries for select
  using (public.is_branch_admin() or user_id = auth.uid());

-- adjust_stock: guard de sucursal -----------------------------
create or replace function public.adjust_stock(p_product_id uuid, p_delta int, p_reason text, p_note text, p_branch uuid default null)
returns int language plpgsql security definer set search_path = public as $$
declare v_branch uuid; v_new int;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  v_branch := coalesce(p_branch, public.default_branch());
  if not public.can_see_branch(v_branch) then raise exception 'No autorizado para esa sucursal'; end if;
  v_new := public._apply_branch_stock(v_branch, p_product_id, p_delta);
  if v_new < 0 then raise exception 'El stock no puede quedar negativo'; end if;
  insert into stock_movements (product_id, delta, reason, note, resulting_stock, created_by, branch_id)
  values (p_product_id, p_delta, coalesce(nullif(p_reason,''),'ajuste'), nullif(p_note,''), v_new, auth.uid(), v_branch);
  return v_new;
end; $$;
grant execute on function public.adjust_stock(uuid, int, text, text, uuid) to authenticated;

-- open_cash_session: guard de sucursal ------------------------
create or replace function public.open_cash_session(p_opening numeric, p_branch uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_branch uuid;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  v_branch := coalesce(p_branch, public.default_branch());
  if not public.can_see_branch(v_branch) then raise exception 'No autorizado para esa sucursal'; end if;
  if exists (select 1 from cash_sessions where status='abierta' and branch_id is not distinct from v_branch) then
    raise exception 'Ya hay una caja abierta en esta sucursal';
  end if;
  insert into cash_sessions (opened_by, opening_amount, branch_id)
  values (auth.uid(), coalesce(p_opening,0), v_branch) returning id into v_id;
  return v_id;
end; $$;
grant execute on function public.open_cash_session(numeric, uuid) to authenticated;

-- branch_metrics: solo sedes visibles para el usuario ---------
create or replace function public.branch_metrics()
returns jsonb language plpgsql security definer set search_path = public as $$
declare result jsonb;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'name', b.name, 'is_default', b.is_default, 'is_online', b.is_online,
    'sales', coalesce((select sum(o.total) from orders o where o.branch_id=b.id and o.status<>'anulado'),0),
    'orders', (select count(*) from orders o where o.branch_id=b.id),
    'stock', coalesce((select sum(s.stock) from branch_stock s where s.branch_id=b.id),0)
  ) order by b.name), '[]'::jsonb)
  into result from branches b where public.can_see_branch(b.id);
  return result;
end; $$;
grant execute on function public.branch_metrics() to authenticated;

-- Asignar rol + sucursales a un usuario (solo admins) ---------
create or replace function public.assign_staff(p_email text, p_role text, p_branches uuid[])
returns boolean language plpgsql security definer set search_path = public as $$
declare v_uid uuid;
begin
  if not public.is_branch_admin() then raise exception 'No autorizado'; end if;
  if p_role not in ('customer','b2b_member','b2b_admin','technician','cashier','warehouse_clerk','accountant','branch_manager','org_admin','super_admin') then
    raise exception 'Rol inválido';
  end if;
  select id into v_uid from auth.users where lower(email) = lower(trim(p_email));
  if v_uid is null then raise exception 'No existe un usuario con ese correo (debe registrarse primero)'; end if;
  update public.profiles set role = p_role::public.app_role, branch_ids = coalesce(p_branches, '{}') where id = v_uid;
  return true;
end; $$;
grant execute on function public.assign_staff(text, text, uuid[]) to authenticated;
