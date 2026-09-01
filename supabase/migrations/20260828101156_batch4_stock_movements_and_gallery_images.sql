-- ===========================================================
-- Tanda 4: stock_movements, gallery_images
-- (ultima tanda de esquema; despues siguen Storage + RPCs)
-- ===========================================================

-- -----------------------------------------------------------
-- stock_movements (historial inmutable, ver AGENT.md seccion 26)
-- -----------------------------------------------------------

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items (id),
  tipo text not null
    check (tipo in ('entrada', 'salida', 'ajuste', 'consumo_trabajo', 'devolucion')),
  cantidad integer not null check (cantidad > 0),
  stock_anterior integer not null check (stock_anterior >= 0),
  stock_posterior integer not null check (stock_posterior >= 0),
  motivo text,
  work_order_id uuid references public.work_orders (id),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create index stock_movements_inventory_item_id_idx
  on public.stock_movements (inventory_item_id);
create index stock_movements_work_order_id_idx
  on public.stock_movements (work_order_id);
create index stock_movements_tipo_idx on public.stock_movements (tipo);
create index stock_movements_created_at_idx on public.stock_movements (created_at);

alter table public.stock_movements enable row level security;

create policy "admin_select_stock_movements"
  on public.stock_movements for select
  to authenticated
  using (public.is_admin());

grant select on public.stock_movements to authenticated;
-- INSERT solo via register_stock_movement RPC (proxima tanda). Nunca se
-- actualiza ni borra un movimiento: es historial inmutable.

-- -----------------------------------------------------------
-- gallery_images (publico si el gallery_item padre esta publicado)
-- -----------------------------------------------------------

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  gallery_item_id uuid not null references public.gallery_items (id) on delete cascade,
  storage_path text not null,
  orden integer not null default 0
);

create index gallery_images_gallery_item_id_idx
  on public.gallery_images (gallery_item_id);

alter table public.gallery_images enable row level security;

create policy "public_read_published_gallery_images"
  on public.gallery_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.gallery_items gi
      where gi.id = gallery_images.gallery_item_id
        and gi.publicado = true
    )
  );

create policy "admin_full_access_gallery_images"
  on public.gallery_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.gallery_images to anon, authenticated;
grant insert, update, delete on public.gallery_images to authenticated;
