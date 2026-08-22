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
- **Phase 8 — Testing, accessibility polish, Docker/Nginx/Kubernetes/Helm/CI** ✅
  additional unit test coverage for scenario transitions, request journal
  helpers, and the file tree; an audited pass for icon-button labeling and
  keyboard/aria affordances; a multi-stage Docker build served via Nginx with
  security headers and SPA routing; Kubernetes manifests and a Helm chart for
  deployment; and a GitHub Actions CI pipeline (type-check, lint, test, build,
  Docker build).

## WireMock Admin API coverage

| Area              | Endpoints                                                                                                                                                              | Status                                                                                                                                                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mappings          | `GET/POST /mappings`, `GET/PUT/DELETE /mappings/{id}`, `DELETE /mappings`, `POST /mappings/reset\|save\|import`, `POST /mappings/find-by-metadata\|remove-by-metadata` | Supported                                                                                                                                                                                                                                                                      |
| Request journal   | `GET /requests`, `GET/DELETE /requests/{id}`, `DELETE /requests`, `POST /requests/count`, `GET /requests/unmatched`                                                    | Supported                                                                                                                                                                                                                                                                      |
| Near misses       | `GET /requests/unmatched/near-misses`, `POST /near-misses/request`                                                                                                     | Supported, plus client-side field-level mismatch explanations (method/URL/header/query/cookie/body) beyond what the raw API returns                                                                                                                                            |
| Scenarios         | `GET /scenarios`, `POST /scenarios/reset`, `PUT /scenarios/{name}/state`                                                                                               | Supported                                                                                                                                                                                                                                                                      |
| Recordings        | `GET /recordings/status`, `POST /recordings/start\|stop\|snapshot`                                                                                                     | Supported                                                                                                                                                                                                                                                                      |
| Files             | `GET /files`, `GET/PUT/DELETE /files/{name}`                                                                                                                           | Supported for text files; binary `__files` (images, archives, fonts, etc.) are listed and deletable but intentionally not opened in the editor — WireMock's files API has no content-type signal, so decoding binary bytes as text and saving them back would corrupt the file |
| Settings & system | `GET/POST /settings`, `GET /health`, `GET /version`, `POST /reset`, `POST /shutdown` (client method present, intentionally not wired to any UI action)                 | Supported                                                                                                                                                                                                                                                                      |

Every schema in `src/shared/types/wiremock.ts` uses a Zod `catchall`, so
fields the UI doesn't have dedicated controls for (custom matchers, exotic
`postServeActions`, future WireMock additions) round-trip through the JSON
editor instead of being silently dropped.

## Authentication & RBAC

MockOps is a static SPA with no backend of its own — it talks directly to
whatever WireMock Admin API base URL you configure, from the browser. That
architecture cannot securely enforce authorization: any client-side role
check is a UI convenience (hiding buttons, disabling actions), not a
security boundary, since a user can always call the WireMock Admin API
directly with the same credentials MockOps holds.

Real access control has to live in front of WireMock itself — e.g. WireMock's
own basic-auth/token config, a reverse proxy (nginx, an API gateway) doing
auth in front of `/__admin`, or an identity-aware proxy — and MockOps'
`basic`/`bearer` auth modes on each server entry are how you hand it
credentials for that boundary. Per-server credentials are stored in
`localStorage` (via the persisted server store) for convenience; treat that
the same as any other browser-stored secret, and prefer scoped or short-lived
credentials over long-lived admin tokens where the upstream supports it.

## Multi-server support

Servers are stored locally (Zustand + localStorage) with environment tagging
(development, qa, sit, uat, production-like, local), `none`/`basic`/`bearer`
auth, health polling, and last-connection tracking. Switch the active server
from the header to retarget every feature.

## Deployment

MockOps is a static single-page app — it can be served by any static file
host or web server. A reference Nginx-based setup is provided:

```bash
# Build and run locally with Docker
docker compose up --build
# App available at http://localhost:8080
```

### Pre-built images

Release images are published to GitHub Container Registry by
[`mockops-release.yml`](.github/workflows/mockops-release.yml) whenever a
release actually ships (see [CI/CD](#cicd--releases) below):

```bash
# Latest release
docker run -p 8080:8080 ghcr.io/ahimsarijalu/mockops:latest

# A specific release, e.g. v1.2.3
docker run -p 8080:8080 ghcr.io/ahimsarijalu/mockops:1.2.3
```

Available tags follow [Semantic Versioning](https://semver.org/):
`latest` and `<major>.<minor>.<patch>` (e.g. `1.2.3`). Prefer the immutable
version tag for anything you deploy — `latest` always points at the most
recent release.

For Kubernetes, apply the manifests in `k8s/` (via `kubectl apply -k k8s/`)
or install the Helm chart in `helm/mockops`:

```bash
helm install mockops ./helm/mockops \
  --set image.repository=ghcr.io/ahimsarijalu/mockops \
  --set image.tag=latest
```

## CI/CD & releases

MockOps and its documentation site have independent CI/CD, so a
documentation change never triggers an application build/release and an
application change never redeploys the docs:

| Workflow                                                                           | Trigger                         | What it does                                                                                                                                      |
| ---------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`mockops-ci.yml`](.github/workflows/mockops-ci.yml)                               | PRs that touch app code         | type-check, lint, unit tests, Playwright e2e smoke, production build, Docker build (validation only, never pushed)                                |
| [`docs-ci.yml`](.github/workflows/docs-ci.yml)                                     | PRs/pushes that touch `docs/**` | builds the VitePress site; deploys to GitHub Pages only on `main`                                                                                 |
| [`pr-release-recommendation.yml`](.github/workflows/pr-release-recommendation.yml) | every PR                        | posts/updates a "Release Recommendation" comment and a `release:major\|minor\|patch` label                                                        |
| [`mockops-release.yml`](.github/workflows/mockops-release.yml)                     | push to `main`                  | computes the next SemVer version, re-validates + builds the app, builds & pushes the Docker image to GHCR, creates the Git tag and GitHub Release |

A PR that touches only `docs/**`/`README.md` skips `mockops-ci.yml`'s
actual work (a `changes` job gates `build-and-test`/`e2e`/`docker` with
`if:`, so they report `skipped` rather than never running at all — which
matters if they're configured as required status checks) and — once
merged — never produces a MockOps release, GHCR push, Git tag, or GitHub
Release; `docs-ci.yml` deploys the docs instead. A PR that touches both
app and docs files runs both pipelines in full.

### Release versioning

Releases follow [Semantic Versioning](https://semver.org/) and are
computed deterministically (no AI service involved) from every PR merged
into `main` since the last release, in priority order:

1. An explicit `release:major` / `release:minor` / `release:patch` label on
   the PR.
2. Its title's [Conventional Commits](https://www.conventionalcommits.org/)
   type — `feat:` → minor, `fix:`/`docs:`/`refactor:`/`test:`/`build:`/
   `ci:`/`chore:` → patch, any type with `!` or a `BREAKING CHANGE:` footer
   → major.
3. Patch, if neither of the above applies.

When multiple PRs are included in one release, the highest bump wins (e.g.
`patch` + `minor` + `patch` → `minor`). Example:

- `fix: fix response matching` → patch
- `feat: add mapping search` → minor
- `feat!: change mapping API` → major

Releases only happen if at least one merged PR touches non-documentation
files — an all-docs batch is skipped.

CI (`mockops-ci.yml`) runs type-checking, linting, unit tests, Playwright
e2e, the production build, and a Docker build validation on every pull
request.
