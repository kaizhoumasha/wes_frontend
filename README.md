# P9 WES 前端项目

> **项目名称**: P9 WES 前端项目 (休斯顿智能仓储执行系统前端)
> **仓库地址**: https://github.com/kaizhoumasha/wes_frontend
> **后端项目**: https://github.com/kaizhoumasha/wes_backend

## 技术栈

- **框架**: Vue 3.5+ (Composition API + `<script setup>`)
- **语言**: TypeScript 5.8+
- **构建工具**: Vite 8+ (Rolldown 引擎)
- **状态管理**: Pinia 2.3+
- **路由**: Vue Router 4.5+
- **UI 组件**: Element Plus 2.9+、Tailwind CSS 4.x
- **HTTP 客户端**: alova 3.2+
- **包管理器**: pnpm 9+

## 快速开始

### 环境要求

- Node.js 20.19+ / 22.12+ (推荐 22 LTS)
- pnpm 9+

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
├── api/           # API 请求模块
├── assets/        # 静态资源
├── components/    # 组件
├── composables/   # 组合式函数
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

- [技术选型文档](./docs/WES_FRONTEND_TECH_STACK.md)
- [时区处理指南](./docs/TIMEZONE_HANDLING.md)
- [第一阶段任务清单](./docs/TASKS_PHASE_1.md)

## CI/CD

- GitHub Actions: `.github/workflows/ci-cd.yml`
- Docker: `Dockerfile`, `docker-compose.yml`

## 开发命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm preview` | 预览构建结果 |
| `pnpm lint` | 代码检查 |
| `pnpm type:check` | 类型检查 |

## 后端 API

- **本地开发**: http://localhost:8001/api/v1
- **API 文档**: http://localhost:8001/docs

## License

MIT
