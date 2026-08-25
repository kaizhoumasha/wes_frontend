# P9 MCS 前端项目

> **项目名称**: P9 MCS 前端项目 (休斯顿智能物料控制系统前端)
> **仓库地址**: https://github.com/kaizhoumasha/wes_frontend
> **后端项目**: https://github.com/kaizhoumasha/wes_backend

## 技术栈

- **框架**: Vue 3.5+ (Composition API + `<script setup>`)
- **语言**: TypeScript 5.9+
- **构建工具**: Vite 7.3+
- **状态管理**: Pinia 3.0+
- **路由**: Vue Router 5.0+
- **UI 组件**: Element Plus 2.13+、Tailwind CSS 4.2+
- **HTTP 客户端**: alova 3.5+
- **包管理器**: pnpm 10+

## 快速开始

### 环境要求

- Node.js 20.19+ / 22.12+ (推荐 22 LTS)
- pnpm 10+

### 安装依赖

```bash
pnpm install
```

### 开发模式

仅调试前端页面且不依赖真实后端行为时：

```bash
pnpm dev
```

访问: http://localhost:5173

需要前后端、PostgreSQL/Redis、Celery、WMS/ECS Mock 共同运行时，显式指定两个 checkout，再使用后端唯一联调入口。这样从主仓库或任意标准 worktree 执行都不会依赖目录相邻关系：

```bash
export WES_BACKEND_ROOT=/absolute/path/to/wes_backend
export WES_FRONTEND_ROOT="$(git rev-parse --show-toplevel)"
cd "$WES_BACKEND_ROOT"
./scripts/dev-env.sh up
./scripts/dev-env.sh check
./scripts/dev-env.sh logs frontend api
```

联调容器绑定当前前端源码并启用 Vite HMR；使用 `./scripts/dev-env.sh down` 停止后会保留持久化数据和前端依赖缓存。完整规范位于后端仓库 `docs/devops/local-development-environment.md`。

### 构建生产版本

```bash
pnpm build
```

### 代码检查

```bash
pnpm lint
pnpm type:check
```

### 契约与代码生成

```bash
pnpm contract:freeze -- --backend-root /path/to/wes_backend
pnpm generate:types
pnpm generate:zod
pnpm generate:permissions
pnpm permission:verify
pnpm contract:verify
pnpm contract:test
pnpm export:release-consumer
```

`contract:freeze` 是唯一需要后端 checkout 的显式冻结步骤，会原子更新 OpenAPI 与权限 canonical 快照。后续生成、验证和 consumer artifact 导出均只读取前端仓库已提交快照，可离线执行。

## Git Worktree 开发

### 创建新的 worktree

```bash
./scripts/git-worktree.sh add feature-your-feature
```

### 列出所有 worktree

```bash
./scripts/git-worktree.sh list
```

### 删除 worktree

```bash
./scripts/git-worktree.sh remove feature-your-feature
```

## 项目结构

```
src/
├── api/           # API 请求层（base / modules / services / streaming / generated）
├── assets/        # 静态资源
├── components/    # 通用组件、UI 组件、Smart Search 组件
├── composables/   # 组合式函数（CRUD / 布局 / 搜索等复用逻辑）
├── config/        # 环境变量与 API 配置
├── layouts/       # 布局组件
├── router/        # 路由配置
├── stores/        # Pinia 状态管理
├── types/         # TypeScript 类型
├── utils/         # 工具函数
└── views/         # 页面视图
```

## 环境变量

- `.env.development`: 开发环境配置
- `.env.production`: 生产环境配置

## 相关文档

- [设计系统](./DESIGN.md)
- [更新日志](./CHANGELOG.md)
- [TODO 清单](./TODOS.md)
- [技术选型文档](./docs/WES_FRONTEND_TECH_STACK.md)
- [CRUD 开发指南](./docs/CRUD_DEVELOPMENT_GUIDE.md)
- [智能搜索组件架构](./docs/SMART_SEARCH_COMPONENT_ARCHITECTURE.md)
- [时区处理指南](./docs/TIMEZONE_HANDLING.md)
- [契约同步工作流](./docs/CONTRACT_SYNC_WORKFLOW.md)
- [契约测试指南](./docs/CONTRACT_TESTING.md)

## CI/CD

- GitHub Actions: `.github/workflows/ci-cd.yml`
- Jenkins 独立 producer: `Jenkinsfile` 只构建并发布不可变前端镜像，不接收后端候选，也不自动部署
- Docker: `Dockerfile`, `docker-compose.yml`

producer 成功只表示 `PUBLISHED — NOT DEPLOYED`。TEST/生产部署由独立发布作业按镜像 digest 选择候选，并在维护态前执行方向性兼容检查。

## 开发命令

| 命令                 | 说明           |
| -------------------- | -------------- |
| `pnpm dev`           | 启动开发服务器 |
| `pnpm build`         | 构建生产版本   |
| `pnpm preview`       | 预览构建结果   |
| `pnpm lint`          | 代码检查       |
| `pnpm type:check`    | 类型检查       |
| `pnpm test`          | 单元测试       |
| `pnpm contract:test` | 契约测试       |

## 后端 API

- **本地开发**: http://localhost:8001
- **Swagger 文档**: http://localhost:8001/api/docs
- **OpenAPI 文档**: http://localhost:8001/api/openapi.json

## License

MIT
