# Installation

## Prerequisites

| Requirement                     | Version                                          | Source                                                                                           |
| ------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Node.js                         | 22                                               | `.github/workflows/mockops-ci.yml` (`node-version: 22`) and `Dockerfile` (`FROM node:22-alpine`) |
| npm                             | bundled with Node 22                             | `package-lock.json` is npm's lockfile; no other package manager config is present                |
| A WireMock server to connect to | any version exposing the standard `/__admin` API | not bundled with MockOps — run your own, e.g. via `docker-compose.yml` (see below)               |

`package.json` does not declare an `engines` field, so nothing enforces the
Node version at install time — Node 22 is what CI and the Docker build
actually use, and is the recommended version for local development.

## Clone and install

```bash
git clone https://github.com/ahimsarijalu/mockops.git
cd mockops
npm install
```

`npm install` also runs the `prepare` script (`husky`), which installs the
repository's Git hooks — a pre-commit hook (`.husky/pre-commit`) that runs
`lint-staged` (ESLint + Prettier on staged files, per the `lint-staged`
block in `package.json`).

## Run the dev server

```bash
npm run dev
```

This starts Vite's dev server (default `http://localhost:5173`). MockOps
itself needs no environment variables or `.env` file to start — every
WireMock server connection is configured **inside the running app** (see
[First Setup](/guide/first-setup)), not at build or deploy time. See
[Reference → Environment Variables](/reference/environment-variables) for
the full (short) picture.

## Optional: run a local WireMock instance

If you don't already have a WireMock server to point MockOps at, the
repository's `docker-compose.yml` includes one for local development:

```bash
docker compose up wiremock
```

This starts `wiremock/wiremock:3.13.1` with `--global-response-templating
--verbose`, exposed on `http://localhost:8081` (mapped from its internal
port 8080). You can then add `http://localhost:8081` as a server in
MockOps — see [First Setup](/guide/first-setup).

## Other local commands

See [Reference → Commands](/reference/commands) for the full list
(`lint`, `test`, `test:e2e`, `build`, …) verified against `package.json`.

## Next step

[First Setup](/guide/first-setup) — add your first WireMock server.
