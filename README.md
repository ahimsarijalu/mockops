# MockOps

A production-grade WireMock API Management Console for managing one or more
WireMock servers through the Admin API — comparable in spirit to Swagger UI,
Postman, and the Kubernetes Dashboard, but purpose-built for mock API
lifecycle management.

## Tech stack

React 19 · TypeScript · Vite · TanStack Router/Query/Table/Form · ShadCN-style
UI on Base UI · Zod · Axios · Zustand · React Virtuoso · Monaco Editor ·
Recharts · Sonner · Tailwind CSS v4

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check + production build
npm run lint      # eslint
npm run test      # vitest unit tests
npm run test:e2e  # playwright e2e tests
```

## Project structure

```text
src/
 ├── app/            # providers: query client, theme, error boundary
 ├── routes/         # TanStack Router file-based routes
 ├── shared/
 │   ├── api/        # axios client + WireMockClient SDK
 │   ├── components/ # ui primitives + app layout
 │   ├── hooks/
 │   ├── lib/
 │   ├── stores/      # cross-cutting Zustand stores (UI state)
 │   ├── types/       # Zod schemas / domain types
 │   └── utils/
 └── features/
     ├── servers/     # multi-server config, health checks
     ├── dashboard/    # live metrics & charts
     ├── mappings/
     ├── files/
     ├── requests/
     ├── scenarios/
     ├── recordings/
     ├── templates/
     ├── settings/
     └── audit/
```

Each feature follows: `api/ components/ hooks/ pages/ schemas/ types/ store/`.

## Implementation roadmap

- **Phase 1 — Foundation** ✅ Tooling, theming, app shell (sidebar, header,
  command palette, theme toggle), routing skeleton, Zod domain schemas,
  `WireMockClient` SDK, multi-server management with health checks, and a
  live dashboard.
- **Phase 2 — Mapping management** ✅ full stub CRUD, visual builder, Monaco
  JSON editor, matcher support, diff view.
- **Phase 3 — Response configuration** ✅ headers/delay distribution/fault/
  proxy (with extra proxy headers)/chunked dribble/templating (incl. custom
  transformers and parameters) editors integrated into the mapping form.
- **Phase 4 — File explorer** ✅ browse/create/edit/delete `__files`, with
  links to mappings referencing each file via `bodyFileName`.
- **Phase 5 — Request journal & near misses** ✅ live, auto-refreshing
  journal with search/filtering, virtualized table, request/response detail
  inspector, journal clearing, and near-miss diagnostics.
- **Phase 6 — Scenarios & recordings** ✅ scenario state view with reset/set
  state controls and derived transition graphs, plus recording start/stop/
  snapshot with captured-mapping review.
- **Phase 7 — Import/export, bulk ops, metadata/tags, settings, audit log** ✅
  mapping JSON import/export, bulk enable/disable/delete, tag-based metadata
  editing, global response settings (delay distribution, proxy pass-through),
  server actions (save/reset), console theme preferences, and a searchable
  local audit log.
- **Phase 8 — Testing, accessibility polish, Docker/Nginx/Kubernetes/Helm/CI**.

## Multi-server support

Servers are stored locally (Zustand + localStorage) with environment tagging
(development, qa, sit, uat, production-like, local), `none`/`basic`/`bearer`
auth, health polling, and last-connection tracking. Switch the active server
from the header to retarget every feature.
