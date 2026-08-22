# Request Journal & Near Misses

## Purpose

Inspect every request WireMock has actually served, and diagnose why a
request _didn't_ match any stub.

## Prerequisites

An active server (see [Servers](/features/servers)). WireMock's request
journal must be enabled on the server (it is by default).

## How to access it

Sidebar → **Request Journal** (`/requests`) and **Near Misses**
(`/near-misses`).

## Request Journal

### Typical workflow

1. Open **Request Journal**. The table auto-refreshes every 10 seconds and
   shows up to the most recent 1000 requests: timestamp, method, URL,
   response status, and the matched stub (or "unmatched").
2. Filter by **All / Matched / Unmatched**, or search by URL, method,
   status, or stub name.
3. Click a row to open the request/response detail panel — full headers
   and (pretty-printed, when JSON) bodies for both the request and the
   matched response, plus timing information (total time, added delay,
   process time) when WireMock reports it.
4. Delete individual entries from a row, or **Clear journal** to wipe it
   entirely (with a confirmation dialog).

### Near-miss diagnostics from the detail panel

Selecting an **unmatched** request in the detail panel shows a **Find near
misses** button, which asks WireMock for the closest-matching stubs for
that specific request and renders the same diagnostics as the Near Misses
page (below).

## Near Misses

### Typical workflow

Open **Near Misses** to see WireMock's own near-miss report — unmatched
requests paired with their closest-matching stub, ranked by WireMock's
internal match distance. Each card shows the request, the closest stub
(linked to its editor), and a **why it didn't match** breakdown.

### How the mismatch explanation works

MockOps evaluates the same candidate stub's request pattern against the
logged request, field by field, and reports concrete "expected vs. actual"
mismatches for method, URL (whichever of `url`/`urlPath`/`urlPattern`/
`urlPathPattern` was used), headers, query parameters, cookies, and simple
body matchers (`equalTo`, `contains`, `matches`, `doesNotMatch`, `absent`).
This goes beyond what WireMock's near-miss API returns on its own (which
gives a match _distance_ but not a field-level reason).

**Regex matchers** (`matches`, `doesNotMatch`, `urlPattern`,
`urlPathPattern`) are evaluated with Java's full-string match semantics —
the entire value must match the pattern, not just a substring — to line up
with how WireMock itself evaluates them. **Body matchers that require a
JSON/XML engine** (`equalToJson`, `matchesJsonPath`, `matchesXPath`,
`equalToXml`) are intentionally **not** evaluated client-side; when a stub
only uses those, the card shows "no field-level mismatch could be detected
client-side" rather than guessing.

## Important behavior

- Both pages poll every 10 seconds — there's no way to disable polling
  from the UI.
- The journal table is virtualized, so it stays responsive even with a
  full 1000-entry page loaded.
- Deleting or clearing journal entries only affects the journal — it does
  not touch stub mappings.

## Common problems

- **A request I expect to see isn't there** — WireMock's request journal
  can be disabled server-side; if so, the journal query still succeeds but
  returns an empty/short list (WireMock reports this via
  `requestJournalDisabled` in its response).
- **Near-miss card shows no explanation** — the difference is likely in a
  JSON/XPath/JSON-path body matcher, which is evaluated server-side only;
  see above.
- **A multi-valued header/query param mismatch looks wrong** — WireMock
  matches a multi-valued field when _any_ one of its values satisfies the
  matcher; MockOps' diagnostics replicate that (not "all values" or
  "joined values") semantics.

## Related

[Mappings](/features/mappings) — edit the stub a near miss points to.
