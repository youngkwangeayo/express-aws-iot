# ========================
# Stage 1: deps
# ========================
FROM node:22-slim AS deps

WORKDIR /agent

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# ========================
# Stage 2: runtime
# ========================
FROM node:22-slim AS runtime

WORKDIR /agent

RUN apk add --no-cache dumb-init curl ca-certificates openssl

# 로그 디렉토리 생성 (root 시점)
RUN mkdir -p /agent/logs/agent

# dependencies
COPY --from=deps /agent/node_modules ./node_modules

# app source
COPY src ./src
COPY package.json package-lock.json ./

# 권한 정리 (node 실행 대비)
RUN chown -R node:node /agent
USER node

# 애플리케이션 시작
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
