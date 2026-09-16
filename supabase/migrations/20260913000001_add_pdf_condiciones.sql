-- ===========================================================
-- Condiciones de los PDFs (órdenes de trabajo y presupuestos).
-- Una fila por tipo (singleton por tipo), con hasta 5 viñetas de
-- maximo 700 caracteres cada una. Se renderizan al final de cada
-- PDF según corresponda.
-- ===========================================================

create table if not exists public.pdf_condiciones (
  id uuid primary key default gen_random_uuid(),
  tipo text not null unique check (tipo in ('orden', 'presupuesto')),
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.pdf_condiciones;
create trigger set_updated_at
  before update on public.pdf_condiciones
  for each row execute function public.set_updated_at();

alter table public.pdf_condiciones enable row level security;

drop policy if exists "admin_select_pdf_condiciones" on public.pdf_condiciones;
create policy "admin_select_pdf_condiciones"
  on public.pdf_condiciones for select
  to authenticated
  using (private.is_admin());
-- INSERT/UPDATE/DELETE solo via RPC (SECURITY DEFINER).

-- Valores por defecto (los mismos que usa la app como fallback).
insert into public.pdf_condiciones (tipo, items) values
  ('orden', '[
    "Los precios pueden variar según el estado de la bicicleta al momento de la revisión. Repuestos no incluidos salvo que se indique lo contrario.",
    "A partir de la fecha de entrega de la bicicleta, la reparación cuenta con una garantía de 5 días sobre el trabajo realizado.",
    "La garantía cubre fallas directamente relacionadas con la tarea efectuada (mano de obra) y no aplica en casos de golpes, caídas, mal uso, manipulación por terceros ajenos al taller, desgaste normal de otras piezas no intervenidas, o repuestos provistos por el cliente.",
    "Para hacer efectiva la garantía, la bicicleta debe presentarse en el local junto con este comprobante."
  ]'::jsonb),
  ('presupuesto', '[
    "Este presupuesto no implica compromiso de compra. Los precios pueden variar según el estado de la bicicleta al momento de la revisión. La aceptación de este presupuesto da inicio a la orden de trabajo correspondiente y los repuestos quedan reservados por un plazo de 7 días corridos desde la fecha de emisión."
  ]'::jsonb)
on conflict (tipo) do nothing;

-- upsert_pdf_condiciones: valida tipo, cantidad (<= 5) y largo (1..700)
-- de cada viñeta antes de guardar.
create or replace function public.upsert_pdf_condiciones(
  p_tipo text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item text;
  v_tipo text;
begin
  if not private.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  v_tipo := lower(p_tipo);
  if v_tipo not in ('orden', 'presupuesto') then
    raise exception 'Tipo de condiciones invalido: %', v_tipo;
  end if;

  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'items debe ser un arreglo';
  end if;

  if jsonb_array_length(p_items) > 5 then
    raise exception 'Maximo 5 viñetas de condiciones';
  end if;

  for v_item in select * from jsonb_array_elements_text(p_items)
  loop
    if length(trim(v_item)) = 0 then
      raise exception 'Las viñetas no pueden quedar vacias';
    end if;
    if length(trim(v_item)) > 700 then
      raise exception 'Cada viñeta admite hasta 700 caracteres';
    end if;
  end loop;

  insert into public.pdf_condiciones (tipo, items)
  values (v_tipo, p_items)
  on conflict (tipo)
  do update set items = excluded.items
  returning to_jsonb(public.pdf_condiciones.*) into v_item;

  return v_item;
end;
$$;

revoke all on function public.upsert_pdf_condiciones(text, jsonb) from public;
grant execute on function public.upsert_pdf_condiciones(text, jsonb) to authenticated;