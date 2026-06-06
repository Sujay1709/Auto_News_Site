# syntax=docker/dockerfile:1

# AutoHub is a static Vite/React SPA. This image builds the bundle and serves it
# with nginx — there is no Python/Flask backend.

# ── Build stage: compile the SPA to static assets in /app/dist ──
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Serve stage: nginx serves dist/ on the port Cloud Run injects ($PORT) ──
FROM nginx:1.27-alpine
# nginx:alpine runs envsubst on /etc/nginx/templates/*.template at startup,
# expanding ${PORT} (injected by Cloud Run; defaults to 8080 locally).
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
ENV PORT=8080
CMD ["nginx", "-g", "daemon off;"]
