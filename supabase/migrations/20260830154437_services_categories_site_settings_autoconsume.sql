-- ===========================================================
-- Cambios de negocio/UX para Riva Bike dashboard
-- 1) service_categories (tabla nueva + FK en services)
-- 2) services.categoria_id (relacion) + migracion de services.categoria (text)
-- 3) site_settings ampliado: About / HowWeWork / Reviews / Services
-- 4) update_work_order_status: auto-consumo de repuestos pendientes al terminar
-- 5) completar profiles.full_name del usuario
-- ===========================================================

-- -----------------------------------------------------------
-- 1) service_categories
-- -----------------------------------------------------------
create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  slug text unique,
  orden integer not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.service_categories
  for each row execute function public.set_updated_at();

alter table public.service_categories enable row level security;

create policy "admin_full_access_service_categories"
  on public.service_categories for all
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

grant select, insert, update, delete on public.service_categories to authenticated;

-- Un 'slug' derivado del nombre si no se provee
create or replace function private.set_service_category_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := lower(regexp_replace(new.nombre, '[^a-zA-Z0-9]+', '-', 'g'));
  end if;
  return new;
end;
$$;

create trigger set_service_category_slug
  before insert or update on public.service_categories
  for each row execute function private.set_service_category_slug();

-- -----------------------------------------------------------
-- 2) services.categoria_id (FK) y migracion de datos de services.categoria
-- -----------------------------------------------------------
alter table public.services
  add column categoria_id uuid references public.service_categories (id);

create index services_categoria_id_idx on public.services (categoria_id);

-- Migrar las categorias existentes en texto libre a la tabla nueva
-- (crea una categoria por cada valor distinto no vacio)
insert into public.service_categories (nombre, activo)
select distinct trim(categoria) as nombre, true
from public.services
where categoria is not null and trim(categoria) <> ''
on conflict (nombre) do nothing;

-- Vincular los servicios a la categoria correspondiente (por nombre)
update public.services s
set categoria_id = sc.id
from public.service_categories sc
where lower(trim(s.categoria)) = lower(trim(sc.nombre));

-- La columna 'categoria' text se conserva por compatibilidad (mocks),
-- pero la fuente de verdad pasa a ser categoria_id.

-- -----------------------------------------------------------
-- 3) site_settings ampliado (About / HowWeWork / Reviews / Services)
-- -----------------------------------------------------------
alter table public.site_settings
  add column about_titulo text,
  add column about_descripcion text,
  add column about_check_1 text,
  add column about_check_2 text,
  add column how_it_works_titulo text,
  add column how_it_works_subtitulo text,
  add column how_it_works_descripcion text,
  add column how_we_work_paso1_titulo text,
  add column how_we_work_paso1_descripcion text,
  add column how_we_work_paso2_titulo text,
  add column how_we_work_paso2_descripcion text,
  add column how_we_work_paso3_titulo text,
  add column how_we_work_paso3_descripcion text,
  add column how_we_work_paso4_titulo text,
  add column how_we_work_paso4_descripcion text,
  add column reviews_titulo text,
  add column reviews_subtitulo text,
  add column services_titulo text,
  add column services_subtitulo text;

-- -----------------------------------------------------------
-- 4) update_work_order_status: auto-consumo de repuestos pendientes
--    al pasar en_ejecucion -> terminado
-- -----------------------------------------------------------
create or replace function public.update_work_order_status(
  p_work_order_id uuid,
  p_new_status text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current_status text;
  v_valid boolean;
  v_item record;
  v_remaining integer;
begin
  if not private.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  select estado into v_current_status
  from public.work_orders
  where id = p_work_order_id
  for update;

  if not found then
    raise exception 'Orden no encontrada: %', p_work_order_id;
  end if;

  v_valid := (
    (v_current_status = 'pendiente' and p_new_status in ('aceptado', 'rechazado'))
    or (v_current_status = 'aceptado' and p_new_status = 'en_ejecucion')
    or (v_current_status = 'en_ejecucion' and p_new_status = 'terminado')
  );

  if not v_valid then
    raise exception 'Transicion invalida: % -> %', v_current_status, p_new_status
      using errcode = 'P0001';
  end if;

  -- Auto-consumo: al terminar, consumir TODOS los repuestos pendientes
  -- que tengan inventario vinculado (no ad-hoc). Logica de negocio confirmada:
  -- el stock se descuenta cuando el repuesto se usa de verdad, al terminar.
  if v_current_status = 'en_ejecucion' and p_new_status = 'terminado' then
    for v_item in
      select woi.id as woi_id,
             woi.inventory_item_id,
             woi.quantity,
             woi.consumed_at
      from public.work_order_inventory_items woi
      where woi.work_order_id = p_work_order_id
        and woi.inventory_item_id is not null
        and woi.consumed_at is null
      for update of woi
    loop
      perform public.register_stock_movement(
        v_item.inventory_item_id,
        'consumo_trabajo',
        v_item.quantity,
        'Consumo de orden de trabajo (auto al terminar)',
        p_work_order_id
      );

      update public.work_order_inventory_items
      set consumed_at = now()
      where id = v_item.woi_id;
    end loop;
  end if;

  update public.work_orders
  set estado = p_new_status
  where id = p_work_order_id;

  return public.get_work_order_detail(p_work_order_id);
end;
$$;

revoke all on function public.update_work_order_status(uuid, text) from public;
grant execute on function public.update_work_order_status(uuid, text) to authenticated;

-- Al dejar de usar el boton "Consumir" individual, se revoca la funcion
-- consume_work_order_inventory_item para evitar un flujo doble que duplique
-- el descuento (el auto-consumo al terminar la reemplaza).
revoke all on function public.consume_work_order_inventory_item(uuid) from public, authenticated;

-- -----------------------------------------------------------
-- 5) Completar profiles.full_name del usuario
--    (muestra el nombre real del dueño en el dashboard)
-- -----------------------------------------------------------
update public.profiles p
set full_name = coalesce(
  nullif(p.full_name, ''),
  (select raw_user_meta_data->>'full_name'
     from auth.users u where u.id = p.id),
  (select raw_user_meta_data->>'name'
     from auth.users u where u.id = p.id)
)
where full_name is null or full_name = '';

-- Si sigue vacio (usuario sin metadatos), usar un valor por defecto sensible
update public.profiles
set full_name = 'Riva Bike'
where full_name is null or full_name = '';
