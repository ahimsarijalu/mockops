# Audit Log

## Purpose

A local, chronological record of actions you've taken through MockOps —
useful for remembering what you changed during a debugging session.

## Prerequisites

None — it works without an active server, since it only records actions
already taken through the UI.

## How to access it

Sidebar → **Audit Log**, route `/audit`.

## What gets logged

Every mutating action across the app logs an entry — mapping create/
update/delete/bulk-delete/import, enable/disable, file save/delete,
scenario reset/set-state (including reset-all), recording start/stop/
snapshot, global settings update, saving mappings to disk, resetting
mappings to default, and resetting server state. Each entry has a
timestamp, an action label, and a target (usually the affected mapping/
file/scenario name).

## Typical workflow

Search entries by action or target text; click **Clear log** to wipe it
(with a confirmation dialog).

## Important behavior

- **This log is entirely local to your browser** — it is not sent
  anywhere, not shared between browsers/devices, and not related to any
  audit logging WireMock itself might have. It only reflects actions taken
  _through MockOps_ on _this browser_.
- **Capped at 500 entries.** Once full, the oldest entries are dropped as
  new ones are added.
- **Persisted to `localStorage`** — it survives page reloads and browser
  restarts, but not clearing site data.
- It is not scoped per-server; actions from every server you've used
  appear together (a server name column isn't currently rendered, though
  the underlying entry shape has room for one).

## Common problems

- **Missing an action you expected** — only actions taken through the
  MockOps UI are recorded; anything done via `curl`/Postman/another tool
  directly against WireMock's Admin API won't appear here.
- **Log seems to have "forgotten" old entries** — the 500-entry cap; there
  is no way to export or extend it from the UI.
