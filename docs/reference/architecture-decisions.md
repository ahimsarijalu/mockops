# Architecture Decisions

Decisions inferable from the implementation. None of these are documented
elsewhere in the repository as formal ADRs — where the historical
rationale isn't recoverable from the code, this page says so explicitly
rather than inventing one.

## Static SPA with no backend

**Context**: MockOps needs to manage one or more WireMock servers'
Admin APIs from a UI.

**Decision**: Ship as a static single-page app with no server-side
component — every WireMock call is made directly from the browser.

**Why**: `README.md`'s own "Authentication & RBAC" section states this
architecture explicitly as a deliberate choice, and the entire codebase
has no server directory, no API routes, and no database dependency to
contradict it.

**Trade-offs**: Simpler to build, test, and deploy (a static file host is
enough); no real authorization boundary is possible inside MockOps itself
(see [Security](/architecture/security)); every user's browser needs
direct network access to every WireMock server they manage.

**Consequences**: CORS and network reachability from the browser (not
just from wherever MockOps is hosted) become operational concerns; access
control must be enforced by WireMock or infrastructure in front of it.

**Alternatives**: A thin backend proxying/authenticating WireMock calls
would enable real access control and hide WireMock from direct browser
exposure, at the cost of a service to build, deploy, and secure. The
implementation indicates the static-SPA choice was deliberate (per the
README), but the full historical discussion isn't documented in the
repository.

## TanStack Query for server state, Zustand for client state

**Context**: Two kinds of state exist — data fetched from WireMock, and
MockOps' own configuration/preferences.

**Decision**: TanStack Query owns every WireMock-derived value (never
mirrored into a Zustand store); Zustand owns servers, UI preferences, and
the audit log (never used to cache WireMock responses).

**Why**: Verified by the consistent pattern across every feature — see
[State Management](/architecture/state-management). No file in the
codebase blurs this line.

**Trade-offs**: Two different mental models to learn, but each is used for
exactly what it's designed for — TanStack Query's caching/retry/
invalidation model fits server data; Zustand's `persist` middleware fits
small, durable client config.

**Consequences**: Adding a feature requires deciding up front which kind
of state something is (see [Adding a Feature](/development/feature-development))
— getting it wrong (e.g. caching WireMock data in a Zustand store) would
break the "switching servers refetches automatically" behavior every
existing feature relies on.

**Alternatives**: A single state library (e.g. everything in Zustand, with
manual fetch/cache logic) was evidently not chosen — the codebase commits
fully to TanStack Query for anything server-derived.

## `localStorage` for server configuration and credentials

**Context**: Server connections (including credentials) need to persist
across sessions without a backend.

**Decision**: Persist the server list, UI preferences, and audit log to
`localStorage` via Zustand's `persist` middleware, each under its own
`mockops-*` key.

**Why**: The only persistence mechanism available to a backend-less SPA
that needs data to survive a page reload.

**Trade-offs**: No encryption at rest, no cross-device sync, and anything
with script execution in the MockOps origin can read stored credentials —
see [Security](/architecture/security) for the full analysis.

**Consequences**: Users should treat MockOps-stored credentials like any
other browser-stored secret, and prefer scoped/short-lived credentials
where WireMock's own auth layer supports it.

**Alternatives**: A backend-managed credential store (e.g. a secrets
manager behind an API) would remove this risk but reintroduces the backend
this project deliberately avoids (see "Static SPA" above).

## Feature-oriented folder structure

**Context**: The app has many largely-independent domain areas (mappings,
requests, scenarios, recordings, files, …).

**Decision**: One folder per feature under `src/features/`, each with its
own `api/`/`components/`/`pages/`/etc., rather than organizing by technical
layer (e.g. a top-level `pages/`, `hooks/`, `api/` for the whole app).

**Why**: Verified consistently across every feature folder and stated
directly in `AGENTS.md`. This keeps a feature's routing, data-fetching,
and UI together, and makes deleting or isolating a feature straightforward.

**Trade-offs**: Some duplication of boilerplate (each feature reimplements
its own loading/error/empty states rather than sharing one generic data
table component); genuinely cross-cutting code has to be deliberately
placed in `src/shared/` instead.

**Consequences**: New contributors and coding agents can find "everything
about mappings" in one directory — see
[Project Structure](/development/project-structure) and
[Feature Map](/ai/feature-map).

## Zod schemas with `.catchall(z.unknown())` for the WireMock domain model

**Context**: WireMock's Admin API has many optional and extension fields
(custom matchers, `postServeActions`, exotic response options) that MockOps
doesn't build dedicated UI for.

**Decision**: Every WireMock-facing Zod schema in
`src/shared/types/wiremock.ts` ends with `.catchall(z.unknown())`.

**Why**: Without it, parsing a real-world WireMock response/request would
silently strip any field the schema doesn't explicitly declare — a JSON
editor round-trip (edit in the visual builder, switch to JSON, switch
back) would then lose data the user never touched.

**Trade-offs**: Less strict validation — a malformed value in an
undeclared field won't be caught by Zod, only by WireMock itself at
request time.

**Consequences**: New WireMock fields "just work" (pass through) even
before MockOps adds explicit UI for them, as long as they're read/written
through the JSON editor rather than a dedicated form control.

## Nginx as the runtime container, not a Node server

**Context**: The build output is a static SPA that needs to be served
somewhere in production.

**Decision**: Serve the compiled `dist/` output with Nginx
(`nginx:1.27-alpine`) rather than a Node-based static server (e.g.
`vite preview`, `serve`, or a small Express app).

**Why**: Nginx is a minimal, well-understood, non-Node runtime for purely
static content, with built-in gzip, caching headers, and a config format
suited to the SPA-fallback + hashed-asset-caching pattern this app needs
(see [Docker](/deployment/docker)). Node isn't needed at runtime at all
once the build is done.

**Trade-offs**: Nginx config (`deploy/nginx/nginx.conf`) is a second
technology to maintain alongside the Vite/Node build tooling.

**Consequences**: The runtime image has no Node/npm attack surface at all
— see [Security](/architecture/security).

## Kubernetes + Helm for deployment, no ConfigMap/Secret

**Context**: MockOps needs a production deployment path beyond `docker
run`.

**Decision**: Provide both plain Kustomize-friendly manifests (`k8s/`) and
a Helm chart (`helm/mockops/`), with no `ConfigMap`/`Secret` resource in
either.

**Why**: Kubernetes/Helm are the de facto standard for container
deployment in the environments MockOps targets (per its own
"production-grade" framing in `README.md`/`Chart.yaml`). No `ConfigMap`/
`Secret` exists because there's no runtime configuration to inject — see
[Environment Variables](/reference/environment-variables).

**Trade-offs**: Two parallel deployment paths (plain manifests and Helm)
to keep in sync when the underlying resources change.

**Consequences**: See [Kubernetes](/deployment/kubernetes) and
[Helm](/deployment/helm) for the exact resources and values each
provides.

## VitePress for documentation, deployed separately from application CI

**Context**: This documentation site needed a framework and a deployment
path.

**Decision**: Use VitePress (added as a devDependency, `docs/` as its
root), deployed via a **dedicated** `.github/workflows/docs.yml` using the
official `configure-pages`/`upload-pages-artifact`/`deploy-pages` actions,
rather than extending `.github/workflows/ci.yml`.

**Why**: VitePress is a Vite-based Markdown site generator — consistent
with the app's own Vite-based tooling and Node 22 toolchain, needing no
new build system to learn. A separate workflow keeps documentation
deployment (which should ship on every relevant `main` push) decoupled
from application CI's gating logic (type-check/lint/test/build/Docker),
so neither can block or interfere with the other, and each has exactly
the permissions it needs (`ci.yml` needs `packages: write` for GHCR;
`docs.yml` needs `pages: write`/`id-token: write` instead).

**Trade-offs**: A second, mostly-parallel workflow file to maintain; two
places `npm ci` runs on the same push if both `docs/` and `src/` change.

**Consequences**: A broken docs build never blocks the application
pipeline, and vice versa.
