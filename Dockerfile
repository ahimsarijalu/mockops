# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run generate-routes && npm run build

FROM nginx:1.27-alpine AS runtime

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
COPY deploy/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Allow nginx to run as its own non-root user (uid/gid 101) with a
# read-only root filesystem, e.g. under Kubernetes securityContext
# runAsNonRoot/runAsUser/readOnlyRootFilesystem.
RUN mkdir -p /var/cache/nginx /var/run \
  && chown -R nginx:nginx /var/cache/nginx /var/run /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
