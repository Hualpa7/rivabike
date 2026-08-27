# Prompt 1 / 2 — Puesta en marcha del scaffold y landing base (Fase 1)

> Pegar este prompt completo a OpenCode dentro del repo clonado (o pasarle
> el repo + este archivo). Es la Fase 1 de `docs/AGENT.md` sección 69.

---

Actuás como arquitecto de software senior y desarrollador Full Stack
React + Supabase, especialista en UX/UI, sobre el repositorio **rivabike**
(`https://github.com/Hualpa7/rivabike`, privado).

## Contexto que ya existe en el repo

El repo YA tiene un scaffold inicial creado (no lo regeneres desde cero,
inspecciónalo primero):

* Vite + React 18 + TypeScript estricto, Tailwind, ESLint.
* Dependencias base instaladas en `package.json`: `@supabase/supabase-js`,
  `react-router-dom`, `react-hook-form`, `zod`, `@hookform/resolvers`,
  `motion`, `@tanstack/react-query`, **`zustand`**.
* Estructura de carpetas `src/app`, `src/components`, `src/features`,
  `src/hooks`, `src/lib`, `src/pages`, `src/types`, `src/schemas`,
  `src/styles` (ver `docs/AGENT.md` sección 6).
* Cliente de Supabase en `src/lib/supabase/client.ts`.
* Store de sesión con **Zustand** en `src/features/auth/store/authStore.ts`
  + `AuthProvider` que lo sincroniza con `supabase.auth`.
* Router con ruta pública (`/`, `/login`) y ruta protegida (`/dashboard`,
  vía `ProtectedRoute` que redirige a `/login` si no hay sesión — esto es
  solo UX, la autorización real vendrá de RLS en la Fase 2).
* `tailwind.config.ts` con la paleta de marca: `ink` (#0A0A0A), `paper`
  (#FFFFFF), `pink` (#EF7D97) / `pink.deep` (#E8546F).
* `docs/AGENT.md` — especificación funcional/técnica completa (fuente de
  verdad para TODO el proyecto, no solo esta fase).
* `docs/design-references.md` — decisiones de diseño derivadas de dos
  referencias de Figma (no accesibles para vos): traduce esas referencias
  a tokens, layout y patrones concretos. Es lo que tenés que seguir para
  el Hero y el resto de la landing; **no inventes una estética distinta**.

## Reglas no negociables (repetidas de `docs/AGENT.md`, para que no se
pierdan aunque no leas el documento completo)

1. Package manager: **pnpm únicamente**. Nunca `npm install` ni `yarn add`.
2. TypeScript estricto (`strict: true`, ya configurado). No usar `any`
   salvo justificación explícita en comentario.
3. Estado: **TanStack Query** para todo dato remoto (Supabase). **Zustand**
   para estado de cliente/UI compartido (sesión, wizards, filtros). Nada de
   Redux, nada de Context ad-hoc para esto. No uses `localStorage` /
   `sessionStorage` para nada crítico (la sesión ya la persiste Supabase).
4. Estilos: Tailwind para todo lo estructural. CSS plano solo para casos
   puntuales (animaciones específicas, variables globales).
5. Animaciones con `motion` (Framer Motion), sutiles, respetando
   `prefers-reduced-motion` (ya hay una regla global en `src/index.css`).
6. **Mobile-first de verdad**: diseñá y probá primero en viewport angosto
   (~375–414px), después expandí a tablet/desktop. El uso real de esta app
   va a ser mayormente desde celular.
7. Paleta: solo `ink` / `paper` / `pink` / `pink-deep` (+ opacidades de
   `ink` para grises). No introduzcas otros colores de marca.
8. No hardcodees textos/datos que el AGENT.md marca como "deben venir de
   la base de datos" (ej. servicios) — para esta fase pueden ser mocks
   locales tipados, pero dejá el punto de integración claro (comentario
   `// TODO fase 2: reemplazar por useServices() con TanStack Query`).
9. Nunca pongas secretos ni la `service_role key` de Supabase en código de
   cliente ni en variables `VITE_*`.

## Qué tenés que hacer en esta fase

### 1. Verificación del scaffold

* Cloná el repo, `pnpm install`, copiá `.env.example` a `.env`.
* Si no tenés un proyecto de Supabase todavía, indicá al usuario los pasos
  para crear uno y completar `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_PUBLISHABLE_KEY` — no los inventes ni los dejes vacíos en
  el código.
* Corré `pnpm dev`, `pnpm typecheck` y `pnpm lint`; arreglá cualquier error
  antes de seguir.
* Revisá que `/` cargue la landing, `/login` la pantalla de login, y que
  navegar a `/dashboard` sin sesión redirija a `/login`.

### 2. Terminar la landing pública (Hero + secciones)

Seguí `docs/design-references.md` al pie de la letra para la estructura
visual. Resumen de lo que falta construir sobre lo ya scaffoldeado en
`src/pages/LandingPage.tsx` (podés mover partes a `src/components/landing/`
y `src/features/landing/` a medida que crezca):

* **Header/nav**: transparente sobre el Hero, sólido al hacer scroll
  (podés usar un `useState` + listener de scroll, o `motion`'s
  `useScroll`). Menú hamburguesa en mobile.
* **Hero**: imagen a sangre completa (usar un placeholder de bicicleta/
  taller con buen contraste para el texto — podés usar una imagen de stock
  libre de derechos por ahora, marcada claramente como placeholder),
  eyebrow, titular grande, doble CTA, animación de entrada sutil. El bloque
  de "rating" puede quedar como mock (`4.8/5 · 63 reseñas`) con un
  comentario `// TODO fase 6: reemplazar por datos reales de Google
  Places`.
* **Sección "Quiénes somos"** y **"Por qué elegirnos"**: patrón
  texto+imagen alternado.
* **"Cómo trabajamos"**: lista numerada en píldoras (4 pasos, ver
  `design-references.md`).
* **Servicios destacados**: 3–4 cards con datos **mockeados mediante un
  array tipado** en `src/features/services/mocks.ts` (mismo shape que
  tendrá la tabla `services` de la Fase 2: `id`, `titulo`, `descripcion`,
  `precio_base`, `activo`), para que enchufar TanStack Query después sea un
  cambio mínimo.
* **Reseñas**: sección con 3 testimonios mockeados (mismo criterio,
  `// TODO fase 6`).
* **Contacto**: formulario con `react-hook-form` + `zod` (validar nombre,
  teléfono, mensaje). El submit por ahora puede solo mostrar un estado de
  éxito local (sin persistir todavía) — dejalo listo para conectar a una
  tabla o a WhatsApp/email en una fase posterior.
* **Footer** oscuro con columnas de links, contacto y redes (datos del
  negocio también mockeados en `src/lib/config/business.ts` con un
  comentario `// TODO fase 7: mover a site_settings administrable`).

### 3. Login real

* Formulario de `/login` con `react-hook-form` + `zod`
  (`supabase.auth.signInWithPassword`), estados `loading` / `error` /
  `success`, mensajes de error genéricos (no filtrar si el error fue
  "usuario no existe" vs "contraseña incorrecta" — ver AGENT.md sección
  18, enumeración de usuarios).
* Flujo de "olvidé mi contraseña" (`resetPasswordForEmail`) y pantalla de
  actualización de contraseña.
* Logout desde el `DashboardLayout` (botón visible, limpia el store de
  Zustand y la sesión de Supabase).

### 4. Accesibilidad y calidad mínima

* Todo botón/link real (`<button>`/`<a>`), labels en todos los inputs,
  foco visible (ya hay una regla global, no la remuevas), `alt` en
  imágenes, jerarquía de `h1`–`h3` correcta.
* `prefers-reduced-motion` respetado en cualquier animación que agregues.
* `title`, meta description y Open Graph básicos en `index.html` (podés
  completarlos con copy real de Riva Bike).

## Definición de terminado para esta fase

Antes de dar por cerrada la Fase 1, verificá contra AGENT.md sección 72:
funcionalidad, seguridad (nada de secretos expuestos), validación
(Zod en los formularios), responsive (probado en mobile primero),
accesibilidad, manejo de errores, loading states, performance (sin
imágenes gigantes sin optimizar), e integridad de los mocks (shape
compatible con lo que va a devolver Supabase en la Fase 2).

No avances a Fase 2 (esquema de base de datos / RLS / módulos del
dashboard) sin confirmar esto — esa fase está en el **Prompt 2**
(`docs/opencode-prompt-2-full-application.md`).
