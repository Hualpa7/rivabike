-- rls_auto_enable tenía EXECUTE otorgado al pseudo-rol PUBLIC (herencia
-- implícita para todos los roles, incluido anon), por eso el revoke anterior
-- a anon/authenticated individualmente no alcanzó. Se revoca de PUBLIC.
revoke execute on function public.rls_auto_enable() from public;
