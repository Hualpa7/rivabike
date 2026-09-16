-- ===========================================================
-- Fix: agregar campo code al JSONB de get_work_order_detail.
-- La columna code se agrego en la migracion anterior pero
-- esta funcion nunca fue actualizada, causando undefined.M_ID
-- en el frontend al guardar observaciones.
-- ===========================================================

CREATE OR REPLACE FUNCTION public.get_work_order_detail(p_work_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT private.is_admin() THEN
    RAISE EXCEPTION 'No autorizado' USING errcode = '42501';
  END IF;

  SELECT jsonb_build_object(
    'id', wo.id,
    'code', wo.code,
    'customer_id', wo.customer_id,
    'bicycle_id', wo.bicycle_id,
    'fecha_estimada_entrega', wo.fecha_estimada_entrega,
    'observaciones', wo.observaciones,
    'estado', wo.estado,
    'total', wo.total,
    'created_at', wo.created_at,
    'updated_at', wo.updated_at,
    'created_by', wo.created_by,
    'customer', to_jsonb(c.*),
    'bicycle', to_jsonb(b.*),
    'services', coalesce((
      SELECT jsonb_agg(to_jsonb(wos.*) ORDER BY wos.id)
      FROM public.work_order_services wos
      WHERE wos.work_order_id = wo.id
    ), '[]'::jsonb),
    'inventoryItems', coalesce((
      SELECT jsonb_agg(to_jsonb(woi.*) ORDER BY woi.id)
      FROM public.work_order_inventory_items woi
      WHERE woi.work_order_id = wo.id
    ), '[]'::jsonb),
    'photos', coalesce((
      SELECT jsonb_agg(to_jsonb(p.*) ORDER BY p.created_at)
      FROM public.work_order_photos p
      WHERE p.work_order_id = wo.id
    ), '[]'::jsonb)
  )
  INTO v_result
  FROM public.work_orders wo
  JOIN public.customers c ON c.id = wo.customer_id
  JOIN public.bicycles b ON b.id = wo.bicycle_id
  WHERE wo.id = p_work_order_id;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Orden no encontrada: %', p_work_order_id;
  END IF;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_work_order_detail(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_work_order_detail(uuid) TO authenticated;
