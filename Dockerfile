# build the static bundle
FROM node:24-alpine AS build

WORKDIR /app

COPY web/package.json web/package-lock.json ./web/
RUN cd web && npm ci --no-audit --no-fund

# the word lists live at the repo root and are imported into the build
COPY data ./data
COPY web ./web

RUN cd web && npm run build

# serve it as an unprivileged user; 8501 is above 1024, so no capabilities are needed
FROM nginxinc/nginx-unprivileged:stable-alpine

COPY --from=build /app/web/dist /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/conf.d/default.conf

# The base image already runs as nginx; state it so a future base swap cannot regress it.
USER nginx

EXPOSE 8501

HEALTHCHECK --interval=60s --timeout=5s --start-period=5s --retries=2 \
  CMD wget -q --spider http://127.0.0.1:8501/ || exit 1

LABEL maintainer="Dan Corley <hello@dancorley.com>" \
      version="2.0.0" \
      description="Wordle Solver Application"
