# Configuration

MockOps has **no build-time or deploy-time application configuration** —
the same static build works in every environment (see
[Environment Variables](/reference/environment-variables)). "Configuration"
in MockOps means one of these distinct things:

## In-app: WireMock server configuration

Set from the running app itself (**Servers**, `/servers`), stored in your
browser — see [Servers](/features/servers) and
[State Management](/architecture/state-management).

| Field                   | Type                                                                    | Notes                                   |
| ----------------------- | ----------------------------------------------------------------------- | --------------------------------------- |
| `name`                  | string, 1–64 chars                                                      |                                         |
| `baseUrl`               | URL                                                                     | must be a valid URL; validated with Zod |
| `environment`           | `development` \| `qa` \| `sit` \| `uat` \| `production-like` \| `local` | organizational tag only                 |
| `authType`              | `none` \| `basic` \| `bearer`                                           |                                         |
| `username` / `password` | string                                                                  | required when `authType: basic`         |
| `token`                 | string                                                                  | required when `authType: bearer`        |

## In-app: global WireMock response settings

Set from **Settings** (`/settings`), applied server-side via WireMock's
own settings API — see [Settings](/features/settings).

| Setting            | Type                                                       | Notes                                        |
| ------------------ | ---------------------------------------------------------- | -------------------------------------------- |
| Fixed delay (ms)   | number                                                     | added to every response on the active server |
| Proxy pass-through | boolean                                                    | forward unmatched requests upstream          |
| Delay distribution | none / uniform (lower, upper) / log-normal (median, sigma) | alternative to a fixed delay                 |

## In-app: console preferences

Set from **Settings**, local to your browser only — theme (light/dark/
system). See [State Management](/architecture/state-management).

## Build-time configuration

| File                                                         | Configures                                                                                                                  |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `vite.config.ts`                                             | The `@` → `src` import alias, TanStack Router codegen, Tailwind, manual chunking (isolates React into its own vendor chunk) |
| `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` | TypeScript project references — `tsconfig.app.json` covers `src/`, `tsconfig.node.json` covers `vite.config.ts`             |
| `eslint.config.js`                                           | Flat ESLint config — see [Developer Guide](/development/local-development)                                                  |
| `docs/.vitepress/config.ts`                                  | This documentation site's own build — see [GitHub Pages](/deployment/github-pages)                                          |

None of these affect the running application's behavior toward WireMock —
they only affect how the source is compiled/linted.

## Deployment configuration

| Surface              | Reference                            |
| -------------------- | ------------------------------------ |
| Docker image / Nginx | [Docker](/deployment/docker)         |
| Kubernetes manifests | [Kubernetes](/deployment/kubernetes) |
| Helm chart values    | [Helm](/deployment/helm)             |

## What's explicitly _not_ configurable

- MockOps cannot be pointed at a "default" WireMock server via any build/
  deploy-time mechanism — every server is added through the UI, per
  browser.
- There is no config file (`.env`, `mockops.config.json`, etc.) read by
  the application at runtime.
