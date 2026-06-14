# Agent Guide

Instructions for AI coding agents (and contributors) working on MockOps.

## Project overview

MockOps is a WireMock API Management Console: React 19 + TypeScript + Vite,
TanStack Router/Query/Table/Form, ShadCN-style components on Base UI, Zod,
Axios, Zustand, Monaco Editor, Recharts, Tailwind CSS v4. See `README.md` for
the full tech stack and roadmap.

## Project structure

```text
src/
 ├── app/            # providers: query client, theme, error boundary
 ├── routes/         # TanStack Router file-based routes
 ├── shared/          # api client/SDK, ui primitives, layout, stores, types, utils
 └── features/        # one folder per domain: servers, dashboard, mappings,
                       # files, requests, scenarios, recordings, templates,
                       # settings, audit
```

Each feature follows: `api/ components/ hooks/ pages/ schemas/ types/ store/`.
Follow this layout for any new feature.

## API layer / SDK

`src/shared/api/http.ts` exposes `createHttpClient(server: ServerConfig)`,
which builds a per-server Axios instance: strips trailing slashes from
`baseUrl`, sets a 15s timeout and JSON content type, and wires up auth from
`ServerConfig` (`basic` via `instance.defaults.auth`, `bearer` via a static
`Authorization` header). A response interceptor normalizes failures into a
typed `ApiError` (`network` | `timeout` | `http` | `parse` | `unknown`).

`src/shared/api/wiremock-client.ts` exports `WireMockClient`, which composes
sub-clients sharing one Axios instance: `mappings` (CRUD, search/find-by-
metadata, import, persist, reset), `files` (`__admin/files` CRUD with
path-segment URL encoding), `scenarios` (list/reset/setState), `requests`
(journal, near-misses, count, unmatched), `recordings` (status/start/stop/
snapshot), and `system` (settings, health, version, shutdown, reset all).
Every read response is parsed through the matching Zod schema in
`src/shared/types/wiremock.ts` — this SDK is the single boundary where
untyped WireMock JSON becomes typed domain objects. New WireMock Admin API
calls should be added to the relevant sub-client, not called ad hoc from
components.

## State management

All Zustand stores follow `create<State>()(persist(...))` with a unique
`mockops-*` localStorage key:

- `src/shared/stores/ui-store.ts` — UI prefs (theme, sidebar collapsed,
  command palette open), cross-cutting.
- `src/features/servers/store/server-store.ts` — configured WireMock
  servers + `activeServerId`, with `addServer`/`updateServer`/`removeServer`/
  `setActiveServer`, plus a derived `useActiveServer()` hook.
- `src/features/audit/store/audit-store.ts` — capped (500-entry) rolling
  audit log; `log()` auto-stamps `id` (`crypto.randomUUID`) and an ISO
  `timestamp`, `clear()` empties it.

Cross-cutting stores live in `src/shared/stores/`; feature-specific stores
live in `src/features/<feature>/store/`.

## Domain types / Zod schemas

`src/shared/types/wiremock.ts` is the canonical Zod model of the WireMock
Admin API. Each schema is declared as `z.object({...}).catchall(z.unknown())`
— permissive to WireMock's many optional/extension fields and forward-
compatible additions — with a matching `type X = z.infer<typeof xSchema>`
exported alongside. Sections: matchers (`stringValuePatternSchema`,
`multipartPatternSchema`), `requestPatternSchema`, response definitions
(`faultSchema`, `delayDistributionSchema`, `chunkedDribbleDelaySchema`,
`responseDefinitionSchema`), `stubMappingSchema` (+ list response), request
journal (`loggedRequestSchema`, `loggedResponseSchema`, `serveEventSchema`),
near misses, scenarios, settings, version, and recording status/start/result
schemas. Any new field returned by WireMock should be added here first, then
flow through the SDK into hooks/components.

## Routing conventions

Routes use TanStack Router's file-based routing with flat, dot-delimited
filenames in `src/routes/` mapping to nested paths, e.g. `mappings.tsx` →
`/mappings`, `mappings.$mappingId.tsx` → `/mappings/$mappingId` (dynamic
param), `mappings.new.tsx` → `/mappings/new`. Each route file is a thin
shell:

```ts
export const Route = createFileRoute('/path')({ component: PageComponent })
```

with the actual page implementation living in
`src/features/<feature>/pages/`. `__root.tsx` defines the root layout/shell.
`src/routeTree.gen.ts` is auto-generated (gitignored, ESLint-ignored) — see
Commands above for regenerating it.

## Component conventions

`src/shared/components/ui/` holds ShadCN-style primitives (button, dialog,
dropdown-menu, select, sheet, table, tabs, input, label, card, badge, switch,
tooltip, etc.) built on Base UI primitives with Tailwind v4 + class-variance
styling. These are generated/copied components, so ESLint disables
`react-refresh/only-export-components` for this directory since they export
variant helpers alongside components — don't "fix" that lint exception.
App-level layout/navigation components (sidebar, header, breadcrumbs,
app-shell, command-palette, server-switcher, theme-toggle, nav-items) live
in `src/shared/components/layout/`, separate from the generic UI kit.

## Testing conventions

Vitest unit tests are colocated next to source as `*.test.ts`, targeting pure
utility/transform logic rather than components — e.g.
`src/shared/lib/utils.test.ts`, `src/shared/types/wiremock.test.ts` (schema
parsing), `src/features/files/utils/file-tree.test.ts`,
`src/features/scenarios/utils/scenario-transitions.test.ts`, and
`src/features/requests/utils/request-helpers.test.ts`. Use `describe`/`it`/
`expect` from `vitest` with table-style assertions. New pure helpers/utils
should ship with a colocated `*.test.ts`.

## Lint/format

`eslint.config.js` is a flat config extending `js.configs.recommended`,
`tseslint.configs.recommended`, `reactHooks.configs.flat.recommended`,
`reactRefresh.configs.vite`, and `eslint-config-prettier` (Prettier owns
formatting; ESLint owns logic/quality). It globally ignores `dist` and the
generated `src/routeTree.gen.ts`. Husky + lint-staged run
`eslint --fix`/`prettier --write` on staged files at commit time.

## Commands

```bash
npm run generate-routes  # regenerate src/routeTree.gen.ts (gitignored)
npm run dev               # dev server
npm run build              # tsc -b && vite build
npm run lint                # eslint
npm run test                 # vitest unit tests
npm run test:e2e              # playwright e2e tests
```

`src/routeTree.gen.ts` is gitignored and required for `tsc` to resolve route
types. If you haven't run `npm run dev` or `npm run build` yet, run
`npm run generate-routes` first — otherwise `tsc -b` fails with `TS2307`/
`TS2345` errors on every route file.

Before pushing, run `npx tsc -b --noEmit`, `npm run lint`, and `npm run test`
— these mirror the CI `build-and-test` job.

## Branch naming

Name branches after the feature/fix being implemented, not after the agent
or session:

- `feature/<short-description>` — new functionality (e.g. `feature/mapping-bulk-export`)
- `fix/<short-description>` — bug fixes (e.g. `fix/server-switcher-menu-group`)
- `chore/<short-description>` — tooling, CI, deps, docs

Use lowercase, hyphen-separated, descriptive names.

## Versioning & releases

The project follows [Semantic Versioning](https://semver.org/)
(`MAJOR.MINOR.PATCH`):

- **MAJOR** — breaking changes (incompatible API/config/behavior changes)
- **MINOR** — new backwards-compatible functionality
- **PATCH** — backwards-compatible bug fixes

Releases are cut by pushing a `v<major>.<minor>.<patch>` tag (e.g. `v1.2.3`)
to `main`. The CI workflow (`.github/workflows/ci.yml`) then builds and
pushes Docker images to `ghcr.io/ahimsarijalu/mockops` tagged with:

- `<major>.<minor>.<patch>`
- `<major>.<minor>`
- `<major>`
- `latest` (only from `main`)

Bump `version` in `package.json` to match the tag when cutting a release.

## Git workflow

- Develop on a feature branch, commit with clear messages, and push.
- Do not create a pull request unless explicitly asked.
- Do not push directly to `main` unless explicitly asked.
