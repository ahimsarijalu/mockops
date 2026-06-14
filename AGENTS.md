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
