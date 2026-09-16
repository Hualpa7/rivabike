-- ============================================================================
-- LIMPIEZA DE DATOS DE APP (Supabase real / produccion)
-- Pega este archivo completo en el SQL Editor de Supabase y ejecuta en orden.
-- Idempotente: los truncates de reseñas saltan si la tabla no existe (su
-- migracion no esta en el repo, se crearon directo en la DB).
--
-- Que hace:
--   1) (MANUAL, via Dashboard) Vaciar los buckets de datos de clientes.
--   2) Vacia las tablas de: servicios, inventario, ordenes de trabajo,
--      presupuestos, galeria, reseñas de clientes y historial de stock.
--   3) Restablece site_settings al contenido por defecto de la landing.
--   4) Conserva: profiles, service_categories, pdf_condiciones,
--      google_reviews_cache y los buckets de storage en si.
--   5) Reinicia las secuencias de codigo (P-1001 / OT-1001).
-- ============================================================================
--
-- PASO 1 (manual, ANTES de ejecutar este script): vaciar los buckets en el
-- Dashboard (Storage > cada bucket > seleccionar todo > Delete):
--   public-gallery, inventory-images, orden-fotos, work-order-photos,
--   customer-review-photos
-- Motivo: desde el SQL Editor (rol postgres, que no es dueño de
-- storage.objects) esta prohibido tanto el DELETE directo (trigger
-- storage.protect_delete() -> "Use the Storage API instead") como
-- deshabilitar ese trigger ("must be owner of table objects"). La UI del
-- Dashboard borra via Storage API, que si esta permitido.
-- ----------------------------------------------------------------------------

begin;

-- ----------------------------------------------------------------------------
-- 2) VACIAR TABLAS.
--    - TRUNCATE ... CASCADE cubre todas las FK (hijos -> padres).
--    - customer_reviews / customer_review_photos existen solo en la DB real
--      (su migracion no esta en el repo), por eso se limpian via DO/if exists.
-- ----------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.customer_review_photos') is not null then
    execute 'truncate table public.customer_review_photos cascade';
  end if;
  if to_regclass('public.customer_reviews') is not null then
    execute 'truncate table public.customer_reviews cascade';
  end if;
end $$;

truncate table
  public.presupuesto_inventory_items,
  public.presupuesto_services,
  public.presupuestos,
  public.gallery_images,
  public.gallery_items,
  public.stock_movements,
  public.work_order_photos,
  public.work_order_inventory_items,
  public.work_order_services,
  public.work_orders,
  public.service_inventory_items,
  public.inventory_items,
  public.services,
  public.customers,
  public.bicycles
cascade;

-- ----------------------------------------------------------------------------
-- 3) RESTABLECER site_settings al contenido por defecto de la landing.
--    Valores tomados de src/features/settings/api/settings.mock.ts.
-- ----------------------------------------------------------------------------

update public.site_settings
set
  nombre_negocio            = 'Riva Bike',
  logo_url                  = null,
  telefono                  = '+543878224212',
  whatsapp                  = '543878224212',
  direccion                 = 'Rivadavia 243, Hipólito Yrigoyen',
  email                     = 'hola@rivabike.com.ar',
  horarios                  = 'Lun a Vie · 8:30–13:00 y 16:30–20:30 · Sáb 8:30–13:00',
  instagram                 = 'rivabike',
  facebook                  = null,
  google_place_id           = null,
  google_maps_url           = 'https://maps.google.com/?q=Rivadavia+243+Hipolito+Yrigoyen',
  descripcion               = 'Taller de reparación, mantenimiento y servicio técnico de bicicletas en Hipólito Yrigoyen.',
  -- Imagen de fondo del hero servida desde el propio frontend (public/hero-cover.webp),
  -- generada a partir de la imagen anterior y convertida a webp (sin egress de
  -- Supabase ni de terceros). Reemplazable desde el dashboard por otro webp.
  hero_imagen_url           = '/hero-cover.webp',
  hero_eyebrow              = 'Taller · Servicio técnico',
  hero_titulo               = 'Tu bici, en las mejores manos.',
  about_titulo              = 'Sobre nosotros',
  about_descripcion         = 'Somos el taller de bicicletas de confianza de Hipólito Yrigoyen, comprometidos con el servicio técnico de calidad.',
  about_check_1             = 'Servicio técnico especializado',
  about_check_1_descripcion = 'Diagnóstico claro antes de tocar nada y ajustes que quedan como corresponde.',
  about_check_2             = 'Repuestos de calidad garantizada',
  about_check_2_descripcion = 'Entregamos cada bicicleta probada y te explicamos qué se hizo y por qué.',
  how_it_works_titulo       = '¿Cómo trabajamos?',
  how_it_works_subtitulo    = 'Un proceso simple y transparente',
  how_it_works_descripcion  = 'Contanos qué necesita tu bici y nos encargamos del resto, manteniéndote informado en cada paso.',
  how_we_work_paso1_titulo  = 'Contacto',
  how_we_work_paso1_descripcion = 'Nos contás el problema de tu bicicleta.',
  how_we_work_paso2_titulo  = 'Presupuesto',
  how_we_work_paso2_descripcion = 'Te pasamos precio y tiempo estimado sin compromiso.',
  how_we_work_paso3_titulo  = 'Reparación',
  how_we_work_paso3_descripcion = 'Reparamos tu bici con repuestos de calidad.',
  how_we_work_paso4_titulo  = 'Entrega',
  how_we_work_paso4_descripcion = 'Te avisamos cuando está lista para retirar.',
  reviews_titulo            = 'Lo que dicen nuestros clientes',
  reviews_subtitulo         = 'Opiniones reales de nuestra comunidad',
  services_titulo           = 'Nuestros servicios',
  services_subtitulo        = 'Todo lo que tu bicicleta necesita'
where id = true;

-- ----------------------------------------------------------------------------
-- 4) REINICIAR SECUENCIAS DE CODIGO (nuevo presupuesto arranca en P-1001,
--    nueva orden en OT-1001).
-- ----------------------------------------------------------------------------

alter sequence public.presupuestos_code_seq restart with 1001;
alter sequence public.work_orders_code_seq restart with 1001;

-- ----------------------------------------------------------------------------
-- 5) VERIFICACION (debe mostrar 0 filas donde corresponde).
-- ----------------------------------------------------------------------------

select 'services' as tabla, count(*) from public.services
union all select 'service_categories', count(*) from public.service_categories
union all select 'inventory_items', count(*) from public.inventory_items
union all select 'customers', count(*) from public.customers
union all select 'bicycles', count(*) from public.bicycles
union all select 'work_orders', count(*) from public.work_orders
union all select 'work_order_photos', count(*) from public.work_order_photos
union all select 'stock_movements', count(*) from public.stock_movements
union all select 'gallery_items', count(*) from public.gallery_items
union all select 'gallery_images', count(*) from public.gallery_images
union all select 'presupuestos', count(*) from public.presupuestos
union all select 'presupuesto_services', count(*) from public.presupuesto_services
union all select 'presupuesto_inventory_items', count(*) from public.presupuesto_inventory_items
union all select 'customer_reviews', count(*) from public.customer_reviews
union all select 'customer_review_photos', count(*) from public.customer_review_photos
union all select 'site_settings', count(*) from public.site_settings;

-- Objetos restantes por bucket (debe dar 0 en los 5 buckets limpiados via UI).
select bucket_id, count(*) as objetos
from storage.objects
where bucket_id in (
  'public-gallery', 'inventory-images', 'orden-fotos',
  'work-order-photos', 'customer-review-photos'
)
group by bucket_id
order by bucket_id;

commit;