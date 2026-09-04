# Prompt maestro · Auditoría UI/UX, tema oscuro vino y navegación

> **Este documento reemplaza a `opencode-prompt-5-refinamiento-ui-tema.md` y
> `opencode-prompt-6-marca-navbar.md`.** Contiene todo lo de esos dos más
> una auditoría completa de jerarquía/contraste de la landing y el
> rediseño del tema oscuro. Pasale solo este archivo a opencode; los dos
> anteriores quedan obsoletos (podés borrarlos o dejarlos como historial).
> Sesión limitada a `src/` — no tocar Supabase ni `docs/data-contract.md`.

## 0. Orden de ejecución

Las secciones están ordenadas por dependencia — no saltear el orden:

1. **§1 Paleta del tema oscuro** — todo lo demás se apoya en estos tokens.
2. **§2 Refactor `useTheme` a Zustand** — necesario antes de §8 (dos
   toggles de tema en el dashboard).
3. **§3 Identidad de marca** (color fijo, logo, tagline).
4. **§4 Secciones con foto de fondo** — el fix principal de esta sesión.
5. **§5 Resto de `bg-ink` + `text-white` sueltos** (footer, menú móvil, etc).
6. **§6 Jerarquía tipográfica.**
7. **§7 Bugs sueltos encontrados** (`Button.tsx`, `shadow-soft`).
8. **§8 Navbar de la landing** (recolor + logo, misma funcionalidad).
9. **§9 Dashboard** (topbar + bottom nav).
10. **§10 Modal — botón cerrar.**
11. **§11 Microinteracciones en tarjetas.**
12. **§12 Checklist de responsive.**
13. **§13 Verificación final.**

---

## 1. Paleta del tema oscuro — de negro neutro a vino de marca

### Diagnóstico

Hoy `[data-theme='dark']` define `--paper: #111114` — un gris casi negro
sin relación con la marca. El pedido es que el modo oscuro se sienta
"morado bordo oscuro", como el navbar (`#2a0e1e`). Un negro plano
funciona en cualquier sitio; un oscuro con el matiz de la marca es lo que
hace que el modo oscuro se sienta diseñado a propósito y no como el
`prefers-color-scheme` por defecto del navegador.

### Paleta nueva

Reemplazá el bloque `:root` / `[data-theme='dark']` completo en
`src/index.css` por esto (mantiene los nombres de variable existentes,
así que **ningún componente necesita tocarse** por este cambio — todo lo
que usa `bg-paper`, `text-ink`, `text-muted`, `border-line`, `bg-surface`
hereda la paleta nueva automáticamente):

```css
:root {
  --ink: #0a0a0a;
  --paper: #ffffff;
  --pink: #ef7d97;
  --pink-deep: #e8546f;
  --gold: #f5c044;
  --surface-2: rgba(10, 10, 10, 0.04);
  --muted: rgba(10, 10, 10, 0.62);
  --border: rgba(10, 10, 10, 0.14);
  --accent-soft: rgba(232, 84, 111, 0.16);
  --shadow: 0 4px 24px rgba(10, 10, 10, 0.08);
  --scrim: rgba(10, 10, 10, 0.6);
  color-scheme: light;

  /* Fijos de marca — se declaran UNA sola vez acá y no se redeclaran en
     [data-theme='dark'], por eso nunca cambian con el tema. Los usan el
     navbar, el footer, el menú móvil full-screen y los chips sobre fotos. */
  --ink-fixed: #2a0e1e; /* vino de marca */
  --on-ink-fixed: #ffffff;
  --cream: #faf5f2;
  --photo-scrim: rgba(10, 10, 10, 0.72); /* velo sobre fondos fotográficos */
}

[data-theme='dark'] {
  --ink: #faf5f2; /* texto principal: crema cálido, no blanco puro — mismo
                      tono que --cream, coherencia con el logo */
  --paper: #1a0a13; /* fondo de página: vino-negro, MÁS oscuro que el
                        navbar (#2a0e1e) para que navbar/tarjetas se
                        sientan elevados sobre la página */
  --pink: #ef7d97;
  --pink-deep: #e8546f;
  --gold: #f5c044;
  --surface-2: rgba(239, 125, 151, 0.07); /* superficie alterna con
                        matiz rosado — no gris neutro */
  --muted: rgba(250, 245, 242, 0.64);
  --border: rgba(239, 125, 151, 0.2);
  --accent-soft: rgba(232, 84, 111, 0.24);
  --shadow: 0 4px 28px rgba(0, 0, 0, 0.55);
  --scrim: rgba(10, 3, 6, 0.72);
  color-scheme: dark;
  --photo-scrim: rgba(0, 0, 0, 0.82); /* más denso que en claro para que
                        la foto no lave el panel de encima */
}
```

Sumá los tokens fijos a `tailwind.config.ts` → `theme.extend.colors`:

```ts
colors: {
  ink: 'var(--ink)',
  paper: 'var(--paper)',
  pink: { DEFAULT: 'var(--pink)', deep: 'var(--pink-deep)' },
  surface: 'var(--surface-2)',
  muted: 'var(--muted)',
  line: 'var(--border)',
  gold: 'var(--gold)',
  'ink-fixed': 'var(--ink-fixed)',
  'on-ink-fixed': 'var(--on-ink-fixed)',
  cream: 'var(--cream)',
  'photo-scrim': 'var(--photo-scrim)',
},
```

**Por qué estos valores puntuales** (para que si algo no convence a
simple vista se pueda ajustar con criterio, no a ciegas):
- `--paper` oscuro (`#1a0a13`) comparte matiz con `--ink-fixed`
  (`#2a0e1e`) pero es más oscuro → jerarquía de elevación correcta:
  página < navbar/footer < tarjetas con foto.
- `--ink` oscuro pasa de `#f5f5f5` a `#faf5f2` (el mismo `--cream` del
  logo) — un blanco cálido en vez de neutro, para que el texto y la
  marca compartan un único "blanco de marca" en vez de dos casi-iguales
  pero distintos.
- `--surface-2` y `--border` oscuros pasan de lavados de blanco puro a
  lavados de `--pink` — las superficies alternas y los divisores del
  modo oscuro quedan con un matiz cálido coherente en vez de gris
  genérico.

---

## 2. Refactor de `useTheme` a Zustand

**Problema:** `src/hooks/useTheme.ts` guarda el estado en un `useState`
local a cada componente. La sección 9 pide un segundo `<ThemeToggle />`
en el dashboard (topbar, además del que ya existe en el sidebar) — con la
implementación actual quedarían desincronizados entre sí.

**Fix**, mismo patrón que `src/features/auth/store/authStore.ts`, mismo
nombre de export y misma firma pública (`{ theme, toggle, setTheme }`)
para que ningún otro archivo que llama `useTheme()` tenga que cambiar:

```ts
// src/hooks/useTheme.ts
import { create } from 'zustand';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'riva-theme';

function resolveInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* localStorage bloqueado: el tema sigue aplicandose en la sesion */
  }
}

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

/** Tema compartido entre toda la app (Zustand). Al ser un store unico,
 *  todos los <ThemeToggle /> montados a la vez quedan sincronizados. */
export const useTheme = create<ThemeState>((set, get) => ({
  theme: resolveInitialTheme(),
  toggle: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    set({ theme: next });
  },
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
}));
```

No hace falta tocar `index.html` (el script anti-FOUC sigue igual) ni
`ThemeToggle.tsx` (sigue llamando `useTheme()` igual que antes).

---

## 3. Identidad de marca — color fijo, logo, tagline

Ya cubierto por el token `--ink-fixed: #2a0e1e` del §1. Creá el logo
extraído tal cual del ejemplo de referencia:

`src/components/ui/icons/BrandMark.tsx`:

```tsx
interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 100 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx={24} cy={42} r={15} stroke="#faf5f2" strokeWidth={4} />
      <circle cx={70} cy={42} r={15} stroke="#ef7d97" strokeWidth={4} />
      <path
        d="M24 42 L46 14 L58 14 M46 14 L38 24 M70 42 L52 20"
        stroke="#ef7d97"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandWordmark() {
  return (
    <span className="leading-none">
      <span className="block text-[20px] font-black lowercase tracking-[0.5px] text-cream">
        riva
      </span>
      <span className="block text-[13px] font-black lowercase tracking-[4px] text-pink">
        bike
      </span>
    </span>
  );
}
```

Los dos colores del ícono (`#faf5f2` / `#ef7d97`) van **fijos**, no como
variables — el logo siempre vive sobre una superficie vino fija
(navbar/footer), no necesita reaccionar al tema claro/oscuro.

Tagline, para usar junto al logo en el navbar (§8), visible desde `md:`:

```tsx
<div className="hidden text-right leading-snug md:block">
  <p className="text-[10px] font-black uppercase tracking-[1.6px] text-cream">
    Tu libertad
  </p>
  <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-pink">
    sobre ruedas
  </p>
</div>
```

---

## 4. Secciones con foto de fondo — el fix principal

Afecta a **`Services.tsx`**, **`HowWeWork.tsx`** y **`Contact.tsx`** —
las tres secciones que el usuario señaló como las que pierden contraste
("la sección con los 4 puntos", "contacto", títulos sobre imagen). Las
tres comparten la misma arquitectura rota: una foto de fondo con un velo
oscuro encima (`bg-ink/XX`), y adentro una tarjeta o panel "de vidrio"
pensado para verse siempre claro (`bg-paper/95`) con texto oscuro normal
(`text-ink`, `text-muted`). El problema:

1. El velo (`bg-ink/70`, `bg-ink/72`, `bg-ink/75`) usa `--ink`, que en
   tema oscuro se invierte a casi blanco → la foto en vez de oscurecerse
   se lava/aclara.
2. El panel (`bg-paper/95`) usa `--paper`, que en tema oscuro también se
   invierte a oscuro → el panel deja de leerse como "tarjeta clara
   flotando sobre foto oscura" (que es su lenguaje visual original) y se
   funde con la foto de atrás, perdiendo definición — esto es lo que se
   percibe como "las tarjetas muy transparentes, se pierden con el
   fondo".

### Fix parte A — el velo siempre oscuro

Reemplazar el `bg-ink/XX` del velo por `bg-photo-scrim` (el token fijo
del §1) en los tres archivos:

| Archivo | Línea aprox. | Cambiar |
|---|---|---|
| `Services.tsx` | ~L25 | `bg-ink/72` → `bg-photo-scrim` |
| `HowWeWork.tsx` | ~L47 | `bg-ink/70` → `bg-photo-scrim` |
| `Contact.tsx` | ~L62 | `bg-ink/75` → `bg-photo-scrim` |

### Fix parte B — el panel "de vidrio" fijado siempre claro

En vez de cambiar clase por clase adentro de cada panel (arriesga dejar
algo suelto), **fijá el panel entero como una superficie clara** vía
override local de las custom properties que ya usan sus hijos. Tailwind
soporta esto con la sintaxis de propiedades arbitrarias (`[--var:valor]`)
directamente en el `className` del contenedor — todo lo que adentro use
`bg-paper`, `text-ink`, `text-muted`, `border-line`, `bg-surface` (o
`bg-[var(--surface-2)]`) queda resuelto en claro automáticamente, tema
claro u oscuro, **sin tocar una sola línea de los hijos**:

```
[--ink:var(--ink-fixed)] [--paper:var(--cream)] [--muted:rgba(42,14,30,0.66)] [--border:rgba(42,14,30,0.18)] [--surface-2:rgba(42,14,30,0.05)]
```

Aplicalo así en cada archivo (agregá esas clases al `className` existente
del elemento indicado, no reemplaces el resto de las clases que ya
tiene):

- **`HowWeWork.tsx`** (~L50): al div `rounded-card bg-paper/95 p-6
  shadow-soft backdrop-blur-sm md:p-10` (el panel entero, incluye el
  `SectionHeading` y los 4 pasos — acá el título SÍ va dentro del panel
  claro, por eso se scopea todo junto).
- **`Contact.tsx`** (~L120): al `<form>` `rounded-card bg-paper/95 p-6
  backdrop-blur-sm md:p-8`.
- **`Services.tsx`** (~L33): al div `mt-10 grid gap-5 md:grid-cols-2
  lg:grid-cols-3` que envuelve las 6 tarjetas de servicio (cada
  `<article className="... bg-paper">` hereda el scope de su padre).

**Importante — no dupliques trabajo:** con este fix, los siguientes
ítems que estaban en el plan anterior (`prompt 5`) para adentro de estas
tres secciones **ya quedan resueltos por el scope** y NO hace falta
tocarlos aparte:
- El badge de paso no-acentuado en `HowWeWork.tsx` (`bg-ink text-white`).
- El botón submit de `Contact.tsx` (`bg-ink ... text-white`).
- El botón "Ver detalle" en hover de `Services.tsx` (`hover:bg-ink
  hover:text-white`).

Todos esos, al estar dentro del scope, resuelven `bg-ink` como el vino de
marca fijo (no como el `--ink` que cambia con el tema) — que es
exactamente el resultado correcto y además más consistente con la
identidad visual que el fix genérico que se había propuesto antes.

En `Services.tsx`, el `<SectionHeading ... onDark />` y el párrafo final
`text-white/70` quedan **fuera** de este scope (se aplica solo al grid de
tarjetas) porque esos sí están pensados para vivir directo sobre la foto,
no sobre el panel — ya son correctos tal como están, no tocar.

---

## 5. Resto de `bg-ink` + `text-white` sueltos

Fuera de las tres secciones del §4, estos quedan igual que en el plan
anterior — no están sobre un panel "de vidrio", son superficies que
deben verse siempre oscuras (footer, menú móvil) o botones que deben
adaptarse con el tema (Tipo A: `bg-ink text-white` → `bg-ink text-paper`,
así la pareja ink/paper se invierte junta y el contraste queda correcto
en los dos temas):

| Archivo | Elemento | Clase actual | Cambiar a | Motivo |
|---|---|---|---|---|
| `Footer.tsx` (~L18) | `<footer>` | `bg-ink text-white` | `bg-ink-fixed text-on-ink-fixed` | Superficie siempre oscura |
| `Nav.tsx` (~L117) | overlay menú móvil | `bg-ink` | `bg-ink-fixed` (dejar `text-white` en los links) | Superficie siempre oscura |
| `Trabajos.tsx` (~L110) | chip sobre foto | `bg-ink/60 text-white` | `bg-ink-fixed/60 text-on-ink-fixed` | Chip siempre oscuro sobre imagen |
| `ui/BeforeAfterSlider.tsx` (~L68) | etiqueta sobre foto | `bg-ink/70 text-white` | `bg-ink-fixed/70 text-on-ink-fixed` | Etiqueta siempre oscura sobre imagen |
| `About.tsx` (~L37) | círculo ícono check | `bg-ink text-white` | `bg-ink text-paper` | Tipo A — se adapta con el tema |
| `Reviews.tsx` (~L32) | avatar iniciales | `bg-ink text-white` | `bg-ink text-paper` | Tipo A |
| `ServiceModal.tsx` (~L49) | CTA "Solicitar presupuesto" | `bg-ink ... text-white` | `bg-ink ... text-paper` | Tipo A — vive en un modal, no en un panel sobre foto |

Cerrá esta sección con un grep de control:
`grep -rn "bg-ink" src --include="*.tsx" | grep "text-white"` no debería
devolver nada.

---

## 6. Jerarquía tipográfica

La tipografía (Archivo/Inter) y la escala principal están bien: el H1 del
Hero (`text-5xl` → `md:text-[88px]`) y el H2 de cada sección — todas usan
el mismo `SectionHeading` (`text-3xl` → `md:text-5xl`) — ya son
consistentes en todo el sitio, no tocar esos dos niveles.

El nivel de "título dentro de tarjeta/ítem repetido" (H3) sí quedó
disperso sin un criterio claro — tres tamaños casi iguales pero
distintos (`18px`, `19px`, `21px`) que no pertenecen a la escala de
Tailwind (son valores arbitrarios `text-[19px]` / `text-[21px]`, no
`text-lg` / `text-xl`). Encuadrarlos en la escala estándar:

| Archivo | Elemento | Clase actual | Cambiar a |
|---|---|---|---|
| `Services.tsx` (~L60) | título de tarjeta de servicio | `text-[19px]` | `text-lg` (18px — mismo nivel que el título de beneficio en `About.tsx`, misma densidad de grilla) |
| `HowWeWork.tsx` (~L68) | título de paso | `text-[21px]` | `text-xl` (20px — un escalón por encima, layout más espacioso de 4 columnas) |

`Contact.tsx` (`text-xl`), `ServiceModal.tsx` (`text-2xl`) y
`Trabajos.tsx` (`text-2xl md:text-3xl`) ya caen en la escala estándar de
Tailwind — no tocar.

---

## 7. Bugs sueltos encontrados en la auditoría

Dos casos donde un color quedó hardcodeado en vez de usar los tokens de
tema — ninguno saltaba a la vista antes porque en tema claro no se nota,
pero rompen en oscuro:

1. **`src/components/ui/Button.tsx`** (~L21) — la variante `dark` tiene
   `hover:bg-black/80` fijo. Como el estado base ya es `bg-ink` (que en
   oscuro es claro), el hover salta a negro y se ve como una inversión
   brusca. Cambiar a:
   ```ts
   dark: 'bg-ink text-paper hover:bg-ink/85',
   ```
2. **`tailwind.config.ts`** — `boxShadow.soft` está hardcodeado a
   `'0 4px 24px rgba(10, 10, 10, 0.08)'`, ignorando la variable `--shadow`
   que `index.css` ya define distinta por tema (más densa en oscuro).
   Resultado: en tema oscuro, `shadow-soft` sigue siendo una sombra
   pensada para fondo claro, casi invisible sobre fondo oscuro. Cambiar a:
   ```ts
   boxShadow: {
     soft: 'var(--shadow)',
   },
   ```

---

## 8. Navbar de la landing — recolor + logo, misma funcionalidad

Archivo: `src/features/landing/components/Nav.tsx`.

**No cambia:** el listener de scroll, el estado `mobileOpen`, todos los
`href`/rutas, el `<ThemeToggle />`, el botón hamburguesa, y el CTA de
sesión (Iniciar sesión / Ir al dashboard según
`useAuthStore((s) => s.status)`, con `/login` y `/dashboard/inicio`).

**Cambia:**

- El fondo del `<header>` pasa a ser **siempre** `bg-ink-fixed` (el
  vino), en los dos estados de scroll — ya no alterna entre `bg-black/55`
  y `bg-paper/88`. Con el fondo fijo, se puede borrar la rama condicional
  de color de texto (`solid ? 'text-ink' : 'text-white'`) y dejar los
  colores fijos: `text-cream` / `text-on-ink-fixed`. Si querés conservar
  sensación de profundidad al scrollear, sumá `shadow-md` solo cuando
  `solid` sea `true` — el color de fondo ya no cambia.
- Reemplazá el logo de texto (`Riva<span>.</span>Bike`) por
  `<BrandMark className="h-8 w-auto" />` + `<BrandWordmark />` (§3)
  dentro del mismo `<Link to="/">`, con `gap-3`.
- Sumá el tagline del §3 en el grupo de la derecha, antes del
  `<ThemeToggle />`.
- El menú full-screen móvil ya hereda el vino automáticamente en cuanto
  se aplique el §1/§5 (usa `bg-ink-fixed`) — solo confirmá que el logo
  ahí adentro también use `<BrandMark />` en vez de texto plano, si
  corresponde.

---

## 9. Dashboard

Archivo: `src/components/layout/DashboardLayout.tsx`. El tema oscuro
nuevo (§1) llega automáticamente a todo el dashboard porque ya está
tokenizado (`bg-paper`, `text-ink`, `border-line`, `bg-surface` sin
colores sueltos, confirmado por auditoría) — no hace falta editar cada
página, solo verificar visualmente.

### 9.1 Agregar el toggle de tema al topbar

Hoy `<ThemeToggle />` solo vive en el `<aside>` (`hidden md:flex`), así
que en mobile no hay forma de cambiar el tema en el dashboard. Agregalo
al `<header>` sticky de arriba, visible en todos los breakpoints, entre
el logo y "Cerrar sesión". Gracias al §2, queda sincronizado
automáticamente con el del sidebar.

### 9.2 Bottom nav — FAB centrado

Hoy `NAV.slice(0, 6)` + el botón "Nueva orden" van en una fila
`overflow-x-auto` con el botón al final — hay que scrollear para
llegarle en pantallas angostas, y "Configuración" (ítem 7) queda
inalcanzable en mobile.

**Fix:** 2 ítems + FAB centrado y elevado + 2 ítems + "Más": `Inicio` ·
`Órdenes` · **FAB "Nueva orden"** (mismo estilo actual: `rounded-card
bg-pink-deep text-paper shadow-soft`, ahora fijo en el centro) ·
`Inventario` · `Más` (abre un listado con `Servicios`, `Galería`,
`Contenido del sitio`, `Configuración` — reutilizá `Modal.tsx`, que ya se
comporta como bottom-sheet en mobile). Sin `overflow-x-auto`: con 5
slots fijos no debería hacer falta scroll horizontal en ningún viewport
del §12.

Para la sensación de "transparente": `bg-paper/90` → `bg-paper/95` +
`shadow-[0_-4px_20px_rgba(0,0,0,0.08)]`, conservando el `backdrop-blur-md`.

---

## 10. Modal — botón cerrar

Archivo: `src/components/ui/Modal.tsx` (componente único, el fix se
propaga a todos los modales). Cambiar:

```tsx
<button
  type="button"
  onClick={onClose}
  aria-label="Cerrar"
  className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:text-ink"
>
```

a:

```tsx
<button
  type="button"
  onClick={onClose}
  aria-label="Cerrar"
  className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-pink hover:text-white active:scale-95"
>
```

Mismo lenguaje visual que el botón "volver arriba" del footer. Confirmá
que el título del modal tenga suficiente `padding-right` para no quedar
debajo del botón en pantallas angostas.

---

## 11. Microinteracciones en tarjetas

Transform + box-shadow, transición corta (200–300ms), `ease-out` — nunca
propiedades de layout. La regla global de `prefers-reduced-motion` en
`index.css` ya desactiva todo automáticamente, no tocarla.

- **`Services.tsx`**: en cada `<article>`, agregar `transition-all
  duration-300 hover:-translate-y-1 hover:shadow-soft`.
- **`Reviews.tsx`**: mismo tratamiento en el `<figure>`.
- **`Trabajos.tsx`**: ya tiene zoom de imagen en hover; opcional sumar
  `hover:shadow-soft` al `<button>` contenedor.

No agregar librerías nuevas — son transiciones CSS puras.

---

## 12. Checklist de responsive

Viewports: `360×800, 390×844, 430×932, 600×960, 820×1180, 1024×768,
1366×768, 1440×900, 1920×1080` (matriz ya usada en sesiones anteriores
del proyecto). Confirmar en cada uno:

- Navbar de landing: logo + tagline (desde `md:`) + CTA de sesión + CTA
  presupuesto + toggle + hamburguesa no se pisan ni desbordan.
- Los paneles del §4 (Servicios/Cómo trabajamos/Contacto) mantienen
  contraste y no cortan texto en ningún ancho.
- Bottom nav del dashboard: FAB centrado, sin scroll horizontal, "Más"
  alcanza los 3 ítems restantes.
- Formulario de contacto y tarjetas de servicio no desbordan en 360px.

---

## 13. Verificación final

1. `pnpm typecheck && pnpm lint && pnpm build`.
2. `grep -rn "bg-ink" src --include="*.tsx" | grep "text-white"` → vacío.
3. Con `pnpm dev`, togglear el tema y recorrer **cada** sección de la
   landing y **cada** pantalla del dashboard — sin texto invisible ni de
   bajo contraste en ninguno de los dos temas, y con el modo oscuro
   leyéndose vino/bordó, no negro plano.
4. Confirmar que los paneles de Servicios/Cómo trabajamos/Contacto se
   ven como tarjeta clara sobre foto oscura en **los dos** temas (antes
   solo funcionaba en claro).
5. Confirmar que los dos `<ThemeToggle />` del dashboard (topbar +
   sidebar) quedan sincronizados entre sí.
6. Confirmar que el FAB "Nueva orden" es alcanzable sin scroll horizontal
   en los 9 viewports, y que las 7 secciones del dashboard siguen siendo
   alcanzables desde mobile.
7. Con `prefers-reduced-motion: reduce` activado, confirmar que las
   animaciones nuevas se desactivan igual que el resto.
