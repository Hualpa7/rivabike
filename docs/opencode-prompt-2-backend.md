# Prompt · Backend (Supabase / PostgreSQL)

> Sesión de OpenCode dedicada **solo a Supabase**. Se puede correr en
> paralelo con `docs/opencode-prompt-3-frontend.md` (sesión distinta), ya
> que ambas se construyen contra `docs/data-contract.md`. Requiere que
> `docs/opencode-prompt-1-project-setup.md` ya esté aplicado (repo
> scaffoldeado, aunque no hace falta que la landing esté terminada).

---

Actuás como arquitecto de base de datos / backend sobre Supabase +
PostgreSQL para el repositorio **rivabike**. Tu alcance en esta sesión es
**exclusivamente** infraestructura de datos: migraciones, RLS, Storage,
funciones/RPCs y Edge Functions. **No edites nada bajo `src/`**, con una
sola excepción al final (ver paso 6).

Fuente de verdad de reglas de negocio: `docs/AGENT.md` (secciones 16–22,
24–28, 29–38, 42–46, 55, 58–61, 70–71). Fuente de la forma exacta de cada
tabla/función: `docs/data-contract.md` — implementá exactamente esas
entidades y esas firmas de RPC, no una versión "parecida".

## Reglas no negociables

* RLS **siempre** activada en toda tabla nueva expuesta a la Data API.
  Ninguna tabla queda accesible por default (AGENT.md sección 20).
* Ninguna operación de escritura sensible (stock, cambios de estado de
  orden) se resuelve con un `UPDATE` directo desde el cliente — todo pasa
  por las RPCs del contrato, transaccionales y atómicas.
* Funciones `SECURITY DEFINER` solo cuando sea necesario, con
  `search_path = ''`, nombres de esquema completos, y grants mínimos
  (sección 21).
* Toda migración va versionada en `supabase/migrations/`, nunca cambios
  sueltos hechos a mano en el dashboard de Supabase (sección 44, 70).
* Nombres en `snake_case`, sin ambigüedad (sección 70).
* Nunca expongas la `service_role key` en ningún archivo del repo.

## Qué construir

### 1. Esquema y roles

* Migración inicial con todas las tablas de `docs/data-contract.md`
  (`services`, `inventory_items`, `service_inventory_items`,
  `stock_movements`, `customers`, `bicycles`, `work_orders`,
  `work_order_services`, `work_order_inventory_items`,
  `work_order_photos`, `gallery_items`, `gallery_images`,
  `site_settings`), con PK/FK/UNIQUE/CHECK constraints e índices donde
  correspondan (secciones 42–43).
* `profiles` con un campo `role` (`superadmin` por ahora, pero el `enum` o
  `check` debe admitir `admin` / `empleado` a futuro sin migrar de nuevo —
  sección 17). Trigger en `auth.users` que cree el `profile` correspondiente.
* `work_orders.estado` como `enum` o `check constraint` con los 5 valores
  del contrato — nunca string libre (sección 30).
* `site_settings`: fila única (o tabla clave-valor) — es toda información
  pública del negocio (sección 56), sin datos sensibles.

### 2. RLS

* Público (`anon`, solo `SELECT`): `services` donde `activo = true`,
  `gallery_items`/`gallery_images` donde `publicado = true`,
  `site_settings` completa.
* Todo lo demás: solo `authenticated` **y** cuyo `profiles.role` sea
  administrativo — nunca alcanza con `authenticated` a secas (sección 20,
  último párrafo).
* Repasá la sección 59 (preguntas de seguridad) para cada tabla antes de
  darla por terminada.

### 3. Storage

Buckets (sección 22):

* `public-gallery` — público, `allowed_mime_types` restringido a
  imágenes, `file_size_limit` razonable.
* `work-order-photos` — privado, RLS + acceso solo admin (URLs firmadas si
  hace falta mostrarlas fuera del dashboard).
* `inventory-images` — privado, solo admin.

Validar MIME/tamaño también a nivel de política, no confiar solo en la
extensión (sección 46).

### 4. RPCs (firma exacta en `docs/data-contract.md`)

Implementar como funciones de Postgres, transaccionales:

1. `register_stock_movement` — comprueba stock, calcula
   `stock_anterior`/`stock_posterior`, actualiza `inventory_items`, inserta
   en `stock_movements`, todo en una transacción. Rechaza stock negativo
   salvo que el `tipo` sea `ajuste` con una decisión explícita (documentar
   qué tipos lo permiten). Sección 26–27.
2. `create_work_order` — crea/reutiliza `customer` y `bicycle`, inserta la
   orden en estado `pendiente`, y los snapshots de servicios/repuestos.
   **No** descuenta stock acá (sección 38: no se consume al presupuestar).
   El `total` se calcula server-side, no se confía en lo que mande el
   cliente (sección 34).
3. `update_work_order_status` — valida la tabla de transiciones de
   `docs/data-contract.md` antes de aplicar el cambio; rechaza transiciones
   inválidas con un error claro.
4. `consume_work_order_inventory_item` — se usa durante `en_ejecucion`:
   llama internamente a la lógica de `register_stock_movement` con
   `tipo='consumo_trabajo'` y `work_order_id`, y marca `consumed_at` en el
   item de la orden para que no se pueda consumir dos veces.

### 5. Edge Function — Google Reviews

* Función `google-reviews` que llama a Places API (New) server-side con el
  `place_id` (desde `site_settings` o una env var de servidor) y una
  credencial que **no** sea `VITE_*` (Supabase secret), usando Field Masks
  para pedir solo lo necesario (sección 12, 55).
* Devuelve exactamente la forma de `GoogleReviewsSummary` del contrato.
* Agregar algún tipo de cache simple (ej. columna con timestamp de última
  consulta) para no pegarle a Google en cada carga de la landing.

### 6. Único cambio permitido en `src/`

Al terminar, correr:

```bash
supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts
```

y ajustar `src/lib/supabase/client.ts` para usar `createClient<Database>()`
con el tipo real (hoy usa el placeholder `Record<string, unknown>`). No
toques ningún otro archivo de `src/`.

## Definición de terminado

Antes de cerrar esta sesión, verificá — tabla por tabla y función por
función — la sección 59 completa de AGENT.md, y confirmá que
`docs/data-contract.md` quedó satisfecho al pie de la letra (mismos nombres,
mismos tipos, mismas firmas) para que la sesión de Frontend y la de
Integración no encuentren sorpresas.
