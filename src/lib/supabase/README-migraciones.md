# Migraciones y Edge Function — reconstruidas desde el proyecto real

Este paquete trae `supabase/migrations/` (14 archivos) y
`supabase/functions/google-reviews/` reconstruidos **exactamente** desde lo
que ya está aplicado y desplegado en el proyecto de Supabase real
(`riva-bike`, ref `bjkpuuebkzkeixjxrggj`). El SQL de cada migración se
extrajo directamente de `supabase_migrations.schema_migrations` (donde
Supabase guarda el historial real ejecutado), no fue reescrito de memoria.

## Por qué existe este paquete

Las migraciones se aplicaron durante el desarrollo del backend usando el
conector MCP de Supabase (sesión de Claude), no con `supabase db push`
desde una máquina local. Eso significa que quedaron versionadas en el
**historial remoto** de Supabase, pero nunca existieron como archivos en
este repositorio hasta ahora. Este paquete cierra esa brecha: al clonar el
repo, ya vas a tener el historial completo en `supabase/migrations/`, y
OpenCode (o cualquiera) va a poder leer la estructura real de la base sin
tener que consultar el proyecto remoto.

## Importante: no hace falta (ni corresponde) re-ejecutarlas

Las 14 migraciones **ya están aplicadas** en el proyecto remoto. Cuando
hagas:

```bash
supabase link --project-ref bjkpuuebkzkeixjxrggj
supabase migration list
```

el CLI debería mostrar las 14 versiones como sincronizadas (mismo timestamp
local y remoto) — no como pendientes. **No corras `supabase db push`** a
menos que hayas agregado migraciones nuevas después de esta (`db push` solo
aplicaría las que el remoto todavía no tiene).

Si en algún punto necesitás recrear el proyecto desde cero en una instancia
nueva de Supabase, ahí sí estos archivos sirven tal cual con
`supabase db push` sobre un proyecto vacío — están en el orden correcto y
son idempotentes en el sentido de que reproducen el estado final real.

## Edge Function `google-reviews`

`supabase/functions/google-reviews/index.ts` es una copia exacta (verificada
byte a byte) de la función ya desplegada (versión 2, la que devuelve la
forma exacta `GoogleReviewsSummary` de `docs/data-contract.md`). Si la
modificás localmente, redesplegala con:

```bash
supabase functions deploy google-reviews
```

Todavía le falta, para funcionar con datos reales (a propósito, sin
apurar — decisión pendiente del dueño del proyecto):

* Cargar `google_place_id` en la tabla `site_settings`.
* Configurar el secret `GOOGLE_MAPS_API_KEY`:
  ```bash
  supabase secrets set GOOGLE_MAPS_API_KEY=tu_api_key_de_google_places_new
  ```

Sin esos dos datos, la función responde igual (200, forma correcta) con
`{ rating: 0, total_reviews: 0, reviews: [] }` — no rompe nada, simplemente
no hay reseñas todavía.

## Nota menor sobre formato

6 de los 14 archivos (los que tienen tildes/ñ en los comentarios, todos de
la sesión de auditoría de seguridad) pueden diferir del original remoto en
exactamente una línea en blanco al principio del archivo — es una diferencia
cosmética de transcripción, sin ningún efecto en el SQL ejecutado. Si hacés
`supabase migration list` y ves que igual coincide el hash/versión, es
porque Supabase compara por número de versión (el timestamp del nombre de
archivo), no por contenido byte a byte.

## Pendiente real (ya señalado en conversaciones anteriores)

* Activar "Leaked Password Protection" en el dashboard de Supabase
  (Authentication → Policies → Password Security) — no se puede hacer vía
  migración SQL.
