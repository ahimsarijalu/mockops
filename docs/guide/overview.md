# Overview

MockOps is a **static single-page application** that manages one or more
[WireMock](https://wiremock.org/) servers through WireMock's Admin REST API.
There is no MockOps server, database, or backend of any kind — it is a
React + TypeScript app that runs entirely in your browser and talks
directly to the WireMock instances you point it at.

## What problem it solves

Teams running WireMock for local development, CI, or shared test
environments typically end up with several ways of managing it: raw
`curl`/Postman calls to the Admin API, hand-edited JSON files in
`mappings/`, or WireMock's own built-in Web UI (available since WireMock
3.x). None of these give you a single, purpose-built view across
**multiple** WireMock servers — dev, QA, SIT, UAT, or a teammate's local
instance — with request-level diagnostics, scenario/recording controls, and
a searchable mapping table in one place. MockOps is that console.

## What it does

- **Multi-server management** — configure any number of WireMock servers,
  tag them by environment, and switch the active one from the header. See
  [Servers](/features/servers).
- **Stub mapping CRUD** — a visual request/response builder, a raw JSON
  editor, and a diff view, plus bulk operations and JSON import/export. See
  [Mappings](/features/mappings).
- **Live request journal & near misses** — an auto-refreshing table of
  every request WireMock has served, with search, matched/unmatched
  filtering, and field-level diagnostics for why a request didn't match a
  stub. See [Request Journal & Near Misses](/features/requests).
- **Scenario state** — view and drive WireMock scenario state machines,
  including a transition graph derived from your mappings. See
  [Scenarios](/features/scenarios).
- **Recording** — start/stop/snapshot traffic recording against a target,
  reviewing captured mappings. See [Recordings](/features/recordings).
- **`__files` browser** — browse, create, edit, and delete text files
  under WireMock's `__files` directory. See [Files](/features/files).
- **Global settings & server actions** — fixed/random response delay,
  proxy pass-through, persisting or resetting mappings, resetting server
  state. See [Settings](/features/settings).
- **Local audit log** — a per-browser log of the actions you've taken in
  MockOps. See [Audit Log](/features/audit).

## What it doesn't do

MockOps has no authentication or authorization layer of its own, and it
cannot securely enforce access control — see
[Security](/architecture/security) for the full analysis. It also does not
run or embed WireMock itself; you point it at WireMock servers you already
run elsewhere (locally via `docker compose`, in CI, or in a shared
environment).

## Tech stack

React 19, TypeScript, Vite, TanStack Router/Query/Table/Form, ShadCN-style
components on Base UI, Zod, Axios, Zustand, Monaco Editor, Recharts,
Tailwind CSS v4 — see [package.json](https://github.com/ahimsarijalu/mockops/blob/main/package.json)
for exact versions and [Frontend Architecture](/architecture/frontend) for
how they fit together.

## Next steps

- [Installation](/guide/installation) — prerequisites and running MockOps
  locally.
- [First Setup](/guide/first-setup) — connecting your first WireMock
  server.
- [Quick Start](/guide/quick-start) — creating your first mapping end to
  end.
