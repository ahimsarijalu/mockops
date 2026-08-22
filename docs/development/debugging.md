# Debugging

## Tracing a request end to end

Because every WireMock operation follows the same chain (see
[Data Flow](/architecture/data-flow)), a bug report ("clicking X doesn't
work") usually maps to one of these checkpoints:

1. **Component** — is the right hook being called, with the right
   arguments? Check the page/component in `src/features/<feature>/pages/`
   or `components/`.
2. **Hook** — is the query/mutation actually enabled (`enabled: !!server`
   and any other guard)? Check `src/features/<feature>/api/use-*.ts`.
3. **`WireMockClient`** — is the right sub-client method being called with
   the right URL/payload? `src/shared/api/wiremock-client.ts`.
4. **HTTP layer** — is auth attached correctly, and is the failure being
   normalized into an `ApiError` you can actually read?
   `src/shared/api/http.ts`.
5. **WireMock itself** — is the server actually behaving as expected? Hit
   its Admin API directly (`curl`, Postman) to rule out MockOps entirely.

Your browser's Network tab shows every one of these requests directly,
since there's no server-side hop to obscure them — this is usually the
fastest way to tell whether a bug is in MockOps or in WireMock's response.

## Common failure signatures

| Symptom                                              | Likely cause                                                                                                                   | Where to look                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| "No active server" on a page you expect to have one  | `activeServerId` doesn't match any configured server (e.g. it was deleted)                                                     | `src/features/servers/store/server-store.ts`                                             |
| A query never fires                                  | Its `enabled` guard is false — check `server`/other required args                                                              | The relevant `use-*.ts` hook                                                             |
| Data looks stale after a mutation                    | The mutation's `onSuccess` isn't invalidating the right query key                                                              | Compare the mutation's `invalidateQueries` key to the query's `queryKey`                 |
| "Unable to reach WireMock server…"                   | Network failure — wrong URL, CORS, server down, or unreachable from the browser (not just from where MockOps itself is hosted) | `src/shared/api/http.ts`, browser Network tab                                            |
| A WireMock validation error is unreadable            | Check `error.message` on the thrown `ApiError` — WireMock's own message is preserved                                           | `src/shared/api/http.ts::createHttpClient`'s response interceptor                        |
| Zod parse error on a query                           | WireMock returned a shape the schema doesn't expect                                                                            | `src/shared/types/wiremock.ts` — the schema may need a field added (keeping `.catchall`) |
| `tsc -b` fails with `TS2307`/`TS2345` on route files | `src/routeTree.gen.ts` hasn't been generated yet                                                                               | Run `npm run generate-routes` — see [Local Development](/development/local-development)  |

## Inspecting state directly

- **Zustand stores** — `mockops-servers`, `mockops-ui`, `mockops-audit` in
  your browser's Application/Storage panel under Local Storage; each is a
  plain JSON blob you can read (and, carefully, edit) directly.
- **TanStack Query cache** — there is no Query DevTools panel wired into
  the app (`@tanstack/react-query-devtools` is not a dependency); the
  Network tab and React DevTools' component tree are the available options
  for inspecting query state during development.

## Error boundaries

A render error you can't otherwise explain will surface as either:

- The full-page "Something went wrong" state, if it escaped every route
  boundary — from `GlobalErrorBoundary`
  (`src/app/error-boundary.tsx`), which logs the error and component
  stack to `console.error`.
- An inline error block inside the current route's outlet — from
  `RouteErrorComponent` (`src/app/router-fallbacks.tsx`), if the error
  occurred during a route's render/data flow.

Check the browser console first in either case — that's the only place
these errors are currently logged (see
[Security](/architecture/security) — there is no external error
reporting).

## Linting and type errors

`npm run lint` and `npx tsc -b --noEmit` (see
[Reference → Commands](/reference/commands)) catch most issues before
they reach the browser. Both are required CI steps
(`.github/workflows/mockops-ci.yml`) — run them locally before pushing.
