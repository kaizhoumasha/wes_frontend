# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**P9 WES (休斯顿智能仓储执行系统)** 是一个独立部署的仓储执行控制中台，前端基于 Vue 3 + TypeScript + Vite 构建，对接 FastAPI 后端。

- **后端项目**: `../wes_backend`
- **本地 API**: http://localhost:8001/api/v1
- **API 文档**: http://localhost:8001/docs

---

## 常用命令

### 开发与构建

```bash
# 安装依赖
pnpm install

# 开发模式（启动 Vite dev server，端口 5173）
pnpm dev

# 生产构建
pnpm build

# 开发环境构建
pnpm build:dev

# 预览构建结果
pnpm preview
```

### 代码质量检查

```bash
# 完整检查（类型 + ESLint + Prettier + Stylelint）
pnpm lint

# 仅类型检查
pnpm type:check

# 仅 ESLint
pnpm lint:eslint

# 仅 Prettier
pnpm lint:prettier

# 仅 Stylelint
pnpm lint:stylelint
```

### Git Worktree 管理

```bash
# 创建新 worktree（并行开发）
./scripts/git-worktree.sh add feature-your-feature

# 列出所有 worktree
./scripts/git-worktree.sh list

# 删除 worktree
./scripts/git-worktree.sh remove feature-your-feature
```

---

## 技术栈关键约束

| 技术栈           | 版本要求        | 说明                                      |
| ---------------- | --------------- | ----------------------------------------- |
| **Node.js**      | 20.19+ / 22.12+ | Vite 要求                                 |
| **pnpm**         | 9+              | 推荐包管理器                              |
| **Vue**          | 3.5+            | 仅使用 Composition API + `<script setup>` |
| **TypeScript**   | 5.8+            | 严格模式开启                              |
| **Vite**         | 7.3+            | 当前版本，配置已优化                      |
| **Element Plus** | 2.13+           | 企业级 UI 组件库                          |
| **alova**        | 3.5+            | HTTP 客户端（非 axios）                   |
| **Tailwind CSS** | 4.2+            | 原子化 CSS                                |

---

## 架构设计原则

### 核心原则

**DRY (Don't Repeat Yourself)**

- 抽取可复用逻辑到 `composables/`
- 通用组件放 `components/common/` 或 `components/ui/`
- 工具函数统一放 `utils/`

**KISS (Keep It Simple, Stupid)**

- 组件职责单一，文件不超过 300 行
- 优先使用框架内置能力，避免过度抽象
- 避免不必要的复杂性

**SOLID**

- **单一职责**: 每个组件/composable 只做一件事
- **开闭原则**: 通过插槽和 props 扩展，而非修改
- **里氏替换**: 子组件可替换父组件使用
- **接口隔离**: props 接口精简，按需传递
- **依赖倒置**: 依赖抽象（类型定义），不依赖具体实现

**YAGNI (You Aren't Gonna Need It)**

- 只实现当前需求，不预 speculated 功能
- 避免为"未来可能"添加抽象层
- 优先考虑可读性和可维护性

---

## 目录结构与职责

```
src/
├── api/               # API 请求层（alova 实例 + 端点定义）
│   └── client.ts      # alova 实例配置，包含请求/响应拦截器
├── assets/            # 静态资源（图片、样式）
├── components/        # 组件
│   ├── common/        # 通用业务组件
│   └── ui/            # UI 基础组件（可复制 shadcn-vue 代码）
├── composables/       # 组合式函数（复用逻辑）
│   └── useEnv.ts      # 环境变量访问（响应式）
├── config/            # 配置文件
│   └── env.ts         # 环境变量单一数据源
├── constants/         # 常量定义（枚举、配置）
├── layouts/           # 布局组件
├── locales/           # 国际化
├── router/            # 路由配置
│   └── index.ts       # 路由实例 + 认证守卫
├── stores/            # Pinia 状态管理
├── types/             # TypeScript 类型定义
├── utils/             # 工具函数
└── views/             # 页面视图
```

---

## 关键架构模式

### 1. 数据流向

```
View → Composable → Store → API Client → Backend
                ↓
            Utils/Constants
```

- **View**: 仅负责 UI 渲染和用户交互
- **Composable**: 封装可复用的响应式逻辑
- **Store**: 全局状态管理（使用 pinia-plugin-persistedstate 持久化）
- **API Client**: 统一的 HTTP 请求处理

### 2. 认证与权限

- **JWT Token**: 存储在 `localStorage.access_token`
- **认证守卫**: `router.beforeEach` 检查 token
- **请求拦截**: `api/client.ts` 自动添加 `Authorization` 头
- **响应处理**: 统一处理后端响应码（1000 = 成功）

### 3. 环境变量访问

**❌ 错误做法**: 直接使用 `import.meta.env`

```ts
const url = import.meta.env.VITE_API_BASE_URL // 不再推荐
```

**✅ 正确做法**: 使用 `useEnv()` 或直接导入 `env`

```ts
// 在组件中
const { apiBaseUrl, isDev } = useEnv()

// 在非组件模块中
import { env } from '@/config/env'
const url = env.apiBaseUrl
```

### 4. API 模块组织

按业务模块组织 API，每个模块一个文件：

```
api/
├── client.ts        # 统一的 alova 实例
├── auth/            # 认证相关 API
├── admin/           # 管理员模块 API
├── workline/        # 作业线管理 API
├── device/          # 设备管理 API
└── callback/        # 回调管理 API
```

---

## 代码规范

### 命名约定

| 类型       | 约定                   | 示例            |
| ---------- | ---------------------- | --------------- |
| 组件文件   | PascalCase             | `UserList.vue`  |
| 组合式函数 | camelCase + `use` 前缀 | `useAuth.ts`    |
| 工具函数   | camelCase              | `formatDate.ts` |
| 类型定义   | PascalCase             | `UserDTO.ts`    |
| 常量       | UPPER_SNAKE_CASE       | `API_BASE_URL`  |
| CSS 类名   | kebab-case             | `.user-card`    |

### 组件编写规范

**必须使用 `<script setup lang="ts">`**

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
}
const props = withDefaults(defineProps<Props>(), {
  count: 0
})

const emit = defineEmits<{
  (e: 'update', value: string): void
}>()
</script>
```

**组件拆分原则**

- 单文件不超过 300 行
- 超过 3 个嵌套层级考虑抽取子组件
- 复杂逻辑抽取到 composables

### 导出约定

**优先使用命名导出**

```ts
// ✅ 推荐
export function formatDate() {}
export const API_BASE_URL = ''

// ❌ 避免（除非仅有单个导出）
export default function formatDate() {}
```

---

## 后端 API 对接规范

### 响应码处理

后端统一响应格式（`src/constants/response-code.ts`）：

```typescript
{
  code: 1000,        // 1000 = 成功
  message: "success",
  data: {...},
  timestamp: 1234567890
}
```

### API 模块映射

| 前端 API 目录   | 后端路由           | 说明                   |
| --------------- | ------------------ | ---------------------- |
| `/api/auth`     | `/api/v1/auth`     | 登录、登出、Token 刷新 |
| `/api/admin`    | `/api/v1/admin`    | 用户、角色、权限、菜单 |
| `/api/sys`      | `/api/v1/sys`      | 审计日志、系统事件     |
| `/api/workline` | `/api/v1/workline` | 作业线管理             |
| `/api/device`   | `/api/v1/device`   | 设备管理、状态监控     |
| `/api/callback` | `/api/v1/callback` | 设备回调处理           |
| `/api/api_auth` | `/api/v1/api_auth` | API 应用认证           |

### 时区处理

- **API 传输**: ISO 8601 (UTC)，如 `2024-01-01T12:00:00Z`
- **显示**: 转换为应用时区（Asia/Shanghai）
- **表单提交**: 本地时间转换为 UTC

详细参考: `docs/TIMEZONE_HANDLING.md`

---

## Git 提交规范

使用 Conventional Commits 格式：

```
<type>(<scope>): <subject>

[body]

[footer]
```

**type 类型**: `feat` | `fix` | `docs` | `style` | `refactor` | `perf` | `test` | `chore`

**示例**:

```
feat(auth): add JWT token refresh mechanism

- Implement automatic token refresh before expiration
- Add refresh token API integration
- Update auth store to handle new token lifecycle

Closes #123
```

---

## 开发注意事项

### 禁止事项

- ❌ 禁止使用 Options API（仅 Composition API）
- ❌ 禁止使用 `any` 类型（使用 `unknown` 或具体类型）
- ❌ 禁止直接在组件中调用 `import.meta.env`（使用 `useEnv()`）
- ❌ 禁止跳过类型检查（`pnpm type:check` 必须通过）
- ❌ 禁止提交未经 lint 的代码（`pnpm lint` 必须通过）

### 推荐做法

- ✅ 优先使用 `@vueuse/core` 中的组合式函数
- ✅ 优先使用 Element Plus 组件而非自定义
- ✅ 复杂表单使用 vee-validate + zod
- ✅ 大列表虚拟滚动使用 `@vueuse/core` 的 `useVirtualList`
- ✅ 自动导入的 API：`ref`、`computed`、`watch`、`onMounted` 等
- ✅ 自动导入的组件：Element Plus 组件无需手动导入

---

## 配置文件说明

| 文件                  | 用途                                 |
| --------------------- | ------------------------------------ |
| `vite.config.ts`      | Vite 构建配置，包含代码分割策略      |
| `eslint.config.js`    | ESLint Flat Config（ESLint 9+ 格式） |
| `stylelint.config.js` | CSS/Lint 检查，支持 Tailwind         |
| `tailwind.config.js`  | Tailwind CSS 配置                    |
| `tsconfig.json`       | TypeScript 配置，严格模式开启        |
| `.env.development`    | 开发环境变量                         |
| `.env.production`     | 生产环境变量                         |

---

## 项目文档

- **技术栈详解**: `docs/WES_FRONTEND_TECH_STACK.md`
- **时区处理**: `docs/TIMEZONE_HANDLING.md`
- **第一阶段任务**: `docs/TASKS_PHASE_1.md`
