# Security

A lightweight architecture review of MockOps' security posture, based on
the actual implementation. Every claim below is either **Implemented**,
**Not implemented**, a **Potential risk**, or **Unknown** — nothing here
asserts a vulnerability without pointing at the code that supports it.

## The core constraint

MockOps is a static SPA with no backend of its own (see
[System Architecture](/architecture/overview)) — it talks directly to
whatever WireMock Admin API base URL you configure, from the browser. This
single fact drives most of the analysis below, and is stated directly in
`README.md`'s own "Authentication & RBAC" section, which this page
verifies against the code.

## Authentication & authorization

- **Implemented**: per-server auth modes — `none`, `basic` (username/
  password), `bearer` (token) — configured on each `ServerConfig`
  (`src/features/servers/types/server.ts`) and applied to every request by
  `createHttpClient` (`src/shared/api/http.ts`).
- **Not implemented**: MockOps has no login, session, or user-identity
  concept of its own. There is nothing to authenticate _into MockOps_ —
  only credentials MockOps forwards to WireMock.
- **Not implemented**: role-based access control. Nothing in the codebase
  gates a UI action by "role" — any client-side check would only be a UI
  convenience (hiding a button), never a security boundary, because a user
  with the same browser access to MockOps can always call the WireMock
  Admin API directly with the same credentials MockOps holds.
- **Implication**: real access control has to live in front of WireMock
  itself — WireMock's own basic-auth/token configuration, a reverse proxy
  doing auth in front of `/__admin`, or an identity-aware proxy. MockOps'
  auth fields are how you hand it credentials for _that_ boundary, not a
  boundary themselves.

## Credential storage

- **Implemented**: per-server credentials (`username`/`password`/`token`)
  are stored in the `ServerConfig` array persisted by
  `useServerStore` (`src/features/servers/store/server-store.ts`) to
  `localStorage` under the key `mockops-servers`, **in plain text** — Zustand's
  `persist` middleware does no encryption by default, and none is
  configured here.
- **Potential risk**: anything with script execution in the MockOps origin
  (a browser extension, a compromised dependency, or an XSS bug — see
  below) can read every configured server's credentials directly out of
  `localStorage`. Treat them the same as any other browser-stored secret:
  prefer scoped or short-lived credentials over long-lived admin tokens
  where WireMock's auth layer supports it.
- **Not implemented**: no credential masking at rest, no "forget
  credentials after N minutes" option, no OS-level keychain integration.

## Browser storage in general

- **Implemented**: three `localStorage` keys —
  `mockops-servers` (server configs + credentials),
  `mockops-ui` (theme/sidebar/command-palette prefs, no secrets),
  `mockops-audit` (local action log, target names/IDs, no credentials) —
  see [State Management](/architecture/state-management).
- **Not implemented**: no `sessionStorage`, cookies, or IndexedDB usage
  found in the source tree.

## Network / transport

- **Implemented**: MockOps will talk to WireMock over whatever scheme the
  configured base URL uses (`http://` or `https://`) — it does not enforce
  HTTPS.
- **Unknown**: whether a given deployment's WireMock servers are reachable
  over plaintext HTTP on a shared network is an operational decision
  outside MockOps' control; if so, credentials configured with `basic`/
  `bearer` auth would be sent in the clear on each request.

## CORS

- **Implemented (by necessity)**: because requests go directly from the
  browser to WireMock's origin, the browser enforces CORS for those
  requests. WireMock's Admin API generally works without explicit CORS
  configuration in typical same-machine/dev setups; a WireMock instance
  behind a stricter reverse proxy may need CORS headers configured for the
  origin MockOps is served from. This is WireMock/infrastructure
  configuration, not something MockOps' own code controls.

## XSS

- **Not implemented / no evidence found**: the source tree contains no use
  of `dangerouslySetInnerHTML`, `eval`, or `document.write`. User-controlled
  content (mapping names, response bodies, file contents, request/response
  detail) is rendered through normal React text interpolation or the
  Monaco editor component, both of which escape content rather than
  injecting raw HTML.
- **Potential risk**: response bodies with `response-template` enabled
  execute WireMock's own Handlebars-style templating **server-side**, not
  in the browser — this is a WireMock behavior, not a MockOps XSS surface,
  but a captured/rendered response body is still attacker-influenced
  content if you're mocking an untrusted upstream during recording.

## CSRF

- **Not applicable in the traditional sense**: MockOps authenticates to
  WireMock with headers/Basic auth attached per-request by Axios, not
  ambient browser-sent cookies, so classic CSRF (a third-party site
  silently riding an authenticated session) doesn't apply the way it would
  to a cookie-authenticated app. A malicious page could still attempt
  cross-origin requests against a WireMock instance if that instance uses
  cookie-based auth of its own and permissive CORS — that risk lives in
  WireMock's configuration, not MockOps'.

## SSRF

- **Not applicable**: there is no MockOps-side server that fetches
  URLs on a user's behalf. The "proxy base URL" and recording "target base
  URL" features direct **WireMock itself** to proxy traffic — that's
  WireMock's proxying behavior, operating with whatever network access the
  WireMock server has, not MockOps'.

## Docker / Kubernetes security

Covered in detail in [Docker](/deployment/docker) and
[Kubernetes](/deployment/kubernetes); summarized here:

- **Implemented**: Nginx security response headers
  (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive
  `Permissions-Policy`) — `deploy/nginx/nginx.conf`.
- **Implemented**: the Kubernetes Deployment and Helm chart run the
  container as a non-root user (`runAsUser: 101`), with
  `allowPrivilegeEscalation: false`, `readOnlyRootFilesystem: true`, and
  all Linux capabilities dropped (`k8s/deployment.yaml`,
  `helm/mockops/values.yaml`).
- **Not implemented**: no Content-Security-Policy header is set by Nginx
  or the app.
- **Unknown**: TLS termination is not configured in `k8s/ingress.yaml`
  beyond an `nginx.ingress.kubernetes.io/ssl-redirect: 'true'` annotation
  and a `tls` block referencing a secret name (`mockops-tls`) that must be
  provisioned separately — the manifest assumes a cert-management setup
  that isn't part of this repository.

## Secrets in this repository

- **Implemented**: no secrets are committed to the repository. The
  `docker-compose.yml` reference WireMock instance is unauthenticated by
  default (local development only).
- **Not implemented**: no `.env` file or environment-variable-based
  secret injection exists for the MockOps app itself, because server
  credentials are entered and stored client-side, not supplied at build/
  deploy time — see
  [Reference → Environment Variables](/reference/environment-variables).

## Summary

| Area                             | Status                                                         |
| -------------------------------- | -------------------------------------------------------------- |
| MockOps-side authentication      | Not implemented (no login/session)                             |
| Per-server credential forwarding | Implemented (`none`/`basic`/`bearer`)                          |
| Real authorization boundary      | Must live in front of WireMock — not implemented by MockOps    |
| Credential storage               | Implemented, plain-text `localStorage` — potential risk        |
| XSS surface                      | No evidence found in current source                            |
| CSRF                             | Not applicable to MockOps' own auth model                      |
| SSRF                             | Not applicable — MockOps has no server-side fetch              |
| Transport encryption             | Depends on the configured server URL — not enforced            |
| Container/K8s hardening          | Implemented (non-root, read-only rootfs, dropped capabilities) |
| Content-Security-Policy          | Not implemented                                                |
| TLS provisioning for Ingress     | Unknown — assumed external to this repo                        |
