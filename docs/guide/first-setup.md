# First Setup

MockOps starts with **no servers configured** — there is no default or
bundled WireMock instance. Every other page in the app (Dashboard,
Mappings, Files, …) shows a "No active server" prompt until you add one.

## Add a server

1. Open **Servers** in the sidebar (`/servers`).
2. Click **Add server**.
3. Fill in the form:

   | Field          | Notes                                                                                                              |
   | -------------- | ------------------------------------------------------------------------------------------------------------------ |
   | Name           | A label shown throughout the app, e.g. "QA Mock Server"                                                            |
   | Base URL       | The WireMock server's root URL, e.g. `http://localhost:8081` — **not** including `/__admin`                        |
   | Environment    | One of Development, QA, SIT, UAT, Production-like Mock, Local Mock — a tag shown as a badge, purely organizational |
   | Authentication | None, Basic Authentication, or Bearer Token                                                                        |

4. If you choose **Basic Authentication**, a username and password are
   required. If you choose **Bearer Token**, a token is required. These
   credentials are sent with every request MockOps makes to that server —
   see [Security](/architecture/security) for how they're stored and what
   that implies.
5. Click **Add server**. The new server becomes the **active server**
   automatically if it's your first one.

## Verify the connection

Each server card on the Servers page shows a live status (online/offline/
checking) based on periodic health checks, plus the WireMock version once
detected and a "checked \_\_ ago" timestamp. Click **Test connection** to
check immediately. If the server shows **offline**, verify:

- The base URL is reachable from your browser (not just from a server-side
  process) — MockOps calls WireMock directly from the browser, so
  `localhost` only resolves to a WireMock instance running on the same
  machine as your browser.
- CORS is not the issue you'd expect from a typical cross-origin API: see
  [Architecture → WireMock Integration](/architecture/wiremock-integration)
  for why WireMock's Admin API generally doesn't need CORS configuration
  for this to work.
- Credentials (if any) are correct.

## Switch the active server

Use the server switcher in the header (top right) to change which server
every page targets. Switching servers does not navigate you anywhere — the
page you're on refetches its data for the newly active server.

## Next step

[Quick Start](/guide/quick-start) — create your first mapping.
