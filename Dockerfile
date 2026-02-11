# Stage 1: Build the frontend
FROM node:20-slim AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .
RUN pnpm build

# Stage 2: Run the proxy server and serve frontend
FROM node:20-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

COPY --from=builder /app/dist ./dist
COPY server.js ./

# Update server.js to serve static files in production
RUN sed -i "s|app.use(cors());|app.use(cors());
app.use(express.static('dist'));|" server.js
# Ensure it handles SPA routing by serving index.html for unknown routes
RUN echo "
app.get('*', (req, res) => res.sendFile(path.resolve('dist', 'index.html')));" >> server.js
# Need path import for the above
RUN sed -i "1i import path from 'path';" server.js

EXPOSE 3001
CMD ["node", "server.js"]
