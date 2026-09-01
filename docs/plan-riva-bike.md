# Plan — Riva Bike Landing: revisión móvil, navbar y modo dark

## Intención

Ajustar la landing `riva-bike-landing.html` para resolver problemas en móvil
(hero y navbar), añadir alternador de tema light/dark consistente con el rosa
de marca, y confirmar cómo pedir un futuro dashboard con la misma identidad.

---

## 1. Hero y bici en móvil

**Problema:** en móvil la bici queda muy abajo y el hero tiene demasiado aire /
espacio vacío arriba; el bloque de texto queda suelto sobre mucho fondo.

**Cambios propuestos:**
- Reposicionar la bici en móvil: subirla y acercarla al bloque de texto
  (menos hueco), con `object-position` centrado en el hero en pantallas
  angostas en vez de `center right`.
- Reordenar el hero en móvil: titular/rating/CTA más altos, imagen como
  segunda capa (ya está `hero-bike` en absoluto; ajustar top/bottom y tamaño).
- Reducir el padding vertical excesivo (`clamp`) del `.hero-inner` en móvil
  y subir el punto de anclaje del bloque para aprovechar el viewport.
- Verificar que el texto nunca quede tapado por la bici en tamaños < 600px.

**Marcadores de edición:**
- `TODO[hero-mobile]`: reescribir reglas `@media (max-width: 600px)` y
  `(max-width: 920px)` de hero para reposicionar bici y texto.
- `TODO[hero-padding]`: acotar el `clamp` de `height/padding` del `.hero-inner`.

---

## 2. Navbar en lo más alto (estado no-scrolled)

**Problema:** el navbar está transparente arriba del todo; sobre la
iluminación superior del hero se "pierde" y las secciones no destacan.

**Cambios propuestos:**
- Dar al navbar, incluso en `top:0`, un fondo más llamativo y legible sin
  esperar a hacer scroll: `background` oscurecido/translúcido con
  `backdrop-filter: blur`, borde inferior sutil y logo/links con más contraste.
- Mantener el estado `scrolled` actual (fondo claro) tal como está usando ya
  el modo claro; en dark, el estado scrolled será la inversión coherente.
- Asegurar contraste de logo/links ≥ 4.5:1 sobre el hero en ambos temas.

**Marcador de edición:**
- `TODO[navbar-hero]`: dar fondo + blur + borde al `.topnav` base (no solo a
  `.scrolled`); conservar el comportamiento al hacer scroll.

---

## 3. Tema claro / oscuro (nuevo botón)

**Objetivo:** botón de alternancia light/dark en el navbar, con persistencia
en `localStorage` y respeto a `prefers-color-scheme` como valor inicial.

**Estilo dark — análisis de colores (consistente con el rosa):**
La paleta se deriva de `design-references.md`: `ink #0A0A0A`, `paper #FFFFFF`,
`pink #EF7D97`, `pink-deep #E8546F`. Para dark invertimos roles sin inventar
grises de sistema:

| Token        | Light (actual)  | Dark propuesto                  |
|--------------|-----------------|---------------------------------|
| `--bg`       | `#FFFFFF`       | `ink` #0A0A0A (fondo)           |
| `--surface`  | `#FFFFFF`       | neutro derivado de ink, ej. oklch L ~0.14 |
| `--fg`       | `#0A0A0A`       | `paper` #FFFFFF (para texto)    |
| `--muted`    | ink al 62%      | paper al 66% (gris claro)       |
| `--border`   | ink al 14%      | paper al 16%                    |
| `--accent`   | `pink #EF7D97`  | `pink #EF7D97` (se mantiene)    |
| `--pink-deep`| `#E8546F`       | rosa más claro para contraste sobre dark |

Notas:
- `--accent` rosa se conserva idéntico en ambos temas (coherencia de marca);
  el rosa ya tiene buen contraste sobre negro.
- Los fondos oscuros existentes (footer, navbar sobre hero) ya son `ink`, así
  que en dark se integran de forma natural.
- El dark se implementa poniendo `data-theme="dark"` en `<html>` y redefiniendo
  las variables entre `[data-theme="dark"]` y `:root`, sin tocar cada regla.
- Ajustar `::selection`, `--accent-soft`, `--fg-soft`, `.topnav.scrolled`,
  `--ink-soft` para que evolucionen con el tema (no hex fijos sueltos).

**Marcador de edición:**
- `TODO[theme-toggle]`: botón 🌙/☀ accesible (`aria-pressed`), JS que alterna
  `data-theme`, guarda en `localStorage("riva-theme")`, lee `prefers-color-scheme`
  al inicio, y respeta `prefers-reduced-motion`.

---

## 4. Duda: dashboard con la misma consistencia visual

**Sí, puedes pasarlo directo por aquí.** Consejos para que preserve la
identidad:

- Menciona "misma identidad que Riva Bike" y referencia esta landing o
  `design-references.md` (paleta ink/paper/pink, tipografía Archivo+Inter,
  cards `radius 14px`, price-rows con precio en rosa, total-bar oscuro).
- Mejor aún: el dashboard reutilizará los mismos tokens. Puedo crear un
  documento compartido de sistema (si se quiere) y luego el dashboard toma
  nombre/tokens de ahí.
- Pásame: qué pantallas/operaciones (ej. inventario, generar presupuesto/OT,
  historial), qué datos necesitas, y si hay una pantalla prioritaria.

Sin bloqueo: sigamos con esta landing primero.

---

## Próximo paso

Revisa y edita este plan (sobre todo la tabla de dark y las preferencias de
navbar). Cuando lo apruebes o me digas "dale", salgo de plan y lo implemento
directo en `riva-bike-landing.html`.
