# Commands

Every command below is copied directly from `package.json`'s `scripts`
block.

## Application

| Command                   | Purpose                                                              | Environment                                                               |
| ------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `npm run dev`             | Start the Vite dev server                                            | Development                                                               |
| `npm run generate-routes` | Regenerate `src/routeTree.gen.ts` from `src/routes/`                 | Development (also run automatically by `dev`/`build` via the Vite plugin) |
| `npm run build`           | `tsc -b && vite build` — type-check then production build to `dist/` | Production build, CI                                                      |
| `npm run preview`         | Serve the production build locally (`vite preview`)                  | Local verification                                                        |
| `npm run lint`            | `eslint .`                                                           | Development, CI                                                           |
| `npm run lint:fix`        | `eslint . --fix`                                                     | Development                                                               |
| `npm run format`          | `prettier --write .`                                                 | Development                                                               |
| `npm run test`            | `vitest run` — unit tests, single run                                | CI                                                                        |
| `npm run test:watch`      | `vitest` — unit tests, watch mode                                    | Development                                                               |
| `npm run test:e2e`        | `playwright test`                                                    | CI, local E2E verification                                                |
| `npm run prepare`         | `husky` — installs Git hooks (runs automatically on `npm install`)   | Development                                                               |

## Documentation site

| Command                | Purpose                                                                                                           | Environment                                              |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `npm run docs:dev`     | `vitepress dev docs` — docs dev server with hot reload                                                            | Development                                              |
| `npm run docs:build`   | Regenerates `docs/public/llms-full.txt`, then `vitepress build docs` — production build to `docs/.vitepress/dist` | CI (`.github/workflows/docs-ci.yml`), local verification |
| `npm run docs:preview` | `vitepress preview docs` — serve the production docs build locally                                                | Local verification                                       |

## How CI maps to these commands

`.github/workflows/mockops-ci.yml` (`build-and-test` job, PRs only): `npm ci`
→ `npm run generate-routes` → `npx tsc -b --noEmit` → `npm run lint` →
`npm run test` → `npm run build`. The `e2e` job separately runs
`npm run generate-routes` → installs Playwright's Chromium browser →
`npm run test:e2e`. The `docker` job (after both pass) builds the image as
a validation check only — it is never pushed from a PR.

`.github/workflows/mockops-release.yml` (push to `main`, skipped for
docs-only changes) re-runs `build-and-test`'s sequence (not `e2e` — see
[Testing](/development/testing) for why), then builds and pushes the
image described in [Docker](/deployment/docker), tags it, and creates the
GitHub Release. It doesn't reuse `mockops-ci.yml` as a job — see
[Architecture Decisions](/reference/architecture-decisions) for why the
two stay independent.

`.github/workflows/docs-ci.yml` runs `npm ci` → `npm run docs:build`, then
uploads and — on `main` only — deploys `docs/.vitepress/dist` — see
[GitHub Pages](/deployment/github-pages).

`.github/workflows/pr-release-recommendation.yml` and
`mockops-release.yml`'s `determine` job both run
`.github/scripts/pr-recommendation.mjs` / `mockops-release.mjs` (plain
Node, no install step needed) to classify changes deterministically — see
the repository root `README.md`'s "CI/CD & releases" section for the full
rules.

## Recommended pre-push check

`AGENTS.md`'s own guidance, mirrored here — run before pushing:

```bash
npm run generate-routes
npx tsc -b --noEmit
npm run lint
npm run test
```
