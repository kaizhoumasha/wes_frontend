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

```bash
pnpm dev
```

访问: http://localhost:5173

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
pnpm generate:permissions -- --backend-root /path/to/wes_backend
pnpm permission:verify -- --backend-root /path/to/wes_backend
pnpm contract:verify
pnpm contract:test
```

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
├── api/           # API 请求层（base / modules / services / generated）
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

## CI/CD

- GitHub Actions: `.github/workflows/ci-cd.yml`
- Docker: `Dockerfile`, `docker-compose.yml`

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
