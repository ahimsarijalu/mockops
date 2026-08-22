# Adding an API Operation

Every existing WireMock operation follows the same chain (see
[WireMock Integration](/architecture/wiremock-integration) and
[Data Flow](/architecture/data-flow)):

```text
Zod schema/type (src/shared/types/wiremock.ts)
  ↓
WireMockClient sub-client method (src/shared/api/wiremock-client.ts)
  ↓
Query/mutation hook (src/features/<feature>/api/use-*.ts)
  ↓
Component
  ↓
Cache invalidation + audit log + toast (mutations only)
```

## 1. Add or extend the domain type

If the operation returns or accepts a shape not already modeled, add it to
`src/shared/types/wiremock.ts` as a Zod schema with a matching inferred
type:

```ts
export const thingSchema = z
  .object({
    // known fields
  })
  .catchall(z.unknown()) // keep this — see below

export type Thing = z.infer<typeof thingSchema>
```

**Always keep `.catchall(z.unknown())`** on WireMock domain schemas
(every existing one has it) — it lets fields the UI has no dedicated
control for round-trip instead of being silently stripped, which matters
because WireMock's stub mapping format has many optional/exotic fields
(custom matchers, `postServeActions`, extension metadata) MockOps doesn't
build a UI for.

## 2. Add the method to the relevant `WireMockClient` sub-client

In `src/shared/api/wiremock-client.ts`, add a method to the existing
sub-client for that domain area (`mappings`, `files`, `scenarios`,
`requests`, `recordings`, `system`) rather than creating a new client or
calling Axios directly elsewhere:

```ts
async doThing(id: string): Promise<Thing> {
  const { data } = await this.http.post(`/__admin/things/${id}/do`)
  return thingSchema.parse(data)
}
```

Parse every response through its Zod schema before returning it — this is
the one place untyped WireMock JSON becomes a typed object; skipping it
anywhere breaks that guarantee for every caller downstream.

## 3. Add a hook

In the relevant feature's `api/use-*.ts`:

```ts
// Query
export function useThing(server: ServerConfig | null, id: string | undefined) {
  return useQuery({
    queryKey: ['thing', server?.id, id],
    queryFn: async () => {
      if (!server || !id) throw new Error('Missing server or id')
      return new WireMockClient(server).things.get(id)
    },
    enabled: !!server && !!id,
  })
}

// Mutation
export function useDoThing(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async (id: string) => {
      if (!server) throw new Error('No server configured')
      return new WireMockClient(server).things.doThing(id)
    },
    onSuccess: (result, id) => {
      queryClient.invalidateQueries({ queryKey: ['thing', server?.id, id] })
      logAction({ action: 'Did The Thing', target: id })
      toast.success('Done')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed')
    },
  })
}
```

Match the conventions every existing hook follows:

- Query keys start with a feature-specific tag and always include
  `server?.id` (see [State Management](/architecture/state-management)).
- `enabled: !!server` (and any other required argument).
- Mutations invalidate the affected query key(s), log to
  `useAuditStore`, and toast — in that order — on success; toast an error
  message on failure, and invalidate nothing.

## 4. Use it from a component

Call the hook from a page or feature component — never construct
`WireMockClient` or call Axios from a component directly. If a component
needs data another feature owns (e.g. Dashboard reading mapping counts),
import that feature's existing hook rather than duplicating the fetch.

## 5. Cache invalidation across features

If the operation affects data another feature's query key depends on
(e.g. stopping a recording creates new mappings), invalidate that other
feature's exported query key helper instead of guessing its shape — e.g.
`import { mappingsKey } from '@/features/mappings/api/use-mappings'`, as
`use-recordings.ts` and `use-settings.ts` already do.

## 6. Tests

If the operation involves any client-side logic beyond a direct pass-
through (parsing, matching, deriving), add a pure function in the
feature's `utils/` with a colocated `*.test.ts` — see
[Testing](/development/testing).
