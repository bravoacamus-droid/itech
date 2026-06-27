-- ============================================================
-- iTech Platform — Migración 0018: políticas de Storage para SUNAT
-- Buckets privados (sunat-certs, sunat-cpe): acceso SOLO staff. Sin lectura
-- pública. El certificado nunca es accesible desde el cliente público.
-- ============================================================

drop policy if exists "sunat_staff_all" on storage.objects;
create policy "sunat_staff_all" on storage.objects
  for all
  to authenticated
  using (bucket_id in ('sunat-certs', 'sunat-cpe') and public.is_staff())
  with check (bucket_id in ('sunat-certs', 'sunat-cpe') and public.is_staff());
