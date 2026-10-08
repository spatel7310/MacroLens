# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS manifests
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json

# Build on the target platform, including any platform-specific dependencies.
FROM manifests AS build
RUN npm ci --no-audit --no-fund
COPY client/ ./client/
COPY server/ ./server/
RUN npm run build

# Install only the API's production dependencies from the same lockfile.
FROM manifests AS production-dependencies
RUN npm ci --workspace=server --omit=dev --ignore-scripts --no-audit --no-fund

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3001
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=production-dependencies /app/server/ ./server/
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/client/dist ./client/dist
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || '3001') + '/api/health', {signal: AbortSignal.timeout(4000)}).then(r => {if (!r.ok) process.exit(1)}).catch(() => process.exit(1))"
CMD ["node", "server/dist/index.js"]
