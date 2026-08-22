# Environment Variables

## The MockOps application itself

**None.** A repository-wide search finds no `import.meta.env` or
`process.env` usage anywhere under `src/`, `vite.config.ts`,
`vitest.config.ts`, or the Dockerfile. MockOps needs no environment
variables to build, run, or deploy — every piece of configuration it
needs (which WireMock servers to talk to, credentials, console
preferences) is entered in the running app and stored in the browser (see
[Configuration](/reference/configuration)).

This is a direct consequence of the architecture: MockOps has no backend
process to configure at startup (see
[System Architecture](/architecture/overview)) — there's no server-side
`process.env` to read from in the first place.

| Variable | Required | Default | Purpose |
| -------- | -------- | ------- | ------- |
| _(none)_ | —        | —       | —       |

## Tooling that does read `CI`

The only environment variable referenced anywhere in the repository is the
conventional `CI` variable, automatically set by GitHub Actions, used by
`playwright.config.ts` to adjust test behavior — not something you need to
set yourself:

| Variable | Required            | Default       | Purpose                                                                                                                                                                      |
| -------- | ------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CI`     | No (auto-set in CI) | unset locally | `playwright.config.ts`: enables `forbidOnly` (fails the build if a test is left with `.only`), sets 1 retry instead of 0, and disables reusing an already-running dev server |

## Docker / Kubernetes / Helm

No environment variables are passed into the container by
`Dockerfile`, `docker-compose.yml`, `k8s/deployment.yaml`, or
`helm/mockops/templates/deployment.yaml` — there are none to pass. See
[Docker](/deployment/docker) for the full picture.

## The documentation site

`docs/.vitepress/config.ts` and `docs/.vitepress/generate-llms-full.mjs`
read no environment variables either; `.github/workflows/docs.yml` needs
none beyond the ambient GitHub Actions context (`GITHUB_TOKEN`, provided
automatically by `actions/deploy-pages`/`actions/configure-pages`, not
something set explicitly in the workflow).
