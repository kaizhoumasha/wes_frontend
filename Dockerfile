# 多阶段构建 Dockerfile
# Stage 1: 构建阶段
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# 构建参数
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_APP_TITLE="P9 MCS"
ARG VITE_APP_DEV=false

# 避免 CI 中的无关交互式依赖下载拖慢构建
ENV CI=true \
    HUSKY=0 \
    ELECTRON_SKIP_BINARY_DOWNLOAD=1 \
    ELECTRON_SKIP_DOWNLOAD=1

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# 复制依赖清单和仓库级下载重试配置
COPY package.json pnpm-lock.yaml .npmrc ./

# 安装依赖；沿用仓库级有限重试与超时预算。
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# Consumer facts 由 producer 在构建前用唯一 exporter 生成；镜像只验收 exporter bytes 与 labels。
ARG WES_CONSUMER_OPENAPI_SHA256
ARG WES_REQUIRED_OPERATIONS_SHA256
ARG WES_REQUIRED_PERMISSIONS_SHA256
ARG WES_FRONTEND_DEPENDENCIES_SHA256
ARG WES_FRONTEND_RECIPE_SHA256
ARG WES_VCS_REVISION
ARG WES_SOURCE_TREE
RUN pnpm exec tsx -e 'import { validateReleaseConsumerArtifacts } from "./scripts/lib/release-consumer.ts"; validateReleaseConsumerArtifacts("artifacts/release-consumer", { consumer_openapi_sha256: process.env.WES_CONSUMER_OPENAPI_SHA256!, dependencies_sha256: process.env.WES_FRONTEND_DEPENDENCIES_SHA256!, kind: "wes.release.frontend-fingerprints.v1", recipe_sha256: process.env.WES_FRONTEND_RECIPE_SHA256!, required_operations_sha256: process.env.WES_REQUIRED_OPERATIONS_SHA256!, required_permissions_sha256: process.env.WES_REQUIRED_PERMISSIONS_SHA256! }, { revision: process.env.WES_VCS_REVISION, sourceTree: process.env.WES_SOURCE_TREE })'

# 注入构建期环境变量，生成可被 nginx 同域反代消费的静态产物
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_APP_TITLE=${VITE_APP_TITLE} \
    VITE_APP_DEV=${VITE_APP_DEV}

# 构建生产版本
RUN pnpm run build

# Stage 2: 生产阶段
FROM nginx:alpine AS production

ARG WES_VCS_REVISION
ARG WES_SOURCE_TREE
ARG WES_CONSUMER_OPENAPI_SHA256
ARG WES_REQUIRED_OPERATIONS_SHA256
ARG WES_REQUIRED_PERMISSIONS_SHA256
ARG WES_FRONTEND_DEPENDENCIES_SHA256
ARG WES_FRONTEND_RECIPE_SHA256
LABEL org.opencontainers.image.revision="${WES_VCS_REVISION}" \
      com.zontec.wes.source-manifest="${WES_SOURCE_TREE}" \
      org.wes.release.consumer-openapi.sha256="${WES_CONSUMER_OPENAPI_SHA256}" \
      org.wes.release.required-operations.sha256="${WES_REQUIRED_OPERATIONS_SHA256}" \
      org.wes.release.required-permissions.sha256="${WES_REQUIRED_PERMISSIONS_SHA256}" \
      org.wes.release.frontend-dependencies.sha256="${WES_FRONTEND_DEPENDENCIES_SHA256}" \
      org.wes.release.frontend-recipe.sha256="${WES_FRONTEND_RECIPE_SHA256}"

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/artifacts/release-consumer/consumer-openapi.json /opt/wes/release/consumer-openapi.json
COPY --from=builder /app/artifacts/release-consumer/required-operations.json /opt/wes/release/required-operations.json
COPY --from=builder /app/artifacts/release-consumer/required-permissions.json /opt/wes/release/required-permissions.json

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 5173

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
