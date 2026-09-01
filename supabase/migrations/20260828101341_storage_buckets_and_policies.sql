-- ===========================================================
-- Storage: public-gallery (publico), work-order-photos (privado),
-- inventory-images (privado). AGENT.md seccion 22.
-- ===========================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-gallery', 'public-gallery', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp']),
  ('work-order-photos', 'work-order-photos', false, 5242880,
    array['image/jpeg', 'image/png', 'image/webp']),
  ('inventory-images', 'inventory-images', false, 5242880,
    array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- -----------------------------------------------------------
-- public-gallery: lectura publica, escritura solo admin
-- -----------------------------------------------------------

create policy "public_read_public_gallery"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'public-gallery');

create policy "admin_insert_public_gallery"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'public-gallery' and private.is_admin());

create policy "admin_update_public_gallery"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'public-gallery' and private.is_admin())
  with check (bucket_id = 'public-gallery' and private.is_admin());

create policy "admin_delete_public_gallery"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'public-gallery' and private.is_admin());

-- -----------------------------------------------------------
-- work-order-photos: privado, solo admin (select/insert/update/delete)
-- -----------------------------------------------------------

create policy "admin_full_access_work_order_photos_bucket"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'work-order-photos' and private.is_admin())
  with check (bucket_id = 'work-order-photos' and private.is_admin());

-- -----------------------------------------------------------
-- inventory-images: privado, solo admin
-- -----------------------------------------------------------

create policy "admin_full_access_inventory_images_bucket"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'inventory-images' and private.is_admin())
  with check (bucket_id = 'inventory-images' and private.is_admin());
