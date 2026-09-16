-- ===========================================================
-- Seña / adelanto en órdenes de trabajo (solo work_orders).
-- La seña es un adelanto del cliente que se descuenta del total:
-- total = subtotal(servicios + repuestos) - senia.
-- ===========================================================

ALTER TABLE public.work_orders
  ADD COLUMN senia numeric(12,2) NOT NULL DEFAULT 0 CHECK (senia >= 0);

-- create_work_order reescrito: acepta "senia" en el payload y la
-- resta del total final. El resto de la logica no cambia.
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
  v_senia numeric(12,2) := 0;
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

  v_senia := GREATEST(COALESCE((payload->>'senia')::numeric, 0), 0);

  INSERT INTO public.work_orders (
    customer_id, bicycle_id, fecha_estimada_entrega, observaciones,
    estado, total, senia, created_by
  ) VALUES (
    v_customer_id, v_bicycle_id,
    NULLIF(payload->>'fecha_estimada_entrega', '')::date,
    payload->>'observaciones',
    'terminado', 0, v_senia, auth.uid()
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

  v_total := GREATEST(v_total - v_senia, 0);
  UPDATE public.work_orders SET total = v_total WHERE id = v_work_order_id;

  RETURN public.get_work_order_detail(v_work_order_id);
END;
$$;

REVOKE ALL ON FUNCTION public.create_work_order(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_work_order(jsonb) TO authenticated;

-- get_work_order_detail: tambien devuelve la senia.
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
    'senia', wo.senia,
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

-- update_work_order_senia: edita la senia de una orden y recalcula su
-- total a partir de los subtotales de servicios y repuestos.
CREATE OR REPLACE FUNCTION public.update_work_order_senia(
  p_work_order_id uuid,
  p_senia numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_senia numeric(12,2);
  v_total numeric(12,2);
  v_subtotal numeric(12,2);
  v_recalc numeric(12,2) := 0;
BEGIN
  IF NOT private.is_admin() THEN
    RAISE EXCEPTION 'No autorizado' USING errcode = '42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.work_orders WHERE id = p_work_order_id) THEN
    RAISE EXCEPTION 'Orden no encontrada: %', p_work_order_id;
  END IF;

  v_senia := GREATEST(COALESCE(p_senia, 0), 0);

  SELECT COALESCE(SUM(subtotal), 0)
  INTO v_subtotal
  FROM public.work_order_services
  WHERE work_order_id = p_work_order_id;
  v_recalc := v_recalc + v_subtotal;

  SELECT COALESCE(SUM(subtotal), 0)
  INTO v_subtotal
  FROM public.work_order_inventory_items
  WHERE work_order_id = p_work_order_id;
  v_recalc := v_recalc + v_subtotal;

  v_total := GREATEST(v_recalc - v_senia, 0);

  UPDATE public.work_orders
  SET senia = v_senia,
      total = v_total,
      updated_at = now()
  WHERE id = p_work_order_id;

  RETURN public.get_work_order_detail(p_work_order_id);
END;
$$;

REVOKE ALL ON FUNCTION public.update_work_order_senia(uuid, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_work_order_senia(uuid, numeric) TO authenticated;