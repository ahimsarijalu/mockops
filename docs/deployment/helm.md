# Helm

A Helm chart at `helm/mockops/` provides a configurable install of the
same resources described in [Kubernetes](/deployment/kubernetes).

## Chart structure

```text
helm/mockops/
├── Chart.yaml          # apiVersion v2, name "mockops", version 0.1.0
├── values.yaml          # default configuration
└── templates/
    ├── _helpers.tpl      # mockops.labels / mockops.selectorLabels
    ├── deployment.yaml
    ├── service.yaml
    └── ingress.yaml
```

There is no `ConfigMap`/`Secret` template, and no `NOTES.txt` — same
reasoning as the plain manifests: MockOps needs no runtime configuration
to inject (see [Docker](/deployment/docker)).

## Values reference

Every value below is read directly from `helm/mockops/values.yaml`.

| Key                                         | Default                                                                   | Purpose                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `replicaCount`                              | `2`                                                                       | Deployment replica count                                        |
| `image.repository`                          | `ghcr.io/ahimsarijalu/mockops`                                            | Image repo                                                      |
| `image.tag`                                 | `latest`                                                                  | Image tag — see [Docker](/deployment/docker) for available tags |
| `image.pullPolicy`                          | `IfNotPresent`                                                            |                                                                 |
| `service.type`                              | `ClusterIP`                                                               |                                                                 |
| `service.port`                              | `80`                                                                      | Service port (routes to container port 8080)                    |
| `ingress.enabled`                           | `false`                                                                   | Ingress is opt-in                                               |
| `ingress.className`                         | `nginx`                                                                   |                                                                 |
| `ingress.annotations`                       | `{}`                                                                      |                                                                 |
| `ingress.hosts`                             | `[{ host: mockops.example.com, paths: [{ path: /, pathType: Prefix }] }]` |                                                                 |
| `ingress.tls`                               | `[]`                                                                      | Empty by default — must be supplied to enable HTTPS             |
| `resources.requests`                        | `cpu: 50m, memory: 64Mi`                                                  |                                                                 |
| `resources.limits`                          | `cpu: 250m, memory: 256Mi`                                                |                                                                 |
| `podSecurityContext.runAsNonRoot`           | `true`                                                                    |                                                                 |
| `podSecurityContext.runAsUser`              | `101`                                                                     | Matches nginx's non-root user in `nginx:1.27-alpine`            |
| `securityContext.allowPrivilegeEscalation`  | `false`                                                                   |                                                                 |
| `securityContext.readOnlyRootFilesystem`    | `true`                                                                    |                                                                 |
| `securityContext.capabilities.drop`         | `['ALL']`                                                                 |                                                                 |
| `nodeSelector` / `tolerations` / `affinity` | `{}` / `[]` / `{}`                                                        | Passed through to the pod spec as-is                            |

The Deployment template mounts the same three `emptyDir` volumes as the
plain manifest (`/var/cache/nginx`, `/var/run`, `/tmp`) to accommodate the
read-only root filesystem, and both probes hit `GET /healthz` — identical
behavior to [Kubernetes](/deployment/kubernetes), just templated.

## Install

```bash
helm install mockops ./helm/mockops \
  --set image.repository=ghcr.io/ahimsarijalu/mockops \
  --set image.tag=latest
```

To enable the Ingress with your own host and TLS secret:

```bash
helm install mockops ./helm/mockops \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=mockops.yourcompany.com \
  --set ingress.tls[0].hosts[0]=mockops.yourcompany.com \
  --set ingress.tls[0].secretName=mockops-tls
```

(the TLS secret itself must exist in the target namespace already, e.g.
via cert-manager — the chart does not create it).

## Upgrade

```bash
helm upgrade mockops ./helm/mockops --set image.tag=1.2.3
```

## Uninstall

```bash
helm uninstall mockops
```

This removes the Deployment, Service, and (if enabled) Ingress created by
the chart. It does not affect any WireMock servers MockOps was configured
to talk to — those are entirely separate systems (see
[System Architecture](/architecture/overview)).
