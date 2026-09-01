-- Problema (Security Advisor): funciones SECURITY DEFINER sensibles quedaron
-- ejecutables por el rol `anon`. El chequeo interno private.is_admin() ya las
-- protege, pero AGENT.MD (sección 21) exige no dejar funciones sensibles
-- ejecutables públicamente: se revoca a nivel de grant como defensa en profundidad.
-- `authenticated` SÍ debe conservar EXECUTE: es el rol con el que el propio
-- superadmin autenticado invoca estas RPCs desde el cliente; la autorización
-- real sigue validándose dentro de cada función vía private.is_admin().

revoke execute on function public.create_work_order(jsonb) from anon;
revoke execute on function public.update_work_order_status(uuid, text) from anon;
revoke execute on function public.register_stock_movement(uuid, text, integer, text, uuid) from anon;
revoke execute on function public.consume_work_order_inventory_item(uuid) from anon;
revoke execute on function public.get_work_order_detail(uuid) from anon;

-- rls_auto_enable es un callback interno de un event trigger (scaffolding de
-- Supabase para auto-activar RLS en tablas nuevas). Nadie debe invocarlo como
-- RPC vía /rest/v1/rpc/rls_auto_enable: se revoca de anon y authenticated.
revoke execute on function public.rls_auto_enable() from anon, authenticated;

-- Endurecer privilegios por defecto: las funciones que se creen de ahora en
-- más en el schema public ya NO heredan EXECUTE para anon automáticamente.
-- Si una función pública (ej. de lectura de catálogo) necesita ser llamada
-- por anon, habrá que otorgarlo explícitamente en su propia migración.
alter default privileges for role postgres in schema public
  revoke execute on functions from anon;
