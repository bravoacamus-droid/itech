-- ============================================================
-- iTech Platform — Migración 0003: políticas de Storage (bucket 'catalog')
-- Lectura pública (el bucket es público) + escritura solo para staff.
-- Permite que los administradores suban/actualicen imágenes de producto
-- desde el panel usando su propia sesión (sin exponer el service_role).
-- ============================================================

-- Lectura pública de objetos del bucket catalog
drop policy if exists "catalog_public_read" on storage.objects;
create policy "catalog_public_read" on storage.objects
  for select using (bucket_id = 'catalog');

-- Subida por staff
drop policy if exists "catalog_staff_insert" on storage.objects;
create policy "catalog_staff_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'catalog' and public.is_staff());

-- Actualización por staff
drop policy if exists "catalog_staff_update" on storage.objects;
create policy "catalog_staff_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'catalog' and public.is_staff())
  with check (bucket_id = 'catalog' and public.is_staff());

-- Eliminación por staff
drop policy if exists "catalog_staff_delete" on storage.objects;
create policy "catalog_staff_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'catalog' and public.is_staff());
