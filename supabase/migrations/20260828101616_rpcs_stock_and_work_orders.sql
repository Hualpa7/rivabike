-- ===========================================================
-- RPCs transaccionales (docs/data-contract.md)
-- ===========================================================

-- -----------------------------------------------------------
-- 1) register_stock_movement
-- 'cantidad' almacenado en stock_movements es siempre la MAGNITUD
-- (positiva). Para entrada/devolucion el delta es +cantidad; para
-- salida/consumo_trabajo el delta es -cantidad; para 'ajuste', el
-- parametro p_cantidad es un DELTA CON SIGNO (puede ser negativo).
-- Decision de negocio (AGENT.md seccion 27): nunca se permite que el
-- stock resultante quede negativo, ni siquiera con 'ajuste'.
-- -----------------------------------------------------------

create or replace function public.register_stock_movement(
  p_inventory_item_id uuid,
  p_tipo text,
  p_cantidad integer,
  p_motivo text default null,
  p_work_order_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_stock_anterior integer;
  v_stock_posterior integer;
  v_delta integer;
  v_cantidad_abs integer;
  v_movement public.stock_movements;
  v_item public.inventory_items;
begin
  if not private.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  if p_tipo not in ('entrada', 'salida', 'ajuste', 'consumo_trabajo', 'devolucion') then
    raise exception 'Tipo de movimiento invalido: %', p_tipo;
  end if;

  if p_tipo = 'consumo_trabajo' and p_work_order_id is null then
    raise exception 'consumo_trabajo requiere work_order_id';
  end if;

  if p_tipo in ('entrada', 'devolucion') then
    if p_cantidad <= 0 then
      raise exception 'La cantidad debe ser positiva para tipo %', p_tipo;
    end if;
    v_delta := p_cantidad;
  elsif p_tipo in ('salida', 'consumo_trabajo') then
    if p_cantidad <= 0 then
      raise exception 'La cantidad debe ser positiva para tipo %', p_tipo;
    end if;
    v_delta := -p_cantidad;
  else -- ajuste: delta con signo explicito
    if p_cantidad = 0 then
      raise exception 'La cantidad de un ajuste no puede ser cero';
    end if;
    v_delta := p_cantidad;
  end if;

  v_cantidad_abs := abs(v_delta);

  select stock_actual into v_stock_anterior
  from public.inventory_items
  where id = p_inventory_item_id
  for update;

  if not found then
    raise exception 'Repuesto no encontrado: %', p_inventory_item_id;
  end if;

  v_stock_posterior := v_stock_anterior + v_delta;

  if v_stock_posterior < 0 then
    raise exception 'Stock insuficiente: actual %, delta solicitado %', v_stock_anterior, v_delta
      using errcode = 'P0001';
  end if;

  update public.inventory_items
  set stock_actual = v_stock_posterior
  where id = p_inventory_item_id
  returning * into v_item;

  insert into public.stock_movements (
    inventory_item_id, tipo, cantidad, stock_anterior, stock_posterior,
    motivo, work_order_id, created_by
  ) values (
    p_inventory_item_id, p_tipo, v_cantidad_abs, v_stock_anterior, v_stock_posterior,
    p_motivo, p_work_order_id, auth.uid()
  )
  returning * into v_movement;

  return jsonb_build_object('movement', to_jsonb(v_movement), 'item', to_jsonb(v_item));
end;
$$;

revoke all on function public.register_stock_movement(uuid, text, integer, text, uuid) from public;
grant execute on function public.register_stock_movement(uuid, text, integer, text, uuid) to authenticated;

-- -----------------------------------------------------------
-- Helper: get_work_order_detail (usado por create_work_order y por
-- el hook useWorkOrder(id) desde el cliente)
-- -----------------------------------------------------------

create or replace function public.get_work_order_detail(p_work_order_id uuid)
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
    'id', wo.id,
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
      select jsonb_agg(to_jsonb(wos.*) order by wos.id)
      from public.work_order_services wos
      where wos.work_order_id = wo.id
    ), '[]'::jsonb),
    'inventoryItems', coalesce((
      select jsonb_agg(to_jsonb(woi.*) order by woi.id)
      from public.work_order_inventory_items woi
      where woi.work_order_id = wo.id
    ), '[]'::jsonb),
    'photos', coalesce((
      select jsonb_agg(to_jsonb(p.*) order by p.created_at)
      from public.work_order_photos p
      where p.work_order_id = wo.id
    ), '[]'::jsonb)
  )
  into v_result
  from public.work_orders wo
  join public.customers c on c.id = wo.customer_id
  join public.bicycles b on b.id = wo.bicycle_id
  where wo.id = p_work_order_id;

  if v_result is null then
    raise exception 'Orden no encontrada: %', p_work_order_id;
  end if;

  return v_result;
end;
$$;

revoke all on function public.get_work_order_detail(uuid) from public;
grant execute on function public.get_work_order_detail(uuid) to authenticated;

-- -----------------------------------------------------------
-- 2) create_work_order
-- No descuenta stock (seccion 38). El total se calcula aca, nunca se
-- confia en lo que mande el cliente (seccion 34).
-- -----------------------------------------------------------

create or replace function public.create_work_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer_id uuid;
  v_bicycle_id uuid;
  v_work_order_id uuid;
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
    insert into public.bicycles (customer_id, marca, modelo, color)
    values (
      v_customer_id,
      payload->'bicycle'->>'marca',
      payload->'bicycle'->>'modelo',
      payload->'bicycle'->>'color'
    )
    returning id into v_bicycle_id;
  end if;

  if coalesce(jsonb_array_length(payload->'services'), 0) = 0
     and coalesce(jsonb_array_length(payload->'inventory_items'), 0) = 0 then
    raise exception 'La orden debe tener al menos un servicio o repuesto';
  end if;

  insert into public.work_orders (
    customer_id, bicycle_id, fecha_estimada_entrega, observaciones,
    estado, total, created_by
  ) values (
    v_customer_id, v_bicycle_id,
    nullif(payload->>'fecha_estimada_entrega', '')::date,
    payload->>'observaciones',
    'pendiente', 0, auth.uid()
  )
  returning id into v_work_order_id;

  for v_service in select * from jsonb_array_elements(coalesce(payload->'services', '[]'::jsonb))
  loop
    v_subtotal := (v_service->>'unit_price')::numeric * (v_service->>'quantity')::integer;
    insert into public.work_order_services (
      work_order_id, service_id, title_snapshot, description_snapshot,
      unit_price, quantity, subtotal
    ) values (
      v_work_order_id,
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
    insert into public.work_order_inventory_items (
      work_order_id, inventory_item_id, name_snapshot,
      unit_price, quantity, subtotal
    ) values (
      v_work_order_id,
      nullif(v_item->>'inventory_item_id', '')::uuid,
      v_item->>'name_snapshot',
      (v_item->>'unit_price')::numeric,
      (v_item->>'quantity')::integer,
      v_subtotal
    );
    v_total := v_total + v_subtotal;
  end loop;

  update public.work_orders set total = v_total where id = v_work_order_id;

  return public.get_work_order_detail(v_work_order_id);
end;
$$;

revoke all on function public.create_work_order(jsonb) from public;
grant execute on function public.create_work_order(jsonb) to authenticated;

-- -----------------------------------------------------------
-- 3) update_work_order_status (valida transiciones, seccion 30)
-- -----------------------------------------------------------

create or replace function public.update_work_order_status(
  p_work_order_id uuid,
  p_new_status text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current_status text;
  v_valid boolean;
  v_updated public.work_orders;
begin
  if not private.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  select estado into v_current_status
  from public.work_orders
  where id = p_work_order_id
  for update;

  if not found then
    raise exception 'Orden no encontrada: %', p_work_order_id;
  end if;

  v_valid := (
    (v_current_status = 'pendiente' and p_new_status in ('aceptado', 'rechazado'))
    or (v_current_status = 'aceptado' and p_new_status = 'en_ejecucion')
    or (v_current_status = 'en_ejecucion' and p_new_status = 'terminado')
  );

  if not v_valid then
    raise exception 'Transicion invalida: % -> %', v_current_status, p_new_status
      using errcode = 'P0001';
  end if;

  update public.work_orders
  set estado = p_new_status
  where id = p_work_order_id
  returning * into v_updated;

  return to_jsonb(v_updated);
end;
$$;

revoke all on function public.update_work_order_status(uuid, text) from public;
grant execute on function public.update_work_order_status(uuid, text) to authenticated;

-- -----------------------------------------------------------
-- 4) consume_work_order_inventory_item (seccion 38: consumo real
-- durante en_ejecucion). Reutiliza register_stock_movement.
-- -----------------------------------------------------------

create or replace function public.consume_work_order_inventory_item(
  p_work_order_inventory_item_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_woi public.work_order_inventory_items;
  v_wo_estado text;
  v_stock_result jsonb;
  v_updated_woi public.work_order_inventory_items;
begin
  if not private.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  select * into v_woi
  from public.work_order_inventory_items
  where id = p_work_order_inventory_item_id
  for update;

  if not found then
    raise exception 'Item de orden no encontrado: %', p_work_order_inventory_item_id;
  end if;

  if v_woi.consumed_at is not null then
    raise exception 'Este repuesto ya fue consumido el %', v_woi.consumed_at;
  end if;

  if v_woi.inventory_item_id is null then
    raise exception 'Item ad-hoc sin repuesto de inventario vinculado, no hay stock que consumir';
  end if;

  select estado into v_wo_estado
  from public.work_orders
  where id = v_woi.work_order_id;

  if v_wo_estado <> 'en_ejecucion' then
    raise exception 'Solo se puede consumir stock con la orden en_ejecucion (estado actual: %)', v_wo_estado;
  end if;

  v_stock_result := public.register_stock_movement(
    v_woi.inventory_item_id,
    'consumo_trabajo',
    v_woi.quantity,
    'Consumo de orden de trabajo',
    v_woi.work_order_id
  );

  update public.work_order_inventory_items
  set consumed_at = now()
  where id = p_work_order_inventory_item_id
  returning * into v_updated_woi;

  return jsonb_build_object('item', to_jsonb(v_updated_woi), 'movement', v_stock_result->'movement');
end;
$$;

revoke all on function public.consume_work_order_inventory_item(uuid) from public;
grant execute on function public.consume_work_order_inventory_item(uuid) to authenticated;
