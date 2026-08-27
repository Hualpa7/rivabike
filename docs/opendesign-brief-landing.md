# Brief de diseño — Landing de Riva Bike (para OpenDesign)

> Este documento es para **OpenDesign**, no para OpenCode: es un brief de
> diseño (contenido, tono, secciones), no una especificación técnica. Tenés
> libertad creativa en tipografía y detalle de layout — la marca y el
> contenido de abajo son lo único fijo.

## El negocio

**Riva Bike** — taller de reparación, mantenimiento y servicio técnico de
bicicletas. Dirección: Rivadavia 243, Hipólito Yrigoyen. WhatsApp: 3878
224212. Tono: cercano, prolijo, técnico pero no frío — el taller de
bicicletas del barrio en el que confiás para dejar tu bici bien arreglada.

## Marca (fijo)

* Colores: **negro** (`#0A0A0A`), **blanco** (`#FFFFFF`), **rosa**
  (`#EF7D97`, variante fuerte `#E8546F`). Un solo acento de color a
  propósito — todo lo demás en negro/blanco/grises.
* Si este proyecto ya está conectado como repo (`rivabike`), podés leer
  `tailwind.config.ts` / `src/index.css` para tomar estos tokens en vez de
  que te los repita.

## Referencias de intención (no copiar texto ni activos, solo el lenguaje visual)

* Hero: `https://www.figma.com/design/jZO5OEltKxi21j07jFr776/Motor-Bike-Website--Concept-UI--Community-` —
  foto de producto a sangre completa, eyebrow + titular enorme anclado
  abajo-izquierda, doble CTA, nav transparente sobre la imagen.
* Resto de la página: `https://www.figma.com/design/eA6vtyjqXpmH1TaqzGyQ2N/Veloretti---Electric-Bike-Shop-Website-Template--Community-` —
  editorial minimalista, mucho aire, tipografía grande y liviana, secciones
  texto+imagen alternadas, footer oscuro.

## Secciones que tiene que tener (contenido real, no lorem ipsum)

**1. Nav** — logo "Riva Bike", links a Servicios / Trabajos / Contacto, menú
hamburguesa en mobile.

**2. Hero** — eyebrow "TALLER · SERVICIO TÉCNICO", titular con la propuesta
de valor (proponé vos el texto exacto, algo en la línea de "tu bici en las
mejores manos"), un indicador de confianza tipo "4.8/5 · 63 reseñas de
Google" cerca del título, y dos CTA: **Solicitar presupuesto** (primario) /
**Ver nuestros trabajos** (secundario).

**3. Quiénes somos / Por qué elegirnos** — 2 bloques cortos tipo
texto+imagen alternado: años de experiencia, especialización en bicicletas,
trabajo prolijo con garantía.

**4. Cómo trabajamos** — 4 pasos numerados: *1. Traés tu bici · 2.
Diagnóstico y presupuesto · 3. Reparación · 4. Retirás tu bici*.

**5. Servicios destacados** — cards con estos servicios reales (título +
precio, en pesos argentinos):

| Servicio | Precio |
|---|---|
| Cambio de cable o funda (mano de obra, + repuesto aparte) | $5.000 |
| Regulación de cambios | $9.000 |
| Regulación de frenos | $9.000 |
| Limpieza general y lubricación | $10.000 |
| Regulación de cambios + frenos | $14.000 |
| Centrado de ambas ruedas | $14.000 |
| Armado de bici | $25.000 |
| **Service completo** (destacado, el más pedido) | **$40.000** |

No hace falta poner los 8 — elegí los 4-6 más representativos para las
cards y dejá "Service completo" como el destacado.

**6. Opiniones de nuestros clientes** — 3 reseñas de ejemplo (autor, rating
5 estrellas, texto corto, "hace 2 semanas" tipo fecha relativa) simulando
reseñas reales de Google.

**7. Nuestros trabajos** (galería) — grid de 6-8 fotos de bicicletas
reparadas/en proceso, con categoría opcional (ej. "Mantenimiento",
"Armado").

**8. Contacto** — teléfono, WhatsApp, dirección, horarios, un mapa
(placeholder está bien), CTA "Cómo llegar", + un formulario corto (nombre,
teléfono, mensaje).

**9. Footer** oscuro — columnas de navegación, contacto, redes
(Instagram/Facebook), botón "volver arriba".

## Qué priorizar

* **Mobile primero** — la mayoría de las visitas van a ser desde celular,
  diseñá y revisá esa versión antes que la de desktop.
* El Hero es lo más importante de la página: ahí es donde más se nota la
  calidad del diseño.
