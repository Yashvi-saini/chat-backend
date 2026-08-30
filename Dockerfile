# Multi-stage production Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy source code and build TypeScript dist
COPY . .
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

CMD ["node", "dist/server.js"]
