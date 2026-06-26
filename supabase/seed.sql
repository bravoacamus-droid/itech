-- ============================================================
-- iTech Platform — Seed de catálogo (categorías + productos)
-- Imágenes servidas desde Supabase Storage (bucket público 'catalog').
-- Idempotente: on conflict (slug) do nothing.
-- ============================================================

-- CATEGORÍAS -------------------------------------------------
insert into public.categories (name, slug, image_url, sort_order) values
  ('Laptops',         'laptops',         'https://qhgrkfzmftfwubamdzfx.supabase.co/storage/v1/object/public/catalog/cat-laptops.jpg',   1),
  ('Impresoras',      'impresoras',      'https://qhgrkfzmftfwubamdzfx.supabase.co/storage/v1/object/public/catalog/cat-impresoras.jpg',2),
  ('Monitores',       'monitores',       'https://qhgrkfzmftfwubamdzfx.supabase.co/storage/v1/object/public/catalog/cat-monitores.webp',3),
  ('Placa madre',     'placa-madre',     'https://qhgrkfzmftfwubamdzfx.supabase.co/storage/v1/object/public/catalog/cat-placa.png',     4),
  ('Fuente de poder', 'fuente-de-poder', 'https://qhgrkfzmftfwubamdzfx.supabase.co/storage/v1/object/public/catalog/cat-fuente.png',    5),
  ('Disco duro',      'disco-duro',      'https://qhgrkfzmftfwubamdzfx.supabase.co/storage/v1/object/public/catalog/cat-disco.png',     6)
on conflict (slug) do nothing;

-- PRODUCTOS --------------------------------------------------
insert into public.products
  (name, slug, sku, brand, description, category_id, price, compare_at_price, stock, image_url, is_featured)
values
  ('Laptop Lenovo IdeaPad 5 2en1', 'laptop-lenovo-ideapad-5-2en1', 'LAP-LEN-IP5', 'Lenovo',
   'Laptop convertible 2en1, 9na Gen AMD, pantalla 14" táctil. Potencia y portabilidad.',
   (select id from public.categories where slug='laptops'), 2499.00, 2799.00, 8,
   'https://qhgrkfzmftfwubamdzfx.supabase.co/storage/v1/object/public/catalog/cat-laptops.jpg', true),

  ('Laptop HP 250 G9', 'laptop-hp-250-g9', 'LAP-HP-250G9', 'HP',
   'Laptop para trabajo y estudio, Intel Core i5, 8GB RAM, SSD 512GB.',
   (select id from public.categories where slug='laptops'), 1899.00, null, 5,
   'https://qhgrkfzmftfwubamdzfx.supabase.co/storage/v1/object/public/catalog/cat-laptops.jpg', false),

  ('Impresora Multifuncional Epson L3250', 'impresora-epson-l3250', 'IMP-EPL3250', 'Epson',
   'Multifuncional con sistema de tinta continua, WiFi e impresión móvil.',
   (select id from public.categories where slug='impresoras'), 749.00, 829.00, 10,
   'https://qhgrkfzmftfwubamdzfx.supabase.co/storage/v1/object/public/catalog/cat-impresoras.jpg', true),

  ('Impresora HP DeskJet', 'impresora-hp-deskjet', 'IMP-HPDJ', 'HP',
   'Impresora compacta para el hogar y la oficina.',
   (select id from public.categories where slug='impresoras'), 320.00, null, 7,
   'https://qhgrkfzmftfwubamdzfx.supabase.co/storage/v1/object/public/catalog/cat-impresoras.jpg', false),

  ('Monitor Samsung 24" FHD', 'monitor-samsung-24-fhd', 'MON-SAM24', 'Samsung',
   'Monitor 24 pulgadas Full HD, panel IPS, 75Hz.',
   (select id from public.categories where slug='monitores'), 449.00, 499.00, 12,
   'https://qhgrkfzmftfwubamdzfx.supabase.co/storage/v1/object/public/catalog/cat-monitores.webp', true),

  ('Monitor LG 27" IPS', 'monitor-lg-27-ips', 'MON-LG27', 'LG',
   'Monitor 27 pulgadas IPS, colores precisos, ideal para diseño.',
   (select id from public.categories where slug='monitores'), 699.00, null, 6,
   'https://qhgrkfzmftfwubamdzfx.supabase.co/storage/v1/object/public/catalog/cat-monitores.webp', false),

  ('Placa ASUS TUF Gaming B850-PLUS WiFi', 'placa-asus-tuf-b850-plus', 'MB-ASUS-B850', 'Asus',
   'Placa madre ATX, socket AM5, DDR5, WiFi integrado.',
   (select id from public.categories where slug='placa-madre'), 899.00, 999.00, 4,
   'https://qhgrkfzmftfwubamdzfx.supabase.co/storage/v1/object/public/catalog/cat-placa.png', true),

  ('Placa Gigabyte B550M', 'placa-gigabyte-b550m', 'MB-GB-B550M', 'Gigabyte',
   'Placa madre micro-ATX, socket AM4, DDR4.',
   (select id from public.categories where slug='placa-madre'), 549.00, null, 9,
   'https://qhgrkfzmftfwubamdzfx.supabase.co/storage/v1/object/public/catalog/cat-placa.png', false),

  ('Fuente de Poder 450W 80+ Bronze', 'fuente-450w-80-bronze', 'PSU-450B', 'Gigabyte',
   'Fuente de poder 450W certificación 80 Plus Bronze.',
   (select id from public.categories where slug='fuente-de-poder'), 145.00, 179.00, 15,
   'https://qhgrkfzmftfwubamdzfx.supabase.co/storage/v1/object/public/catalog/cat-fuente.png', false),

  ('Fuente de Poder 650W 80+ Bronze', 'fuente-650w-80-bronze', 'PSU-650B', 'Corsair',
   'Fuente de poder 650W certificación 80 Plus Bronze, ideal para gaming.',
   (select id from public.categories where slug='fuente-de-poder'), 259.00, null, 8,
   'https://qhgrkfzmftfwubamdzfx.supabase.co/storage/v1/object/public/catalog/cat-fuente.png', false),

  ('Disco Sólido SSD HP S650 240GB', 'ssd-hp-s650-240gb', 'SSD-HPS650-240', 'HP',
   'SSD 2.5" SATA 240GB, mejora la velocidad de tu equipo.',
   (select id from public.categories where slug='disco-duro'), 95.00, 120.00, 25,
   'https://qhgrkfzmftfwubamdzfx.supabase.co/storage/v1/object/public/catalog/cat-disco.png', true),

  ('Disco Sólido SSD Kingston A400 480GB', 'ssd-kingston-a400-480gb', 'SSD-KNGA400-480', 'Kingston',
   'SSD 2.5" SATA 480GB, alto rendimiento y confiabilidad.',
   (select id from public.categories where slug='disco-duro'), 159.00, 189.00, 20,
   'https://qhgrkfzmftfwubamdzfx.supabase.co/storage/v1/object/public/catalog/cat-disco.png', false)
on conflict (slug) do nothing;
