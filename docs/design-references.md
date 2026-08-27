# Referencias de diseño — Riva Bike

Este documento traduce las dos referencias de Figma y la guía de colores del
`html_ejemplo.html` en decisiones de diseño concretas para el equipo/agente
que implemente la UI. **No copiar textos ni activos** de los Figma: son
referencia de *estructura y estilo*, no de contenido.

---

## 1. Paleta de marca

Fuente: colores negro / blanco / rosa tomados de `html_ejemplo.html`
(el archivo de referencia del dashboard/PDF).

| Token          | Hex       | Uso                                                    |
|----------------|-----------|---------------------------------------------------------|
| `ink`          | `#0A0A0A` | Texto principal, fondos oscuros (footer, navbar dashboard) |
| `paper`        | `#FFFFFF` | Fondo base, texto sobre fondo oscuro                    |
| `pink`         | `#EF7D97` | Acento (badges, links, iconos, hover secundario)         |
| `pink-deep`    | `#E8546F` | Acento fuerte (CTA hover, focus ring, precios destacados) |

Reglas:

* Un solo acento de color a propósito (rosa). Todo lo demás se resuelve con
  negro, blanco y grises neutros derivados de esos dos (no introducir grises
  "de sistema" tipo `#F3F4F6` porque sí; usar `ink` con opacidad, ej. `text-ink/60`).
* Los CTA primarios son negro sólido que invierte a `pink-deep` en hover
  (ver `src/components/ui/Button.tsx`).
* Ya está cableado en `tailwind.config.ts` como `ink`, `paper`, `pink`,
  `pink.deep`.

---

## 2. Tipografía

* **Display** (titulares, Hero): una sans geométrica de peso medio/alto,
  tracking ajustado, tamaños grandes (5xl–8xl en desktop). Alternativa
  gratuita recomendada: **Archivo** (variable, cubre de 400 a 900) o
  **General Sans**. Configurado como `font-display` en Tailwind.
* **Body/UI**: **Inter**. Configurado como `font-body`.
* Evitar usar más de dos familias. El dashboard reutiliza las mismas
  familias que la landing (misma identidad, distinto layout).

---

## 3. Hero — referencia "Motor Bike Website Concept UI"

Lo que ese Figma resuelve bien y vale la pena adaptar:

* Imagen a **sangre completa** (full-bleed) ocupando todo el viewport del
  Hero, con la composición del producto (en nuestro caso: una bici o el
  mecánico trabajando) corrida hacia la derecha.
* Navegación superior minimalista: logo/menu a la izquierda, links
  centrados, iconos de acción a la derecha — con fondo transparente sobre
  la imagen del Hero (se vuelve sólido al hacer scroll).
* Bloque de texto anclado **abajo a la izquierda**: eyebrow corto en
  mayúsculas y tracking amplio ("TALLER · SERVICIO TÉCNICO"), seguido de un
  titular enorme (5xl–7xl), en una o dos líneas.
* Un elemento de "prueba social" cerca del titular (en el original: rating
  con estrellas). En Riva Bike: reutilizar el **rating de Google
  Reviews** real (ej. "4.8/5 · 63 reseñas") en esa misma posición — conecta
  el Hero con la sección de reseñas más abajo.
* Doble CTA (uno sólido, uno con borde) inmediatamente debajo del titular.

Adaptación para Riva Bike (ya scaffoldeada en `src/pages/LandingPage.tsx`,
a completar):

```text
┌────────────────────────────────────────────┐
│ [logo]     Servicios  Trabajos  Contacto  ☰ │  <- nav transparente
│                                              │
│                                              │
│                         [foto bici/taller]  │
│                                              │
│ TALLER · SERVICIO TÉCNICO                   │
│ Tu bici, en las                             │
│ mejores manos.                              │
│ ★★★★★ 4.8/5 · 63 reseñas de Google          │
│ [Solicitar presupuesto] [Ver nuestros trabajos] │
└────────────────────────────────────────────┘
```

---

## 4. Resto de la landing — referencia "Veloretti"

Patrón editorial minimalista, mucho aire, tipografía grande y liviana,
fondo blanco/negro sin colores intermedios. Secciones a reutilizar:

1. **Texto + imagen alternado** (imagen a un lado, heading + párrafo corto +
   CTA de texto al otro, alternando de lado en cada sección) → usar para
   "Quiénes somos", "Por qué elegirnos", y para presentar cada servicio
   destacado.
2. **"Cómo trabajamos"** — lista numerada con badges tipo píldora (número en
   círculo/pill + título + descripción corta), tal como el "How it works"
   del Veloretti. Mapea directo a nuestro flujo real: `1. Traés tu bici` ·
   `2. Diagnóstico y presupuesto` · `3. Reparación` · `4. Retirás tu bici`.
3. **Cards de servicios/productos destacados** — card con imagen, título,
   precio (`precio_base` del catálogo), y CTA. Reutilizar para la sección de
   servicios (11 del AGENT.md), consumiendo datos reales, no hardcodeados.
4. **Reseñas** — grid de 3 columnas con cita + atribución. En vez de logos
   de prensa, usar el avatar/nombre del autor de Google y su rating.
5. **Formulario de contacto** minimalista — inputs con solo borde inferior,
   sin cajas pesadas, un único botón grande al final.
6. **FAQ en acordeón** — opcional para fase posterior (info de garantía,
   tiempos de entrega, etc.).
7. **Footer oscuro (`bg-ink`)** — columnas de links, bloque de contacto/
   redes, botón circular "volver arriba". Mismo tratamiento tipográfico que
   el resto (mayúsculas, tracking amplio, tamaño pequeño).

Motivo recurrente ("signature element" del diseño): el **badge numerado en
píldora** de "Cómo trabajamos" se reutiliza como acento visual también en la
Galería (numerando categorías) y en el propio Hero (rating), para darle una
firma visual consistente sin depender de fotografía de stock.

---

## 5. Dashboard — guía de `html_ejemplo.html`

El HTML de ejemplo (catálogo + generador de presupuesto/OT en un solo
archivo con `localStorage`) **no se reutiliza tal cual** — usaba
`localStorage` y jsPDF en el cliente sin backend. Se toma de ahí únicamente:

* La paleta rosa/negro/blanco y el tratamiento de **cards con borde
  redondeado (`rounded-card`, ~14px) y borde fino**.
* Los **price-rows** (fila con nombre a la izquierda, precio destacado en
  rosa a la derecha) como patrón para listas de servicios/inventario.
* El **total-bar** oscuro con el monto en rosa grande, como patrón para
  totales de presupuestos.
* La estructura del **PDF** (header oscuro con logo, cajas de
  cliente/bicicleta, tabla de ítems, barra de total, cláusula de garantía,
  footer con contacto) como base visual para el PDF real (implementado con
  `@react-pdf/renderer` o similar — ver sección 62 del AGENT.md — **no**
  jsPDF en el cliente, para poder generarlo también desde una Edge Function
  si hiciera falta).
* La lógica de **negocio** de ese HTML (stock en `localStorage`, descuento
  de 1 unidad al generar PDF, sin transacciones ni historial) **no** se
  traslada: el AGENT.md secciones 26–27 y 38 la reemplazan por completo
  (movimientos de stock transaccionales en Postgres, consumo solo al
  ejecutar el trabajo, no al presupuestar).

---

## 6. Motion / animación

* Hero: fade + slide-up sutil del bloque de texto al cargar (una sola vez).
* Secciones texto/imagen: reveal al entrar en viewport (una vez, sin
  replay al volver a scrollear).
* Cards (servicios, galería): hover con leve scale/translate, nada más.
* Dashboard: transiciones de estado (loading → success) con fade simple;
  nada de animación decorativa en tablas o formularios.
* Respetar siempre `prefers-reduced-motion` (ya contemplado en
  `src/index.css`).
