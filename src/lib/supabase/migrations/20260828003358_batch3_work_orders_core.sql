-- ===========================================================
-- Tanda 3: work_orders, work_order_services,
-- work_order_inventory_items, work_order_photos
-- ===========================================================

-- -----------------------------------------------------------
-- work_orders
-- -----------------------------------------------------------

create table public.work_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id),
  bicycle_id uuid not null references public.bicycles (id),
  fecha_estimada_entrega date,
  observaciones text,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'aceptado', 'en_ejecucion', 'terminado', 'rechazado')),
  total numeric(12,2) not null default 0 check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references auth.users (id)
);

create index work_orders_estado_idx on public.work_orders (estado);
create index work_orders_customer_id_idx on public.work_orders (customer_id);
create index work_orders_bicycle_id_idx on public.work_orders (bicycle_id);

create trigger set_updated_at
  before update on public.work_orders
  for each row execute function public.set_updated_at();

alter table public.work_orders enable row level security;

create policy "admin_select_work_orders"
  on public.work_orders for select
  to authenticated
  using (public.is_admin());

grant select on public.work_orders to authenticated;
-- INSERT/UPDATE deliberadamente NO se otorgan: solo las RPC
-- create_work_order / update_work_order_status (SECURITY DEFINER,
-- proxima tanda) pueden escribir esta tabla. Nunca se borra una orden.

-- -----------------------------------------------------------
-- work_order_services (snapshot historico, ver AGENT.md seccion 45)
-- -----------------------------------------------------------

create table public.work_order_services (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders (id) on delete cascade,
  service_id uuid references public.services (id) on delete set null,
  title_snapshot text not null,
  description_snapshot text,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  subtotal numeric(12,2) not null check (subtotal >= 0)
);

create index work_order_services_work_order_id_idx
  on public.work_order_services (work_order_id);

alter table public.work_order_services enable row level security;

create policy "admin_select_work_order_services"
  on public.work_order_services for select
  to authenticated
  using (public.is_admin());

grant select on public.work_order_services to authenticated;
-- INSERT solo via create_work_order RPC.

-- -----------------------------------------------------------
-- work_order_inventory_items (snapshot historico)
-- -----------------------------------------------------------

create table public.work_order_inventory_items (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders (id) on delete cascade,
  inventory_item_id uuid references public.inventory_items (id) on delete set null,
  name_snapshot text not null,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  consumed_at timestamptz
);

create index work_order_inventory_items_work_order_id_idx
  on public.work_order_inventory_items (work_order_id);
create index work_order_inventory_items_inventory_item_id_idx
  on public.work_order_inventory_items (inventory_item_id);

alter table public.work_order_inventory_items enable row level security;

create policy "admin_select_work_order_inventory_items"
  on public.work_order_inventory_items for select
  to authenticated
  using (public.is_admin());

grant select on public.work_order_inventory_items to authenticated;
-- INSERT via create_work_order RPC; consumed_at se actualiza via
-- consume_work_order_inventory_item RPC.

-- -----------------------------------------------------------
-- work_order_photos (sin logica transaccional especial: insert directo)
-- -----------------------------------------------------------

create table public.work_order_photos (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders (id) on delete cascade,
  storage_path text not null,
  tipo text not null check (tipo in ('antes', 'durante', 'despues')),
  descripcion text,
  created_at timestamptz not null default now()
);

create index work_order_photos_work_order_id_idx
  on public.work_order_photos (work_order_id);

alter table public.work_order_photos enable row level security;

create policy "admin_full_access_work_order_photos"
  on public.work_order_photos for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on public.work_order_photos to authenticated;
