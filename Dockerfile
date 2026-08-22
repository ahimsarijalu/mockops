# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run generate-routes && npm run build

# nginx-unprivileged is a drop-in nginx image that already listens on
# unprivileged ports and runs as a non-root user (uid/gid 101) — used here
# so the container never runs as root.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

USER root
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html
COPY --chown=101:101 deploy/nginx/nginx.conf /etc/nginx/conf.d/default.conf
USER 101

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
