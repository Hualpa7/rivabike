-- ===========================================================
-- RPC: update_work_order_observaciones
-- Edita SOLO la columna observaciones de una orden de trabajo.
--
-- Sigue la arquitectura de seguridad existente: work_orders NO
-- tiene politica de UPDATE ni grant directo; todas las escrituras
-- pasan por RPCs SECURITY DEFINER que validan private.is_admin().
-- El trigger set_updated_at actualiza updated_at automaticamente.
-- Devuelve el detalle fresco reutilizando get_work_order_detail.
-- ===========================================================

create or replace function public.update_work_order_observaciones(
  p_work_order_id uuid,
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

  update public.work_orders
  set observaciones = p_observaciones
  where id = p_work_order_id;

  if not found then
    raise exception 'Orden no encontrada: %', p_work_order_id;
  end if;

  return public.get_work_order_detail(p_work_order_id);
end;
$$;

revoke all on function public.update_work_order_observaciones(uuid, text) from public;
grant execute on function public.update_work_order_observaciones(uuid, text) to authenticated;
