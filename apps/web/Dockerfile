FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# ============================================
# DEPENDENCIES
# ============================================
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# ============================================
# BUILDER
# ============================================
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN pnpm db:generate

# Build the application
RUN pnpm build

# ============================================
# RUNNER
# ============================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
