-- ===========================================================
-- Fixes de Performance Advisor
-- ===========================================================

-- 1) auth.uid() sin envolver se reevalua por fila -> envolver en (select ...)
alter policy "select_own_profile" on public.profiles
  using (id = (select auth.uid()));

-- 2) Consolidar policies permisivas duplicadas (services, gallery_items,
-- gallery_images tenian una policy publica de SELECT + una de admin FOR ALL
-- que tambien cubre SELECT -> se evaluaban las dos por consulta).

-- services
drop policy "public_read_active_services" on public.services;
drop policy "admin_full_access_services" on public.services;

create policy "select_services"
  on public.services for select
  to anon, authenticated
  using (activo = true or private.is_admin());

create policy "admin_insert_services"
  on public.services for insert to authenticated with check (private.is_admin());
create policy "admin_update_services"
  on public.services for update to authenticated
  using (private.is_admin()) with check (private.is_admin());
create policy "admin_delete_services"
  on public.services for delete to authenticated using (private.is_admin());

-- gallery_items
drop policy "public_read_published_gallery_items" on public.gallery_items;
drop policy "admin_full_access_gallery_items" on public.gallery_items;

create policy "select_gallery_items"
  on public.gallery_items for select
  to anon, authenticated
  using (publicado = true or private.is_admin());

create policy "admin_insert_gallery_items"
  on public.gallery_items for insert to authenticated with check (private.is_admin());
create policy "admin_update_gallery_items"
  on public.gallery_items for update to authenticated
  using (private.is_admin()) with check (private.is_admin());
create policy "admin_delete_gallery_items"
  on public.gallery_items for delete to authenticated using (private.is_admin());

-- gallery_images
drop policy "public_read_published_gallery_images" on public.gallery_images;
drop policy "admin_full_access_gallery_images" on public.gallery_images;

create policy "select_gallery_images"
  on public.gallery_images for select
  to anon, authenticated
  using (
    private.is_admin() or exists (
      select 1 from public.gallery_items gi
      where gi.id = gallery_images.gallery_item_id and gi.publicado = true
    )
  );

create policy "admin_insert_gallery_images"
  on public.gallery_images for insert to authenticated with check (private.is_admin());
create policy "admin_update_gallery_images"
  on public.gallery_images for update to authenticated
  using (private.is_admin()) with check (private.is_admin());
create policy "admin_delete_gallery_images"
  on public.gallery_images for delete to authenticated using (private.is_admin());

-- 3) Indices de FK sugeridos (AGENT.md seccion 43)
create index stock_movements_created_by_idx on public.stock_movements (created_by);
create index work_orders_created_by_idx on public.work_orders (created_by);
create index work_order_services_service_id_idx on public.work_order_services (service_id);
