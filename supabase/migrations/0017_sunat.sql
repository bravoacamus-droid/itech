-- ============================================================
-- iTech Platform — Migración 0017: Facturación electrónica (SUNAT)
-- Configuración fiscal del emisor, comprobantes (CPE) y sus ítems.
-- La firma XML (UBL 2.1) y el envío a SUNAT se realizan server-side con el
-- certificado digital (almacenado en bucket privado) — se activa al configurarlo.
-- ============================================================

create table if not exists public.fiscal_config (
  id            text primary key default 'default',
  ruc           text,
  razon_social  text,
  direccion     text,
  ubigeo        text,
  factura_serie text not null default 'F001',
  boleta_serie  text not null default 'B001',
  environment   text not null default 'beta', -- beta | produccion
  sol_user      text,
  cert_uploaded boolean not null default false,
  igv_rate      numeric(4,2) not null default 18.00,
  updated_at    timestamptz not null default now()
);

insert into public.fiscal_config (id) values ('default') on conflict (id) do nothing;

create table if not exists public.invoices (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid references public.orders (id) on delete set null,
  doc_type          text not null,            -- 01 = factura, 03 = boleta
  serie             text not null,
  correlativo       int not null,
  full_number       text not null,            -- F001-00000123
  customer_doc_type text not null default '0',-- 6=RUC, 1=DNI, 0=sin
  customer_doc      text,
  customer_name     text not null default 'Cliente',
  currency          text not null default 'PEN',
  op_gravada        numeric(10,2) not null default 0,
  igv               numeric(10,2) not null default 0,
  total             numeric(10,2) not null default 0,
  status            text not null default 'borrador', -- borrador|firmado|enviado|aceptado|rechazado|anulado
  sunat_ticket      text,
  cdr_status        text,
  xml_path          text,
  cdr_path          text,
  hash              text,
  note              text,
  created_at        timestamptz not null default now(),
  unique (doc_type, serie, correlativo)
);

create table if not exists public.invoice_items (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references public.invoices (id) on delete cascade,
  description text not null,
  quantity    int not null,
  unit_price  numeric(10,2) not null,
  igv         numeric(10,2) not null default 0,
  line_total  numeric(10,2) not null
);

alter table public.fiscal_config enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

drop policy if exists fiscal_staff_all on public.fiscal_config;
create policy fiscal_staff_all on public.fiscal_config for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists invoices_staff_all on public.invoices;
create policy invoices_staff_all on public.invoices for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists invoice_items_staff_all on public.invoice_items;
create policy invoice_items_staff_all on public.invoice_items for all using (public.is_staff()) with check (public.is_staff());

grant select, insert, update on public.fiscal_config to authenticated;
grant select, insert, update on public.invoices to authenticated;
grant select, insert on public.invoice_items to authenticated;

-- Emitir comprobante desde un pedido -------------------------
create or replace function public.create_invoice_from_order(p_order uuid, p_doc_type text, p_customer jsonb)
returns table (id uuid, full_number text)
language plpgsql security definer set search_path = public
as $$
declare
  v_cfg public.fiscal_config%rowtype;
  v_order public.orders%rowtype;
  v_serie text;
  v_corr int;
  v_id uuid;
  v_num text;
  v_rate numeric := 18.00;
  v_total numeric(10,2);
  v_grav numeric(10,2);
  v_igv numeric(10,2);
  it record;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  select * into v_cfg from fiscal_config where id = 'default';
  v_rate := coalesce(v_cfg.igv_rate, 18.00);

  select * into v_order from orders where id = p_order;
  if not found then raise exception 'Pedido no encontrado'; end if;

  if exists (select 1 from invoices where order_id = p_order and status <> 'anulado') then
    raise exception 'El pedido ya tiene un comprobante';
  end if;

  v_serie := case when p_doc_type = '01' then coalesce(v_cfg.factura_serie,'F001')
                  else coalesce(v_cfg.boleta_serie,'B001') end;
  select coalesce(max(correlativo),0) + 1 into v_corr from invoices where doc_type = p_doc_type and serie = v_serie;
  v_num := v_serie || '-' || lpad(v_corr::text, 8, '0');

  v_total := coalesce(v_order.total, 0);
  v_grav := round(v_total / (1 + v_rate/100.0), 2);
  v_igv := v_total - v_grav;

  insert into invoices (order_id, doc_type, serie, correlativo, full_number,
    customer_doc_type, customer_doc, customer_name, currency, op_gravada, igv, total)
  values (p_order, p_doc_type, v_serie, v_corr, v_num,
    coalesce(p_customer->>'doc_type','0'), nullif(p_customer->>'doc',''),
    coalesce(nullif(p_customer->>'name',''), v_order.customer_name, 'Cliente'),
    coalesce(v_order.currency,'PEN'), v_grav, v_igv, v_total)
  returning invoices.id into v_id;

  for it in select * from order_items where order_id = p_order loop
    insert into invoice_items (invoice_id, description, quantity, unit_price, igv, line_total)
    values (v_id, it.name, it.quantity, it.unit_price,
      round(it.line_total - it.line_total/(1+v_rate/100.0), 2), it.line_total);
  end loop;

  return query select v_id, v_num;
end; $$;

grant execute on function public.create_invoice_from_order(uuid, text, jsonb) to authenticated;
