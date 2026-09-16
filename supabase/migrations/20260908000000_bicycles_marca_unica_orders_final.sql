-- ===========================================================
-- M1 - Cambios de negocio sobre work_orders:
--   * se unifica marca+modelo: se elimina la columna modelo de bicycles
--   * las ordenes se crean directamente en estado 'terminado' (Lista),
--     sin flujo de cambios de estado
--   * los repuestos incluidos se consumen (descuento de stock) en el
--     mismo momento de crear la orden
--   * se eliminan las RPCs de cambio de estado y consumo manual
-- ===========================================================

-- 1. Bicicleta: eliminar modelo (la marca pasa a ser "marca y modelo", ej. "Venzo R29")
ALTER TABLE public.bicycles DROP COLUMN IF EXISTS modelo;

-- 2. Estado por defecto de las ordenes: directamente 'terminado'
ALTER TABLE public.work_orders ALTER COLUMN estado SET DEFAULT 'terminado';

-- 3. create_work_order reescrito: estado fijo 'terminado', consumo
--    inmediato de stock de los repuestos incluidos.
CREATE OR REPLACE FUNCTION public.create_work_order(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_customer_id uuid;
  v_bicycle_id uuid;
  v_work_order_id uuid;
  v_service jsonb;
  v_item jsonb;
  v_total numeric(12,2) := 0;
  v_subtotal numeric(12,2);
BEGIN
  IF NOT private.is_admin() THEN
    RAISE EXCEPTION 'No autorizado' USING errcode = '42501';
  END IF;

  IF (payload->'customer'->>'id') IS NOT NULL THEN
    v_customer_id := (payload->'customer'->>'id')::uuid;
    IF NOT EXISTS (SELECT 1 FROM public.customers WHERE id = v_customer_id) THEN
      RAISE EXCEPTION 'Cliente no encontrado: %', v_customer_id;
    END IF;
  ELSE
    INSERT INTO public.customers (nombre, apellido, telefono, direccion)
    VALUES (
      payload->'customer'->>'nombre',
      payload->'customer'->>'apellido',
      payload->'customer'->>'telefono',
      payload->'customer'->>'direccion'
    )
    RETURNING id INTO v_customer_id;
  END IF;

  IF (payload->'bicycle'->>'id') IS NOT NULL THEN
    v_bicycle_id := (payload->'bicycle'->>'id')::uuid;
    IF NOT EXISTS (
      SELECT 1 FROM public.bicycles
      WHERE id = v_bicycle_id AND customer_id = v_customer_id
    ) THEN
      RAISE EXCEPTION 'Bicicleta no encontrada para este cliente: %', v_bicycle_id;
    END IF;
  ELSE
    INSERT INTO public.bicycles (customer_id, marca, color)
    VALUES (
      v_customer_id,
      payload->'bicycle'->>'marca',
      payload->'bicycle'->>'color'
    )
    RETURNING id INTO v_bicycle_id;
  END IF;

  IF COALESCE(jsonb_array_length(payload->'services'), 0) = 0
     AND COALESCE(jsonb_array_length(payload->'inventory_items'), 0) = 0 THEN
    RAISE EXCEPTION 'La orden debe tener al menos un servicio o repuesto';
  END IF;

  INSERT INTO public.work_orders (
    customer_id, bicycle_id, fecha_estimada_entrega, observaciones,
    estado, total, created_by
  ) VALUES (
    v_customer_id, v_bicycle_id,
    NULLIF(payload->>'fecha_estimada_entrega', '')::date,
    payload->>'observaciones',
    'terminado', 0, auth.uid()
  )
  RETURNING id INTO v_work_order_id;

  FOR v_service IN SELECT * FROM jsonb_array_elements(COALESCE(payload->'services', '[]'::jsonb))
  LOOP
    v_subtotal := (v_service->>'unit_price')::numeric * (v_service->>'quantity')::integer;
    INSERT INTO public.work_order_services (
      work_order_id, service_id, title_snapshot, description_snapshot,
      unit_price, quantity, subtotal
    ) VALUES (
      v_work_order_id,
      NULLIF(v_service->>'service_id', '')::uuid,
      v_service->>'title_snapshot',
      v_service->>'description_snapshot',
      (v_service->>'unit_price')::numeric,
      (v_service->>'quantity')::integer,
      v_subtotal
    );
    v_total := v_total + v_subtotal;
  END LOOP;

  -- Consumo inmediato: los repuestos incluidos se descuentan al crear la orden.
  FOR v_item IN SELECT * FROM jsonb_array_elements(COALESCE(payload->'inventory_items', '[]'::jsonb))
  LOOP
    v_subtotal := (v_item->>'unit_price')::numeric * (v_item->>'quantity')::integer;

    INSERT INTO public.work_order_inventory_items (
      work_order_id, inventory_item_id, name_snapshot,
      unit_price, quantity, subtotal, consumed_at
    ) VALUES (
      v_work_order_id,
      NULLIF(v_item->>'inventory_item_id', '')::uuid,
      v_item->>'name_snapshot',
      (v_item->>'unit_price')::numeric,
      (v_item->>'quantity')::integer,
      v_subtotal,
      now()
    );

    IF (v_item->>'inventory_item_id') IS NOT NULL AND (v_item->>'inventory_item_id') <> '' THEN
      PERFORM public.register_stock_movement(
        (v_item->>'inventory_item_id')::uuid,
        'consumo_trabajo',
        (v_item->>'quantity')::integer,
        'Consumo de orden de trabajo',
        v_work_order_id
      );
    END IF;

    v_total := v_total + v_subtotal;
  END LOOP;

  UPDATE public.work_orders SET total = v_total WHERE id = v_work_order_id;

  RETURN public.get_work_order_detail(v_work_order_id);
END;
$$;

REVOKE ALL ON FUNCTION public.create_work_order(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_work_order(jsonb) TO authenticated;

-- 4. Se elimina todo lo relacionado con el cambio/consumo manual de estados.
DROP FUNCTION IF EXISTS public.update_work_order_status(uuid, text);
DROP FUNCTION IF EXISTS public.consume_work_order_inventory_item(uuid);