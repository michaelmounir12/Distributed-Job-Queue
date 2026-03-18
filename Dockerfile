# Stage 1: Build the application
FROM node:18-alpine AS builder

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy dependency manifests
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (including dev)
RUN pnpm install

# Copy application code
COPY . .

# Build NestJS bundle
RUN pnpm run build

# Stage 2: Production Execution Environment
FROM node:18-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy production manifests
COPY package.json pnpm-lock.yaml* ./

# Only install prod dependencies to keep image small
RUN pnpm install --prod --ignore-scripts

# Pull compiled application from builder
COPY --from=builder /app/dist ./dist

# Expose HTTP port
EXPOSE 3000

# Execute API Bootstrap
CMD ["node", "dist/main.js"]
