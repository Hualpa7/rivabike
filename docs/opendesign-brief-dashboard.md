# Brief de diseño — Dashboard de Riva Bike (para OpenDesign)

> Este documento es para **OpenDesign**, no para OpenCode: es un brief de
> diseño, no una especificación técnica. Libertad creativa en el detalle de
> layout — la marca y las pantallas de abajo son lo fijo.

## Qué es

El panel privado donde el dueño del taller (único usuario por ahora)
gestiona servicios, inventario, presupuestos/órdenes y la galería pública.
Se usa **mayormente desde el celular**, parado en el taller — no es un
dashboard de oficina.

## Marca (fijo, la misma que la landing)

Negro `#0A0A0A` / blanco `#FFFFFF` / rosa `#EF7D97` (fuerte `#E8546F`). Si
está conectado al repo `rivabike`, tomá los tokens de `tailwind.config.ts`.

## Referencia de tono para tablas/tarjetas/totales

Referencia adjunta: `html_ejemplo.html` (catálogo + generador de
presupuesto de un taller de bicicletas). Tomá de ahí el **lenguaje visual**,
no el layout completo (ese HTML es una herramienta de una sola pantalla con
tabs, esto es un dashboard de verdad):

* Cards con borde fino redondeado (~14px).
* Filas de precio: nombre a la izquierda, precio destacado en rosa a la
  derecha.
* Barra de total oscura con el monto en rosa grande.
* Botones tipo píldora (`border-radius` completo).

## No hace falta mockear todo — priorizá estas 3 pantallas

Con estas 3 quedan cubiertos todos los patrones de UI que el resto del
dashboard va a reutilizar (tabla, indicadores, formulario, wizard):

**1. Shell + Inicio** — navbar/sidebar con: Inicio, Trabajos/Servicios,
Inventario, Presupuestos/Órdenes, Galería, Contenido del sitio,
Configuración. En mobile, navegación tipo bottom-bar o menú deslizable (vos
elegís, lo que se sienta mejor con una mano en un celular). Inicio: un
resumen simple (cantidad de órdenes pendientes, alertas de stock bajo —
podés inventar 2-3 métricas de ejemplo).

**2. Inventario** — tabla con columnas: Producto, Stock, Precio, Estado,
Último movimiento, Acciones. Indicador visual claro para stock bajo / sin
stock (no solo color, también texto o ícono). Datos de ejemplo: repuestos
típicos de bicicleta (cámaras, cubiertas, cables, pastillas de freno,
cadenas).

**3. Nueva orden (wizard)** — flujo de varios pasos en una sola pantalla o
en pasos secuenciales: datos del cliente → datos de la bici → elegir
servicios (de una lista tipo la de la landing) → agregar repuestos del
inventario → observaciones → resumen con subtotales y total antes de
guardar. Este es el flujo más importante del dashboard — hacelo cómodo de
usar con una sola mano.

## Qué priorizar

* **Mobile primero**, sin excepción — más que en la landing todavía.
* Que se sienta una herramienta de trabajo real, no un admin genérico:
  información densa pero clara, texto legible con guantes/apuro, botones
  grandes y fáciles de tocar.
