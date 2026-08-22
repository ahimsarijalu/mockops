# Response Templating

::: info Not a separate page
Unlike the other User Guide pages, response templating has no dedicated
route in MockOps — it's a section of the **response editor** inside the
[Mappings](/features/mappings) feature
(`src/features/mappings/components/response-editor-form.tsx`). This page
exists because it's a distinct enough capability to deserve its own
explanation.
:::

## Purpose

Let a stub's response body, headers, or status depend on the incoming
request (path/query parameters, headers, request body fields, random
values, dates, etc.) using WireMock's `response-template` transformer,
instead of a fixed response.

## Prerequisites

A mapping already open in the mapping editor (see
[Mappings](/features/mappings)).

## How to access it

In the mapping editor's **Visual builder** tab, under **Response**, at the
bottom of the section:

1. Check **Enable response templating (response-template transformer)** —
   this adds `"response-template"` to the mapping's `transformers` array.
2. Optionally list **additional transformers** (comma-separated) — for any
   custom WireMock transformer registered on the server beyond the
   built-in one.
3. Once any transformer is enabled, a **Transformer parameters (JSON)**
   editor appears for `transformerParameters` — extra values made
   available to the template beyond what WireMock provides automatically.

The actual template syntax lives in the response body itself, written
using WireMock's Handlebars-based templating — double-curly-brace
placeholders such as `request.path.[0]` or `now` — in whichever body mode
you're using (JSON or text). MockOps does not add its own templating
syntax or validation on top of WireMock's.

## Important behavior

- MockOps doesn't validate template syntax — a broken template only
  surfaces as a WireMock error at request time, not at save time.
- Response templating is a per-mapping opt-in; it is not a global setting
  (compare to global response delay in
  [Settings](/features/settings), which does apply everywhere).
- The `docker-compose.yml` reference WireMock instance runs with
  `--global-response-templating`, which enables templating on every stub
  automatically — useful for local testing without opting in per mapping,
  but that's a WireMock server flag, not something MockOps controls.

## Common problems

- **Template placeholders show up literally in the response** — the
  "Enable response templating" checkbox likely isn't checked, or the
  target WireMock server doesn't have the `response-template` extension
  available (it ships with WireMock's standalone/Docker distribution by
  default).

## Related

[Mappings](/features/mappings#response-configuration) — full response
editor reference.
