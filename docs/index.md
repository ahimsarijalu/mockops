---
layout: home

hero:
  name: MockOps
  text: WireMock API Management Console
  tagline: >-
    A browser-based console for managing one or more WireMock servers —
    mappings, request journal, near misses, scenarios, recordings, and
    files — entirely through WireMock's Admin API.
  image:
    src: /favicon.svg
    alt: MockOps
  actions:
    - theme: brand
      text: Getting Started
      link: /guide/overview
    - theme: alt
      text: Quick Start
      link: /guide/quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/ahimsarijalu/mockops

features:
  - icon: 🧩
    title: Stub mapping management
    details: >-
      Full CRUD on WireMock stub mappings with a visual request/response
      builder, a Monaco JSON editor, a before/after diff view, bulk
      enable/disable/delete, and JSON import/export.
  - icon: 🛰️
    title: Live request journal & near misses
    details: >-
      An auto-refreshing, virtualized view of every request WireMock has
      served, with search/filtering and field-level "why didn't this
      match?" diagnostics for unmatched requests.
  - icon: 🔀
    title: Scenarios & recordings
    details: >-
      View and drive stateful scenarios (reset, set state, derived
      transition graphs) and record live traffic into new stub mappings,
      with start/stop/snapshot controls.
  - icon: 📁
    title: __files browser
    details: >-
      Browse, create, edit, and delete files under WireMock's __files
      directory, with links back to every mapping that references a file
      via bodyFileName.
  - icon: 🖥️
    title: Multi-server, no backend
    details: >-
      Configure any number of WireMock servers (dev/QA/SIT/UAT/local),
      each with its own base URL and auth, and switch between them from
      the header. MockOps is a static SPA — it talks to WireMock directly
      from your browser.
  - icon: 🚀
    title: Container-ready deployment
    details: >-
      A multi-stage Docker build served by Nginx, Kubernetes manifests,
      and a Helm chart are included, with images published to GHCR by
      GitHub Actions on every push to main and on tagged releases.
---

## What MockOps is

MockOps is a management console for [WireMock](https://wiremock.org/) — the
API mocking tool many teams run in local, CI, and shared test
environments. WireMock ships with a REST Admin API and a Java-based Web UI,
but no first-class way to browse, edit, and operate its state across
multiple environments from a single, purpose-built interface. MockOps fills
that gap: it is a React + TypeScript single-page application that talks
directly to one or more WireMock servers' Admin APIs
(`/__admin/...`) to manage stub mappings, inspect the request journal,
drive scenarios, control recordings, and edit `__files` content.

It is **not** a mocking engine itself, and it has **no backend of its
own** — every action in the UI is an HTTP call from your browser straight
to the WireMock server you've configured. See
[Architecture Overview](/architecture/overview) for the full runtime model
and its security implications.

## Who it's for

Anyone who works with WireMock day to day and currently juggles raw Admin
API calls, WireMock's built-in UI, or hand-edited JSON mapping files:
backend/QA engineers maintaining mock APIs across multiple environments,
and teams that want one console instead of separate tooling per WireMock
instance.

## Where to go next

- **New to MockOps?** Start with [Getting Started](/guide/overview), then
  the [Quick Start](/guide/quick-start) to connect your first server and
  create a mapping.
- **Using MockOps day to day?** The [User Guide](/features/servers) covers
  every feature: servers, dashboard, mappings, requests, scenarios,
  recordings, files, response templating, settings, and the audit log.
- **Working on MockOps itself?** See the
  [Developer Guide](/development/local-development) and
  [Architecture](/architecture/overview) docs.
- **Deploying MockOps?** See [Docker](/deployment/docker),
  [Kubernetes](/deployment/kubernetes), and [Helm](/deployment/helm).
- **Using a coding agent on this repo?** See the
  [AI / coding-agent reference](/ai/architecture).
