# Project Structure

```text
src/
├── app/            # providers: query client, theme, error boundary, router fallbacks
├── routes/         # TanStack Router file-based routes (thin shells)
├── shared/
│   ├── api/        # axios client (http.ts) + WireMockClient SDK
│   ├── components/
│   │   ├── ui/       # ShadCN-style primitives on Base UI
│   │   ├── layout/    # app shell, sidebar, header, command palette, ...
│   │   ├── editor/    # Monaco JSON/diff editor wrappers
│   │   └── feedback/  # NoActiveServerState, PlaceholderPage
│   ├── lib/         # utils.ts (cn), virtual-padding.ts
│   ├── stores/       # cross-cutting Zustand stores (ui-store.ts)
│   └── types/        # wiremock.ts — the Zod domain model
└── features/
    ├── servers/     # multi-server config, health checks
    ├── dashboard/    # live metrics & charts
    ├── mappings/
    ├── files/
    ├── requests/
    ├── scenarios/
    ├── recordings/
    ├── settings/
    └── audit/
```

This matches `AGENTS.md`'s own description of the layout, which is the
canonical source for these conventions — this page restates it with a bit
more detail and cross-references. Also see:
[Adding a Feature](/development/feature-development) and
[Feature Map](/ai/feature-map) for exactly which files exist in each
feature today.

## Feature folder convention

Each feature under `src/features/<name>/` uses whichever of these
subfolders it actually needs — not every feature has all of them:

```text
src/features/<feature>/
├── api/        # TanStack Query hooks (use-*.ts) — the only place WireMockClient is constructed
├── components/ # feature-specific components, not reused elsewhere
├── pages/      # one component per route in this feature
├── schemas/    # Zod schemas specific to this feature (forms, matcher option lists)
├── store/      # a Zustand store, only if the feature needs its own client state
├── types/      # types specific to this feature (not the shared WireMock domain model)
└── utils/      # pure helper/transform functions, colocated with a *.test.ts
```

For example, `servers` has `api/`, `components/`, `pages/`, `schemas/`,
`store/`, `types/`; `audit` has only `pages/`, `store/`, `types/` (no
`api/`, since it never talks to WireMock); `dashboard` has `api/`,
`components/`, `pages/` only (it reads other features' data, it doesn't
own any).

## Where things that aren't feature-specific belong

| Kind of code                                                                    | Location                                        |
| ------------------------------------------------------------------------------- | ----------------------------------------------- |
| Generic, reusable UI primitive with no business logic                           | `src/shared/components/ui/`                     |
| Cross-feature but WireMock/feature-agnostic widget (e.g. another shared editor) | `src/shared/components/` in a purpose subfolder |
| App chrome (nav, header, global dialogs)                                        | `src/shared/components/layout/`                 |
| The WireMock domain model (Zod schemas + types)                                 | `src/shared/types/wiremock.ts`                  |
| HTTP client / WireMock SDK                                                      | `src/shared/api/`                               |
| Cross-cutting client state (not WireMock data)                                  | `src/shared/stores/`                            |
| Anything specific to one feature's domain                                       | that feature's own folder, not `shared/`        |

## Non-`src` directories

| Path                 | Purpose                                                                       |
| -------------------- | ----------------------------------------------------------------------------- |
| `public/`            | Static assets served as-is by Vite (favicon, icon sprite)                     |
| `e2e/`               | Playwright end-to-end specs                                                   |
| `scripts/`           | `generate-routes.mjs` — regenerates `src/routeTree.gen.ts`                    |
| `deploy/nginx/`      | The Nginx config used in the Docker runtime image                             |
| `k8s/`               | Kubernetes manifests (Deployment, Service, Ingress, Namespace, Kustomization) |
| `helm/mockops/`      | The Helm chart                                                                |
| `.github/workflows/` | CI (`ci.yml`) and docs deployment (`docs.yml`)                                |
| `docs/`              | This documentation site (VitePress)                                           |
