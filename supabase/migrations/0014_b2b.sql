-- ============================================================
-- iTech Platform — Migración 0014: B2B (empresas + helpdesk con SLA)
-- Empresas, miembros (via profiles.company_id), tickets de soporte con
-- SLA y conversación, y reparaciones ligadas a empresa (flota).
-- ============================================================

create sequence if not exists public.support_seq start 1000;

create table if not exists public.companies (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  ruc           text,
  contact_name  text,
  contact_phone text,
  contact_email text,
  plan          text not null default 'esencial', -- esencial | pro | enterprise
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- reparaciones ligadas a empresa (flota)
alter table public.repair_tickets
  add column if not exists company_id uuid references public.companies (id) on delete set null;

create table if not exists public.support_tickets (
  id              uuid primary key default gen_random_uuid(),
  ticket_number   text unique not null,
  company_id      uuid not null references public.companies (id) on delete cascade,
  subject         text not null,
  priority        text not null default 'media',  -- baja | media | alta | urgente
  status          text not null default 'abierto', -- abierto | en_proceso | resuelto | cerrado
  created_by      uuid references auth.users (id) on delete set null,
  assigned_to     text,
  sla_due_at      timestamptz,
  first_response_at timestamptz,
  resolved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.support_messages (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references public.support_tickets (id) on delete cascade,
  author_type text not null default 'cliente', -- cliente | soporte
  author_id   uuid references auth.users (id) on delete set null,
  body        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_support_company on public.support_tickets (company_id, created_at desc);
create index if not exists idx_support_msgs on public.support_messages (ticket_id, created_at);

drop trigger if exists trg_support_updated on public.support_tickets;
create trigger trg_support_updated
  before update on public.support_tickets
  for each row execute function public.set_updated_at();

-- Helper: empresa del usuario actual ------------------------
create or replace function public.auth_company()
returns uuid
language sql stable security definer set search_path = public
as $$ select company_id from public.profiles where id = auth.uid() $$;

-- RLS -------------------------------------------------------
alter table public.companies enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;

drop policy if exists companies_staff_all on public.companies;
create policy companies_staff_all on public.companies
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists companies_member_read on public.companies;
create policy companies_member_read on public.companies
  for select using (id = public.auth_company());

drop policy if exists support_staff_all on public.support_tickets;
create policy support_staff_all on public.support_tickets
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists support_member_read on public.support_tickets;
create policy support_member_read on public.support_tickets
  for select using (company_id = public.auth_company());

drop policy if exists support_msg_select on public.support_messages;
create policy support_msg_select on public.support_messages
  for select using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id
        and (public.is_staff() or t.company_id = public.auth_company())
    )
  );

-- reparaciones: lectura para miembros de la empresa
drop policy if exists repairs_company_read on public.repair_tickets;
create policy repairs_company_read on public.repair_tickets
  for select using (company_id is not null and company_id = public.auth_company());

grant select, insert, update on public.companies to authenticated;
grant select, insert, update on public.support_tickets to authenticated;
grant select, insert on public.support_messages to authenticated;

-- Asignar miembro a empresa (staff) -------------------------
create or replace function public.assign_company_member(p_email text, p_company uuid, p_role text)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare v_uid uuid;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  select id into v_uid from auth.users where lower(email) = lower(trim(p_email));
  if v_uid is null then raise exception 'No existe un usuario con ese correo (debe registrarse primero)'; end if;
  update public.profiles
    set company_id = p_company,
        role = (case when p_role in ('b2b_admin','b2b_member') then p_role::public.app_role else 'b2b_member' end)
    where id = v_uid;
  return true;
end; $$;

grant execute on function public.assign_company_member(text, uuid, text) to authenticated;

-- Crear ticket de soporte (miembro B2B) ---------------------
create or replace function public.create_support_ticket(p_subject text, p_priority text, p_body text)
returns table (id uuid, ticket_number text)
language plpgsql security definer set search_path = public
as $$
declare
  v_company uuid;
  v_id uuid;
  v_num text;
  v_hours int;
begin
  v_company := public.auth_company();
  if v_company is null then raise exception 'Tu cuenta no está asociada a una empresa'; end if;

  v_hours := case lower(coalesce(p_priority,'media'))
    when 'urgente' then 4 when 'alta' then 8 when 'baja' then 48 else 24 end;
  v_num := 'SUP-' || lpad(nextval('support_seq')::text, 6, '0');

  insert into support_tickets (ticket_number, company_id, subject, priority, created_by, sla_due_at)
  values (v_num, v_company, coalesce(nullif(p_subject,''),'(sin asunto)'),
          lower(coalesce(p_priority,'media')), auth.uid(), now() + (v_hours || ' hours')::interval)
  returning support_tickets.id into v_id;

  if coalesce(nullif(p_body,''),'') <> '' then
    insert into support_messages (ticket_id, author_type, author_id, body)
    values (v_id, 'cliente', auth.uid(), p_body);
  end if;

  return query select v_id, v_num;
end; $$;

grant execute on function public.create_support_ticket(text, text, text) to authenticated;

-- Agregar mensaje a un ticket (miembro o staff) -------------
create or replace function public.add_support_message(p_ticket uuid, p_body text)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare v_company uuid; v_staff boolean;
begin
  if coalesce(nullif(p_body,''),'') = '' then raise exception 'Mensaje vacío'; end if;
  select company_id into v_company from support_tickets where id = p_ticket;
  if v_company is null then raise exception 'Ticket no encontrado'; end if;
  v_staff := public.is_staff();
  if not v_staff and v_company <> public.auth_company() then
    raise exception 'No autorizado';
  end if;

  insert into support_messages (ticket_id, author_type, author_id, body)
  values (p_ticket, case when v_staff then 'soporte' else 'cliente' end, auth.uid(), p_body);

  if v_staff then
    update support_tickets
      set first_response_at = coalesce(first_response_at, now()),
          status = case when status = 'abierto' then 'en_proceso' else status end
      where id = p_ticket;
  end if;
  return true;
end; $$;

grant execute on function public.add_support_message(uuid, text) to authenticated;

-- Cambiar estado del ticket (staff) -------------------------
create or replace function public.set_support_status(p_ticket uuid, p_status text, p_assigned text)
returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  update support_tickets set
    status = p_status,
    assigned_to = coalesce(nullif(p_assigned,''), assigned_to),
    resolved_at = case when p_status in ('resuelto','cerrado') then coalesce(resolved_at, now()) else resolved_at end
    where id = p_ticket;
  return true;
end; $$;

grant execute on function public.set_support_status(uuid, text, text) to authenticated;
