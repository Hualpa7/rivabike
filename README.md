# Riva Bike — Plataforma web (landing + dashboard)

Aplicación para un taller de reparación y servicio técnico de bicicletas:
landing pública + dashboard administrativo. Ver la especificación completa
en [`docs/AGENT.md`](./docs/AGENT.md) y las referencias visuales en
[`docs/design-references.md`](./docs/design-references.md).

## Stack

React · Vite · TypeScript (strict) · Tailwind CSS · Supabase (Auth + Postgres +
Storage) · TanStack Query · React Hook Form + Zod · Zustand (estado local/UI) ·
Motion.

**Package manager: `pnpm` exclusivamente.** No usar `npm` ni `yarn`.

## Empezar

```bash
pnpm install
cp .env.example .env   # completar con las credenciales del proyecto de Supabase
pnpm dev
```

## Estructura

```text
src/
├── app/            # router, providers globales, config/env
├── components/      # ui/, layout/, forms/, landing/, dashboard/
├── features/        # auth, landing, inventory, services, work-orders,
│                     # quotes, gallery, settings (un modulo = una carpeta)
├── hooks/
├── lib/              # supabase/, google/, utils/
├── pages/
├── types/
├── schemas/          # validaciones Zod
└── styles/
```

## Estado del proyecto

Esto es el **scaffold de Fase 1** (ver `docs/AGENT.md` sección 69): configuración
inicial, routing, Auth cableado a Zustand, layout público/privado y una landing
mínima. El resto se divide en **tres prompts que pueden delegarse a sesiones
de OpenCode separadas** (incluso en paralelo): Backend, Frontend e
Integración — ver más abajo.

## Documentos de referencia

- `docs/AGENT.md` — especificación funcional y técnica completa (fuente de verdad).
- `docs/design-references.md` — decisiones de diseño (paleta, tipografía, referencias
  de Figma para el hero y el resto de la landing).
- `docs/data-contract.md` — contrato de datos (tipos + firmas de hooks/RPCs)
  compartido entre el prompt de Backend y el de Frontend, para que puedan
  avanzar en paralelo sin pisarse.
- `docs/opencode-prompt-1-project-setup.md` — prompt para poner a andar este
  scaffold y terminar la landing visualmente.
- `docs/opencode-prompt-2-backend.md` — prompt de Supabase/PostgreSQL
  (esquema, RLS, Storage, RPCs). No toca `src/`.
- `docs/opencode-prompt-3-frontend.md` — prompt de UI completa (landing +
  dashboard), construida contra mocks del mismo contrato de datos. Incluye
  la opción de usar OpenDesign para el Hero/landing.
- `docs/opencode-prompt-4-integration.md` — une backend y frontend,
  reemplaza mocks por datos reales, y cierra con hardening final.
