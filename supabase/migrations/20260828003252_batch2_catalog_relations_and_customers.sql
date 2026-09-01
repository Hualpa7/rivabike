-- ===========================================================
-- Tanda 2: service_inventory_items, customers, bicycles, gallery_items
-- ===========================================================

-- -----------------------------------------------------------
-- service_inventory_items (repuestos por defecto de un servicio)
-- -----------------------------------------------------------

create table public.service_inventory_items (
  service_id uuid not null references public.services (id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items (id) on delete cascade,
  cantidad integer not null check (cantidad > 0),
  primary key (service_id, inventory_item_id)
);

create index service_inventory_items_item_idx
  on public.service_inventory_items (inventory_item_id);

alter table public.service_inventory_items enable row level security;

create policy "admin_full_access_service_inventory_items"
  on public.service_inventory_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete
  on public.service_inventory_items to authenticated;

-- -----------------------------------------------------------
-- customers (privado)
-- -----------------------------------------------------------

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellido text not null,
  telefono text not null,
  direccion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_telefono_idx on public.customers (telefono);

create trigger set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

alter table public.customers enable row level security;

create policy "admin_full_access_customers"
  on public.customers for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on public.customers to authenticated;

-- -----------------------------------------------------------
-- bicycles (privado, depende de customers)
-- -----------------------------------------------------------

create table public.bicycles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  marca text not null,
  modelo text not null,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bicycles_customer_id_idx on public.bicycles (customer_id);

create trigger set_updated_at
  before update on public.bicycles
  for each row execute function public.set_updated_at();

alter table public.bicycles enable row level security;

create policy "admin_full_access_bicycles"
  on public.bicycles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on public.bicycles to authenticated;

-- -----------------------------------------------------------
-- gallery_items (publico si publicado = true)
-- -----------------------------------------------------------

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  categoria text,
  fecha date,
  orden integer not null default 0,
  publicado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index gallery_items_publicado_idx on public.gallery_items (publicado);

create trigger set_updated_at
  before update on public.gallery_items
  for each row execute function public.set_updated_at();

alter table public.gallery_items enable row level security;

create policy "public_read_published_gallery_items"
  on public.gallery_items for select
  to anon, authenticated
  using (publicado = true);

create policy "admin_full_access_gallery_items"
  on public.gallery_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.gallery_items to anon, authenticated;
grant insert, update, delete on public.gallery_items to authenticated;
