# Proyecto: Plataforma web para taller y servicio técnico de bicicletas

Actúa como **arquitecto de software senior, desarrollador Full Stack especializado en React + Supabase y especialista en UX/UI**, trabajando sobre una aplicación web moderna, segura, escalable y mantenible.

El proyecto debe desarrollarse pensando desde el inicio en buenas prácticas de arquitectura, seguridad, accesibilidad, rendimiento y experiencia de usuario.

No quiero una implementación improvisada ni una aplicación difícil de mantener. Antes de tomar decisiones estructurales importantes, analiza las implicancias técnicas y utiliza las soluciones recomendadas actualmente por React, Supabase, PostgreSQL y Google Maps Platform.

---

# 1. Objetivo general

Construir una aplicación web para un negocio dedicado a:

* reparación de bicicletas;
* mantenimiento;
* servicios técnicos;
* instalación/cambio de repuestos;
* gestión interna de trabajos;
* generación de presupuestos;
* generación de órdenes de trabajo;
* control de inventario;
* presentación pública del negocio.

La aplicación tendrá dos grandes áreas:

## Área pública

Una **landing page profesional**, visible para cualquier visitante, cuyo objetivo será mostrar el negocio y generar confianza.

## Área privada

Un **dashboard administrativo**, accesible únicamente mediante autenticación con Supabase, que utilizará inicialmente un único usuario con privilegios de superadministrador.

La arquitectura debe quedar preparada para agregar posteriormente más usuarios, roles y permisos sin tener que rediseñar toda la base de datos.

---

# 2. Stack obligatorio

Utilizar:

* React
* Vite
* TypeScript
* Supabase
* PostgreSQL mediante Supabase
* pnpm como package manager

Todo comando relacionado con instalación de dependencias debe utilizar:

```bash
pnpm
```

No utilizar npm ni yarn.

Utilizar React con componentes funcionales y hooks.

Priorizar TypeScript estricto.

Configurar:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

siempre que sea compatible con el proyecto.

---

# 3. Filosofía del proyecto

El código debe priorizar:

* simplicidad;
* mantenibilidad;
* separación de responsabilidades;
* componentes reutilizables;
* tipado fuerte;
* validación;
* seguridad;
* accesibilidad;
* rendimiento;
* escalabilidad;
* bajo acoplamiento;
* evitar dependencias innecesarias.

No instalar una librería para resolver algo que pueda resolverse correctamente con React o APIs nativas sin complicar el proyecto.

Antes de agregar una dependencia, evaluar:

1. peso;
2. mantenimiento;
3. utilidad real;
4. compatibilidad con Vite;
5. impacto en bundle;
6. si existe una solución nativa suficientemente buena.

---

# 4. UI, estilos y animaciones

Para los estilos utilizar preferentemente:

## Tailwind CSS

Utilizar Tailwind para:

* layout;
* spacing;
* responsive design;
* componentes;
* estados;
* grids;
* formularios;
* dashboard;
* navegación.

Evitar crear grandes cantidades de CSS global.

Utilizar CSS tradicional únicamente cuando realmente aporte valor, por ejemplo:

* animaciones CSS específicas;
* estilos muy particulares;
* variables globales;
* integración con componentes que necesiten CSS específico.

Mantener una estructura de estilos limpia.

No usar un framework UI pesado salvo que exista una razón concreta.

---

# 5. Animaciones

Utilizar **Motion para React** únicamente donde realmente mejore la experiencia.

No llenar la aplicación de animaciones.

Usar animaciones principalmente en:

* Hero;
* entrada de secciones;
* cards;
* modales;
* navegación;
* transiciones de estados;
* microinteracciones.

Preferir CSS cuando una animación simple pueda resolverse sin JavaScript.

Las animaciones deben respetar:

```css
prefers-reduced-motion
```

---

# 6. Arquitectura frontend

Crear una arquitectura modular.

Ejemplo de estructura:

```text
src/
├── app/
│   ├── router/
│   ├── providers/
│   └── config/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── landing/
│   └── dashboard/
│
├── features/
│   ├── auth/
│   ├── landing/
│   ├── inventory/
│   ├── services/
│   ├── work-orders/
│   ├── quotes/
│   ├── gallery/
│   └── settings/
│
├── hooks/
├── lib/
│   ├── supabase/
│   ├── google/
│   └── utils/
│
├── pages/
├── types/
├── schemas/
└── styles/
```

No mezclar toda la lógica de negocio dentro de componentes visuales.

Separar:

* presentación;
* acceso a datos;
* validación;
* tipos;
* lógica de negocio.

---

# 7. Librerías frontend recomendadas

Evaluar y utilizar solamente las necesarias.

Base recomendada:

* `@supabase/supabase-js`
* `react-router-dom`
* `react-hook-form`
* `zod`
* `@hookform/resolvers`
* `motion`
* `@tanstack/react-query`

Utilizar React Query/TanStack Query para:

* caching;
* refetch;
* loading;
* mutations;
* invalidación de datos;
* sincronización de datos provenientes de Supabase.

Evitar estado global innecesario.

Utilizar React Context solamente cuando realmente corresponda, especialmente para:

* sesión;
* usuario autenticado;
* configuración global.

No introducir Redux salvo que la complejidad futura realmente lo justifique.

---

# 8. Variables de entorno

Las variables sensibles nunca deben estar hardcodeadas.

Utilizar `.env`.

Ejemplo conceptual:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_GOOGLE_MAPS_BROWSER_KEY=
VITE_GOOGLE_PLACE_ID=
```

Las claves que verdaderamente sean secretas **nunca deben exponerse mediante `VITE_`**.

Toda credencial que no pueda ser pública deberá mantenerse exclusivamente en:

* Supabase Edge Functions;
* variables de entorno del servidor;
* Supabase secrets.

Nunca exponer:

* service role key;
* secretos de APIs;
* credenciales administrativas;
* tokens privados.

Agregar:

```text
.env
.env.local
```

al `.gitignore` cuando corresponda.

Crear también:

```text
.env.example
```

sin secretos reales.

---

# 9. Landing page pública

Crear una landing page moderna, profesional y visualmente atractiva.

La landing deberá transmitir:

* confianza;
* experiencia;
* calidad de trabajo;
* profesionalismo;
* cercanía;
* especialización en bicicletas.

Debe estar completamente optimizada para móvil.

---

# 10. Hero

Crear un Hero visualmente fuerte.

Debe incluir:

* nombre del negocio;
* propuesta de valor;
* breve descripción;
* CTA principal;
* CTA secundario;
* imagen/visual relacionado con bicicletas;
* animaciones sutiles;
* buena jerarquía visual.

Los CTA podrían ser:

```text
Solicitar presupuesto
Ver nuestros trabajos
Cómo llegar
Contactarnos
```

No asumir todavía textos definitivos del negocio.

Crear una estructura fácilmente editable desde el dashboard posteriormente.

---

# 11. Sección de servicios

La landing deberá mostrar los servicios disponibles.

Los servicios no deberían quedar hardcodeados.

Deben provenir de la base de datos mediante una estructura de contenido público.

Mostrar:

* título;
* descripción;
* precio opcional;
* imagen opcional;
* estado activo/inactivo.

Los servicios podrán ser administrados desde el dashboard.

---

# 12. Google Reviews

Implementar una sección:

```text
Opiniones de nuestros clientes
```

Debe consumir Google Places API (New).

La arquitectura debe utilizar el `place_id` del negocio.

No realizar scraping de Google Maps.

Utilizar la API oficial.

Obtener como mínimo:

* nombre del negocio;
* rating general;
* cantidad de reseñas cuando esté disponible;
* reseñas;
* autor;
* rating;
* texto;
* fecha relativa;
* enlace correspondiente cuando corresponda.

Considerar que Google Places API devuelve un número limitado de reviews por respuesta.

Respetar todas las políticas de Google respecto a:

* atribución;
* autor de la reseña;
* Google Maps;
* contenido proveniente de Google.

No almacenar permanentemente contenido de Google sin verificar previamente las políticas correspondientes.

Evitar realizar solicitudes innecesarias.

Preferir una arquitectura que reduzca llamadas repetidas a Google.

La lógica sensible de acceso a Google debe quedar fuera del cliente cuando la API utilizada requiera una credencial que no deba exponerse.

---

# 13. Galería

Crear una sección pública:

```text
Nuestros trabajos
```

La galería debe consumir imágenes administradas desde Supabase Storage.

Cada trabajo de galería debe poder contener:

* título;
* descripción;
* imagen;
* múltiples imágenes opcionalmente;
* categoría;
* fecha;
* orden de visualización;
* estado publicado/no publicado.

Debe existir la posibilidad de:

* crear;
* editar;
* eliminar;
* activar/desactivar;
* reordenar.

La galería pública solamente debe mostrar contenido publicado.

Utilizar lazy loading para imágenes.

Optimizar imágenes.

Evitar cargar imágenes originales gigantescas.

---

# 14. Contacto y ubicación

Crear sección de contacto con:

* teléfono;
* WhatsApp;
* dirección;
* horarios;
* redes sociales;
* email opcional.

Agregar Google Maps.

El mapa debe mostrar el local.

Utilizar Google Maps JavaScript API.

No construir un mapa falso.

La API key utilizada en frontend debe estar correctamente restringida por dominio y APIs necesarias.

El mapa debe ser responsive.

Incluir:

```text
Cómo llegar
```

como CTA.

---

# 15. Posible CMS interno para la landing

Preparar el sistema para que en el futuro el superadmin pueda modificar desde el dashboard:

* textos del Hero;
* descripción del negocio;
* contacto;
* horarios;
* redes;
* servicios;
* galería;
* imágenes;
* información de ubicación;
* mensajes de CTA.

No crear todos estos módulos obligatoriamente en la primera iteración si afectan demasiado el alcance.

Sin embargo, diseñar la base de datos pensando desde el inicio en que la landing sea administrable.

---

# 16. Autenticación Supabase

La aplicación privada utilizará Supabase Auth.

Implementar:

* login;
* logout;
* persistencia de sesión;
* recuperación de contraseña;
* actualización de contraseña;
* protección de rutas;
* manejo correcto de expiración de sesión;
* estados de loading;
* manejo de errores.

La ruta:

```text
/dashboard
```

y todas sus rutas hijas deben ser privadas.

Si el usuario no tiene una sesión válida:

```text
redirect -> /login
```

No confiar únicamente en esconder botones o rutas en React.

La autorización real debe estar implementada en Supabase/PostgreSQL mediante RLS.

---

# 17. Único usuario inicial: superadmin

Inicialmente existirá un único usuario administrativo.

No implementar un registro público.

El usuario será creado/controlado mediante Supabase Auth.

El sistema debe quedar preparado para incorporar posteriormente:

```text
superadmin
admin
empleado
```

sin necesidad de reconstruir las tablas principales.

Crear una estructura de perfil/rol apropiada.

No guardar información crítica únicamente en localStorage.

---

# 18. Seguridad de autenticación

Implementar protección contra:

* fuerza bruta;
* credential stuffing;
* abuso de recuperación de contraseña;
* bots;
* enumeración de usuarios cuando sea posible;
* sesiones inválidas.

Utilizar las capacidades de rate limiting de Supabase Auth.

Evaluar activar:

* CAPTCHA;
* Cloudflare Turnstile;
* políticas de contraseña robustas;
* MFA para el superadmin como futura mejora.

No implementar un sistema de rate limiting inventado en el frontend como sustituto de la seguridad del backend.

---

# 19. Protección contra SQL Injection

No construir SQL concatenando strings provenientes del usuario.

Utilizar:

* Supabase client;
* queries parametrizadas;
* PostgreSQL;
* RPCs seguras;
* validación de entradas.

Toda entrada de usuario debe validarse con Zod cuando corresponda.

Las operaciones sensibles sobre inventario deben realizarse de forma transaccional.

---

# 20. Row Level Security

RLS debe permanecer activada.

Regla fundamental:

> Ninguna tabla expuesta a la Data API debe quedar accesible simplemente por existir.

Diseñar políticas explícitas.

Separar:

## Datos públicos

Por ejemplo:

* servicios publicados;
* contenido público;
* galería publicada;
* información de contacto;
* configuración pública.

## Datos privados

Por ejemplo:

* clientes;
* presupuestos;
* órdenes de trabajo;
* inventario;
* movimientos de stock;
* fotos privadas;
* información interna.

El contenido público debe poder ser leído por `anon` únicamente cuando corresponda.

Los datos administrativos deben poder ser accedidos exclusivamente por el superadmin autenticado.

No permitir que `anon`:

* inserte;
* actualice;
* elimine;

datos administrativos.

No permitir que `authenticated` cualquiera acceda al dashboard solamente por estar autenticado.

La autorización debe contemplar el rol/identidad administrativa.

---

# 21. Grants

No asumir que RLS por sí sola resuelve todo.

Revisar:

* grants;
* privileges;
* execute sobre funciones;
* acceso anon;
* acceso authenticated.

Dar solamente los permisos necesarios.

Las funciones sensibles no deben quedar ejecutables públicamente.

Si se utilizan funciones `SECURITY DEFINER`:

* utilizarlas únicamente cuando sea necesario;
* limitar su ejecución;
* usar `search_path = ''`;
* utilizar nombres de esquema completos;
* evitar privilegios innecesarios.

---

# 22. Supabase Storage

Utilizar Supabase Storage para imágenes.

Separar conceptualmente como mínimo:

```text
public-gallery
work-order-photos
inventory-images
```

La galería pública puede utilizar un bucket público cuando sea apropiado.

Las fotos de órdenes de trabajo deben tratarse como información privada.

Las fotos privadas deben utilizar políticas RLS y, cuando corresponda, URLs firmadas temporales.

No almacenar las imágenes como BYTEA dentro de PostgreSQL.

Guardar en PostgreSQL solamente:

* path;
* bucket;
* metadata;
* relación con la entidad.

---

# 23. Dashboard

El dashboard deberá tener una navbar/sidebar superior responsive.

Secciones iniciales:

```text
Inicio
Trabajos / Servicios
Inventario
Presupuestos / Órdenes
Trabajos por realizar
Galería
Contenido del sitio
Configuración
```

El diseño debe poder crecer posteriormente.

En mobile debe existir navegación adecuada.

---

# 24. Módulo: catálogo de servicios

Crear CRUD completo.

Cada servicio deberá tener como mínimo:

```text
id
titulo
descripcion
precio_base
activo
created_at
updated_at
```

Opcionalmente:

```text
imagen
categoria
orden
```

El administrador debe poder:

* crear;
* editar;
* activar;
* desactivar;
* eliminar cuando corresponda.

Los servicios utilizados históricamente en órdenes no deben provocar inconsistencias si posteriormente se modifica su precio.

---

# 25. Módulo: inventario

Crear CRUD de repuestos.

Cada repuesto tendrá:

```text
id
nombre
descripcion opcional
stock_actual
precio_unitario
imagen opcional
activo
created_at
updated_at
```

Poder:

* crear;
* editar;
* inhabilitar;
* buscar;
* filtrar;
* visualizar stock;
* modificar precio;
* modificar descripción;
* administrar imagen.

No borrar físicamente productos que ya tengan historial importante salvo que exista una razón clara.

Preferir:

```text
activo = false
```

para inhabilitar.

---

# 26. Movimiento de inventario

No permitir simplemente:

```text
UPDATE stock = stock - 1
```

desde el frontend para operaciones críticas.

Crear un sistema de movimientos.

Tabla conceptual:

```text
stock_movements
```

Campos sugeridos:

```text
id
inventory_item_id
tipo
cantidad
stock_anterior
stock_posterior
motivo
work_order_id nullable
created_by
created_at
```

Tipos:

```text
entrada
salida
ajuste
consumo_trabajo
devolucion
```

Cada modificación de stock debe generar un historial.

---

# 27. Stock transaccional

Implementar una función/RPC o mecanismo transaccional para:

1. comprobar stock;
2. determinar movimiento;
3. actualizar stock;
4. registrar movimiento;
5. asegurar consistencia.

La operación completa debe ser atómica.

Evitar race conditions.

Evitar stock negativo salvo que exista una decisión explícita de negocio para permitirlo.

---

# 28. Relación entre servicio y repuestos

Cada servicio del catálogo podrá asociarse opcionalmente a uno o varios repuestos.

No asumir necesariamente una relación 1:1.

Crear una tabla intermedia conceptual:

```text
service_inventory_items
```

con campos similares a:

```text
service_id
inventory_item_id
cantidad
```

Ejemplo:

```text
Cambio de transmisión
    -> Cable de cambio x1
    -> Funda x1
```

Sin embargo, al crear un presupuesto el administrador podrá:

* aceptar la configuración predefinida;
* modificarla;
* quitar repuestos;
* agregar repuestos adicionales.

Los datos incluidos finalmente en la orden deben ser una **fotografía histórica** del presupuesto, no depender en tiempo real del catálogo.

---

# 29. Presupuestos / órdenes de trabajo

Crear un módulo para registrar trabajos.

La entidad puede llamarse:

```text
work_orders
```

Debe contener información del cliente.

Datos del cliente:

```text
nombre
apellido
telefono
direccion
```

Datos de la bicicleta:

```text
marca
modelo
color
```

Datos del trabajo:

```text
fecha_estimada_entrega
observaciones
estado
```

Además:

```text
created_at
updated_at
created_by
```

---

# 30. Estados de una orden

Estados iniciales:

```text
pendiente
aceptado
en_ejecucion
terminado
rechazado
```

Interpretación:

### pendiente

Presupuesto generado y esperando aceptación del cliente.

### aceptado

El cliente aceptó el presupuesto.

### en_ejecucion

El trabajo está siendo realizado.

### terminado

El trabajo terminó y la bicicleta está lista para entregar.

### rechazado

El cliente rechazó el presupuesto.

No depender solamente de colores para representar estados.

Utilizar etiquetas claras.

---

# 31. Items de una orden

No depender directamente del precio actual del catálogo.

Crear:

```text
work_order_services
```

y:

```text
work_order_inventory_items
```

Los servicios incluidos deben guardar:

```text
service_id nullable
title_snapshot
description_snapshot
unit_price
quantity
subtotal
```

Esto permite que si mañana un servicio pasa de:

```text
$10.000
```

a:

```text
$15.000
```

una orden histórica siga mostrando:

```text
$10.000
```

---

# 32. Edición manual del precio

Cuando el superadmin agregue un servicio desde el catálogo:

```text
precio por defecto = precio_base actual
```

Pero debe poder modificar manualmente:

```text
precio de esta orden
```

La modificación solo debe afectar esa orden.

No modificar el precio global del catálogo.

---

# 33. Items de inventario dentro de la orden

También se podrán agregar repuestos independientemente de los servicios.

Ejemplo:

```text
Servicio:
Centrado de rueda

Repuesto adicional:
Cámara 29"
Cantidad: 1
Precio: $...
```

Guardar snapshot del:

* nombre;
* precio;
* cantidad.

---

# 34. Descuento / subtotal / total

La estructura debe permitir posteriormente incorporar:

* descuentos;
* impuestos;
* promociones;
* mano de obra;
* costos adicionales.

Aunque no se implementen inicialmente, diseñar el modelo para permitirlo.

El total no debe depender únicamente de cálculos visuales del frontend.

El backend/base de datos debe validar los valores importantes.

---

# 35. Observaciones

Permitir un campo de texto amplio:

```text
observaciones
```

para registrar:

* daños encontrados;
* pedidos especiales;
* indicaciones del cliente;
* detalles técnicos;
* advertencias.

---

# 36. Fotografías

Una orden podrá tener múltiples fotografías.

Ejemplos:

```text
antes
durante
despues
```

Crear una entidad conceptual:

```text
work_order_photos
```

con:

```text
id
work_order_id
storage_path
tipo
descripcion
created_at
```

Tipos:

```text
antes
durante
despues
```

Permitir múltiples imágenes.

Las imágenes no deben guardarse directamente en la tabla principal.

---

# 37. Flujo completo de una orden

Flujo esperado:

```text
Nueva orden
    ↓
Agregar cliente
    ↓
Agregar bicicleta
    ↓
Seleccionar servicios
    ↓
Modificar precios si corresponde
    ↓
Agregar repuestos
    ↓
Agregar observaciones
    ↓
Subir fotografías
    ↓
Guardar
    ↓
Estado: pendiente
```

Luego:

```text
pendiente
    ↓
cliente acepta
    ↓
aceptado
```

Después:

```text
aceptado
    ↓
comienza reparación
    ↓
en_ejecucion
```

Después:

```text
en_ejecucion
    ↓
trabajo terminado
    ↓
terminado
```

También:

```text
pendiente
    ↓
rechazado
```

---

# 38. Consumo de inventario

Definir claramente cuándo se consume un repuesto.

La regla inicial recomendada es:

* no descontar stock al crear un presupuesto;
* no descontar stock simplemente porque un repuesto fue agregado a una cotización;
* descontar stock cuando el repuesto sea realmente utilizado durante la ejecución del trabajo.

El sistema deberá registrar ese consumo vinculado a:

```text
work_order_id
inventory_item_id
stock movement
```

Esto permite conocer exactamente por qué disminuyó el inventario.

Si posteriormente se necesita reservar stock para órdenes aceptadas, diseñar esa funcionalidad como una evolución separada.

---

# 39. PDF de presupuesto

En una orden en estado `pendiente` o cuando tenga sentido generar el presupuesto, mostrar botón:

```text
Generar presupuesto
```

El PDF debe incluir:

* identidad del negocio;
* logo;
* datos de contacto;
* fecha;
* número de presupuesto/orden;
* datos del cliente;
* datos de la bicicleta;
* servicios;
* descripción;
* cantidad;
* precio unitario;
* subtotal;
* repuestos;
* total;
* observaciones;
* condiciones;
* estado del presupuesto.

Debe tener diseño profesional.

Debe poder descargarse/abrirse para imprimir.

---

# 40. PDF de orden de trabajo / entrega

Cuando el trabajo esté:

```text
terminado
```

habilitar:

```text
Generar orden de trabajo
```

Este PDF debe diferenciarse del presupuesto.

Debe indicar claramente que:

```text
se realiza la entrega de la bicicleta
```

Debe incluir:

* cliente;
* bicicleta;
* trabajos realizados;
* repuestos utilizados;
* total;
* observaciones;
* fecha;
* información de entrega;
* fotografías.

Las fotografías deben incluir:

```text
antes
después
```

cuando existan.

El PDF debe poder utilizarse como comprobante/documentación interna.

---

# 41. Historial

Preparar la arquitectura para mantener historial de:

* cambios de estado;
* movimientos de inventario;
* modificaciones importantes;
* quién realizó la acción;
* fecha.

Puede implementarse inicialmente de forma sencilla, pero debe ser posible ampliarlo.

---

# 42. Base de datos

Diseñar un modelo relacional normalizado.

Como punto de partida estudiar entidades similares a:

```text
profiles
roles
site_settings
services
inventory_items
service_inventory_items
stock_movements
customers
bicycles
work_orders
work_order_services
work_order_inventory_items
work_order_photos
gallery_items
gallery_images
```

No copiar ciegamente esta estructura.

Analizar relaciones, cardinalidades y necesidades reales antes de crear las migraciones.

Agregar:

* PK;
* FK;
* UNIQUE;
* CHECK constraints;
* índices;
* timestamps;
* soft delete/active cuando sea conveniente.

---

# 43. Índices

Crear índices donde tengan sentido, especialmente para:

* foreign keys;
* estados;
* fechas;
* búsquedas frecuentes;
* relaciones de órdenes;
* movimientos de stock.

No crear índices indiscriminadamente.

Analizar consultas reales.

---

# 44. Migraciones

Toda modificación de base de datos debe realizarse mediante migraciones versionadas.

No depender exclusivamente de cambios manuales en el dashboard de Supabase.

La estructura debe ser reproducible.

---

# 45. Integridad histórica

Este punto es muy importante.

Los datos históricos de una orden no deben cambiar porque:

* se modifique un servicio;
* se cambie el nombre de un repuesto;
* se modifique el precio;
* se desactive un servicio;
* se cambie una imagen.

Por eso utilizar snapshots donde corresponda.

Ejemplo:

```text
service_id
service_name_snapshot
service_description_snapshot
unit_price
```

Lo mismo para repuestos.

---

# 46. Seguridad de archivos

Validar:

* MIME type;
* extensión;
* tamaño;
* cantidad de archivos.

No confiar exclusivamente en la extensión proporcionada por el navegador.

No permitir uploads arbitrarios.

Definir límites razonables.

Evitar almacenar archivos innecesariamente grandes.

---

# 47. Validación

Utilizar Zod para validar formularios.

Validar en frontend para UX.

Pero recordar:

> La validación frontend no reemplaza la seguridad backend.

Los constraints importantes deben existir también en PostgreSQL o en la lógica de servidor correspondiente.

---

# 48. Manejo de errores

Nunca mostrar errores internos del backend directamente al usuario.

Crear mensajes como:

```text
No se pudo guardar el servicio.
Intentá nuevamente.
```

Registrar detalles técnicos en consola durante desarrollo cuando sea apropiado.

Manejar:

* errores de red;
* errores de Supabase;
* errores de autenticación;
* errores de Storage;
* errores de Google APIs;
* errores de generación de PDF.

---

# 49. Loading states

Nunca dejar al usuario preguntándose si algo está cargando.

Crear estados:

```text
loading
empty
error
success
```

especialmente para:

* tablas;
* dashboard;
* galería;
* inventario;
* servicios;
* login;
* uploads.

---

# 50. UX

La experiencia debe ser profesional.

Utilizar:

* skeletons;
* toasts;
* modales;
* confirmaciones;
* formularios claros;
* feedback inmediato;
* estados visuales;
* filtros;
* búsqueda;
* paginación cuando sea necesario.

No abusar de modales gigantes.

---

# 51. Dashboard responsive

El dashboard debe funcionar correctamente en:

* desktop;
* tablet;
* mobile.

No diseñar pensando exclusivamente en desktop.

La gestión de órdenes e inventario debe seguir siendo usable desde una pantalla pequeña.

---

# 52. Accesibilidad

Respetar:

* HTML semántico;
* labels;
* focus states;
* navegación por teclado;
* contraste;
* aria-label cuando sea necesario;
* reduced motion;
* botones reales para acciones;
* mensajes de error accesibles.

---

# 53. SEO

La landing debe estar preparada para SEO.

Implementar:

* title;
* meta description;
* Open Graph;
* favicon;
* headings correctamente jerarquizados;
* URLs limpias;
* información estructurada cuando corresponda;
* alt text.

Agregar datos estructurados de negocio local solamente cuando sean correctos y aplicables.

---

# 54. Performance

Optimizar:

* lazy loading;
* code splitting;
* React.lazy cuando corresponda;
* imágenes;
* consultas;
* caché;
* bundle;
* componentes.

No cargar todo el dashboard inicialmente.

Separar rutas públicas y privadas.

No realizar consultas innecesarias.

---

# 55. Google Maps y Google Places

Separar conceptualmente:

```text
Google Maps JavaScript API
```

de:

```text
Places API (New)
```

Utilizar el método/API adecuado para cada necesidad.

Para Places API:

* utilizar Field Masks;
* solicitar solamente los campos necesarios;
* evitar requests costosos innecesarios;
* utilizar el place ID conocido del negocio;
* respetar las políticas de Google.

No utilizar APIs legacy si existe una solución actual apropiada.

---

# 56. Configuración del negocio

El sistema debería permitir posteriormente administrar desde dashboard:

```text
nombre del negocio
logo
telefono
WhatsApp
direccion
email
horarios
Instagram
Facebook
Google Place ID
Google Maps URL
descripcion
```

Separar configuración pública de datos privados.

---

# 57. Arquitectura para futuras funcionalidades

No implementar funcionalidades futuras todavía, pero no diseñar de manera que sea imposible agregarlas.

Posibles futuras funciones:

* múltiples empleados;
* múltiples roles;
* agenda;
* calendario;
* notificaciones;
* WhatsApp;
* seguimiento del trabajo;
* cliente consultando su orden;
* QR;
* firma digital;
* historial de bicicletas;
* estadísticas;
* reportes;
* compras a proveedores;
* control financiero;
* dashboard con métricas;
* reservas online.

La base debe permitir evolucionar hacia eso.

---

# 58. Seguridad de Supabase

Aplicar como regla general:

* RLS habilitada;
* grants mínimos;
* políticas explícitas;
* no exponer service role;
* no utilizar service role en frontend;
* Storage protegido;
* funciones sensibles protegidas;
* secrets únicamente en entorno servidor/Edge Functions;
* revisar Security Advisor;
* revisar Performance Advisor.

No considerar una feature terminada si funciona pero deja una brecha de seguridad.

---

# 59. Revisión de seguridad

Antes de considerar una funcionalidad terminada, verificar:

```text
¿Puede anon acceder?
¿Puede un usuario autenticado no autorizado acceder?
¿Puede modificar?
¿Puede eliminar?
¿Puede ejecutar una función sensible?
¿Puede acceder a imágenes privadas?
¿Puede alterar stock directamente?
¿Puede modificar precios históricos?
¿Puede modificar una orden que no debería?
```

---

# 60. Transacciones importantes

Las operaciones como:

```text
consumir stock
crear movimiento
actualizar orden
```

deben pensarse como operaciones consistentes y atómicas.

Cuando una operación involucre múltiples tablas y la consistencia sea importante, preferir una RPC/PostgreSQL function o mecanismo transaccional apropiado antes que intentar coordinarla únicamente desde React.

---

# 61. Supabase Edge Functions

Utilizar Edge Functions cuando exista necesidad de:

* secretos;
* integración con APIs externas;
* lógica server-side;
* generación de URLs firmadas;
* operaciones que no deben ejecutarse directamente desde el navegador.

No convertir Edge Functions en una capa innecesaria para todas las consultas normales.

Para CRUD simples protegidos correctamente mediante RLS, utilizar Supabase directamente.

---

# 62. PDF

Investigar antes de implementar cuál solución es más apropiada entre:

* `@react-pdf/renderer`;
* impresión HTML/CSS;
* otra solución liviana.

La elección debe priorizar:

* calidad;
* imágenes;
* estabilidad;
* compatibilidad;
* mantenimiento.

No elegir una librería solamente porque sea popular.

---

# 63. Estado de la aplicación

Mantener una arquitectura sencilla.

No utilizar estado global para datos que solamente necesita un componente.

Utilizar React Query para datos remotos.

Utilizar estado local para UI.

Utilizar contexto solamente para estado verdaderamente transversal.

---

# 64. Formulario de nueva orden

Diseñar el formulario como un flujo fácil de usar.

Debe permitir:

### Cliente

```text
Nombre
Apellido
Teléfono
Dirección
```

### Bicicleta

```text
Marca
Modelo
Color
```

### Trabajo

```text
Fecha estimada
Servicios
Repuestos
Observaciones
Fotos
```

### Resumen

Mostrar:

```text
Subtotal servicios
Subtotal repuestos
Descuentos
Total
```

antes de guardar.

---

# 65. UX del catálogo de servicios

Al agregar un servicio:

```text
buscar servicio
↓
seleccionar
↓
mostrar precio actual
↓
permitir edición
↓
guardar snapshot
```

No obligar al administrador a escribir manualmente todo.

---

# 66. UX del inventario

En la tabla de inventario mostrar:

```text
Producto
Stock
Precio
Estado
Último movimiento
Acciones
```

Agregar indicadores visuales para:

* stock normal;
* stock bajo;
* sin stock.

El umbral de stock bajo debe poder configurarse posteriormente.

---

# 67. Historial de stock

Agregar vista:

```text
Historial de movimientos
```

Mostrar:

```text
Fecha
Repuesto
Tipo
Cantidad
Stock anterior
Stock posterior
Motivo
Trabajo relacionado
Usuario
```

Poder filtrar por:

* repuesto;
* fecha;
* tipo;
* orden.

---

# 68. Reglas de negocio importantes

No permitir:

* stock negativo accidental;
* precios negativos;
* cantidades negativas introducidas como cantidades normales;
* órdenes sin cliente;
* órdenes sin ningún trabajo;
* estados inválidos;
* acceso a información administrativa mediante anon;
* acceso a fotos privadas sin autorización.

---

# 69. Desarrollo incremental

NO intentar construir toda la aplicación de una sola vez.

Trabajar por fases.

## Fase 1

* configuración inicial;
* React;
* Vite;
* pnpm;
* Tailwind;
* routing;
* Supabase;
* Auth;
* layout;
* landing base.

## Fase 2

* esquema DB;
* RLS;
* roles;
* servicios;
* inventario.

## Fase 3

* órdenes;
* clientes;
* bicicletas;
* servicios;
* repuestos.

## Fase 4

* stock movements;
* consumo de inventario;
* fotografías.

## Fase 5

* PDFs.

## Fase 6

* Google Maps;
* Google Reviews.

## Fase 7

* CMS de landing;
* galería administrable.

## Fase 8

* testing;
* hardening;
* performance;
* accesibilidad;
* SEO.

No pasar automáticamente de una fase a otra sin verificar la anterior.

---

# 70. Migraciones y SQL

Cada modificación importante del esquema debe quedar documentada.

Generar SQL/migraciones legibles.

Utilizar nombres consistentes.

Preferir:

```text
snake_case
```

en PostgreSQL.

Evitar nombres ambiguos.

---

# 71. Testing

Agregar progresivamente:

* tests unitarios;
* tests de validación;
* tests de lógica de stock;
* tests de permisos;
* tests de componentes críticos;
* tests del flujo de órdenes.

Las reglas de stock y permisos deben tener especial cobertura.

---

# 72. Definición de terminado

Una funcionalidad no se considera terminada solamente porque "funciona".

Debe verificarse:

```text
Funcionalidad
Seguridad
Validación
Responsive
Accesibilidad
Manejo de errores
Loading states
Performance
RLS
Storage
Integridad de datos
```

---

# 73. Forma de trabajo con Claude

Antes de modificar o crear código importante:

1. inspeccionar la estructura existente;
2. entender dependencias;
3. identificar qué ya está implementado;
4. analizar el impacto;
5. proponer una arquitectura;
6. implementar;
7. verificar;
8. corregir errores.

No duplicar funcionalidades existentes.

No crear archivos innecesarios.

No realizar refactors masivos sin justificación.

No cambiar tecnologías previamente seleccionadas sin explicar por qué.

---

# 74. Regla fundamental para Claude

No asumir que una decisión es correcta solamente porque "funciona".

Cuando exista una decisión arquitectónica relevante, evaluar:

```text
seguridad
performance
mantenibilidad
escalabilidad
costo
complejidad
```

y elegir la solución con mejor equilibrio.

---

# 75. Resultado esperado

El producto final deberá sentirse como una aplicación comercial real, no como un CRUD genérico.

La landing debe tener:

* diseño profesional;
* excelente experiencia móvil;
* identidad visual;
* imágenes;
* animaciones sutiles;
* llamadas a la acción.

El dashboard debe tener:

* navegación clara;
* información estructurada;
* tablas profesionales;
* formularios cómodos;
* filtros;
* feedback visual;
* seguridad real;
* operaciones consistentes.

El resultado debe permitir que el dueño del taller pueda gestionar su negocio desde un único lugar.

---

# 76. Primera tarea de Claude

Antes de comenzar a programar:

1. analizar esta especificación;
2. detectar contradicciones;
3. proponer la arquitectura definitiva;
4. proponer el esquema relacional;
5. proponer las políticas RLS;
6. proponer buckets de Storage;
7. proponer estructura de carpetas;
8. proponer dependencias mínimas;
9. proponer estrategia de Google Maps/Places;
10. proponer estrategia de generación de PDF;
11. proponer roadmap de implementación.

No generar todavía toda la aplicación.

Primero presentar una propuesta técnica detallada.

Luego, una vez aprobada la arquitectura, comenzar la implementación por fases.

---

# 77. Criterio de diseño

La aplicación debe seguir un lenguaje visual contemporáneo relacionado con:

* bicicletas;
* mecánica;
* tecnología;
* precisión;
* movimiento;
* confianza.

Evitar una estética de "dashboard administrativo genérico".

La landing y el dashboard deben compartir identidad visual, pero cada uno debe estar optimizado para su propósito.

---

# 78. Decisión tecnológica inicial

La elección inicial es:

```text
React
Vite
TypeScript
Supabase
PostgreSQL
Tailwind CSS
React Hook Form
Zod
TanStack Query
Motion
pnpm
```

No agregar librerías adicionales hasta justificar claramente la necesidad.

La prioridad es construir una aplicación:

**segura + rápida + mantenible + escalable + visualmente profesional.**

---

# 79. Adenda — decisiones tomadas fuera de este documento

Estas decisiones se tomaron en la conversación de arranque del proyecto y
**complementan** (no reemplazan) todo lo anterior:

* **Estado local/UI:** cuando se necesite estado compartido en cliente que no
  sea sesión (ej. wizard de nueva orden, filtros de UI persistentes en una
  pantalla, carrito de items de un presupuesto en construcción), usar
  **Zustand** — no Context ad-hoc, no Redux, no otras libs de estado.
  React Query sigue siendo la única fuente de verdad para datos remotos;
  Zustand es solo para estado de cliente/UI.
* **Paleta de marca:** negro, blanco y rosa (`#EF7D97` / `#E8546F` como
  variante hover/deep), ver `docs/design-references.md`.
* **Referencias visuales:** el Hero de la landing debe inspirarse en el
  patrón visual del Figma "Motor Bike Website — Concept UI" (foto a sangre +
  eyebrow + titular enorme superpuesto). El resto de la landing sigue el
  lenguaje editorial minimalista del Figma "Veloretti — Electric Bike Shop
  Website Template" (alternancia de secciones texto/imagen, mucho espacio en
  blanco, tipografía grande y liviana, footer oscuro). Nunca copiar textos ni
  activos de esos archivos: son referencia de *estructura y estilo*, el
  contenido es 100% de Riva Bike.
* **Mobile-first:** dado que el uso principal será desde celular, priorizar
  el diseño y las pruebas en viewport mobile antes que desktop en cada
  pantalla nueva.
