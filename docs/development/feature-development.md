# Adding a Feature

Follow the same structure every existing feature uses (see
[Project Structure](/development/project-structure)). There's no
scaffolding CLI — create the folders you need by hand.

## 1. Create the feature folder

```text
src/features/<feature>/
├── api/        # if it talks to WireMock
├── components/
├── pages/
├── schemas/    # if it has forms or matcher-option lists
├── store/      # only if it needs its own client-state store
├── types/      # only if it needs types beyond the shared WireMock domain model
└── utils/      # pure helpers, each with a colocated *.test.ts
```

Only create the subfolders the feature actually needs — e.g. `audit` has
no `api/` because it never calls WireMock; `dashboard` has no `schemas/`
or `store/` because it has no forms or feature-specific client state.

## 2. Add the WireMock operations it needs

If the feature calls WireMock, extend `WireMockClient` rather than adding
ad hoc `axios`/`fetch` calls anywhere else — see
[Adding an API Operation](/development/api-integration).

## 3. Build the page component

Create `src/features/<feature>/pages/<Feature>Page.tsx`. Every existing
page follows the same shape:

```tsx
export function FeaturePage() {
  const server = useActiveServer()
  const { data, isLoading, error } = useFeatureData(server)

  if (!server) {
    return <NoActiveServerState description="..." />
  }
  // loading / error / empty / content states
}
```

- Always resolve the active server with `useActiveServer()`
  (`src/features/servers/store/server-store.ts`), never read the store's
  raw state for this.
- Always render `NoActiveServerState`
  (`src/shared/components/feedback/no-active-server-state.tsx`) when there
  is no active server, before attempting to fetch anything feature-specific.
- Follow the existing loading (`Skeleton`), error (inline destructive
  message block), and empty-state patterns already used across features
  for visual consistency.

## 4. Wire up the route

Add a route file in `src/routes/` (see
[Routing](/architecture/routing) for the file-naming convention) that
imports the page and does nothing else:

```ts
import { createFileRoute } from '@tanstack/react-router'
import { FeaturePage } from '@/features/<feature>/pages/<Feature>Page'

export const Route = createFileRoute('/<path>')({
  component: FeaturePage,
})
```

Run `npm run generate-routes` (or `npm run dev`) to regenerate
`src/routeTree.gen.ts`, then add an entry to `navItems`
(`src/shared/components/layout/nav-items.ts`) if the feature should appear
in the sidebar and command palette.

## 5. State

- Server data (anything from WireMock) → a TanStack Query hook in
  `api/use-*.ts`, never a Zustand store — see
  [State Management](/architecture/state-management).
- Feature-specific client state that needs to persist across sessions →
  a Zustand store in the feature's own `store/`, following the
  `create<State>()(persist(..., { name: 'mockops-<feature>' }))` pattern
  every existing store uses.
- Purely local, ephemeral UI state (a search box, a dialog's open state) →
  plain `useState` in the component.

## 6. Tests

Add a colocated `*.test.ts` next to any pure utility/transform function
you add (see [Testing](/development/testing)). MockOps doesn't unit-test
components — if the feature is significant, add a Playwright smoke check
to `e2e/smoke.spec.ts` instead.

## 7. Audit logging (if the feature mutates WireMock state)

Every existing mutation hook logs to `useAuditStore` on success — match
that convention:

```ts
const logAction = useAuditStore((s) => s.log)
// ...
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ... })
  logAction({ action: 'Did The Thing', target: someIdentifier })
  toast.success('...')
}
```

See [Conventions](/ai/conventions) for the full mutation-hook template.
