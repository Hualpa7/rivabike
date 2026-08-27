# Prompt · Integración, hardening y cierre

> Requiere que `docs/opencode-prompt-2-backend.md` y
> `docs/opencode-prompt-3-frontend.md` ya estén terminados y verificados por
> separado. Esta sesión los une.

---

Actuás como arquitecto de software senior sobre el repositorio **rivabike**.
El backend (Supabase/RLS/RPCs) y el frontend (landing + dashboard sobre
mocks) ya existen por separado, construidos ambos contra
`docs/data-contract.md`. Tu trabajo es unirlos, endurecer la seguridad y
dejar el proyecto listo para producción — esto cubre lo que en
`docs/AGENT.md` era la Fase 8, más el paso de integración en sí.

## 1. Conectar el proyecto real

* Completar `.env` con `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`
  del proyecto de Supabase real (el que armó la sesión de Backend).
* Confirmar que `src/lib/supabase/types.ts` es el generado por esa sesión
  (no el placeholder), y que `src/lib/supabase/client.ts` usa
  `createClient<Database>()`.

## 2. Reemplazar mocks por datos reales

Para cada función en `src/features/<feature>/api/*.supabase.ts`:

* Implementarla contra Supabase (`supabase.from(...)` / `supabase.rpc(...)`)
  respetando **exactamente** la firma que ya definía `docs/data-contract.md`
  y que el mock correspondiente ya cumplía — así los hooks y los
  componentes que los consumen no deberían necesitar cambios.
* Si algo del contrato quedó implementado distinto en el backend real
  (nombre de columna, forma de un JSON), ajustar acá el adaptador dentro de
  `*.supabase.ts`, no forzar un cambio en cadena por todo el frontend.
* Cuando todas las funciones de un feature estén reales, cambiar
  `VITE_USE_MOCKS` a `false` (dejarlo disponible como flag de desarrollo,
  no borrar los mocks — sirven para trabajar sin conexión o para tests).

## 3. QA funcional end-to-end

* Recorrer landing + dashboard completos con datos reales: loading, empty,
  error (probar cortando la conexión o forzando un error de RLS a
  propósito).
* Flujo completo de una orden (AGENT.md sección 37) de punta a punta en
  mobile: nueva orden → aceptar → ejecutar (con consumo real de stock) →
  terminar → generar ambos PDFs.
* Condiciones de carrera: dos movimientos de stock simultáneos sobre el
  mismo repuesto, confirmar que la RPC transaccional no genera stock
  inconsistente.

## 4. QA de integridad histórica

* Modificar el precio o desactivar un servicio que ya esté usado en una
  orden existente y confirmar que la orden **no cambia** (sección 45).
* Mismo chequeo para repuestos.

## 5. QA de seguridad

Repasar la sección 59 de AGENT.md **con el usuario real**, en dos sesiones
de navegador: una autenticada como superadmin, otra sin sesión (o con la
`anon key` sola vía curl/Postman) — confirmando que ningún endpoint privado
responde datos ni acepta escrituras sin la autorización correcta. Revisar
Security Advisor y Performance Advisor de Supabase (sección 58).

## 6. Performance, accesibilidad, SEO (antigua Fase 8)

* Code splitting de rutas privadas vs públicas (`React.lazy` donde
  corresponda), imágenes optimizadas.
* Pasada de teclado + lector de pantalla sobre landing y dashboard
  (sección 52).
* `title`/meta description/Open Graph/headings/alt text revisados con
  contenido real, no placeholder (sección 53).
* Lighthouse mobile como referencia mínima de performance.

## 7. Testing

* Tests unitarios y de validación con foco en reglas de stock y de
  permisos/RLS (sección 71) — estos son los que más valor tienen porque
  cubren dinero e inventario real.

## Definición de terminado (cierre del proyecto)

Para cada módulo (landing, auth, servicios, inventario, órdenes, galería,
configuración, PDFs, Maps/Reviews), confirmar el checklist completo de
AGENT.md sección 72 —funcionalidad, seguridad, validación, responsive,
accesibilidad, manejo de errores, loading states, performance, RLS,
storage, integridad de datos— antes de considerar a Riva Bike lista para
que el dueño del taller la use en producción.
