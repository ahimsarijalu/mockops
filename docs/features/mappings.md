# Mappings

## Purpose

Full lifecycle management of WireMock **stub mappings** — the core objects
that define how WireMock matches incoming requests and what it responds
with.

## Prerequisites

An active server (see [Servers](/features/servers)).

## How to access it

Sidebar → **Mappings**, route `/mappings` (list) and `/mappings/new` /
`/mappings/$mappingId` (editor).

## Viewing mappings

The list page shows every mapping on the active server in a virtualized
table (so it stays fast with thousands of stubs), with:

- Name, method, matched URL, response status, priority.
- Badges for scenario-linked, proxy, and response-file stubs, plus any
  tags.
- A free-text search box matching name, ID, URL, scenario name, response
  file name, tags, and raw metadata JSON.
- Row actions: enable/disable, edit, duplicate, delete.
- Checkboxes for bulk selection.

## Creating a mapping

Click **New mapping**. The editor has three tabs:

- **Visual builder** — form controls for the request matcher and response
  (see below).
- **JSON editor** — the raw stub mapping JSON, kept in sync with the
  visual builder both ways; useful for matchers the visual builder doesn't
  expose a control for (e.g. `matchesJsonPath`, `equalToXml`).
- **Diff** — only available when editing an existing mapping; a
  side-by-side comparison against the version last loaded from the server.

Name, priority, persistence, and scenario fields (scenario name, required
state, new state) sit above the tabs and apply regardless of which tab
you're using.

## Editing a mapping

Open a mapping from the list (or from a link in the request journal,
near-miss diagnostics, scenario card, or file reference) to edit it in the
same three-tab editor, pre-filled with its current definition. Leaving the
page with unsaved changes — including closing the browser tab — prompts a
confirmation dialog.

## Deleting mappings

Delete a single mapping from its row action, or select multiple rows and
use the bulk toolbar's **Delete**. Bulk delete reports how many succeeded
and how many failed (a mapping can fail to delete if the request itself
fails against WireMock); failed rows stay selected so you can retry.

## Duplicating a mapping

The row action's **Duplicate** copies a mapping (dropping its `id`/`uuid`
so WireMock assigns new ones) with `" (copy)"` appended to its name, and
saves it as a new mapping immediately.

## Import / export

- **Export** downloads the currently filtered mappings (or just your
  selection, if any) as a JSON file (`{ "mappings": [...] }`).
- **Import** accepts a JSON file containing either an array of mappings or
  an object with a `mappings` array, and creates each one on the active
  server.

## Bulk operations

Select rows via their checkboxes to reveal a toolbar for **Enable**,
**Disable**, **Delete**, or clearing the selection.

## Request matching

The visual builder's **Request matcher** section covers:

- **Method** — any HTTP method or `ANY`.
- **URL match type** — exact URL (`url`), exact path (`urlPath`), or regex
  versions of either (`urlPattern`, `urlPathPattern`).
- **Headers**, **query parameters**, **cookies** — each as a list of
  name → matcher pairs, where the matcher type is one of: equal to,
  contains, matches (regex), does not match (regex), or absent.
- **Body patterns** — equal to, equal to JSON, matches JSONPath, equal to
  XML, matches XPath, contains, matches (regex), or binary equal to.
- **Basic auth credentials** the incoming request must present.

## Response configuration

The **Response** section covers:

- Status code and status message.
- Response body, in one of four modes: JSON (Monaco JSON editor), text/
  XML/HTML (Monaco text editor), a response file (`bodyFileName`,
  referencing [Files](/features/files)), or no body.
- Response headers.
- Fixed delay, or a delay distribution (uniform or log-normal).
- A fault (empty response, malformed chunk, random data then close, or
  connection reset), for testing client resilience.
- A proxy base URL, with additional proxy request headers.
- Chunked dribble delay (number of chunks, total duration).
- Response templating (the `response-template` transformer) and any
  additional transformers with JSON parameters — see
  [Response Templating](/features/templates).

## WireMock-specific behavior

- **"Disabled" is a MockOps convention, not a WireMock feature.** WireMock
  has no native concept of a disabled stub; MockOps implements it by
  setting `metadata.disabled: true` and expects your own judgment about
  whether a "disabled" stub might still match traffic on a raw Admin API
  call or another tool — MockOps only skips it in its own UI treatment,
  it does not remove or deprioritize it on the WireMock server.
- **Tags are also a MockOps convention**, stored as a `tags` array inside
  `metadata`, editable as a comma-separated field. They're used for search
  and displayed as badges; WireMock itself doesn't interpret them.
- **Priority** follows WireMock's own semantics: lower numbers match
  first when multiple stubs could match a request.
- **Persistent** controls whether WireMock writes the stub to disk
  (`mappings/` on the server) — if a save fails with a permission error,
  MockOps surfaces a specific message suggesting you check WireMock's
  filesystem permissions or disable persistence.
- Every field WireMock's Admin API accepts round-trips correctly even if
  the visual builder has no dedicated control for it, because the
  underlying schema is permissive — use the **JSON editor** tab for
  anything not covered above.

## Common problems

- **A saved mapping doesn't seem to disable** — remember disabling is a
  MockOps-only UI convention; the stub is still live on the WireMock
  server.
- **Regex matcher behaves unexpectedly** — WireMock's regex matchers
  require the _entire_ value to match (Java's `Pattern.matches` semantics),
  not just a substring — see
  [Request Journal & Near Misses](/features/requests) for how MockOps'
  near-miss diagnostics account for this.
- **A body matcher never gets flagged in near-miss diagnostics** —
  matchers requiring a JSON/XML engine (`equalToJson`, `matchesJsonPath`,
  `matchesXPath`, `equalToXml`) are evaluated by WireMock server-side only;
  MockOps' client-side diagnostics skip them rather than guess.

## Related

[Files](/features/files) · [Scenarios](/features/scenarios) ·
[Response Templating](/features/templates) ·
[Request Journal & Near Misses](/features/requests)
