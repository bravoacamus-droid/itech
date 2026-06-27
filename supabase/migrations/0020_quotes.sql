-- ============================================================
-- iTech Platform — Migración 0020: Cotizaciones (con enlace público)
-- ============================================================

create sequence if not exists public.quote_seq start 1000;

create table if not exists public.quotes (
  id            uuid primary key default gen_random_uuid(),
  quote_number  text unique not null,
  token         text unique not null,
  customer_name text not null,
  customer_doc  text,
  customer_email text,
  customer_phone text,
  currency      text not null default 'PEN',
  total         numeric(10,2) not null default 0,
  notes         text,
  valid_until   date,
  status        text not null default 'borrador', -- borrador|enviada|aceptada|rechazada|vencida
  created_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now()
);

create table if not exists public.quote_items (
  id          uuid primary key default gen_random_uuid(),
  quote_id    uuid not null references public.quotes (id) on delete cascade,
  description text not null,
  quantity    numeric(10,2) not null default 1,
  unit_price  numeric(10,2) not null default 0,
  line_total  numeric(10,2) not null default 0
);

create index if not exists idx_quote_items on public.quote_items (quote_id);

alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;

drop policy if exists quotes_staff_all on public.quotes;
create policy quotes_staff_all on public.quotes for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists quote_items_staff_all on public.quote_items;
create policy quote_items_staff_all on public.quote_items for all using (public.is_staff()) with check (public.is_staff());

grant select, insert, update on public.quotes to authenticated;
grant select, insert on public.quote_items to authenticated;

-- Crear cotización (staff) -----------------------------------
create or replace function public.create_quote(p_customer jsonb, p_items jsonb, p_notes text, p_valid_days int)
returns table (quote_id uuid, quote_number text, token text)
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
  v_num text;
  v_token text;
  v_item jsonb;
  v_total numeric(10,2) := 0;
  v_qty numeric(10,2);
  v_price numeric(10,2);
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Agrega al menos un ítem';
  end if;

  v_num := 'COT-' || lpad(nextval('quote_seq')::text, 6, '0');
  v_token := replace(gen_random_uuid()::text, '-', '');

  insert into quotes (quote_number, token, customer_name, customer_doc, customer_email,
    customer_phone, notes, valid_until, created_by, status)
  values (v_num, v_token,
    coalesce(nullif(p_customer->>'name',''),'Cliente'),
    nullif(p_customer->>'doc',''), nullif(p_customer->>'email',''),
    nullif(p_customer->>'phone',''), nullif(p_notes,''),
    (current_date + coalesce(p_valid_days, 15)), auth.uid(), 'enviada')
  returning quotes.id into v_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := coalesce((v_item->>'quantity')::numeric, 1);
    v_price := coalesce((v_item->>'unit_price')::numeric, 0);
    insert into quote_items (quote_id, description, quantity, unit_price, line_total)
    values (v_id, coalesce(nullif(v_item->>'description',''),'Ítem'), v_qty, v_price, v_qty * v_price);
    v_total := v_total + v_qty * v_price;
  end loop;

  update quotes set total = v_total where quotes.id = v_id;
  return query select v_id, v_num, v_token;
end; $$;

grant execute on function public.create_quote(jsonb, jsonb, text, int) to authenticated;

-- Cotización pública por token (anon) ------------------------
create or replace function public.get_quote_public(p_token text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare q public.quotes%rowtype; result jsonb;
begin
  select * into q from quotes where token = p_token;
  if not found then return jsonb_build_object('found', false); end if;

  select jsonb_build_object(
    'found', true,
    'quote', jsonb_build_object(
      'number', q.quote_number,
      'customer_name', q.customer_name,
      'customer_doc', q.customer_doc,
      'currency', q.currency,
      'total', q.total,
      'notes', q.notes,
      'valid_until', q.valid_until,
      'status', q.status,
      'created_at', q.created_at
    ),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object('description', i.description, 'quantity', i.quantity,
        'unit_price', i.unit_price, 'line_total', i.line_total) order by i.id)
      from quote_items i where i.quote_id = q.id
    ), '[]'::jsonb)
  ) into result;
  return result;
end; $$;

grant execute on function public.get_quote_public(text) to anon, authenticated;
