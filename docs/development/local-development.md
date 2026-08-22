# Local Development

## Prerequisites

Node.js 22 (matching CI and the Dockerfile — see
[Installation](/guide/installation)) and npm.

## Setup

```bash
git clone https://github.com/ahimsarijalu/mockops.git
cd mockops
npm install
```

`npm install` runs `prepare` (`husky`), installing the pre-commit hook
that runs `lint-staged` on staged files.

## Day-to-day commands

```bash
npm run dev          # Vite dev server
npm run lint         # ESLint
npm run lint:fix     # ESLint with autofix
npm run format       # Prettier, whole repo
npm run test         # Vitest unit tests (single run)
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright e2e tests
npm run build        # tsc -b && vite build (production build)
```

See [Reference → Commands](/reference/commands) for the full list,
including the docs site's own scripts, verified against `package.json`.

## The generated route tree

`src/routeTree.gen.ts` is gitignored and required for `tsc` to resolve
route types. `npm run dev` and `npm run build` regenerate it automatically
via the TanStack Router Vite plugin, but if you run `tsc -b` standalone
before either of those has run once, do:

```bash
npm run generate-routes
```

first, or `tsc -b` fails with `TS2307`/`TS2345` on every route file.

## Before pushing

Mirror the CI `build-and-test` job locally:

```bash
npm run generate-routes
npx tsc -b --noEmit
npm run lint
npm run test
```

See [Testing](/development/testing) for what each check actually covers,
and `.github/workflows/mockops-ci.yml` for the exact CI steps.

## Local WireMock instance

To develop against a real WireMock server without standing one up
yourself, `docker-compose.yml` includes one:

```bash
docker compose up wiremock
```

This runs `wiremock/wiremock:3.13.1` on `http://localhost:8081`, with
`--global-response-templating --verbose`. Add it as a server in MockOps
(`npm run dev`, then **Servers → Add server**) to develop against it — see
[First Setup](/guide/first-setup).

## Running the full app in Docker

```bash
docker compose up --build
```

Builds the production image (see [Docker](/deployment/docker)) and serves
it at `http://localhost:8080`. Useful for testing the actual deployed
artifact, not for iterative development (no hot reload).
