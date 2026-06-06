# ─────────────────────────────────────────────
# Stage 1: Build the React/Vite frontend
# ─────────────────────────────────────────────
FROM node:20-slim AS builder

# Enable pnpm via corepack (matches packageManager field in package.json)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

# ─────────────────────────────────────────────
# Stage 2: Production — proxy server + static
# ─────────────────────────────────────────────
FROM node:20-slim AS runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production

RUN corepack enable

WORKDIR /app

# Install only production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy the Express proxy server
COPY server.js ./

# Expose the port the Express server listens on
EXPOSE 3001

# Run the proxy + static file server
CMD ["node", "server.js"]
