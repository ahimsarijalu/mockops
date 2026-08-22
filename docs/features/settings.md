# Settings

## Purpose

Two distinct things live on this page: **global WireMock response
behavior** for the active server, and **console preferences** local to
your browser.

## Prerequisites

An active server for the WireMock-side settings; none for the console
preference.

## How to access it

Sidebar → **Settings**, route `/settings`.

## Console preferences

- **Theme** — Light, Dark, or System. Stored in your browser
  (`localStorage`), independent of any server — see
  [State Management](/architecture/state-management).

## Global response settings

Applied to **every stub** on the active server via WireMock's global
settings API:

- **Fixed delay (ms)** — added to every response.
- **Proxy pass-through for unmatched requests** — whether WireMock
  forwards requests with no matching stub upstream instead of returning 404.
- **Delay distribution** — None, Uniform (lower/upper bound), or
  Log-normal (median/sigma), as an alternative to a fixed delay.

Click **Save settings** to apply. These are genuinely global — they are
not scoped to a single mapping the way a per-mapping delay
(see [Mappings](/features/mappings)) is.

## Server actions

- **Save mappings to disk** — persists all current in-memory mappings to
  the WireMock server's `mappings/` directory (equivalent to WireMock's
  `/mappings/save`).
- **Reset mappings to default** — discards in-memory mapping changes and
  reloads stubs from disk (with a confirmation dialog).
- **Reset server state** — resets mappings, scenarios, and the request
  journal back to their original state (with a confirmation dialog). This
  is the most destructive action on this page.

## Important behavior

- Global response settings and server actions apply to the **active
  server only** — switching servers reloads this page's WireMock-side
  fields for the newly active one.
- **Reset server state** only refetches data scoped to that server
  (queries keyed by server ID) rather than refetching every server's data.
- Theme is a MockOps-only preference; it has no effect on WireMock.

## Common problems

- **"Save mappings to disk" fails with a permission error** — WireMock
  couldn't write to its `mappings`/`__files` directory; MockOps surfaces a
  specific message suggesting you check filesystem permissions or avoid
  relying on persistence for that server.
- **Reset server state removed data I wanted** — this action is
  irreversible from MockOps; it mirrors WireMock's own `/__admin/reset`
  behavior exactly.

## Related

[Mappings](/features/mappings) — per-mapping delay vs. this page's global
delay.
