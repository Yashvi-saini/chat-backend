# Multi-stage production Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy source code
COPY . .

# Set placeholder DATABASE_URL required by Prisma CLI during build stage
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

# Build TypeScript dist
RUN npm run build

# Production image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules and built dist from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Automatically run prisma db push to ensure database tables are created on startup, then launch server
CMD ["sh", "-c", "npx prisma db push && node dist/server.js"]
