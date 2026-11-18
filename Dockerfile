FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* bun.lock* ./
RUN npm install

# Copy application source
COPY . .

# Build Vite + PWA static assets
RUN npm run build

# Persistent volume directory
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data
RUN mkdir -p /app/data

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.ts"]
