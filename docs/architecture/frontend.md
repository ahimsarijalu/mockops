# Frontend Architecture

## Bootstrap

`src/main.tsx` is the sole entry point, composing (outside in):

```text
StrictMode
 └─ GlobalErrorBoundary        (src/app/error-boundary.tsx)
     └─ QueryClientProvider    (src/app/query-client.ts)
         └─ ThemeProvider      (src/app/theme-provider.tsx)
             ├─ RouterProvider (src/routeTree.gen.ts, generated)
             └─ Toaster        (sonner)
```

- **`GlobalErrorBoundary`** — a class component catching any uncaught
  render error, replacing the app with a full-page error state and a
  "Try again" button. It only logs to `console.error`; there is no
  external error reporting (see [Security](/architecture/security) and
  [Debugging](/development/debugging)).
- **`queryClient`** — one app-wide TanStack Query client:
  `staleTime: 10_000`, no refetch on window focus, mutations never retry,
  and queries skip retrying any 4xx `ApiError` (only retrying network
  errors / 5xx, up to 2 attempts).
- **`ThemeProvider`** — toggles the `dark` class on `<html>` based on the
  Zustand UI store's theme, following the OS preference when set to
  "System".
- **Router** — `defaultPreload: 'intent'` (routes preload on link hover/
  focus), with dedicated error/pending/not-found fallback components.

## Routing

TanStack Router, file-based, flat dot-delimited filenames under
`src/routes/`. `npm run generate-routes` scans that directory and writes
`src/routeTree.gen.ts` (gitignored — must be regenerated locally before
`tsc` can resolve route types). See [Routing](/architecture/routing) for
the full route tree and conventions.

## Feature organization

Each feature under `src/features/<name>/` groups its own `api/`,
`components/`, `pages/`, and (where relevant) `schemas/`, `store/`,
`types/`, `utils/` — a route file is a thin shell pointing at a page
component in that feature's `pages/` directory. See
[Project Structure](/development/project-structure) for the placement
rules used when adding new code.

## Shared components

| Location                          | What lives there                                                                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `src/shared/components/ui/`       | ShadCN-style primitives on `@base-ui/react` + `class-variance-authority` + Tailwind v4 (button, dialog, table, tabs, select, sheet, …) |
| `src/shared/components/layout/`   | App chrome — sidebar, header, breadcrumbs, command palette, server switcher, theme toggle                                              |
| `src/shared/components/editor/`   | `MonacoJsonEditor` / `MonacoDiffEditor`, shared across mappings, files, and the request detail view                                    |
| `src/shared/components/feedback/` | `NoActiveServerState`, `PlaceholderPage` — reused empty states                                                                         |

## API layer

`src/shared/api/http.ts::createHttpClient(server)` builds one Axios
instance per `ServerConfig` — trims trailing slashes from the base URL,
sets a 15s timeout, and wires up `basic`/`bearer` auth. A response
interceptor normalizes every failure into a typed `ApiError` with a
`code` of `network` | `timeout` | `http` | `parse` | `unknown`.

`src/shared/api/wiremock-client.ts::WireMockClient` composes sub-clients
(`mappings`, `files`, `scenarios`, `requests`, `recordings`, `system`)
sharing that Axios instance, each parsing responses through the matching
Zod schema. See [WireMock Integration](/architecture/wiremock-integration)
for the full breakdown.

## State management

TanStack Query owns server state (WireMock API responses); Zustand owns
client state (servers, UI prefs, audit log); a handful of forms use
TanStack Form + Zod. See
[State Management](/architecture/state-management).

## Validation

Every WireMock domain type is a Zod schema in `src/shared/types/wiremock.ts`,
each declared with `.catchall(z.unknown())` so fields the UI has no
dedicated control for still round-trip instead of being silently dropped.
Form-level validation (e.g. the server form) uses separate Zod schemas
under each feature's `schemas/` folder, wired through TanStack Form.

## Editors

`src/shared/components/editor/monaco-json-editor.tsx` and
`monaco-diff-editor.tsx` wrap `@monaco-editor/react`, resolving their own
dark/light theme from the UI store rather than the DOM's `dark` class.
They back: the mapping JSON/diff tabs, JSON response bodies and
transformer parameters, mapping metadata JSON, read-only request/response
detail panels, and the `__files` text editor.

## Styling

Tailwind CSS v4 via the `@tailwindcss/vite` plugin, one stylesheet entry
(`src/index.css`), `class-variance-authority` for variant-based component
styling, and a `cn()` helper (`clsx` + `tailwind-merge`) used throughout
for conditional class composition.
