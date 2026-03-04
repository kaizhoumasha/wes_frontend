# WES 前端项目技术选型与实施计划

> **项目名称**: P9 WES 前端项目 (休斯顿智能仓储执行系统前端)
> **文档版本**: 1.2 (2026-03 移除 Vite 6 支持，专注 Vite 8+)
> **创建日期**: 2026-03-04
> **后端项目**: `/Users/kaizhou/SynologyDrive/works/wes_backend`
> **前端目录**: `/Users/kaizhou/SynologyDrive/works/wes_frontend`

> **更新日志**:
> - **v1.2** (2026-03-04): 移除 Vite 6 支持，专注使用 Vite 8+ (Rolldown 引擎)
> - **v1.1** (2026-03-04): 更新所有技术栈到最新版本 (Vite 6/8, Vue 3.5+, TS 5.8+, Tailwind 4.x, ESLint 9.x)
> - **v1.0** (2026-03-04): 初始版本

---

## 1. 项目概述

### 1.1 系统定位

P9 WES 是一个**独立部署的仓储执行控制中台**，向上对接 SAP/WMS，向下协调自动化设备（ECS/RCS）。前端需要提供：

- **实时监控**: 设备状态、任务执行、库存追踪
- **业务管理**: 入库、出库、盘点、波次策略
- **配置管理**: 设备配置、货架管理、权限控制
- **数据分析**: 效率统计、异常分析、报表导出

### 1.2 技术约束

| 约束项 | 要求 |
|--------|------|
| **开发语言** | TypeScript 5.8+ |
| **框架** | Vue 3.5+ (Composition API + `<script setup>`) |
| **包管理器** | pnpm 9+ / npm 10+ / bun 1+ (推荐 pnpm) |
| **Node.js** | 20.19+ / 22.12+ (Vite 8+ 要求) |
| **开发模式** | Git Worktree (支持多分支并行开发) |
| **构建工具** | Vite 8+ (Rolldown 引擎，10-30x 性能提升) |
| **后端 API** | FastAPI (RESTful + JWT 认证) |

> **版本说明** (2026-03 更新):
> - **Vite 8** 已发布，使用 **Rolldown** (Rust 编写) 引擎，性能提升 **10-30 倍**
> - **Rolldown 1.0 RC** 已于 2026-01-21 发布，正式版即将到来
> - **Node.js 18 已不再支持**，需要 **Node.js 20.19+** 或 **22.12+**
> - **pnpm 9** 是当前稳定版本，**pnpm 10** 正在 Beta 测试中
>
> **推荐组合**:
> - 推荐: Vite 8 + Node.js 22 LTS + pnpm 9/10 Beta

---

## 2. 技术选型

### 2.1 核心框架与构建工具

| 技术 | 版本 | 选型依据 |
|------|------|----------|
| **Vue 3** | 3.5+ | • Composition API 提供更好的逻辑复用<br>• `<script setup>` 语法简洁高效<br>• 3.5 版本引入 Reactivity Transform 等新特性 |
| **TypeScript** | 5.8+ | • 强类型检查减少运行时错误<br>• 装饰器支持 (ECMAScript Stage 3)<br>• 大型项目必备 |
| **Vite** | 8+ | • **Vite 8**: 使用 **Rolldown** (Rust 编写) 引擎，性能提升 10-30 倍<br>• 极速 HMR、原生 ESM 支持<br>• 统一的 dev 和 prod 构建引擎 |
| **Vue Router** | 4.5+ | • Vue 3 官方路由<br>• 支持路由懒加载和守卫 |
| **Pinia** | 2.3+ | • Vue 3 官方状态管理<br>• 完整的 TypeScript 支持<br>• 持久化插件集成 |

### 2.2 UI 组件库与样式方案

| 技术 | 版本 | 选型依据 |
|------|------|----------|
| **Element Plus** | 2.9+ | • 企业级组件库，适合后台管理系统<br>• 与 glass_frontend 保持一致<br>• 丰富的 Table/Form 组件 |
| **Tailwind CSS** | 4.x (最新) | • 原子化 CSS，快速构建 UI<br>• CSS-first 配置 (@import 替代 JIT)<br>• 生产环境体积更小 |
| **Radix Vue** | 1.9+ | • 无样式的可访问组件<br>• 用于自定义复杂交互组件 |
| **shadcn-vue** | 最新 | • 基于 Radix Vue + Tailwind 的组件集合<br>• 可直接复制代码到项目中 |

> **Tailwind CSS 4.x 更新**:
> - **CSS-first 配置**: 使用 `@import "tailwindcss"` 替代 `content` 配置
> - **更快的构建**: 基于 Lightning CSS 引擎
> - **原生 CSS 特性**: 更好地支持现代 CSS 特性

### 2.3 HTTP 客户端与数据请求

| 技术 | 版本 | 选型依据 |
|------|------|----------|
| **alova** | 3.2+ | • 轻量级请求库，支持请求缓存<br>• 与 glass_frontend 保持一致<br>• 支持 RESTful/gRPC |
| **axios** | 1.7+ | • 备选方案（如需要更复杂的拦截器） |

### 2.4 表单与验证

| 技术 | 版本 | 选型依据 |
|------|------|----------|
| **vee-validate** | 4.15+ | • Vue 3 最好的表单验证库<br>• 支持复杂验证场景 |
| **zod** | 3.24+ | • TypeScript 优先的 Schema 验证<br>• 类型自动推断 |

### 2.5 工具库

| 技术 | 版本 | 用途 |
|------|------|------|
| **@vueuse/core** | 12.x+ | 组合式 API 工具集，与 Vue 3.5+ 完美兼容 |
| **date-fns** | 4.x+ | 日期处理（与后端时区保持一致） |
| **lodash-es** | 4.17+ | 工具函数 (ESM 版本) |
| **clsx** | 2.1+ | 条件类名合并 |
| **tailwind-merge** | 2.6+ | Tailwind 类名合并，支持 Tailwind 4.x |

> **@vueuse/core 12.x 更新**:
> - 新增 `useElementSize`、`useMouseInElement` 等实用函数
> - 完整支持 Vue 3.5+ 的新特性
> - 更好的 TypeScript 类型推断

### 2.6 代码质量与开发工具

| 技术 | 版本 | 用途 |
|------|------|------|
| **ESLint** | 9.x (Flat Config) | 代码检查，使用新的 Flat Config 格式 |
| **TypeScript ESLint** | 8.x | TypeScript 代码检查 |
| **Prettier** | 3.4+ | 代码格式化 |
| **Stylelint** | 16.x | CSS/Less 检查，支持 Tailwind CSS 4.x |
| **vue-tsc** | 2.2+ | Vue 类型检查 |
| **unplugin-auto-import** | 0.19+ | 自动导入 Vue API |
| **unplugin-vue-components** | 0.28+ | 自动导入组件 |
| **@vitejs/plugin-vue** | 5.x+ | Vue 3 Vite 插件 |

> **ESLint 9.x 更新**:
> - **Flat Config**: 新的配置格式，替代 `.eslintrc.js`
> - **更快**: 内置 ESM 支持，启动速度更快
> - **TypeScript 原生**: 无需额外 TypeScript 解析器

### 2.7 可视化与图表

| 技术 | 版本 | 用途 |
|------|------|------|
| **ECharts** | 5.x+ | 数据可视化图表 |
| **@unovis/vue** | 1.5+ | 现代化图表库（备选） |
| **@logicflow/core** | 2.0+ | 流程图编辑器（用于任务编排可视化） |
| **Vue-ECharts** | 7.x+ | ECharts 的 Vue 3 组件封装 |

> **ECharts 5.x 更新**:
> - 更好的 TypeScript 支持
> - 性能优化，大数据量渲染更快
> - 新增更多图表类型和交互能力

---

## 3. 项目架构设计

### 3.1 目录结构

```
wes_frontend/
├── .git/                          # Git 仓库（主分支）
├── .gitignore
├── .env.development               # 开发环境变量
├── .env.production                # 生产环境变量
├── .prettierrc
├── .eslintrc.cjs
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── index.html
├── CLAUDE.md                      # 前端开发指南
├── docs/                          # 项目文档
│   ├── API.md                     # 后端 API 文档映射
│   └── ARCHITECTURE.md            # 前端架构说明
│
├── public/                        # 静态资源
│   ├── favicon.ico
│   └── robots.txt
│
├── scripts/                       # 脚本工具
│   ├── bootstrap.sh               # 项目初始化脚本
│   ├── git-worktree.sh            # Git Worktree 管理脚本
│   └── generate-api.js            # API 代码生成工具
│
└── src/                           # 源代码
    ├── main.ts                    # 应用入口
    ├── App.vue                    # 根组件
    │
    ├── api/                       # API 请求模块
    │   ├── client.ts              # alova 客户端配置
    │   ├── types.ts               # API 类型定义
    │   ├── auth/                  # 认证相关 API
    │   │   └── auth.ts            # 登录、登出、Token 刷新
    │   ├── admin/                 # 管理员模块 API
    │   │   ├── users.ts           # 用户管理
    │   │   ├── roles.ts           # 角色管理
    │   │   ├── perms.ts           # 权限管理
    │   │   ├── menus.ts           # 菜单管理
    │   │   └── performance.ts     # 性能监控
    │   ├── sys/                   # 系统模块 API
    │   │   ├── audit.ts           # 审计日志
    │   │   └── events.ts          # 系统事件
    │   ├── workline/              # 作业线管理 API
    │   │   └── workline.ts        # 作业线 CRUD
    │   ├── device/                # 设备管理 API
    │   │   └── device.ts          # 设备 CRUD
    │   ├── callback/              # 设备回调 API
    │   │   ├── callback.ts        # 回调处理
    │   │   └── callback_log.ts    # 回调日志
    │   └── api_auth/              # API 应用认证 API
    │       ├── api_application.ts # API 应用管理
    │       └── api_access_log.ts  # API 访问日志
    │
    ├── assets/                    # 静态资源
    │   ├── images/
    │   ├── icons/
    │   └── styles/
    │       ├── variables.css      # CSS 变量
    │       └── globals.css        # 全局样式
    │
    ├── components/                # 组件
    │   ├── common/                # 通用组件
    │   │   ├── AppHeader.vue
    │   │   ├── AppSidebar.vue
    │   │   ├── AppBreadcrumb.vue
    │   │   └── AppFooter.vue
    │   ├── business/              # 业务组件
    │   │   ├── DeviceStatusCard.vue
    │   │   ├── TaskTimeline.vue
    │   │   └── InventoryGrid.vue
    │   └── ui/                    # UI 组件（基于 shadcn-vue）
    │       ├── button/
    │       ├── input/
    │       └── dialog/
    │
    ├── composables/               # 组合式函数
    │   ├── useAuth.ts             # 认证相关
    │   ├── usePermission.ts       # 权限检查
    │   ├── useTable.ts            # 表格通用逻辑
    │   ├── useWebSocket.ts        # WebSocket 连接
    │   └── useDeviceStatus.ts     # 设备状态监控
    │
    ├── layouts/                   # 布局组件
    │   ├── DefaultLayout.vue
    │   ├── AuthLayout.vue
    │   └── EmptyLayout.vue
    │
    ├── router/                    # 路由配置
    │   ├── routes/                # 路由定义
    │   │   ├── index.ts           # 路由汇总
    │   │   ├── auth.ts            # 认证路由
    │   │   ├── admin.ts           # 管理员模块路由
    │   │   ├── sys.ts             # 系统模块路由
    │   │   ├── workline.ts        # 作业线路由
    │   │   ├── device.ts          # 设备管理路由
    │   │   ├── callback.ts        # 回调管理路由
    │   │   └── api_auth.ts        # API 认证路由
    │   ├── guards/                # 路由守卫
    │   │   ├── auth.ts            # 认证守卫
    │   │   └── permission.ts      # 权限守卫
    │   └── index.ts               # 路由实例
    │
    ├── stores/                    # Pinia 状态管理
    │   ├── user.ts                # 用户状态
    │   ├── permission.ts          # 权限状态
    │   ├── device.ts              # 设备状态
    │   └── app.ts                 # 应用全局状态
    │
    ├── types/                     # TypeScript 类型定义
    │   ├── api.d.ts               # API 响应类型
    │   ├── models.d.ts            # 业务模型类型
    │   └── global.d.ts            # 全局类型扩展
    │
    ├── utils/                     # 工具函数
    │   ├── request.ts             # 请求工具
    │   ├── storage.ts             # 本地存储
    │   ├── date.ts                # 日期处理
    │   ├── permission.ts          # 权限工具
    │   └── validate.ts            # 表单验证规则
    │
    ├── views/                     # 页面视图
    │   ├── auth/                  # 认证页面
    │   │   ├── Login.vue          # 登录页
    │   │   └── Logout.vue         # 登出页
    │   ├── dashboard/             # 仪表板
    │   │   └── Dashboard.vue      # 系统首页
    │   ├── admin/                 # 管理员模块
    │   │   ├── users/             # 用户管理
    │   │   ├── roles/             # 角色管理
    │   │   ├── perms/             # 权限管理
    │   │   ├── menus/             # 菜单管理
    │   │   └── performance/       # 性能监控
    │   ├── sys/                   # 系统模块
    │   │   ├── audit/             # 审计日志查询
    │   │   └── events/            # 系统事件查询
    │   ├── workline/              # 作业线管理
    │   │   └── WorklineList.vue   # 作业线列表
    │   ├── device/                # 设备管理
    │   │   ├── DeviceList.vue     # 设备列表
    │   │   ├── DeviceStatus.vue   # 设备状态监控
    │   │   └── DeviceDetail.vue   # 设备详情
    │   ├── callback/              # 回调管理
    │   │   ├── CallbackList.vue   # 回调列表
    │   │   └── CallbackLog.vue    # 回调日志
    │   ├── api_auth/              # API 应用认证
    │   │   ├── ApiApplication.vue # API 应用管理
    │   │   └── ApiAccessLog.vue   # API 访问日志
    │   └── demo/                  # 示例模块
    │       └── DemoProduct.vue    # 示例产品
    │
    ├── locales/                   # 国际化
    │   ├── zh-CN.ts
    │   └── en-US.ts
    │
    └── constants/                 # 常量定义
        ├── response-code.ts       # 后端响应码
        ├── device-status.ts       # 设备状态枚举
        └── menu.ts                # 菜单配置
```

### 3.2 技术架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        前端应用 (Vue 3)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Views      │  │ Components  │  │   Composables        │ │
│  │  (页面视图)  │  │  (组件库)    │  │   (组合式函数)        │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                     │             │
│         ▼                ▼                     ▼             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Pinia Stores                    │   │
│  │              (状态管理 + 持久化)                    │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Router + Guards                    │   │
│  │               (路由 + 权限守卫)                      │   │
│  └──────────────────────┬──────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                       API 层 (alova)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Auth API    │  │ Admin API   │  │  Business API       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    后端 API (FastAPI)                       │
│         http://localhost:8001/api/v1/                      │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Git Worktree 开发模式

#### 为什么使用 Git Worktree？

1. **并行开发**: 同时处理多个功能分支，无需频繁切换
2. **隔离环境**: 每个 worktree 有独立的 node_modules 和构建产物
3. **快速切换**: 无需重新安装依赖，直接切换 worktree 目录
4. **代码审查**: 在一个 worktree 中运行代码，在另一个中审查 PR

#### Worktree 目录结构

```
wes_frontend/
├── .git/                    # 主 Git 仓库
├── main/                    # 主分支 (main) 的源码（通过 worktree add 创建）
├── feature-auth/            # 功能分支 worktree
├── feature-inbound/         # 功能分支 worktree
├── hotfix-device-status/   # 热修复分支 worktree
└── develop/                # 开发分支 worktree
```

#### Git Worktree 管理脚本

**创建 worktree**:
```bash
# scripts/git-worktree.sh add feature-auth
# 创建: wes_frontend/feature-auth/
```

**列出 worktree**:
```bash
# scripts/git-worktree.sh list
# 输出所有 worktree 及其分支状态
```

**删除 worktree**:
```bash
# scripts/git-worktree.sh remove feature-auth
# 删除 worktree 目录
```

---

## 4. 与后端 API 对接

### 4.1 后端 API 结构

根据后端 `src/register.py`，前端需要对接以下 API 模块：

| API 模块 | 后端路由前缀 | 前端 API 目录 | 说明 |
|----------|--------------|--------------|------|
| **auth** | `/api/v1/auth` | `/api/auth` | 登录、登出、Token 刷新 |
| **admin** | `/api/v1/admin` | `/api/admin` | 用户、角色、权限、菜单、性能监控 |
| **sys** | `/api/v1/sys` | `/api/sys` | 审计日志、系统事件 |
| **workline** | `/api/v1/workline` | `/api/workline` | 作业线管理（区域、设备层级） |
| **device** | `/api/v1/device` | `/api/device` | 设备管理、状态监控 |
| **callback** | `/api/v1/callback` | `/api/callback` | 设备回调处理、回调日志 |
| **api_auth** | `/api/v1/api_auth` | `/api/api_auth` | API 应用认证、访问日志 |
| **demo** | `/api/v1/demo` | `/api/demo` | 示例模块 |

### 4.2 API 请求配置

```typescript
// src/api/client.ts
import { alovaInstance } from 'alova'
import VueHook from 'alova/vue'
import adapter from 'alova/adapter/xhr'

// 创建 alova 实例
export const apiClient = alovaInstance({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1',
  statesHook: VueHook,
  requestAdapter: adapter,
  timeout: 10000,

  // 请求拦截器（添加 JWT Token）
  beforeRequest(method) {
    const token = localStorage.getItem('access_token')
    if (token) {
      method.config.headers.Authorization = `Bearer ${token}`
    }
  },

  // 响应拦截器（统一错误处理）
  responded: {
    onSuccess: (response) => {
      const { code, data, message } = response.data
      if (code !== 1000) { // 后端成功响应码
        throw new Error(message || '请求失败')
      }
      return data
    },
    onError: (error) => {
      // Token 过期处理
      if (error.response?.status === 401) {
        // 跳转登录页或刷新 Token
      }
      throw error
    }
  }
})
```

### 4.3 响应码处理

根据后端 `src/core/response/response_code.py`：

```typescript
// src/constants/response-code.ts
export enum ResponseCode {
  SUCCESS = 1000,              // 成功
  AUTH_FAILED = 2001,          // 认证失败
  TOKEN_EXPIRED = 2002,        // Token 过期
  PERMISSION_DENIED = 2003,    // 权限不足
  RESOURCE_NOT_FOUND = 3001,   // 资源不存在
  RESOURCE_CONFLICT = 3002,    // 资源冲突
  BUSINESS_ERROR = 4001,       // 业务错误
  SERVER_ERROR = 5001,         // 服务器错误
}

// 响应数据结构
export interface ApiResponse<T = any> {
  code: ResponseCode
  message: string
  data: T
  timestamp: number
}
```

---

## 5. 核心功能模块设计

### 5.1 认证与权限

#### JWT Token 管理

```typescript
// src/composables/useAuth.ts
export function useAuth() {
  const store = useAuthStore()

  const login = async (credentials: LoginDTO) => {
    const { access_token, refresh_token } = await authApi.login(credentials)
    store.setTokens(access_token, refresh_token)
    await fetchUserInfo()
  }

  const logout = async () => {
    await authApi.logout()
    store.clearTokens()
    router.push('/login')
  }

  const refreshAccessToken = async () => {
    const { access_token } = await authApi.refreshToken()
    store.setAccessToken(access_token)
  }

  return {
    login,
    logout,
    refreshAccessToken,
    isAuthenticated: computed(() => store.isAuthenticated)
  }
}
```

#### RBAC 权限控制

```typescript
// src/composables/usePermission.ts
export function usePermission() {
  const store = usePermissionStore()

  // 检查是否有指定权限
  const hasPermission = (permission: string) => {
    return store.permissions.includes(permission) || store.is_superuser
  }

  // 检查是否有任意一个权限
  const hasAnyPermission = (permissions: string[]) => {
    return permissions.some(p => hasPermission(p))
  }

  // 检查是否有所有权限
  const hasAllPermissions = (permissions: string[]) => {
    return permissions.every(p => hasPermission(p))
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: computed(() => store.permissions),
    is_superuser: computed(() => store.is_superuser)
  }
}
```

### 5.2 实时设备监控

#### WebSocket 连接

```typescript
// src/composables/useWebSocket.ts
export function useWebSocket(url: string) {
  const ws = ref<WebSocket | null>(null)
  const connected = ref(false)
  const data = ref<any>(null)

  const connect = () => {
    ws.value = new WebSocket(url)

    ws.value.onopen = () => {
      connected.value = true
    }

    ws.value.onmessage = (event) => {
      data.value = JSON.parse(event.data)
    }

    ws.value.onclose = () => {
      connected.value = false
      // 自动重连
      setTimeout(connect, 3000)
    }
  }

  const disconnect = () => {
    ws.value?.close()
  }

  onMounted(connect)
  onUnmounted(disconnect)

  return { connected, data }
}
```

#### 设备状态监控

```typescript
// src/composables/useDeviceStatus.ts
export function useDeviceStatus() {
  const devices = ref<DeviceStatus[]>([])
  const loading = ref(false)

  const fetchStatus = async () => {
    loading.value = true
    try {
      devices.value = await deviceApi.getStatus()
    } finally {
      loading.value = false
    }
  }

  // 定时刷新（5秒）
  const { pause, resume } = useIntervalFn(fetchStatus, 5000)

  return {
    devices,
    loading,
    fetchStatus,
    pause,
    resume
  }
}
```

### 5.3 通用表格组件

```vue
<!-- src/components/common/AppTable.vue -->
<script setup lang="ts" generic="T">
import { ref } from 'vue'
import { ElTable } from 'element-plus'

interface Props {
  data: T[]
  columns: TableColumn[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  (e: 'selection-change', selection: T[]): void
  (e: 'row-click', row: T): void
}>()
</script>

<template>
  <ElTable
    :data="data"
    :loading="loading"
    @selection-change="emit('selection-change', $event)"
    @row-click="emit('row-click', $event)"
  >
    <template v-for="column in columns" :key="column.prop">
      <ElTableColumn v-bind="column">
        <template v-if="column.slot" #default="{ row }">
          <slot :name="column.slot" :row="row" />
        </template>
      </ElTableColumn>
    </template>
  </ElTable>
</template>
```

---

## 6. 开发规范

### 6.1 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| **组件文件** | PascalCase | `UserList.vue` |
| **组合式函数** | camelCase + `use` 前缀 | `useAuth.ts` |
| **工具函数** | camelCase | `formatDate.ts` |
| **类型定义** | PascalCase | `UserDTO.ts` |
| **常量** | UPPER_SNAKE_CASE | `API_BASE_URL` |
| **CSS 类名** | kebab-case | `.user-card` |

### 6.2 代码规范

- **使用 `<script setup>`**: 所有组件使用 `<script setup lang="ts">` 语法
- **组合式 API**: 优先使用 Composition API，避免 Options API
- **类型定义**: 所有函数、变量必须有明确的类型注解
- **组件拆分**: 单个组件文件不超过 300 行
- **命名导出**: 优先使用命名导出，避免默认导出

### 6.3 Git 提交规范

使用 Conventional Commits 格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**type 类型**:
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例**:
```
feat(auth): add JWT token refresh mechanism

- Implement automatic token refresh before expiration
- Add refresh token API integration
- Update auth store to handle new token lifecycle

Closes #123
```

---

## 7. 环境配置

### 7.1 环境变量

```bash
# .env.development
VITE_APP_TITLE=P9 WES (开发环境)
VITE_API_BASE_URL=http://localhost:8001/api/v1
VITE_WS_URL=ws://localhost:8001/api/v1/ws
VITE_APP_MOCK=false

# .env.production
VITE_APP_TITLE=P9 WES
VITE_API_BASE_URL=https://api.wes.example.com/api/v1
VITE_WS_URL=wss://api.wes.example.com/api/v1/ws
VITE_APP_MOCK=false
```

### 7.2 Vite 配置

```typescript
// vite.config.ts (Vite 8+)
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/types/auto-imports.d.ts',
      eslintrc: {
        enabled: true  // 生成 ESLint 配置
      }
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/types/components.d.ts'
    })
  ],

  // Vite 8 使用 Rolldown 引擎 (Rust 编写)
  build: {
    rollupOptions: {
      // Rolldown 配置
      acoin: true,  // 使用 Acorn 解析器（更快）

      output: {
        manualChunks(id) {
          // 分包策略
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  server: {
    port: 5173,
    host: true,  // 监听所有地址，便于局域网访问
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:8001',
        ws: true  // WebSocket 支持
      }
    }
  }
})
```

> **Vite 8 注意事项**:
> - 安装: `pnpm add -D vite@latest @vitejs/plugin-vue@latest`
> - Rolldown 是 Vite 8 的默认引擎，提供 10-30x 性能提升
> - 需要Node.js 20.19+ 或 22.12+
> - 部分传统 Rollup 插件可能需要适配

---

## 8. 时区处理

> **详细文档**: 参见 [时区处理详细指南](./TIMEZONE_HANDLING.md)

### 8.1 时区策略概述

WES 前端采用与后端完全对齐的时区处理方案，确保时间数据在前后端之间正确传递和显示。

```
┌─────────────────────────────────────────────────────────────┐
│  后端                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ 数据库存储    │  │ API 响应     │  │ 应用时区              │ │
│  │ naive UTC    │  │ aware UTC    │  │ Asia/Shanghai        │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                        │ API 通信 (ISO 8601)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  前端 (Vue 3)                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ 解析 API     │  │ 显示转换     │  │ 表单提交              │ │
│  │ ISO → Date   │  │ UTC → 本地   │  │ 本地 → UTC           │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 核心原则

| 层级 | 格式 | 示例 | 说明 |
|------|------|------|------|
| **数据库存储** | naive UTC datetime | `2024-01-01 12:00:00` | 后端存储，无时区信息（默认 UTC） |
| **API 传输** | ISO 8601 (UTC) | `2024-01-01T12:00:00Z` | 前后端通信格式，明确 UTC 时区 |
| **前端显示** | 本地时区 | `2024-01-01 20:00:00` | 用户看到的本地时间（Asia/Shanghai） |
| **表单提交** | ISO 8601 (UTC) | `2024-01-01T12:00:00Z` | 前端将本地时间转换为 UTC 后提交 |

### 8.3 工具库依赖

```json
{
  "dependencies": {
    "date-fns": "^4.0.0",
    "date-fns-tz": "^3.0.0"
  }
}
```

### 8.4 核心函数

```typescript
// src/utils/timezone.ts

// 解析后端返回的 ISO 8601 时间
parseApiTime("2024-01-01T12:00:00Z") // → Date 对象

// 格式化为应用时区显示
formatAppTime(date, "yyyy-MM-dd HH:mm:ss") // → "2024-01-01 20:00:00"

// 格式化为浏览器本地时区
formatLocalTime(date, "yyyy-MM-dd HH:mm:ss") // → "2024-01-01 20:00:00"

// 表单时间转换为 API 格式
toApiTime("2024-01-01 20:00:00") // → "2024-01-01T12:00:00Z"

// 获取当前 UTC 时间
nowUtc() // → "2024-01-01T12:00:00Z"

// 相对时间显示
formatRelativeTime("2024-01-01T12:00:00Z") // → "5分钟前"
```

### 8.5 使用示例

```vue
<!-- 显示后端返回的时间 -->
<template>
  <div>
    <p>创建时间: {{ formatAppTime(parseApiTime(device.created_at)) }}</p>
    <p>相对时间: {{ formatRelativeTime(device.created_at) }}</p>
  </div>
</template>

<script setup lang="ts">
import { parseApiTime, formatAppTime, formatRelativeTime } from '@/utils/timezone'
</script>
```

```vue
<!-- 提交表单时间 -->
<template>
  <el-date-picker
    v-model="form.plannedTime"
    type="datetime"
    format="YYYY-MM-DD HH:mm:ss"
    value-format="YYYY-MM-DD HH:mm:ss"
    @change="handleSubmit"
  />
</template>

<script setup lang="ts">
import { toApiTime } from '@/utils/timezone'

const handleSubmit = () => {
  // 转换为 UTC 时间提交给后端
  const payload = {
    planned_time: toApiTime(form.value.plannedTime)
    // "2024-01-01 20:00:00" → "2024-01-01T12:00:00Z"
  }
  await apiClient.post('/api/v1/device/tasks', payload)
}
</script>
```

### 8.6 Element Plus 集成

```typescript
// DatePicker 返回本地时间，需要转换为 UTC
import { datePickerToApi } from '@/utils/element-plus-config'

// 日期范围选择器
const timeRange = ref(['2024-01-01 00:00:00', '2024-01-31 23:59:59'])

const submit = () => {
  const payload = {
    start_time: datePickerToApi(timeRange.value[0]),
    end_time: datePickerToApi(timeRange.value[1]),
  }
}
```

### 8.7 注意事项

| 规则 | 说明 | 示例 |
|------|------|------|
| ✅ **显示时转换** | 从后端获取的时间，显示时转换为本地时区 | `2024-01-01T12:00:00Z` → `2024-01-01 20:00:00` |
| ✅ **提交时转换** | 用户输入的本地时间，提交时转换为 UTC | `2024-01-01 20:00:00` → `2024-01-01T12:00:00Z` |
| ✅ **比较用 UTC** | 时间比较统一使用 UTC timestamp | `date.getTime()` |
| ❌ **禁止直接显示** | 不直接显示 ISO 8601 字符串给用户 | 避免显示 `2024-01-01T12:00:00Z` |
| ❌ **禁止 naive 计算** | 不对 naive datetime 进行时间戳计算 | 使用 `date.getTime()` 而非 `.timestamp()` |

---

## 9. 实施计划

### 阶段一：项目初始化（Week 1）

| 任务 | 说明 | 产出 |
|------|------|------|
| 1.1 创建项目结构 | 使用 Vite 创建 Vue 3 + TypeScript 项目 | 基础项目骨架 |
| 1.2 配置开发工具 | ESLint、Prettier、Stylelint、vue-tsc | 代码质量保障 |
| 1.3 配置 Git Worktree | 创建 worktree 管理脚本 | 并行开发能力 |
| 1.4 搭建基础布局 | AppLayout、AuthLayout、路由框架 | 页面框架 |

### 阶段二：核心功能（Week 2-3）

| 任务 | 说明 | 产出 |
|------|------|------|
| 2.1 认证模块 | 登录、登出、Token 管理 | 用户认证功能 |
| 2.2 权限模块 | RBAC 权限控制、路由守卫 | 权限管理功能 |
| 2.3 用户管理 | 用户 CRUD、角色分配 | 用户管理页面 |
| 2.4 通用组件 | Table、Form、Dialog 基础组件 | 可复用组件库 |

### 阶段三：业务功能（Week 4-6）

| 任务 | 说明 | 产出 |
|------|------|------|
| 3.1 设备管理 | 设备列表、状态监控、回调日志 | 设备管理模块 |
| 3.2 入库管理 | 收货、IQC、上架 | 入库业务模块 |
| 3.3 出库管理 | 发料、波次计算 | 出库业务模块 |
| 3.4 库存查询 | 实时库存、货位视图 | 库存查询模块 |

### 阶段四：优化与部署（Week 7-8）

| 任务 | 说明 | 产出 |
|------|------|------|
| 4.1 性能优化 | 路由懒加载、组件按需加载 | 加载速度优化 |
| 4.2 测试 | 单元测试、E2E 测试 | 测试覆盖 |
| 4.3 部署配置 | Docker 镜像、CI/CD 流程 | 生产部署方案 |

---

## 10. 关键技术决策

### 10.1 为什么选择 alova 而不是 axios？

| 特性 | alova | axios |
|------|-------|-------|
| **请求缓存** | ✅ 内置支持 | ❌ 需手动实现 |
| **状态驱动** | ✅ 专为 Vue 3 设计 | ❌ 需额外封装 |
| **TypeScript** | ✅ 完整类型推导 | ⚠️ 需手动定义 |
| **体积** | 小 (~4KB) | 较大 (~15KB) |
| **学习曲线** | 与 Vue 3 一致 | 需学习拦截器 |

### 10.2 为什么使用 Git Worktree 而不是多仓库？

| 对比项 | Git Worktree | 多仓库 |
|--------|--------------|--------|
| **代码共享** | ✅ 同一个仓库 | ❌ 需要手动同步 |
| **依赖安装** | ⚠️ 每个 worktree 独立 | ✅ 可共享 node_modules |
| **分支管理** | ✅ 统一管理 | ❌ 分散在多个仓库 |
| **PR 流程** | ✅ 标准流程 | ❌ 需要跨仓库 PR |

### 10.3 为什么选择 Element Plus 而不是 Ant Design Vue？

| 特性 | Element Plus | Ant Design Vue |
|------|--------------|-----------------|
| **Vue 3 支持** | ✅ 原生支持 | ⚠️ 迁移中 |
| **TypeScript** | ✅ 完整类型 | ✅ 完整类型 |
| **生态** | 国内生态成熟 | 国际化更好 |
| **学习曲线** | 与 glass_frontend 一致 | 需要学习新组件 API |

### 10.4 ESLint Flat Config vs 旧版 .eslintrc.js

| 特性 | 旧版 (.eslintrc.js) | Flat Config (eslint.config.js) |
|------|-------------------|------------------------------|
| **配置格式** | JSON/JS 对象 | ES Module |
| **性能** | 较慢 | **更快** (内置 ESM) |
| **TypeScript** | 需要额外解析器 | **原生支持** |
| **插件系统** | 需要覆盖配置 | 更简洁的配置方式 |
| **未来** | 逐渐废弃 | **官方推荐** |

> **ESLint 9.x 默认使用 Flat Config**，不再支持 `.eslintrc.js` 格式。

### 10.1 为什么选择 alova 而不是 axios？

| 特性 | alova | axios |
|------|-------|-------|
| **请求缓存** | ✅ 内置支持 | ❌ 需手动实现 |
| **状态驱动** | ✅ 专为 Vue 3 设计 | ❌ 需额外封装 |
| **TypeScript** | ✅ 完整类型推导 | ⚠️ 需手动定义 |
| **体积** | 小 (~4KB) | 较大 (~15KB) |
| **学习曲线** | 与 Vue 3 一致 | 需学习拦截器 |

### 10.2 为什么使用 Git Worktree 而不是多仓库？

| 对比项 | Git Worktree | 多仓库 |
|--------|--------------|--------|
| **代码共享** | ✅ 同一个仓库 | ❌ 需要手动同步 |
| **依赖安装** | ⚠️ 每个 worktree 独立 | ✅ 可共享 node_modules |
| **分支管理** | ✅ 统一管理 | ❌ 分散在多个仓库 |
| **PR 流程** | ✅ 标准流程 | ❌ 需要跨仓库 PR |

### 10.3 为什么选择 Element Plus 而不是 Ant Design Vue？

| 特性 | Element Plus | Ant Design Vue |
|------|--------------|-----------------|
| **Vue 3 支持** | ✅ 原生支持 | ⚠️ 迁移中 |
| **TypeScript** | ✅ 完整类型 | ✅ 完整类型 |
| **生态** | 国内生态成熟 | 国际化更好 |
| **学习曲线** | 与 glass_frontend 一致 | 需要学习新组件 API |

---

## 11. 参考资源

### 官方文档

- **Vue 3 官方文档**: https://cn.vuejs.org
- **Vite 官方文档**: https://cn.vitejs.dev
- **Element Plus 官方文档**: https://element-plus.org
- **Pinia 官方文档**: https://pinia.vuejs.org
- **alova 官方文档**: https://alova.js.org
- **Git Worktree 指南**: https://git-scm.com/docs/git-worktree

### 项目文档

- **后端 API 文档**: `/Users/kaizhou/SynologyDrive/works/wes_backend/docs/SRS.md`
- **第三方设备接入**: `/Users/kaizhou/SynologyDrive/works/wes_backend/docs/third_party_integration_whitepaper.md`

### 最新技术动态 (2025-2026)

| 技术 | 最新动态 | 链接 |
|------|---------|------|
| **Vite 8** | Rolldown (Rust) 引擎，性能提升 10-30x | [Vite 8 公告](https://vitejs.dev/blog/announcing-vite8) |
| **Rolldown** | 1.0 RC 发布 (2026-01-21) | [Rolldown GitHub](https://github.com/rolldown/rolldown) |
| **Tailwind CSS 4** | CSS-first 配置，Lightning CSS 引擎 | [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4-alpha) |
| **ESLint 9** | Flat Config 成为主要配置方式 | [ESLint 9.0.0](https://eslint.org/blog/2025/02/06/eslint-v9.0.0-released) |
| **TypeScript 5.8** | 装饰器支持稳定，更好的类型推断 | [TS 5.8 发布](https://devblogs.microsoft.com/typescript/2024/10/announcing-typescript-5-8/) |
| **Vue 3.5** | Reactivity Transform 稳定，性能优化 | [Vue 3.5 发布](https://blog.vuejs.org/posts/vue-3-5/) |
| **pnpm 9** | 稳定版本，性能优化 | [pnpm 9.0](https://pnpm.io/blog/2024/09/11/pnpm-9-0) |

### 新兴技术推荐

| 技术 | 说明 | 适用场景 |
|------|------|----------|
| **TanStack Start** | 支持 Vite 的全栈框架 | 新项目尝鲜 |
| **Nitropack** | Vite 原生打包工具 | 替代传统 Vite 打包 |
| **Million.js** | 极致性能优化 | 超大应用性能优化 |
| **Nuxt 4** | 基于 Vite 5 的全栈框架 | SSR 项目 |
| **Vitest** | Vite 原生测试框架 | 单元测试 |

---

## 附录 A: ESLint Flat Config 示例

```javascript
// eslint.config.js (ESLint 9.x Flat Config)
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default [
  // 忽略的文件和目录
  { ignores: ['dist', 'node_modules', '**/*.d.ts'] },

  // JavaScript 配置
  eslint.configs.recommended,

  // TypeScript 配置
  ...tslint.configs.recommended,

  // Vue 配置
  ...pluginVue.configs['flat/recommended'],

  // 自定义规则
  {
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'vue/multi-word-component-names': 'off'
    }
  }
]
```

## 附录 B: Tailwind CSS 4.x 配置示例

```css
/* src/assets/styles/main.css */
@import "tailwindcss";

@theme {
  /* 自定义主题变量 */
  --color-primary: oklch(0.7 0.15 200);
  --color-secondary: oklch(0.6 0.2 250);

  --font-sans: "Inter", system-ui, sans-serif;
  --radius-md: 0.5rem;

  /* 自定义断点 */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* 自定义样式 */
@layer components {
  .btn-primary {
    @apply rounded-md bg-primary px-4 py-2 text-white;
    transition: all 0.2s;
  }

  .btn-primary:hover {
    @apply brightness-110;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

```javascript
// tailwind.config.js (Tailwind CSS 4.x)
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)'
      }
    }
  },
  plugins: []
}
```

---

**文档结束**
