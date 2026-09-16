-- ===========================================================
-- Bucket privado para fotos de ordenes de trabajo: 'orden-fotos'.
-- Separado del bucket publico de galeria y del bucket
-- work-order-photos (que no se usa). Multiples fotos por orden,
-- sin categorias antes/durante/despues.
-- ===========================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('orden-fotos', 'orden-fotos', false, 5242880,
    array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "admin_full_access_orden_fotos_bucket"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'orden-fotos' and private.is_admin())
  with check (bucket_id = 'orden-fotos' and private.is_admin());