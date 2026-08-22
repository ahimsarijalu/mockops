# Routing

MockOps uses **TanStack Router's file-based routing**, with flat,
dot-delimited filenames in `src/routes/`.

## Route tree

Verified directly against `src/routes/`:

```text
/                          → src/routes/index.tsx                → DashboardPage
/servers                   → src/routes/servers.tsx               → ServersPage
/mappings                  → src/routes/mappings.tsx               → MappingsListPage
/mappings/new               → src/routes/mappings_.new.tsx          → MappingEditorPage (create mode)
/mappings/$mappingId        → src/routes/mappings_.$mappingId.tsx   → MappingEditorPage (edit mode)
/files                      → src/routes/files.tsx                  → FilesPage
/requests                   → src/routes/requests.tsx               → RequestJournalPage
/near-misses                 → src/routes/near-misses.tsx            → NearMissesPage
/scenarios                   → src/routes/scenarios.tsx              → ScenariosPage
/recordings                  → src/routes/recordings.tsx             → RecordingsPage
/settings                    → src/routes/settings.tsx               → SettingsPage
/audit                       → src/routes/audit.tsx                  → AuditLogPage
```

Every route file is a thin shell:

```ts
export const Route = createFileRoute('/path')({ component: PageComponent })
```

with the real implementation in the matching feature's `pages/` directory.
`src/routes/__root.tsx` defines the root route, whose component is
`AppShell` (`src/shared/components/layout/app-shell.tsx`) — sidebar +
header + `<Outlet/>` + command palette, wrapping every page.

## Generated route tree

`npm run generate-routes` (wrapping `@tanstack/router-generator`, see
`scripts/generate-routes.mjs`) scans `src/routes/` and writes
`src/routeTree.gen.ts` — **gitignored** and excluded from ESLint. It must
be regenerated locally (or via `npm run dev`/`npm run build`, which invoke
the same plugin through `@tanstack/router-plugin/vite`) before `tsc` can
resolve route types; running `tsc -b` without it fails with `TS2307`/
`TS2345` on every route file.

## The `mappings_.` naming convention

The trailing underscore before the dot in `mappings_.new.tsx` and
`mappings_.$mappingId.tsx` opts those routes out of `mappings.tsx`'s
implicit layout nesting (a TanStack Router file-based routing convention),
so `/mappings/new` and `/mappings/$mappingId` render as standalone pages
rather than nested inside the mappings list route's layout.

## Route parameters

Only one route takes a path parameter. `/mappings/$mappingId` validates it
with a Zod schema at the route level:

```ts
const paramsSchema = z.object({ mappingId: z.string().min(1) })
export const Route = createFileRoute('/mappings_/$mappingId')({
  params: { parse: (raw) => paramsSchema.parse(raw) },
  component: MappingEditorPage,
})
```

`MappingEditorPage` reads it with `useParams({ strict: false })` and
treats a missing `mappingId` as "new mapping" mode — the same component
backs both `/mappings/new` and `/mappings/$mappingId`.

## No route loaders

No route in the app defines a TanStack Router `loader`. Every page fetches
its own data via TanStack Query hooks keyed off `useActiveServer()`, so
navigating to a page shows a loading/skeleton state rather than blocking
navigation on a loader.

## Navigation patterns

- **Sidebar** (`src/shared/components/layout/sidebar.tsx`) renders a
  static `navItems` array (`src/shared/components/layout/nav-items.ts`) —
  the single source of truth for top-level navigation. It intentionally
  does not include `/mappings/new` or `/mappings/$mappingId`, which are
  reached through in-page links.
- **Server switcher** changes `activeServerId` in the server store; it
  never navigates.
- **Command palette** (`Ctrl/Cmd+K`) filters `navItems` by label and
  navigates on selection.
- **Breadcrumbs** derive a label trail from `navItems` and the current
  path — they are not clickable links to intermediate segments.
- **Unsaved-changes guard**: the mapping editor uses
  `useBlocker({ shouldBlockFn: () => isDirty, enableBeforeUnload: () =>
isDirty })` to intercept in-app navigation and browser tab close/reload
  while there are unsaved edits.

## Fallback components

`src/app/router-fallbacks.tsx` defines the router's default error/pending/
not-found components:

- **`RouteErrorComponent`** — scoped to the route outlet (the shell stays
  visible), with a "Try again" that resets both the router and TanStack
  Query's error boundary.
- **`RoutePendingComponent`** — a centered spinner; rarely visible in
  practice since no route defines a blocking loader.
- **`RouteNotFoundComponent`** — for unmatched paths, with a link back to
  the dashboard.
