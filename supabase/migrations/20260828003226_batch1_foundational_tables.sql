-- ===========================================================
-- Tanda 1: tablas fundacionales (sin dependencias entre si)
-- profiles, site_settings, services, inventory_items
-- ===========================================================

grant usage on schema public to anon, authenticated;

-- -----------------------------------------------------------
-- Utilidad reutilizable: set_updated_at (no depende de otras tablas)
-- -----------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------
-- profiles (primero, porque is_admin() depende de esta tabla)
-- -----------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'superadmin'
    check (role in ('superadmin', 'admin', 'empleado')),
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Alta automatica de perfil cuando se crea un usuario en auth.users.
-- Nota: por ahora todo usuario nuevo entra como 'superadmin' porque el
-- sistema solo admite altas manuales (sin registro publico, AGENT.md
-- seccion 17). Si en el futuro se crean cuentas de 'admin'/'empleado',
-- ajustar el role manualmente via SQL despues del alta.
create or replace function public.handle_new_user()
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "select_own_profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

grant select on public.profiles to authenticated;

-- Crear el profile del usuario que ya existe en auth.users (fue creado
-- antes de que este trigger existiera).
insert into public.profiles (id, role)
select id, 'superadmin' from auth.users
on conflict (id) do nothing;

-- -----------------------------------------------------------
-- Helper de autorizacion (ahora que profiles ya existe)
-- -----------------------------------------------------------

create or replace function public.is_admin()
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

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- -----------------------------------------------------------
-- site_settings (fila unica, toda informacion publica del negocio)
-- -----------------------------------------------------------

create table public.site_settings (
  id boolean primary key default true,
  nombre_negocio text not null default 'Riva Bike',
  logo_url text,
  telefono text,
  whatsapp text,
  direccion text,
  email text,
  horarios text,
  instagram text,
  facebook text,
  google_place_id text,
  google_maps_url text,
  descripcion text,
  hero_eyebrow text,
  hero_titulo text,
  hero_imagen_url text,
  updated_at timestamptz not null default now(),
  constraint site_settings_single_row check (id)
);

create trigger set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

insert into public.site_settings (id) values (true);

alter table public.site_settings enable row level security;

create policy "public_read_site_settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "admin_update_site_settings"
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;

-- -----------------------------------------------------------
-- services
-- -----------------------------------------------------------

create table public.services (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text not null default '',
  precio_base numeric(12,2) not null check (precio_base >= 0),
  activo boolean not null default true,
  imagen_url text,
  categoria text,
  orden integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index services_activo_idx on public.services (activo);

create trigger set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

alter table public.services enable row level security;

create policy "public_read_active_services"
  on public.services for select
  to anon, authenticated
  using (activo = true);

create policy "admin_full_access_services"
  on public.services for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated;

-- -----------------------------------------------------------
-- inventory_items (privado: no hay lectura publica de inventario)
-- -----------------------------------------------------------

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  stock_actual integer not null default 0 check (stock_actual >= 0),
  precio_unitario numeric(12,2) not null check (precio_unitario >= 0),
  imagen_url text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inventory_items_activo_idx on public.inventory_items (activo);

create trigger set_updated_at
  before update on public.inventory_items
  for each row execute function public.set_updated_at();

alter table public.inventory_items enable row level security;

create policy "admin_full_access_inventory_items"
  on public.inventory_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on public.inventory_items to authenticated;
