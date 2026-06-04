# ── Estágio 1: build ──────────────────────────────────────────────────────────
FROM node:22-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_SOCKET_URL é embutida no bundle em build time
ARG NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL

RUN npm run build

# ── Estágio 2: runtime ─────────────────────────────────────────────────────────
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN mkdir -p ./public
COPY --from=builder /app/.next         ./.next
COPY --from=builder /app/node_modules  ./node_modules
COPY --from=builder /app/package.json  ./package.json

EXPOSE 3001
CMD ["npm", "start"]
