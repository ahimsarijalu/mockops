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

| Command                | Purpose                                                                                                           | Environment                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `npm run docs:dev`     | `vitepress dev docs` — docs dev server with hot reload                                                            | Development                                           |
| `npm run docs:build`   | Regenerates `docs/public/llms-full.txt`, then `vitepress build docs` — production build to `docs/.vitepress/dist` | CI (`.github/workflows/docs.yml`), local verification |
| `npm run docs:preview` | `vitepress preview docs` — serve the production docs build locally                                                | Local verification                                    |

## How CI maps to these commands

`.github/workflows/ci.yml` (`build-and-test` job): `npm ci` →
`npm run generate-routes` → `npx tsc -b --noEmit` → `npm run lint` →
`npm run test` → `npm run build`. The `e2e` job separately runs
`npm run generate-routes` → installs Playwright's Chromium browser →
`npm run test:e2e`. The `docker` job (after both pass) builds and, outside
pull requests, pushes the image described in
[Docker](/deployment/docker).

`.github/workflows/docs.yml` runs `npm ci` → `npm run docs:build`, then
uploads and deploys `docs/.vitepress/dist` — see
[GitHub Pages](/deployment/github-pages).

## Recommended pre-push check

`AGENTS.md`'s own guidance, mirrored here — run before pushing:

```bash
npm run generate-routes
npx tsc -b --noEmit
npm run lint
npm run test
```
