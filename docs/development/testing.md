# Testing

MockOps has two test layers, both driven from `package.json`:

```text
Unit tests (Vitest)  →  E2E smoke tests (Playwright)  →  CI
```

There is no separate component-testing layer — unit tests target pure
logic, and Playwright covers what would otherwise need component/
integration tests.

## Unit tests (Vitest)

```bash
npm run test        # single run, as CI does
npm run test:watch  # watch mode
```

Configured in `vitest.config.ts`: `jsdom` environment, globals enabled,
`src/test/setup.ts` as the setup file (imports
`@testing-library/jest-dom/vitest` for DOM matchers), `e2e/**` excluded.

### What's actually tested

Vitest tests are **colocated next to source as `*.test.ts`**, and
deliberately target **pure utility/transform logic**, not components:

| Test file                                                                                                          | Covers                                                                           |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `src/shared/lib/utils.test.ts`                                                                                     | `cn()` class-merging helper                                                      |
| `src/shared/api/http.test.ts`                                                                                      | `describeWireMockError` — filesystem-permission error rewriting                  |
| `src/shared/types/wiremock.test.ts`                                                                                | Zod schema parsing for the WireMock domain model                                 |
| `src/features/files/utils/file-tree.test.ts`                                                                       | Building the file tree, binary-file detection                                    |
| `src/features/scenarios/utils/scenario-transitions.test.ts`                                                        | Deriving the scenario transition graph from mappings                             |
| `src/features/requests/utils/near-miss-diagnostics.test.ts`                                                        | Field-level mismatch explanations (method/URL/header/query/cookie/body)          |
| `src/features/requests/utils/request-helpers.test.ts`                                                              | Status badge variant, unmatched detection, journal search                        |
| `src/features/mappings/api/use-mappings.test.ts`                                                                   | Mapping query/mutation hook behavior                                             |
| `src/features/mappings/components/key-value-matcher-editor.test.tsx`, `mapping-metadata-form.test.tsx`             | Component-level tests for a couple of the more logic-heavy mapping-editor pieces |
| `src/shared/components/ui/method-badge.test.tsx`, `src/shared/components/feedback/no-active-server-state.test.tsx` | Small, focused component tests                                                   |

The bulk of the suite targets pure functions with table-style
`describe`/`it`/`expect` assertions (`vitest`) — this is the convention to
follow for new pure logic (see
[Adding a Feature](/development/feature-development)). A handful of
component tests exist for the highest-logic-density pieces of the mapping
editor and a couple of small shared components, but most page/feature
components are **not** unit-tested; that coverage comes from the
Playwright suite instead.

## E2E tests (Playwright)

```bash
npm run test:e2e
```

Configured in `playwright.config.ts`: tests live in `e2e/`, run against
`http://localhost:4173` (Vite's preview server, started automatically via
`webServer` — `npm run dev -- --port 4173 --strictPort`), Chromium only,
`fullyParallel: true`, retries once in CI.

`e2e/smoke.spec.ts` is the current suite — two smoke checks:

1. The app shell renders with navigation links to every top-level section.
2. The mappings page correctly prompts to add a server when none is
   configured, and that flow lands you on the Servers page.

Both tests clear `localStorage` before each run
(`page.addInitScript(() => window.localStorage.clear())`), so they always
start from a clean, no-servers-configured state.

## What should be unit tested vs. E2E tested

Following the pattern the existing suite already establishes:

- **Unit test**: any pure function — matching/diagnostic logic, data
  transforms, formatting helpers, Zod schema behavior. Fast, colocated,
  no DOM needed for most of them.
- **E2E test**: cross-page flows, routing behavior, and anything that
  depends on the app shell rendering correctly end to end (navigation,
  empty states, forms actually submitting against a real dev server).

## Untested areas worth knowing about

Most feature **pages** and **components** (mapping editor tabs, the
request journal table, scenario cards, the file tree, recordings
controls, settings forms) have no dedicated component or E2E coverage
beyond the two smoke checks above — if you change one, verify it manually
(`npm run dev`) as described in [Debugging](/development/debugging), and
consider adding a Playwright check for any new user-facing flow.

## CI test behavior

`.github/workflows/mockops-ci.yml` runs unit tests and E2E tests as
**separate jobs** (`build-and-test` and `e2e`) on every pull request that
touches non-docs files; the `docker` job only runs after both pass, and
only as a build validation — it never pushes. The same checks run again
in `.github/workflows/mockops-release.yml`'s `validate` job on every push
to `main` that actually produces a release. See
[Reference → Commands](/reference/commands) for how each script maps to a
CI step.
