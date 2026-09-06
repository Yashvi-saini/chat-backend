# Multi-stage production Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Set placeholder DATABASE_URL required by Prisma CLI during build stage
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

# Copy package manifests and prisma configuration
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install dependencies without running postinstall prematurely
RUN npm ci --ignore-scripts

# Copy remaining source code
COPY . .

# Generate Prisma Client and build TypeScript dist
RUN npx prisma generate && npm run build

# Production image
FROM node:22-alpine AS runner

WORKDIR /app

# Install OpenSSL for Prisma engine on Alpine Linux
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules and built dist from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

EXPOSE 3000

# Automatically run prisma db push to ensure database tables are created on startup, then launch server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/server.js"]
