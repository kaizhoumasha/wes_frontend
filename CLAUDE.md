# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Design System

**Always read `DESIGN.md` before making any visual or UI decisions.**

All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

---

## 项目概述

**P9 MCS (休斯顿智能物料控制系统)** 是一个独立部署的物料控制中台，前端基于 Vue 3 + TypeScript + Vite 构建，对接 FastAPI 后端。

- **当前仓库定位**: 当前工程是前端仓库；涉及后端实现、接口逻辑或服务端代码时，应切换到独立后端仓库处理
- **后端项目**: `../wes_backend`
- **本地 API**: http://localhost:8001
- **Swagger 文档**: http://localhost:8001/api/docs
- **OpenAPI 文档**: http://localhost:8001/api/openapi.json

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

### 运行态浏览器 Smoke

```bash
# 默认使用本地后端 seed，覆盖 monitor/devices/sandbox/trace 运行态路径
pnpm smoke:runtime:agent-browser

# 固定前端 fixture，复核运行态 monitor 资源布局
RUNTIME_SMOKE_USE_FIXED_MONITOR_FIXTURE=1 pnpm smoke:runtime:agent-browser

# 需要截图证据时额外开启
RUNTIME_SMOKE_CAPTURE_SCREENSHOTS=1 pnpm smoke:runtime:agent-browser
```

### 契约与代码生成

```bash
# OpenAPI 类型生成
pnpm generate:types

# Zod Schema 生成
pnpm generate:zod

# 权限码生成 / 校验
pnpm generate:permissions
pnpm permission:verify

# 前后端契约校验 / 测试
pnpm contract:verify
pnpm contract:test
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

| 技术栈           | 版本要求 | 说明                                      |
| ---------------- | -------- | ----------------------------------------- |
| **Node.js**      | 22+      | 推荐 22 LTS                               |
| **pnpm**         | 10+      | 当前 packageManager 为 pnpm 10            |
| **Vue**          | 3.5+     | 仅使用 Composition API + `<script setup>` |
| **TypeScript**   | 5.9+     | 严格模式开启                              |
| **Vite**         | 7.3+     | 当前版本，配置已优化                      |
| **Element Plus** | 2.13+    | 企业级 UI 组件库                          |
| **alova**        | 3.5+     | HTTP 客户端（非 axios）                   |
| **Tailwind CSS** | 4.2+     | 原子化 CSS                                |

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

## 目录结构与职责（以当前仓库为准）

```
src/
├── api/               # API 请求层
│   ├── base/          # CRUD/API 基类
│   ├── modules/       # 业务 API 模块
│   ├── services/      # token 刷新、SSE、认证错误处理
│   ├── generated/     # 生成的权限码等产物
│   └── client.ts      # alova 实例配置，包含请求/响应拦截器
├── assets/            # 静态资源（图片、样式）
├── components/        # 组件
│   ├── common/        # 通用业务组件
│   ├── search/        # Smart Search 组件
│   └── ui/            # UI 基础组件（可复制 shadcn-vue 代码）
├── composables/       # 组合式函数（复用逻辑）
│   ├── useEnv.ts      # 环境变量访问（响应式）
│   ├── useCrud*.ts    # CRUD 页面复用逻辑
│   └── useResponsiveLayout.ts
├── config/            # 配置文件
│   ├── env.ts         # 环境变量单一数据源
│   └── api/           # API base url / version 统一配置
├── constants/         # 常量定义（枚举、配置）
├── layouts/           # 布局组件
├── router/            # 路由配置
│   ├── guards/        # 权限守卫
│   └── index.ts       # 路由实例 + 认证守卫
├── stores/            # Pinia 状态管理
├── types/             # TypeScript 类型定义
├── utils/             # 工具函数
└── views/             # 页面视图
```

补充目录：

```
docs/                  # 技术、CRUD、搜索、时区、契约同步文档
scripts/               # 类型生成、权限同步、契约测试、worktree 脚本
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

当前 API 分层以“基础能力 + 业务模块 + 生成产物”为主：

```
api/
├── client.ts        # 统一的 alova 实例
├── base/            # CRUD/API 抽象
├── modules/         # auth / user / menu / device 等业务模块
├── services/        # token-refresh / auth-error-handler / sse-client
├── generated/       # 生成的权限码等文件
├── types/           # request / response / model 类型
└── utils/           # 错误分类等辅助函数
```

### 4.1 当前协作约定

- `AGENTS.md` 为仓库协作指南，使用中文单文件维护。
- `.serena/memories/` 中的共享记忆可保留入库；`project-init/`、`repo-docs/` 这类本地运行痕迹不提交。

### 5. 响应式布局架构

#### 三层断点管理架构

| 层级       | 文件                            | 用途                   | 断点定义                                           |
| ---------- | ------------------------------- | ---------------------- | -------------------------------------------------- |
| **常量层** | `src/constants/breakpoints.ts`  | TypeScript 常量定义    | `SMALL: 480`, `MOBILE: 768`, `DESKTOP: 1280`       |
| **配置层** | `tailwind.config.js`            | Tailwind 工具类断点    | `'sm': '480px'`, `'md': '768px'`, `'xl': '1280px'` |
| **样式层** | `src/assets/styles/globals.css` | CSS 变量（仅组件样式） | `--breakpoint-mobile`, `--breakpoint-tablet`       |

**断点规范**:

- **Mobile**: < 768px
- **Tablet**: 768px - 1279px
- **Desktop**: ≥ 1280px
- **Small**: < 480px

#### Composable 选择原则

**使用 `useResponsiveLayout`** (纯检测层):

- ✅ 只需要设备类型检测（`isMobile`, `isTablet`, `isDesktop`）
- ✅ 需要断点匹配工具（`matchesBreakpoint`, `matchesRange`）
- ✅ 不需要侧边栏/菜单等 UI 状态
- 📍 使用场景：表格响应式列显示、条件渲染、工具函数

**使用 `useLayout`** (状态管理层):

- ✅ 需要控制侧边栏折叠状态（`sidebarCollapsed`）
- ✅ 需要移动端菜单状态（`isMobileMenuOpen`）
- ✅ 需要布局相关的计算属性（`sidebarWidth`, `contentMarginLeft`）
- 📍 使用场景：布局组件、导航组件、需要控制 UI 状态的组件

**架构原则**:

```
useLayout (UI 状态层)
    ↓ 复用
useResponsiveLayout (检测层)
    ↓ 使用
@vueuse/core (useBreakpoints, useWindowSize)
    ↓ 依赖
constants/breakpoints.ts (断点常量)
```

#### CSS 媒体查询限制

⚠️ **重要**: @media 查询不支持 CSS 变量（CSS 规范限制）

```css
/* ❌ 错误：不工作 */
@media (width >= var(--breakpoint-mobile)) {
}

/* ✅ 正确：使用固定值 */
@media (width >= 768px) {
}
```

**为什么**?

- `@media` 是编译时特性（CSS 规范）
- CSS 变量是运行时计算（CSS 自定义属性）
- 变量值在浏览器运行时才确定，而媒体查询需要在样式表解析时匹配

**解决方案**:

- 在 `@media` 查询中使用固定值（参考 `constants/breakpoints.ts` 和 `tailwind.config.js`）
- CSS 变量仅用于组件内样式（如 `min-width: var(--search-min-width)`）

**维护规则**:

- 修改断点值时，同步更新三个文件：`breakpoints.ts` → `tailwind.config.js` → `globals.css` 注释
- 在 CSS 注释中引用断点来源：`/* 参考：src/constants/breakpoints.ts */`

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

## Git 工作流规范

### 🟢 混合开发模式：Git Workflow + Worktree

**原则：小功能用 Git Workflow（新建分支），大功能/多人协作用 Worktree**

### 分支管理策略

```
main (生产) ←─ develop (开发基准) ←─ feature/* (功能分支)
```

| 分支        | 用途             | 开发方式                                | 部署目标         |
| ----------- | ---------------- | --------------------------------------- | ---------------- |
| `main`      | 生产版本         | ❌ 禁止直接开发                         | 私有化部署       |
| `develop`   | 开发基准（默认） | ❌ 禁止直接开发                         | Cloudflare Pages |
| `feature/*` | 功能开发         | ⚠️ 小功能用 Workflow，大功能用 Worktree | 无               |
| `hotfix/*`  | 紧急修复         | ⚠️ Workflow 或 Worktree                 | 无               |

### 开发方式选择标准

#### ✅ **使用 Git Workflow 开发**（满足以下所有条件）：

- 单文件修改或少量文件改动（< 5 个文件）
- 单人开发，无并行任务
- 小功能、Bug 修复、文档更新
- 预计开发时间 < 1 小时
- 不需要并行开发其他功能

#### ⚠️ **使用 Worktree 开发**（满足以下任一条件）：

- 多文件/多模块改动（≥ 5 个文件）
- 多人协作开发同一功能
- 大功能开发（预计 > 1 小时）
- 需要并行开发多个功能
- 实验性功能（可能需要多次调整）
- 破坏性改动（需要独立测试）

### 开发流程

#### 方式一：Git Workflow 开发（小功能）

```bash
# ✅ 适用场景：小功能、Bug修复、文档更新

# 1. 从 develop 创建功能分支
git checkout develop
git pull origin develop
git checkout -b fix-login-validation

# 2. 开发
# ... 编码 ...
pnpm lint  # 提交前检查

# 3. 提交代码
git add .
git commit -m "fix: 修复登录表单验证错误"
git push -u origin fix-login-validation

# 4. 创建 PR 合并到 develop
# 在 GitHub: fix-login-validation → develop

# 5. 合并后删除功能分支
git checkout develop
git pull origin develop
git branch -d fix-login-validation
```

#### 方式二：Worktree 开发（大功能/多人协作）

```bash
# ✅ 适用场景：大功能、多人协作、并行开发

# 1. 创建功能分支 worktree
./scripts/git-worktree.sh add feature-auth

# 2. 进入 worktree 开发
cd /Users/kaizhou/SynologyDrive/works/worktrees/wes_frontend/feature-auth
# ... 编码 ...
pnpm lint

# 3. 提交代码
git add .
git commit -m "feat(auth): 添加JWT token刷新机制"
git push -u origin feature-auth

# 4. 创建 PR 合并到 develop
# 在 GitHub: feature-auth → develop

# 5. 合并后删除 worktree
cd ../../wes_frontend
./scripts/git-worktree.sh remove feature-auth
```

### Worktree 目录结构

```
~/SynologyDrive/works/
├── wes_frontend/                    # 主仓库（develop 分支）
│   ├── .git/                        # Git 仓库
│   ├── src/
│   └── scripts/
└── worktrees/
    └── wes_frontend/                # Worktree 基础目录（大功能使用）
        ├── feature-auth/            # 功能分支 worktree
        ├── feature-inbound/         # 功能分支 worktree
        └── hotfix-device-status/    # 热修复分支 worktree
```

### 为什么使用混合模式？

| 优势         | 说明                                               |
| ------------ | -------------------------------------------------- |
| **标准流程** | 所有功能都通过分支开发，遵循 Git Workflow 最佳实践 |
| **灵活性**   | 小功能快速创建分支，无需 worktree 开销             |
| **并行开发** | 大功能使用 worktree，多分支并行无干扰              |
| **代码隔离** | worktree 独立环境，适合长期开发的功能              |
| **团队协作** | 多人开发强制使用 worktree，确保质量                |
| **快速切换** | `cd` 到不同目录 = 切换分支（worktree 模式）        |

### 最佳实践建议

**开发方式选择流程：**

```
开始开发
    ↓
评估改动范围
    ↓
┌─────────────┴─────────────┐
│ 小功能（< 5 文件, < 1 小时）│ 大功能（≥ 5 文件, > 1 小时, 多人协作）
│                           │
│ Git Workflow              │ Worktree
│ - 创建分支                 │ - 创建 worktree
│ - 快速开发                 │ - 独立环境
│ - 提交 PR                  │ - 并行开发
│ - 合并删除                 │ - 提交 PR
└───────────────────────────┴───────────────────────────
```

**避免的问题：**

- ❌ 在 develop/main 分支直接开发（必须创建功能分支）
- ❌ 多人同时在同一分支开发（应使用 worktree 分离）
- ❌ 在 main 分支直接开发（破坏生产环境）
- ❌ 提交未经 lint 检查的代码（CI/CD 会失败）

### 代码合并规范

**所有代码通过 PR 合并：**

- ✅ feature 分支 → develop（必须 PR）
- ✅ develop → main（必须 PR，生产部署）
- ✅ hotfix 分支 → main 和 develop（必须 PR）

**PR 审查要求：**

- 至少 1 人审查通过（大功能建议 2 人）
- CI/CD 检查全部通过
- 无冲突，可自动合并

### CI/CD 检查要求

所有代码提交必须满足：

- ✅ `pnpm lint` 检查通过（类型 + ESLint + Prettier + Stylelint）
- ✅ `pnpm type:check` 类型检查通过
- ✅ `pnpm contract:test` 契约测试通过（前后端类型一致）
- ❌ 不通过的代码将被拒绝合并

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
- ❌ 禁止修改代码后直接提交（必须先验证生效）

### 推荐做法

- ✅ 优先使用 `@vueuse/core` 中的组合式函数
- ✅ 优先使用 Element Plus 组件而非自定义
- ✅ 复杂表单使用 vee-validate + zod
- ✅ 大列表虚拟滚动使用 `@vueuse/core` 的 `useVirtualList`
- ✅ 自动导入的 API：`ref`、`computed`、`watch`、`onMounted` 等
- ✅ 自动导入的组件：Element Plus 组件无需手动导入
- ✅ 代码修改后验证生效再提交（启动服务、访问页面、检查日志）

### 代码修改验证流程（强制）

**任何代码提交前必须验证修改生效**

#### 验证步骤（按类型）

| 修改类型     | 验证方法              | 检查点               |
| ------------ | --------------------- | -------------------- |
| **前端修复** | `pnpm dev` → 访问页面 | 功能正常、无报错     |
| **后端对接** | 启动容器 → 调用 API   | 响应正确、数据一致   |
| **配置修改** | 重启服务 → 检查日志   | 配置生效、服务正常   |
| **类型修改** | `pnpm type:check`     | 类型正确、无错误     |
| **路由修改** | 访问路由 → 检查导航   | 路由跳转正常、无阻塞 |

#### 禁止行为

- ❌ 修改后立即 `git commit`
- ❌ 基于假设提交"修复"代码
- ❌ 未验证就创建 PR
- ❌ 提交"修复"但实际问题未解决

#### 建议工作流

```bash
# ✅ 正确流程
修改代码 → 验证生效 → git commit → git push

# ❌ 错误流程
修改代码 → git commit → git push → 发现问题
```

**验证失败时**：继续调试 → 验证成功 → 提交（不要提交无效修改）

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

- **设计系统**: `DESIGN.md`
- **更新日志**: `CHANGELOG.md`
- **TODO 清单**: `TODOS.md`
- **技术栈详解**: `docs/WES_FRONTEND_TECH_STACK.md`
- **时区处理**: `docs/TIMEZONE_HANDLING.md`
- **第一阶段任务**: `docs/TASKS_PHASE_1.md`
- **运行态资源布局设计**: `docs/superpowers/specs/2026-06-08-runtime-monitor-resource-layout-design.md`

---

## 表单验证最佳实践

### vee-validate + Zod 集成（推荐）

**✅ 正确用法（v4.6+）：**

```typescript
import { useForm } from 'vee-validate'
import { UserCreateSchema } from '@/types/zod-extensions'
import { usersApi as userApi, type CreateUsersInput as CreateUserInput } from '@/api/modules/users'

// 关键：使用泛型参数实现类型推断
const { handleSubmit, errors, defineField } = useForm<CreateUserInput>({
  validationSchema: UserCreateSchema // 直接传递 Zod schema
})

const onSubmit = handleSubmit(async values => {
  // values 自动推断为 CreateUserInput，无需类型断言
  await userApi.create(values)
})
```

**❌ 错误做法：**

```typescript
// ❌ 不要使用 toTypedSchema（v5 才不需要）
validationSchema: toTypedSchema(UserCreateSchema)

// ❌ 不要使用类型断言绕过
validationSchema: toTypedSchema(UserCreateSchema) as any

// ❌ 不要手动 infer 类型
type FormValues = z.infer<typeof UserCreateSchema>
const onSubmit = handleSubmit(async (values: FormValues) => {
  await userApi.create(values as CreateUserInput) // 多余的类型断言
})
```

### Zod Schema 生成与使用

```bash
# 1. 从后端 OpenAPI 生成 Zod schemas
pnpm run generate:zod

# 2. 在组件中使用
import { UserCreateSchema } from '@/types/zod-extensions'
```

**生成的文件位置：**

- `src/types/generated/zod-schemas.ts` - 自动生成（请勿手动编辑）
- `src/types/zod-extensions.ts` - 自定义扩展

### 调试技巧

遇到类型问题时，按以下顺序排查：

```bash
# 1. 确认包版本
pnpm list vee-validate zod

# 2. 查看类型定义（比文档更准确）
cat node_modules/vee-validate/dist/*.d.ts | grep "function useForm"

# 3. 查看对应版本的官方文档
# v4 文档 vs v5 文档可能有重大差异
```

📖 **详细经验教训**：已记录在 Serena memory 中

- Memory Key: `debugging-lessons-typescript-framework-integration`
- 查看方式：Serena memory → debugging-lessons-typescript-framework-integration

---

YOU MUST: 任何问题处理超过三次还没有成功，就要找其他方法解决，或直接退出！

# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
