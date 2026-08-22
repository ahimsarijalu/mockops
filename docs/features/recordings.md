# Recordings

## Purpose

Capture real HTTP traffic (proxied through WireMock) as new stub mappings,
instead of authoring them by hand.

## Prerequisites

An active server. Recording requires WireMock's proxy recorder, which
sends real requests to a **target base URL** you specify — that target
must be reachable from the WireMock server (not from your browser).

## How to access it

Sidebar → **Recordings**, route `/recordings`.

## Typical workflow

1. Open **Recordings**. The current status badge shows `NeverStarted`,
   `Recording`, or `Stopped`, polled every 5 seconds.
2. Fill in the recording configuration:
   - **Target base URL** — where WireMock proxies real requests to.
   - **URL path pattern filter** — optionally restrict which paths are
     recorded (a regex).
   - **Method filter** — optionally restrict to one HTTP method.
   - **Persist captured mappings** — whether WireMock writes them to disk
     immediately.
   - **Repeated requests as scenarios** — whether WireMock turns repeated
     identical requests into a scenario state sequence instead of
     duplicate stubs.
3. Click **Start recording**, then exercise the target through WireMock
   (point your client at the WireMock server, not directly at the target).
4. Click **Stop recording** to end the session and capture whatever
   traffic occurred into new mappings — the captured list appears below,
   each linking to its new mapping in the editor.

## Snapshot

**Take snapshot** captures mappings from traffic WireMock has already
proxied (using the same filters), without needing an explicit start/stop
cycle — useful for a one-off capture.

## Available operations

- Start recording (with target/filters/persist/scenario options).
- Stop recording (captures mappings from the session).
- Snapshot (captures from already-proxied traffic).

## Important behavior

- Configuration fields are disabled while a recording is in progress —
  stop the current recording to change target/filters.
- Newly captured mappings automatically show up in
  [Mappings](/features/mappings) (the mappings cache is invalidated on
  stop/snapshot).
- MockOps does not proxy or record anything itself — this entire feature
  is WireMock's own recorder, driven through the Admin API.

## Common problems

- **No mappings captured** — confirm the target base URL is reachable
  _from the WireMock server_, and that your test traffic actually went
  through WireMock (not directly to the target).
- **Recording captures nothing matching your filter** — double-check the
  URL path pattern is a valid regex matching the paths you exercised.

## Related

[Mappings](/features/mappings) — where captured stubs land.
