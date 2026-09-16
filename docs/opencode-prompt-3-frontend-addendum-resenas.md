# Addendum · Frontend — Reseñas de clientes vía OAuth

> Este documento se lee **junto con** `docs/opencode-prompt-3-frontend.md`
> (el original). No lo reemplaza: agrega una feature nueva que no existía
> cuando se escribió el original, y **corrige un supuesto** de la sección
> de Auth que ya no es válido. Si la sesión de Frontend ya arrancó o
> avanzó contra el prompt original, este addendum es prioritario donde
> haya conflicto — en particular, todo lo referido a `useAuthStore` y a
> `ProtectedRoute`.

El backend de esta feature **ya está implementado y auditado en producción**
(no es especulativo): tablas `customer_reviews` / `customer_review_photos`,
bucket de Storage `customer-review-photos`, y 4 RPCs. El detalle exacto de
tipos/firmas está en la versión actualizada de `docs/data-contract.md` — este
documento asume que ya la leíste.

---

## 0. Corrección crítica: `useAuthStore` y `ProtectedRoute`

El prompt original (sección 7) definía:

```ts
{ session, user, status: 'loading' | 'authenticated' | 'unauthenticated', signIn, signOut }
```

y asumía implícitamente que `status === 'authenticated'` alcanzaba para
dejar pasar al `/dashboard`. **Eso ya no es correcto.** Ahora existen dos
identidades con sesión válida pero privilegios completamente distintos (ver
"Modelo de identidades" en `data-contract.md`): el staff, y cualquier
persona que dejó una reseña con Google/Facebook. Ambas tienen `status:
'authenticated'`.

`useAuthStore` pasa a ser:

```ts
{
  session: Session | null;
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isStaff: boolean; // true solo si existe fila propia en profiles
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'facebook') => Promise<void>;
  signOut: () => Promise<void>;
}
```

`isStaff` se resuelve consultando la propia fila en `profiles`
(`select role from profiles where id = auth.uid()`, protegido por la RLS
`select_own_profile` que ya existe) inmediatamente después de que cambia el
estado de auth. Si no hay fila, `isStaff = false` — no es un error, es el
caso esperado para cualquier usuario que solo dejó una reseña.

**`ProtectedRoute` (el que envuelve `/dashboard/*`) ahora es:**

```ts
if (status === 'loading') return <LoadingScreen />;
if (status !== 'authenticated' || !isStaff) return <Navigate to="/login" replace />;
return children;
```

No alcanza con "hay sesión". Esto es lo único que evita que alguien que
dejó una reseña con su Google vea el shell del dashboard (los datos ya
están bloqueados por RLS de todas formas, pero la UX correcta es no
mostrarle la navegación del dashboard en absoluto).

`signInWithOAuth` se implementa con:

```ts
await supabase.auth.signInWithOAuth({
  provider, // 'google' | 'facebook'
  options: { redirectTo: `${window.location.origin}/dejar-resena` },
});
```

No hace falta ninguna librería nueva para esto — es Supabase Auth nativo.

---

## 1. Ruta nueva

Agregar a la tabla de rutas del prompt original (sección 5):

```text
/dejar-resena                  → pública, requiere login (Google/Facebook) para interactuar
```

No va bajo `/dashboard`. Es una ruta pública independiente, linkeada desde
la sección "Opiniones" de la landing (ej. "¿Ya nos visitaste? Dejá tu
reseña").

## 2. Dashboard: nav con un link más

`DashboardShell` (sección 6.3 del original) pasa de 7 a 8 links: agregar
**"Reseñas"** → `/dashboard/resenas`. Mismo tratamiento visual que el
resto (sidebar desktop + bottom-bar drawer mobile).

## 3. Página pública `/dejar-resena`

No hay mockup de OpenDesign para esta pantalla — es nueva, hay que
diseñarla siguiendo el mismo lenguaje visual del resto del sitio (tokens de
la sección 3 del prompt original: mismos colores, tipografía, radios,
`Modal` reutilizado donde aplique). Comportamiento esperado:

**Sin sesión**: pantalla simple — texto breve explicando qué es, y dos
botones grandes: "Continuar con Google" / "Continuar con Facebook"
(`signInWithOAuth`). Sin formulario de email/password acá — esta puerta es
exclusivamente OAuth, el login de staff sigue siendo `/login`.

**Con sesión** (`status === 'authenticated'`, sin importar `isStaff` — un
miembro del staff que use su Google personal también puede dejar una
reseña, no hay restricción):

* **"Mis reseñas"**: lista desde `useMyCustomerReviews()`. Cada card
  muestra `nombre_visible`, estrellas, texto, fotos (si tiene), y un
  `CustomerReviewStatusBadge` (componente nuevo en `components/dashboard/`
  o `components/reviews/` según convenga — 3 variantes: `pendiente`
  neutro, `aprobada` verde, `rechazada` rojo con el `motivo_rechazo`
  visible debajo en un bloque tipo nota/alerta).
  * `pendiente` o `rechazada` → botón "Editar" (abre el formulario
    precargado, usa `useUpdateCustomerReview()`).
  * `rechazada` → el `motivo_rechazo` se muestra siempre, no solo al
    editar, para que quede claro por qué sin tener que entrar a editar.
  * `aprobada` → solo lectura, sin botón de editar (el backend lo
    rechazaría igual, pero no tiene sentido mostrar el botón).
* **Botón "Escribir nueva reseña"**: abre el formulario vacío. Si el
  usuario ya tiene 5 `pendiente`, el botón se deshabilita con un mensaje
  ("Ya tenés 5 reseñas esperando revisión — esperá a que se revisen antes
  de escribir otra"). Este chequeo es solo de UX; el backend igual lo
  valida y puede rechazar si hay una condición de carrera.
* **Formulario** (mismo componente para crear y editar):
  * Nombre visible: input de texto, precargado con el nombre que vino de
    Google/Facebook (`user.user_metadata.full_name` o similar) pero
    editable.
  * Puntaje: componente nuevo `StarRatingInput` (`components/ui/`) — 5
    estrellas clicables/con teclado (`role="radiogroup"`, cada estrella
    `role="radio"`, navegable con flechas, `aria-label` tipo "3 de 5
    estrellas"). No existe en los mockups porque ahí las estrellas son
    siempre de solo lectura — este es el primer input interactivo de
    rating del proyecto.
  * Texto: `textarea` con contador visible "247/500" que se actualiza en
    vivo, y bloqueo real de escritura pasado el límite (no solo aviso).
  * Fotos: hasta 4, con preview antes de guardar y botón para quitar cada
    una. Al llegar a 4, el selector de archivos se deshabilita. **Detalle
    no obvio**: el path de subida a Storage tiene que ser
    `customer-review-photos/{auth.uid()}/{nombre-archivo}` — la política
    de Storage exige que el primer segmento de la carpeta sea el
    `user_id` del usuario autenticado, o el upload se rechaza.
  * Validación con `react-hook-form` + `zod`
    (`schemas/customer-review.schema.ts`): `rating` 1-5, `texto` no vacío
    y ≤500 caracteres, `nombre_visible` no vacío.
  * Guardar → `useCreateCustomerReview()` o `useUpdateCustomerReview()`
    según corresponda, seguido de la subida de fotos si hay nuevas
    (`useUploadCustomerReviewPhoto()` una vez creada/actualizada la
    reseña, ya que la foto necesita el `review_id`).
* Botón de **cerrar sesión** visible en esta pantalla también (es sesión
  real, aunque no sea de staff).

## 4. Dashboard · Reseñas de clientes (moderación) — `/dashboard/resenas`

Tampoco hay mockup — nueva pantalla, mismo lenguaje visual que el resto del
dashboard (cards, tabla en desktop/cards en mobile como el resto).

* **Tabs/filtro**: Pendientes (default) / Aprobadas / Rechazadas, usando
  `useCustomerReviewsAdmin({ estado })`.
* Cada fila: `nombre_visible`, estrellas, texto completo, miniaturas de
  fotos (click para ampliar en un `Modal` simple), fecha de creación.
* **En pendientes**:
  * Botón "Aprobar" → `useModerateCustomerReview()` con
    `newEstado: 'aprobada'`. Si el backend rechaza por el límite de 3
    aprobadas de ese usuario, mostrar el mensaje de error tal cual lo
    devuelve (ya viene en español y es claro: "Este cliente ya tiene 3
    reseñas aprobadas...").
  * Botón "Rechazar" → abre un `Modal` (reusar el componente de la
    sección 6.12 del prompt original) pidiendo el motivo en un
    `textarea`, obligatorio antes de habilitar el botón de confirmar —
    el backend también lo exige, pero no tiene sentido dejar que el
    admin intente sin motivo.
* **En aprobadas/rechazadas**: botón "Eliminar" (con confirmación —
  reusar el patrón de confirmación ya establecido en el proyecto, ej. el
  modal "¿Guardar la orden?" del mockup de dashboard). Al confirmar,
  `useDeleteCustomerReviewAdmin()` devuelve `storagePaths`; el hook debe
  encadenar automáticamente
  `supabase.storage.from('customer-review-photos').remove(storagePaths)`
  después de que la mutación de borrado en base resuelva OK — si esto
  falla, no revertir el borrado de la reseña (ya se borró en base, es
  irreversible), solo loguear el error de limpieza de Storage para que no
  quede huérfano silenciosamente sin que nadie se entere.

## 5. Landing: sección "Opiniones" actualizada

La sección `Opiniones` (punto 4 de la sección 6.2 del prompt original) deja
de alimentarse solo de `useGoogleReviews()`: ahora combina esa fuente con
`useApprovedCustomerReviews()`. Decisión de presentación (libre para la
sesión, no hay mockup): se pueden mostrar intercalados, o Google primero y
después las propias — lo único no negociable es que ambas fuentes
aparezcan, ya que es el pedido explícito original ("que esas reseñas junto
con las de Google puedan aparecer en la sección de puntuaciones"). Si
`useApprovedCustomerReviews()` devuelve vacío, no romper el layout — la
sección ya maneja el caso de Google en 0 reseñas, aplicar el mismo criterio.

## 6. Librerías

Ninguna nueva. OAuth es Supabase Auth nativo (`signInWithOAuth`), el
input de estrellas se construye con botones/SVG propios (mismo criterio
anti-dependencias del prompt original, sección 9), el contador de
caracteres es JS plano.

## 7. Definición de terminado (suma a la del prompt original)

* [ ] `useAuthStore` expone `isStaff`; `ProtectedRoute` de `/dashboard/*`
      chequea `isStaff`, no solo `status`.
* [ ] `/dejar-resena` funciona sin sesión (botones OAuth) y con sesión
      (form + lista de "Mis reseñas").
* [ ] Un usuario con 5 reseñas `pendiente` no puede crear una 6ta desde la
      UI (botón deshabilitado) y, si de todas formas llega la request, el
      error del backend se muestra legible.
* [ ] Una reseña `aprobada` no muestra botón de editar.
* [ ] Una reseña `rechazada` muestra el `motivo_rechazo` siempre visible.
* [ ] El formulario de reseña bloquea la escritura pasado el carácter 500,
      no solo avisa.
* [ ] La subida de fotos respeta el límite visual de 4 y usa el path
      `{auth.uid()}/{archivo}`.
* [ ] `/dashboard/resenas` exige motivo para rechazar antes de habilitar
      el botón de confirmar.
* [ ] Eliminar una reseña desde el dashboard también limpia sus fotos en
      Storage, no solo en la base.
* [ ] La sección "Opiniones" de la landing muestra reseñas de Google y
      reseñas propias aprobadas, ninguna de las dos fuentes rota el layout
      si viene vacía.
