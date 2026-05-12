# 多阶段构建 Dockerfile
# Stage 1: 构建阶段
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# 构建参数
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_SSE_URL=/api/v1/sys/events/stream
ARG VITE_APP_TITLE="P9 MCS"
ARG VITE_APP_DEV=false

# 避免 CI 中的无关交互式依赖下载拖慢构建
ENV CI=true \
    HUSKY=0 \
    ELECTRON_SKIP_BINARY_DOWNLOAD=1 \
    ELECTRON_SKIP_DOWNLOAD=1

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 注入构建期环境变量，生成可被 nginx 同域反代消费的静态产物
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_SSE_URL=${VITE_SSE_URL} \
    VITE_APP_TITLE=${VITE_APP_TITLE} \
    VITE_APP_DEV=${VITE_APP_DEV}

# 先生成菜单清单，再构建生产版本
RUN pnpm run generate:menu && pnpm run build

# Stage 2: 生产阶段
FROM nginx:alpine AS production

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/artifacts/menu-manifest.json /opt/wes/menu-manifest.json

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 5173

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
