# Servers

## Purpose

The Servers page is where you register the WireMock instances MockOps
manages, and where you pick which one every other page acts on.

## Prerequisites

None — this is the first thing to set up in a fresh MockOps install. See
[First Setup](/guide/first-setup) for a walkthrough.

## How to access it

Sidebar → **Servers**, route `/servers`.

## Typical workflow

1. **Add a server** with a name, base URL, environment tag, and
   authentication mode (see [First Setup](/guide/first-setup) for field
   details).
2. MockOps periodically checks each server's health in the background and
   shows online/offline/checking status on its card, along with the
   detected WireMock version and how long ago it was last checked.
3. Click **Set active** on a server card (or use the header's server
   switcher) to make it the target for every other page.
4. **Edit** or **Delete** a server from its card at any time. Deleting a
   server only removes it from MockOps — it does not affect the WireMock
   instance itself.

## Available operations

- Add / edit / delete a server.
- Set the active server.
- Test connection (manually re-check health).

## Configuration

| Field          | Values                                                        | Notes                                                 |
| -------------- | ------------------------------------------------------------- | ----------------------------------------------------- |
| Name           | free text, 1–64 chars                                         | shown throughout the app                              |
| Base URL       | any valid URL                                                 | must be reachable **from your browser**               |
| Environment    | `development`, `qa`, `sit`, `uat`, `production-like`, `local` | organizational tag only, no behavioral effect         |
| Authentication | None / Basic / Bearer                                         | applied to every request MockOps sends to this server |

## Important behavior

- **No default server.** A fresh install has zero servers configured;
  every feature shows a "No active server" empty state until one exists.
- **First server becomes active automatically.** Adding your first server
  sets it active; deleting the active server falls back to the next
  configured one (or `null` if none remain).
- **Health checks poll every 30 seconds** while a server card is mounted,
  and also fall back to listing one mapping if the WireMock instance
  doesn't expose `/__admin/health` (older WireMock versions).
- **Switching the active server never navigates you** — it just changes
  which server the current page's data comes from, and every page's
  queries refetch automatically because they're keyed by server ID.
- **Credentials are stored in your browser**, not on any server — see
  [Security](/architecture/security).

## Common problems

- **Server always shows offline** — confirm the base URL is reachable
  directly from the machine/browser running MockOps (not just from a
  container or CI runner), and that credentials are correct.
- **"No servers configured" everywhere** — you haven't added a server yet;
  see [First Setup](/guide/first-setup).
- **Removed a server by mistake** — MockOps only forgets its local
  connection details; the WireMock instance and its data are untouched. Re-add it with the same base URL.
