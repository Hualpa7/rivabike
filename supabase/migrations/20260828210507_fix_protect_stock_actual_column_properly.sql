-- Corrección: el REVOKE UPDATE(columna) anterior no funcionó porque el
-- GRANT original era a nivel de tabla completa (relacl), no por columna.
-- En Postgres, revocar un privilegio por columna no reduce un privilegio
-- ya otorgado a nivel de tabla: hay que revocar el UPDATE de tabla entera
-- y volver a otorgarlo solo en las columnas editables directamente.
-- stock_actual queda deliberadamente afuera: solo se modifica a través de
-- register_stock_movement() (SECURITY DEFINER, corre como owner de la
-- función, no se ve afectado por este grant).
revoke update on public.inventory_items from authenticated;
grant update (nombre, descripcion, precio_unitario, imagen_url, activo)
  on public.inventory_items to authenticated;
