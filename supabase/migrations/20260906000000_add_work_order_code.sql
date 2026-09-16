-- ===========================================================
-- Agregar columna code a work_orders para codigos cortos
-- (OT-0001, OT-0002, etc.) en vez de usar el UUID.
-- ===========================================================

-- 1. Agregar columna (nullable primero para backfill)
ALTER TABLE public.work_orders ADD COLUMN code varchar(20);

-- 2. Backfill: asignar codigos secuenciales a ordenes existentes (CTE)
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM public.work_orders
)
UPDATE public.work_orders AS wo
SET code = 'OT-' || lpad(r.rn::text, 4, '0')
FROM ranked r
WHERE wo.id = r.id;

-- 3. Hacer NOT NULL y unico
ALTER TABLE public.work_orders ALTER COLUMN code SET NOT NULL;
ALTER TABLE public.work_orders ADD CONSTRAINT work_orders_code_unique UNIQUE (code);

-- 4. Secuencia para auto-generar el proximo codigo
CREATE SEQUENCE IF NOT EXISTS work_orders_code_seq START WITH 1001;

-- 5. Default para nuevas ordenes (las RPCs deben setear el code manualmente
--    usando la secuencia, pero esto es un fallback de seguridad)
ALTER TABLE public.work_orders ALTER COLUMN code SET DEFAULT 'OT-' || lpad(nextval('work_orders_code_seq')::text, 4, '0');
