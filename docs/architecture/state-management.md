# State Management

MockOps uses several distinct state mechanisms, each with a clear owner.
Mixing them up is the most common way to introduce bugs when extending the
app — see [Adding a Feature](/development/feature-development) for the
placement rules this page justifies.

## Ownership table

| State                                                                                            | Owner                                                           | Persistence                                                         | Purpose                                          |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| Configured WireMock servers + active server ID                                                   | `useServerStore` (`src/features/servers/store/server-store.ts`) | `localStorage`, key `mockops-servers`                               | Multi-server config, drives every WireMock query |
| UI preferences (theme, sidebar collapsed, command palette open)                                  | `useUiStore` (`src/shared/stores/ui-store.ts`)                  | `localStorage`, key `mockops-ui`                                    | Cross-cutting UI state, not WireMock data        |
| Local audit log (max 500 entries)                                                                | `useAuditStore` (`src/features/audit/store/audit-store.ts`)     | `localStorage`, key `mockops-audit`                                 | Per-browser record of mutating actions           |
| WireMock API responses (mappings, journal, scenarios, files, settings, recording status, health) | TanStack Query, per-feature `use-*.ts` hooks                    | In-memory only                                                      | Server state cache, polling, retry               |
| Mapping editor draft (visual/JSON/metadata form state)                                           | React `useState` in `MappingEditorPage`                         | None — lost on navigation/reload (guarded by a dirty-check blocker) | Local edit buffer before save                    |
| Server / mapping forms                                                                           | TanStack Form + Zod schemas                                     | None (submits into a store or a mutation)                           | Field-level validation                           |

## Zustand stores

All three stores follow the same pattern:
`create<State>()(persist((set) => ({ ... }), { name: 'mockops-*' }))`. This
is a deliberate, consistent convention — see
[Conventions](/ai/conventions) for the exact rule to follow when adding a
new store. `useServerStore` additionally exports a derived hook,
`useActiveServer()`, which every WireMock query hook takes as its data
dependency instead of reading `activeServerId` directly.

## TanStack Query

Every feature's `src/features/<feature>/api/use-*.ts` file defines its own
query/mutation hooks, each:

- Building a query key that starts with a feature-specific tag and always
  includes `server?.id` (and usually `server?.baseUrl`), e.g.
  `['mappings', server?.id, server?.baseUrl]` — this is what makes
  switching the active server "just work" without manual invalidation
  (see [WireMock Integration](/architecture/wiremock-integration)).
- Being `enabled: !!server`, so no request fires with no active server.
- On mutation success, calling `queryClient.invalidateQueries` for the
  affected key(s), logging an entry to `useAuditStore`, and showing a
  `sonner` toast.

### Polling intervals

| Data              | Interval | Hook                  |
| ----------------- | -------- | --------------------- |
| Request journal   | 10s      | `useRequestJournal`   |
| Near misses       | 10s      | `useNearMisses`       |
| Scenarios         | 10s      | `useScenarios`        |
| Recording status  | 5s       | `useRecordingStatus`  |
| Server health     | 30s      | `useServerHealth`     |
| Dashboard metrics | 15s      | `useDashboardMetrics` |

Mappings, files, and settings are **not** polled — they refetch on
mutation success or manual refresh only.

### Cache invalidation patterns worth knowing

- `useResetServerState` invalidates with a `predicate` matching any query
  key containing the server's ID, rather than listing every affected key
  by name — deliberately broad because a full server reset touches
  mappings, scenarios, and the journal at once.
- `useStopRecording`/`useSnapshotRecording` invalidate the **mappings**
  cache (via the shared `mappingsKey` helper exported from the mappings
  feature), not just their own recording-status cache, since a successful
  recording creates new mappings.
- `useDeleteFile` uses `removeQueries` (not `invalidateQueries`) for the
  now-deleted file's content query, since refetching a deleted file's
  content would just produce a 404.

### Retry and error policy

Configured once at the `QueryClient` level (`src/app/query-client.ts`):
queries retry up to twice, except any `ApiError` with `code: 'http'` and a
status under 500 (client errors aren't worth retrying); mutations never
retry, since retrying a WireMock write automatically could double-apply
it.

## Forms

The server add/edit dialog uses **TanStack Form** with a Zod validator
(`src/features/servers/schemas/server-schema.ts`), including a
`superRefine` that requires a username for basic auth and a token for
bearer auth. The mapping editor does **not** use TanStack Form — it's
plain `useState` over the mapping object, since its "form" is really three
synchronized views (visual/JSON/diff) of one JSON document rather than a
conventional field-by-field form.

## URL / route state

The only route param in the app is `$mappingId` on the mapping editor
route, validated by a Zod schema at the route level. No other page encodes
filter/search state in the URL — search boxes, filters, and table
selection (mappings list, request journal) are local component state that
resets on navigation.

## No global "current WireMock data" store

There's no Zustand or Context store holding "the current mappings" or
similar — TanStack Query's cache is the only place WireMock data lives.
This is a deliberate boundary: Zustand stores hold MockOps' _own_
configuration/preferences, never a mirror of server-fetched data. See
[Conventions](/ai/conventions).
