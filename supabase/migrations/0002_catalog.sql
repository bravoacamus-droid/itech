-- ============================================================
-- iTech Platform — Migración 0002: catálogo (categorías + productos)
-- Lectura pública de items activos; escritura solo para staff (is_staff()).
-- ============================================================

-- CATEGORÍAS -------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  parent_id   uuid references public.categories (id) on delete set null,
  image_url   text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- PRODUCTOS --------------------------------------------------
create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  sku              text unique,
  brand            text,
  description      text,
  category_id      uuid references public.categories (id) on delete set null,
  price            numeric(10, 2) not null default 0,   -- precio de lista
  compare_at_price numeric(10, 2),                      -- precio anterior (para descuento)
  currency         text not null default 'PEN',
  stock            int not null default 0,
  image_url        text,
  is_active        boolean not null default true,
  is_featured      boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_products_active on public.products (is_active);
create index if not exists idx_products_featured on public.products (is_featured);

-- updated_at automático ---------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated
  before update on public.products
  for each row execute function public.set_updated_at();

-- RLS --------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products enable row level security;

-- Lectura pública de items activos
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select using (is_active = true);

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select using (is_active = true);

-- El staff puede ver y administrar todo
drop policy if exists categories_staff_all on public.categories;
create policy categories_staff_all on public.categories
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists products_staff_all on public.products;
create policy products_staff_all on public.products
  for all using (public.is_staff()) with check (public.is_staff());

-- Grants (RLS sigue aplicando por encima)
grant select on public.categories, public.products to anon, authenticated;
grant insert, update, delete on public.categories, public.products to authenticated;
