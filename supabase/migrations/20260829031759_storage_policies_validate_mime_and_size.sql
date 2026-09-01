-- opencode-prompt-2-backend.md, sección "Storage": "Validar MIME/tamaño
-- también a nivel de política, no confiar solo en la extensión" (eco de
-- AGENT.md sección 46). Hasta ahora esa validación solo vivía en la
-- config del bucket (allowed_mime_types / file_size_limit). Se agrega como
-- capa adicional en el WITH CHECK de las políticas de storage.objects,
-- para que quede validado también a nivel de RLS, no solo en el motor de
-- Storage.
alter policy admin_full_access_inventory_images_bucket on storage.objects
  with check (
    bucket_id = 'inventory-images'
    and private.is_admin()
    and (metadata->>'mimetype') = any (array['image/jpeg','image/png','image/webp'])
    and coalesce((metadata->>'size')::bigint, 0) <= 5242880
  );

alter policy admin_full_access_work_order_photos_bucket on storage.objects
  with check (
    bucket_id = 'work-order-photos'
    and private.is_admin()
    and (metadata->>'mimetype') = any (array['image/jpeg','image/png','image/webp'])
    and coalesce((metadata->>'size')::bigint, 0) <= 5242880
  );

alter policy admin_insert_public_gallery on storage.objects
  with check (
    bucket_id = 'public-gallery'
    and private.is_admin()
    and (metadata->>'mimetype') = any (array['image/jpeg','image/png','image/webp'])
    and coalesce((metadata->>'size')::bigint, 0) <= 5242880
  );

alter policy admin_update_public_gallery on storage.objects
  with check (
    bucket_id = 'public-gallery'
    and private.is_admin()
    and (metadata->>'mimetype') = any (array['image/jpeg','image/png','image/webp'])
    and coalesce((metadata->>'size')::bigint, 0) <= 5242880
  );
