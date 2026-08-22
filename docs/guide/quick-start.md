# Quick Start

This walks through creating a working stub mapping end to end, assuming
you've already [added a server](/guide/first-setup).

## 1. Open Mappings

Go to **Mappings** in the sidebar (`/mappings`). You'll see a searchable,
virtualized table of every stub mapping currently on the active WireMock
server (empty on a fresh instance).

## 2. Create a mapping

Click **New mapping** (`/mappings/new`). The editor opens with a sensible
default — `GET /` returning `200` with an empty JSON body — split across
three tabs:

- **Visual builder** — form-based request matcher and response editor.
- **JSON editor** — the raw WireMock stub mapping JSON (Monaco), kept in
  sync with the visual builder in both directions.
- **Diff** — only shown when editing an existing mapping; a side-by-side
  diff against the last-loaded version.

## 3. Configure the request matcher

In the **Request matcher** section, set:

- **Method** — e.g. `GET`.
- **URL match type** — exact URL, exact URL path, or regex versions of
  either (`urlPattern`/`urlPathPattern`).
- **URL** — e.g. `/api/hello`.

Optionally add header, query parameter, cookie, or body matchers.

## 4. Configure the response

In the **Response** section, set a status code and a response body — JSON,
raw text, or a reference to a file under `__files` (`bodyFileName`).
Optionally add response headers, a fixed or randomized delay, a fault
(e.g. connection reset), or enable response templating (see
[Response Templating](/features/templates)).

## 5. Save

Click **Save mapping**. On success, MockOps navigates back to the mappings
list and the new stub is immediately live on the WireMock server — try
hitting it directly (e.g. `curl http://localhost:8081/api/hello`).

## 6. See it in the request journal

Go to **Request Journal** (`/requests`). The request you just made appears
within a few seconds (the journal auto-refreshes) with its matched status,
method, URL, and response code. Click a row to open the full request/
response detail, including headers and body.

## What's next

- [Mappings](/features/mappings) — the full mapping editor reference:
  matcher types, response modes, bulk operations, import/export.
- [Request Journal & Near Misses](/features/requests) — diagnosing
  unmatched requests.
- [Scenarios](/features/scenarios) and [Recordings](/features/recordings)
  — stateful mocks and capturing real traffic as mappings.
