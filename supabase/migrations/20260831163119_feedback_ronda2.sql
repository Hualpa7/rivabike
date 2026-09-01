-- ===========================================================
-- Feedback ronda 2 · Riva Bike dashboard
-- 1) services.plazo (plazo editable por servicio)
-- 2) gallery_images.tipo (antes / despues)
-- 3) gallery_items.check_1..4 (hasta 4 tildes por trabajo)
-- 4) service_categories FK -> on delete set null (permite borrar categoria)
-- 5) site_settings: descripciones de checks de la seccion "nosotros"
-- ===========================================================

-- -----------------------------------------------------------
-- 1) services.plazo
-- -----------------------------------------------------------
alter table public.services
  add column plazo text;

-- -----------------------------------------------------------
-- 2) gallery_images.tipo (antes / despues)
--    Se mantiene nullable para compatibilidad; la UI exige 1 de cada.
-- -----------------------------------------------------------
alter table public.gallery_images
  add column tipo text check (tipo in ('antes', 'despues'));

-- -----------------------------------------------------------
-- 3) gallery_items.check_1..4 (hasta 4 tildes por trabajo)
-- -----------------------------------------------------------
alter table public.gallery_items
  add column check_1 text,
  add column check_2 text,
  add column check_3 text,
  add column check_4 text;

-- -----------------------------------------------------------
-- 4) service_categories: FK on delete set null
--    Para poder borrar una categoria sin romper los servicios.
-- -----------------------------------------------------------
alter table public.services
  drop constraint services_categoria_id_fkey;

alter table public.services
  add constraint services_categoria_id_fkey
  foreign key (categoria_id) references public.service_categories (id)
  on delete set null;

-- -----------------------------------------------------------
-- 5) site_settings: descripciones de los checks de "nosotros"
-- -----------------------------------------------------------
alter table public.site_settings
  add column about_check_1_descripcion text,
  add column about_check_2_descripcion text;

-- Backfill con los textos actuales de la landing
update public.site_settings
set about_check_1_descripcion = coalesce(
      nullif(about_check_1_descripcion, ''),
      'No hacemos de todo: hacemos bicicletas. Por eso cada ajuste queda como corresponde.'
    ),
    about_check_2_descripcion = coalesce(
      nullif(about_check_2_descripcion, ''),
      'Entregamos cada bicicleta probada y te explicamos qué se hizo y por qué.'
    );
