-- ===========================================================
-- M2 - Presupuestos (quotation / quote)
-- Entidad independiente de work_orders. No admite fotos ni
-- cambios de estado; solo pendiente -> aceptado/rechazado.
-- Codigo de nomenclatura P-XXXX (incremental).
-- ===========================================================

-- -----------------------------------------------------------
-- presupuestos
-- -----------------------------------------------------------

create table if not exists public.presupuestos (
  id uuid primary key default gen_random_uuid(),
  code varchar(20) unique not null,
  customer_id uuid not null references public.customers (id),
  bicycle_id uuid not null references public.bicycles (id),
  observaciones text,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'aceptado', 'rechazado')),
  total numeric(12,2) not null default 0 check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references auth.users (id)
);

create sequence if not exists public.presupuestos_code_seq start with 1001;
alter table public.presupuestos
  alter column code set default 'P-' || lpad(nextval('public.presupuestos_code_seq')::text, 4, '0');

create index if not exists presupuestos_estado_idx on public.presupuestos (estado);
create index if not exists presupuestos_customer_id_idx on public.presupuestos (customer_id);
create index if not exists presupuestos_bicycle_id_idx on public.presupuestos (bicycle_id);

drop trigger if exists set_updated_at on public.presupuestos;
create trigger set_updated_at
  before update on public.presupuestos
  for each row execute function public.set_updated_at();

alter table public.presupuestos enable row level security;

drop policy if exists "admin_select_presupuestos" on public.presupuestos;
create policy "admin_select_presupuestos"
  on public.presupuestos for select
  to authenticated
  using (private.is_admin());

grant select on public.presupuestos to authenticated;
-- INSERT/UPDATE/DELETE solo via RPC (SECURITY DEFINER).

-- -----------------------------------------------------------
-- presupuesto_services (snapshot historico)
-- -----------------------------------------------------------

create table if not exists public.presupuesto_services (
  id uuid primary key default gen_random_uuid(),
  presupuesto_id uuid not null references public.presupuestos (id) on delete cascade,
  service_id uuid references public.services (id) on delete set null,
  title_snapshot text not null,
  description_snapshot text,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  subtotal numeric(12,2) not null check (subtotal >= 0)
);

create index if not exists presupuesto_services_presupuesto_id_idx
  on public.presupuesto_services (presupuesto_id);

alter table public.presupuesto_services enable row level security;

drop policy if exists "admin_select_presupuesto_services" on public.presupuesto_services;
create policy "admin_select_presupuesto_services"
  on public.presupuesto_services for select
  to authenticated
  using (private.is_admin());

grant select on public.presupuesto_services to authenticated;

-- -----------------------------------------------------------
-- presupuesto_inventory_items (snapshot historico; NO se consumen)
-- -----------------------------------------------------------

create table if not exists public.presupuesto_inventory_items (
  id uuid primary key default gen_random_uuid(),
  presupuesto_id uuid not null references public.presupuestos (id) on delete cascade,
  inventory_item_id uuid references public.inventory_items (id) on delete set null,
  name_snapshot text not null,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  subtotal numeric(12,2) not null check (subtotal >= 0)
);

create index if not exists presupuesto_inventory_items_presupuesto_id_idx
  on public.presupuesto_inventory_items (presupuesto_id);

alter table public.presupuesto_inventory_items enable row level security;

drop policy if exists "admin_select_presupuesto_inventory_items" on public.presupuesto_inventory_items;
create policy "admin_select_presupuesto_inventory_items"
  on public.presupuesto_inventory_items for select
  to authenticated
  using (private.is_admin());

grant select on public.presupuesto_inventory_items to authenticated;

-- -----------------------------------------------------------
-- helper: get_presupuesto_detail
-- -----------------------------------------------------------

create or replace function public.get_presupuesto_detail(p_presupuesto_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not private.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'id', p.id,
    'code', p.code,
    'customer_id', p.customer_id,
    'bicycle_id', p.bicycle_id,
    'observaciones', p.observaciones,
    'estado', p.estado,
    'total', p.total,
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'created_by', p.created_by,
    'customer', to_jsonb(c.*),
    'bicycle', to_jsonb(b.*),
    'services', coalesce((
      select jsonb_agg(to_jsonb(ps.*) order by ps.id)
      from public.presupuesto_services ps
      where ps.presupuesto_id = p.id
    ), '[]'::jsonb),
    'inventoryItems', coalesce((
      select jsonb_agg(to_jsonb(pi.*) order by pi.id)
      from public.presupuesto_inventory_items pi
      where pi.presupuesto_id = p.id
    ), '[]'::jsonb)
  )
  into v_result
  from public.presupuestos p
  join public.customers c on c.id = p.customer_id
  join public.bicycles b on b.id = p.bicycle_id
  where p.id = p_presupuesto_id;

  if v_result is null then
    raise exception 'Presupuesto no encontrado: %', p_presupuesto_id;
  end if;

  return v_result;
end;
$$;

revoke all on function public.get_presupuesto_detail(uuid) from public;
grant execute on function public.get_presupuesto_detail(uuid) to authenticated;

-- -----------------------------------------------------------
-- create_presupuesto (no descuenta stock; total se calcula aca)
-- -----------------------------------------------------------

create or replace function public.create_presupuesto(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer_id uuid;
  v_bicycle_id uuid;
  v_presupuesto_id uuid;
  v_service jsonb;
  v_item jsonb;
  v_total numeric(12,2) := 0;
  v_subtotal numeric(12,2);
begin
  if not private.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  if (payload->'customer'->>'id') is not null then
    v_customer_id := (payload->'customer'->>'id')::uuid;
    if not exists (select 1 from public.customers where id = v_customer_id) then
      raise exception 'Cliente no encontrado: %', v_customer_id;
    end if;
  else
    insert into public.customers (nombre, apellido, telefono, direccion)
    values (
      payload->'customer'->>'nombre',
      payload->'customer'->>'apellido',
      payload->'customer'->>'telefono',
      payload->'customer'->>'direccion'
    )
    returning id into v_customer_id;
  end if;

  if (payload->'bicycle'->>'id') is not null then
    v_bicycle_id := (payload->'bicycle'->>'id')::uuid;
    if not exists (
      select 1 from public.bicycles
      where id = v_bicycle_id and customer_id = v_customer_id
    ) then
      raise exception 'Bicicleta no encontrada para este cliente: %', v_bicycle_id;
    end if;
  else
    insert into public.bicycles (customer_id, marca, color)
    values (
      v_customer_id,
      payload->'bicycle'->>'marca',
      payload->'bicycle'->>'color'
    )
    returning id into v_bicycle_id;
  end if;

  if coalesce(jsonb_array_length(payload->'services'), 0) = 0
     and coalesce(jsonb_array_length(payload->'inventory_items'), 0) = 0 then
    raise exception 'El presupuesto debe tener al menos un servicio o repuesto';
  end if;

  insert into public.presupuestos (
    customer_id, bicycle_id, observaciones, estado, total, created_by
  ) values (
    v_customer_id, v_bicycle_id,
    payload->>'observaciones',
    'pendiente', 0, auth.uid()
  )
  returning id into v_presupuesto_id;

  for v_service in select * from jsonb_array_elements(coalesce(payload->'services', '[]'::jsonb))
  loop
    v_subtotal := (v_service->>'unit_price')::numeric * (v_service->>'quantity')::integer;
    insert into public.presupuesto_services (
      presupuesto_id, service_id, title_snapshot, description_snapshot,
      unit_price, quantity, subtotal
    ) values (
      v_presupuesto_id,
      nullif(v_service->>'service_id', '')::uuid,
      v_service->>'title_snapshot',
      v_service->>'description_snapshot',
      (v_service->>'unit_price')::numeric,
      (v_service->>'quantity')::integer,
      v_subtotal
    );
    v_total := v_total + v_subtotal;
  end loop;

  for v_item in select * from jsonb_array_elements(coalesce(payload->'inventory_items', '[]'::jsonb))
  loop
    v_subtotal := (v_item->>'unit_price')::numeric * (v_item->>'quantity')::integer;
    insert into public.presupuesto_inventory_items (
      presupuesto_id, inventory_item_id, name_snapshot,
      unit_price, quantity, subtotal
    ) values (
      v_presupuesto_id,
      nullif(v_item->>'inventory_item_id', '')::uuid,
      v_item->>'name_snapshot',
      (v_item->>'unit_price')::numeric,
      (v_item->>'quantity')::integer,
      v_subtotal
    );
    v_total := v_total + v_subtotal;
  end loop;

  update public.presupuestos set total = v_total where id = v_presupuesto_id;

  return public.get_presupuesto_detail(v_presupuesto_id);
end;
$$;

revoke all on function public.create_presupuesto(jsonb) from public;
grant execute on function public.create_presupuesto(jsonb) to authenticated;

-- -----------------------------------------------------------
-- update_presupuesto_observaciones
-- -----------------------------------------------------------

create or replace function public.update_presupuesto_observaciones(
  p_presupuesto_id uuid,
  p_observaciones text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  update public.presupuestos
  set observaciones = p_observaciones
  where id = p_presupuesto_id;

  if not found then
    raise exception 'Presupuesto no encontrado: %', p_presupuesto_id;
  end if;

  return public.get_presupuesto_detail(p_presupuesto_id);
end;
$$;

revoke all on function public.update_presupuesto_observaciones(uuid, text) from public;
grant execute on function public.update_presupuesto_observaciones(uuid, text) to authenticated;

-- -----------------------------------------------------------
-- update_presupuesto_estado (aceptar / rechazar)
-- -----------------------------------------------------------

create or replace function public.update_presupuesto_estado(
  p_presupuesto_id uuid,
  p_new_estado text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated public.presupuestos;
begin
  if not private.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  if p_new_estado not in ('pendiente', 'aceptado', 'rechazado') then
    raise exception 'Estado invalido: %', p_new_estado;
  end if;

  update public.presupuestos
  set estado = p_new_estado
  where id = p_presupuesto_id
  returning * into v_updated;

  if not found then
    raise exception 'Presupuesto no encontrado: %', p_presupuesto_id;
  end if;

  return to_jsonb(v_updated);
end;
$$;

revoke all on function public.update_presupuesto_estado(uuid, text) from public;
grant execute on function public.update_presupuesto_estado(uuid, text) to authenticated;

-- -----------------------------------------------------------
-- delete_presupuesto (cascada a line items)
-- -----------------------------------------------------------

create or replace function public.delete_presupuesto(p_presupuesto_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  delete from public.presupuestos where id = p_presupuesto_id;

  if not found then
    raise exception 'Presupuesto no encontrado: %', p_presupuesto_id;
  end if;
end;
$$;

revoke all on function public.delete_presupuesto(uuid) from public;
grant execute on function public.delete_presupuesto(uuid) to authenticated;