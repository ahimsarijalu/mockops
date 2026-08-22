# Architecture Reference (AI / coding agents)

Condensed, factual summary for a coding agent working on this repository.
Prose versions with full explanations live under
[Architecture](/architecture/overview) — this page is optimized for
density, not narrative.

## Facts

- MockOps is a **static SPA**. No backend, no database, no server-side
  code anywhere in the repository.
- Every WireMock call is made **directly from the browser** to the base
  URL configured for the active server. There is no proxy layer.
- React 19 + TypeScript + Vite. Routing: TanStack Router (file-based,
  `src/routes/`). Server state: TanStack Query. Client state: Zustand
  (`persist` to `localStorage`). Validation: Zod. Forms: TanStack Form
  (only used for the server dialog). HTTP: Axios. Editor: Monaco. Styling:
  Tailwind CSS v4 on Base UI + `class-variance-authority`.
- `src/routeTree.gen.ts` is **generated and gitignored** — run
  `npm run generate-routes` before `tsc -b` will succeed if it doesn't
  exist yet.

## Call chain (every WireMock operation)

```text
Route (src/routes/*.tsx, thin shell)
  → Page (src/features/<feature>/pages/)
    → Component (src/features/<feature>/components/)
      → Hook (src/features/<feature>/api/use-*.ts, TanStack Query)
        → WireMockClient (src/shared/api/wiremock-client.ts)
          → Axios instance (src/shared/api/http.ts)
            → WireMock Admin API (/__admin/...)
```

No component or page constructs `WireMockClient` or calls Axios directly
— only hooks in `api/use-*.ts` files do. No file in the repository
bypasses this chain.

## The single WireMock domain model

`src/shared/types/wiremock.ts` is the **only** source of truth for
WireMock-shaped types. Every schema there is
`z.object({...}).catchall(z.unknown())` — always preserve the `.catchall`
when editing or adding a schema; it's what lets unmodeled fields survive a
visual-builder ↔ JSON-editor round trip instead of being silently dropped.

## State ownership (do not cross these)

| Kind                                            | Owner                   | Never                                                           |
| ----------------------------------------------- | ----------------------- | --------------------------------------------------------------- |
| Data fetched from WireMock                      | TanStack Query hook     | Never mirror into a Zustand store                               |
| Server list, active server, UI prefs, audit log | Zustand `persist` store | Never used to cache WireMock API responses                      |
| Mapping editor draft                            | local `useState`        | Not a form library — it's three synced views of one JSON object |

Full detail: [State Management](/architecture/state-management).

## Query key convention

Every query key includes `server?.id` (usually `server?.baseUrl` too),
e.g. `['mappings', server?.id, server?.baseUrl]`. This is what makes
switching the active server refetch every page automatically with no
manual invalidation. Preserve this when adding a new query.

## Mutation hook template

Every mutation hook in the codebase follows this shape — match it exactly
for new ones:

```ts
export function useDoThing(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async (arg) => {
      if (!server) throw new Error('No server configured')
      return new WireMockClient(server).<subclient>.<method>(arg)
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [...] })
      logAction({ action: '<Past-tense label>', target: '<identifier>' })
      toast.success('...')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed')
    },
  })
}
```

## Route file template

```ts
import { createFileRoute } from '@tanstack/react-router'
import { FeaturePage } from '@/features/<feature>/pages/<Feature>Page'

export const Route = createFileRoute('/<path>')({ component: FeaturePage })
```

Route files never contain page logic. Dynamic segments use `$name` in the
filename (only `mappings_.$mappingId.tsx` does this today); a trailing
underscore before a dot (`mappings_.new.tsx`) opts a route out of its
parent's layout nesting.

## Feature inventory

See [Feature Map](/ai/feature-map) for the exact file layout of every
feature currently in the repository.

## What does not exist (don't assume it)

- No backend, no database, no server-side auth/session.
- No `templates` feature folder — response templating is part of the
  mappings response editor (`src/features/mappings/components/response-editor-form.tsx`).
- No route loaders — all data fetching happens inside page components via
  hooks.
- No component-level state management library beyond React `useState` and
  the two mechanisms above (no Context-based stores, no Redux, no Jotai).
- No environment variables read by the application (see
  [Environment Variables](/reference/environment-variables)).
