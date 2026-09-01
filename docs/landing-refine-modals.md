# Plan — Refinamiento landing Riva Bike: fondos, dark, contacto, trabajos y modales

## Intención

Corrección de los puntos que quedaron flojos en `riva-bike-landing.html` tras la
ronda anterior (reorden de secciones + modales). La marca queda fija (ink/paper/
pink `#EF7D97`/pink-deep `#E8546F`, Archivo + Inter, es-ES). No se toca el
dashboard.

Problemas reportados por el usuario:
1. Los fondos fotográficos de las secciones `section-bg` "no se integran bien".
2. En modo dark esas fotos "aumentan su transparencia" (se ven lavadas).
3. En la página de Contacto el contraste de los títulos no convence y hay que
   reordenar el encabezado.
4. "Nuestros trabajos": se malinterpretó. Quería las **tarjetas con fotos de
   bicis** (galería de cards clicables), y que al **seleccionar una tarjeta** se
   abra el modal con el **slider antes/después + descripción**. (No un showcase
   con slider incrustado en la página.)
5. En "Servicios" no se está viendo el modal con los detalles → falta un mockup
   real y las imágenes de ejemplo (usar aleatoriamente las imágenes que ya
   pasó el usuario).

---

## 1. Fondos fotográficos (`section-bg`) — integración + dark

**Diagnóstico actual:**
- `.section-bg::before` usa `color-mix(in oklch, var(--bg) 60%, transparent)`.
  En light `--bg` = blanco → velo blanco 60% sobre la foto. En dark `--bg` =
  casi negro → porn una capa oscura muy densa que "apaga" la foto (parece que
  la transparencia aumenta / no se integra).
- Además las fotos se cargan por URL externa (CDN) y son de baja coherencia
  con la marca.

**Cambios propuestos:**
- Separar el velo por tema con variables: definir `--photo-scrim` en `:root`
  (light: ráfaga oscura-media para legibilidad, p. ej. oklch L ~0.3 al 68%) y
  en `[data-theme="dark"]` (velo más suave, L ~0.16 al 78%), de modo que la
  foto siempre se vea y el texto sea legible en ambos.
- Añadir un gradiente sutil de legibilidad (oscuro arriba/abajo) dentro del
  `::before` en lugar de un solo velo plano.
- Si se decide, sustituir las 3 URL externas por imágenes locales copiadas al
  proyecto (`assets/`), con `loading="lazy"` y `alt` descriptivo. Las fotos de
  taller reales se integrarán mejor que las de stock.

**Marcadores:**
- `TODO[photo-scrim]`: definir velo por tema en `.section-bg::before`.
- `TODO[photo-local]`: decidir si migrar a imágenes locales (recomendado).

---

## 2. Modo dark y paneles de contraste

**Diagnóstico:** `.panel` usa `var(--surface)` al 90% + blur. En dark `--surface`
es `#141419`, que al mezclarse sobre foto oscura se confunde (contraste pobre
entre panel y fondo).

**Cambios propuestos:**
- Dar al `.panel` dentro de `.section-bg` un fondo sólido real en ambos temas
  (`--surface`, sin transparencia) cuando esté sobre foto, con borde
  `--border` y sombra para despegarlo de la foto. En dark eso garantiza
  contraste AA (texto `--fg` claro sobre `--surface` oscuro).
- Revisar el par `.panel .eyebrow` (rosa sobre surface): verificar ≥4.5:1 en
  dark (usar `--accent-strong` claro si hace falta).

**Marcadores:**
- `TODO[panel-solid]`: `.section-bg .panel { background: var(--surface) }`.
- `TODO[panel-eyebrow]`: contrastar eyebrow rosa en dark.

---

## 3. Contacto — reordenar encabezado y contraste

**Diagnóstico actual:** el header de Contacto está en un panel grande con
eyebrow + H2, y más abajo hay otro panel con el formulario; sobre la foto se
lee mal y la jerarquía es plana.

**Cambios propuestos:**
- Sacar el header de Contacto del panel: título H2 + eyebrow con color
  `--paper`/`--on-dark` sobre un fondo oscuro sólido legible (foto oscurecida),
  y subir el panel del **formulario** como tarjeta blanca (surface sólida).
- Reordenar: primero el título, luego la info de contacto (WhatsApp/dirección/
  horarios + "Cómo llegar") como tarjetas, y el formulario como panel destacado.
- Aumentar contraste de `.contact-row .c-label`, `.c-val` y del botón sobre la
  foto.

**Marcadores:**
- `TODO[contacto-header]`: restructurar header fuera del panel.
- `TODO[contacto-panel]`: formulario como surface sólida.

---

## 4. "Nuestros trabajos" — tarjetas de bicis → modal con slider

**Diagnóstico:** se había puesto un `trabajo-showcase` con slider antes/después
incrustado, sumado a la galería. El usuario quería **solo tarjetas de fotos de
bicis** y que cada una abra un modal.

**Cambios propuestos:**
- Reemplazar el `trabajo-showcase` por una **galería de tarjetas** (`g-item`)
  con foto de bici (de las imágenes del usuario / `assets/`), tag y título.
- Cada tarjeta es un botón que abre el **modal de trabajo** con:
  - **slider antes/después** (arrastrar / teclado ←→),
  - **descripción** de los trabajos realizados,
  - lista de tareas, precio referencial y CTA a contacto.
- Eliminar el slider incrustado en la página (se mueve al modal).

**Marcadores:**
- `TODO[trabajos-cards]`: galería de cards clicables con fotos.
- `TODO[trabajo-modal]`: modal con slider + descripción + datos.

---

## 5. Servicios — modal con detalles visible + mockups

**Diagnóstico:** el modal existe pero "no se ve"; falta contenido firme y el
carrusel usa placeholders grises que no comunican.

**Cambios propuestos:**
- Rellenar el modal de servicio de forma completa: nombre, sub, carrusel con
  **imágenes de ejemplo** del usuario (usar aleatoriamente de `ejemplo-1.png`,
  `ejemplo-2.png` y los `drawing-*.png`), descripción, precio, plazo, qué
  incluye y CTA.
- Confirmar que el modal se abre y cierra bien (walkthrough) y que el carrusel
  cambia de slide con flechas/dots.
- Ajustar el ancho del modal de servicio para que el carrusel se vea cómodo.

**Marcadores:**
- `TODO[svc-modal-fill]`: contenido + imágenes reales en el modal.
- `TODO[svc-carrusel]`: carrusel con flechas/dots funcionando.

---

## 6. Imágenes de ejemplo

- Copiar a `assets/` las imágenes ya presentes: `ejemplo-1.png`, `ejemplo-2.png`
  y los `drawing-*.png` si aportan.
- Para los fondos de sección y las fotos de trabajos/servicios, usar esas
  imágenes (aleatoriamente) en lugar de las URLs externas, con rutas relativas.
- Mantener `data-od-id="kebab-case-id"` en secciones, tarjetas y controles.

---

## Verificación

- `node --check` de los scripts inline + balance de tags HTML.
- Walkthrough: abrir una tarjeta de trabajo → modal con slider + descripción;
  abrir un servicio → modal con carrusel; ambos con cierre por botón/Esc/
  backdrop.
- Contraste AA en light y dark de títulos sobre fondos de foto, y de paneles
  sobre `--surface`.
- Sin scroll horizontal a 390/768/1024 px.

---

## Próximo paso

Revisá y editá este plan (sobre todo la sección de trabajos 4 y el uso de
imágenes 6). Cuando me digas que está ok o "dale", salgo de plan y lo implemento
directo en `riva-bike-landing.html`, copiando primero las imágenes a `assets/`.
