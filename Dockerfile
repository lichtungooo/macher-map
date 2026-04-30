# Multi-Repo-Build: macher-map nutzt Sources aus real-life-stack + web-of-trust
# als Sibling-Verzeichnisse (siehe vite.config.ts Aliase).
# Build-Context muss auf das Parent-Verzeichnis zeigen, das alle drei Repos enthaelt.
# Siehe .github/workflows/deploy.yml fuer Multi-Checkout.

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache git python3 make g++

# Web-of-Trust zuerst — pnpm-Workspace mit eigenen Deps
COPY web-of-trust /app/web-of-trust
WORKDIR /app/web-of-trust
RUN pnpm install --frozen-lockfile --ignore-scripts || pnpm install --ignore-scripts

# Real-Life-Stack — pnpm-Workspace, referenziert WoT via overrides
COPY real-life-stack /app/real-life-stack
WORKDIR /app/real-life-stack
RUN pnpm install --frozen-lockfile --ignore-scripts || pnpm install --ignore-scripts

# Macher-Map — eigentliche App, nutzt beide via Vite-Aliase
WORKDIR /app/macher-map
COPY macher-map/package.json macher-map/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY macher-map/ ./
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/macher-map/dist /usr/share/nginx/html
COPY --from=build /app/macher-map/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
