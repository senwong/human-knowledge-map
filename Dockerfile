FROM node:22-bookworm-slim AS base

RUN printf '%s\n' \
  'deb https://mirrors.ustc.edu.cn/debian bookworm main contrib non-free non-free-firmware' \
  'deb https://mirrors.ustc.edu.cn/debian bookworm-updates main contrib non-free non-free-firmware' \
  'deb https://mirrors.ustc.edu.cn/debian-security bookworm-security main contrib non-free non-free-firmware' \
  > /etc/apt/sources.list && \
  rm -f /etc/apt/sources.list.d/debian.sources && \
  apt-get update && \
  apt-get install -y --no-install-recommends ca-certificates wget && \
  rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs --create-home nextjs

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
