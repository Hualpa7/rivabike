-- ===========================================================
-- Fix de seguridad (Security Advisor): is_admin() y handle_new_user()
-- eran SECURITY DEFINER en el schema public -> PostgREST las exponia
-- como /rest/v1/rpc/is_admin y /rest/v1/rpc/handle_new_user.
-- Se mueven a un schema "private" que no forma parte de los schemas
-- expuestos por la Data API, pero siguen siendo invocables desde las
-- policies de RLS (que corren a nivel SQL, no via REST).
-- ===========================================================

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to anon, authenticated;

-- -----------------------------------------------------------
-- private.is_admin()
-- -----------------------------------------------------------

create or replace function private.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('superadmin', 'admin')
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

-- Repuntar todas las policies que usaban public.is_admin()
alter policy "admin_update_site_settings" on public.site_settings
  using (private.is_admin()) with check (private.is_admin());

alter policy "admin_full_access_services" on public.services
  using (private.is_admin()) with check (private.is_admin());

alter policy "admin_full_access_inventory_items" on public.inventory_items
  using (private.is_admin()) with check (private.is_admin());

alter policy "admin_full_access_service_inventory_items" on public.service_inventory_items
  using (private.is_admin()) with check (private.is_admin());

alter policy "admin_full_access_customers" on public.customers
  using (private.is_admin()) with check (private.is_admin());

alter policy "admin_full_access_bicycles" on public.bicycles
  using (private.is_admin()) with check (private.is_admin());

alter policy "admin_full_access_gallery_items" on public.gallery_items
  using (private.is_admin()) with check (private.is_admin());

alter policy "admin_select_work_orders" on public.work_orders
  using (private.is_admin());

alter policy "admin_select_work_order_services" on public.work_order_services
  using (private.is_admin());

alter policy "admin_select_work_order_inventory_items" on public.work_order_inventory_items
  using (private.is_admin());

alter policy "admin_full_access_work_order_photos" on public.work_order_photos
  using (private.is_admin()) with check (private.is_admin());

alter policy "admin_select_stock_movements" on public.stock_movements
  using (private.is_admin());

alter policy "admin_full_access_gallery_images" on public.gallery_images
  using (private.is_admin()) with check (private.is_admin());

-- Ya no queda ninguna policy usando public.is_admin(): eliminarla.
revoke all on function public.is_admin() from public, anon, authenticated;
drop function public.is_admin();

-- -----------------------------------------------------------
-- private.handle_new_user()
-- -----------------------------------------------------------

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role) values (new.id, 'superadmin');
  return new;
end;
$$;

drop trigger on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

revoke all on function public.handle_new_user() from public, anon, authenticated;
drop function public.handle_new_user();
