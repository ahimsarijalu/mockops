# Dashboard

## Purpose

A live, at-a-glance overview of the active WireMock server's state — how
many stubs exist and what kind, recent traffic, and connection health.

## Prerequisites

An active server (see [Servers](/features/servers)).

## How to access it

Sidebar → **Dashboard**, route `/` (the app's default landing page).

## What it shows

- **Stat cards**: total stubs, disabled stubs, scenario-linked stubs,
  proxy stubs, response-file stubs, total requests (from the last 50
  journal entries fetched for this view), unmatched requests, and near
  misses.
- **Charts**: a request-volume chart and a stub-composition chart, built
  from the same data as the stat cards.
- **Server card**: base URL, online/offline status, detected WireMock
  version, and environment tag.

## Important behavior

- **Auto-refreshes every 15 seconds.** All figures update on a fixed
  polling interval — there's no manual refresh button because the whole
  page is designed to stay current on its own.
- **"Disabled" stubs** are mappings with a `disabled: true` flag in their
  `metadata` — a MockOps-specific convention (see
  [Mappings](/features/mappings)), not a native WireMock concept.
- **Chart code is lazy-loaded.** The charting library only downloads when
  you actually visit the Dashboard, to keep it out of the app's initial
  bundle.
- If the active server is unreachable, the page shows a "Disconnected"
  badge and an inline error instead of stale numbers.

## Common problems

- **Numbers don't match what you expect** — the dashboard's "total
  requests" figure reflects only the most recent 50 journal entries
  fetched for this view, not the full journal; use
  [Request Journal](/features/requests) for the complete, searchable list.
- **Charts don't appear** — they render only once metrics have loaded
  successfully; check the error banner if the server is unreachable.
