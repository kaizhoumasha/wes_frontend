# P9 WES 前端项目 - 第一阶段详细任务清单

> **阶段目标**: 完成项目基础搭建和核心功能开发
> **预计时间**: Week 1-2
> **文档版本**: 1.0
> **创建日期**: 2026-03-04

---

## 任务状态说明

| 状态      | 说明                       |
| --------- | -------------------------- |
| ✅ 已完成 | 任务已通过验证             |
| 🔄 进行中 | 任务正在执行               |
| ⏳ 待开始 | 任务等待执行               |
| ⚠️ 阻塞   | 任务被阻塞，需要先解决问题 |
| ❌ 失败   | 任务执行失败               |

---

## 阶段一：项目初始化（Week 1）

### 1.1 项目骨架搭建 ✅

| 任务ID | 任务描述            | 状态    | 产出                              |
| ------ | ------------------- | ------- | --------------------------------- |
| 1.1.1  | 创建项目目录结构    | ✅ 完成 | 基础目录                          |
| 1.1.2  | 配置 package.json   | ✅ 完成 | package.json                      |
| 1.1.3  | 配置 vite.config.ts | ✅ 完成 | Vite 8+ 配置                      |
| 1.1.4  | 配置 tsconfig.json  | ✅ 完成 | TypeScript 配置                   |
| 1.1.5  | 配置环境变量        | ✅ 完成 | .env.development, .env.production |
| 1.1.6  | 创建基础 Vue 组件   | ✅ 完成 | App.vue, Login.vue, Dashboard.vue |
| 1.1.7  | 配置 Tailwind CSS   | ✅ 完成 | tailwind.config.js                |
| 1.1.8  | 配置 ESLint         | ✅ 完成 | eslint.config.js (Flat Config)    |

### 1.2 依赖安装 ✅

| 任务ID | 任务描述     | 状态    | 产出         |
| ------ | ------------ | ------- | ------------ |
| 1.2.1  | 安装项目依赖 | ✅ 完成 | node_modules |
| 1.2.2  | 验证依赖版本 | ✅ 完成 | 版本检查     |

> **注意**: 使用 **Node.js 22 LTS + pnpm 10** 安装依赖
>
> ```bash
> # 执行方式
> nvm use 22
> pnpm install
> ```

### 1.3 开发工具配置 ✅

| 任务ID | 任务描述       | 状态    | 产出                                           |
| ------ | -------------- | ------- | ---------------------------------------------- |
| 1.3.1  | 配置 Prettier  | ✅ 完成 | .prettierrc                                    |
| 1.3.2  | 配置 Stylelint | ✅ 完成 | stylelint.config.js                            |
| 1.3.3  | 配置 Git Hooks | ✅ 完成 | .husky/pre-commit, lint-staged                 |
| 1.3.4  | 配置 VSCode    | ✅ 完成 | .vscode/settings.json, .vscode/extensions.json |

### 1.4 CI/CD 配置 ✅

| 任务ID | 任务描述            | 状态    | 产出                           |
| ------ | ------------------- | ------- | ------------------------------ |
| 1.4.1  | 创建 GitHub Actions | ✅ 完成 | .github/workflows/ci-cd.yml    |
| 1.4.2  | 配置 Docker 构建    | ✅ 完成 | Dockerfile, docker-compose.yml |
| 1.4.3  | 配置 nginx          | ✅ 完成 | nginx.conf                     |

---

## 阶段二：核心功能开发（Week 2）

### 2.1 认证模块 ✅

| 任务ID | 任务描述        | 依赖  | 产出                          | 状态 |
| ------ | --------------- | ----- | ----------------------------- | ---- |
| 2.1.1  | 实现登录 API    | 1.2.1 | api/modules/auth.ts           | ✅   |
| 2.1.2  | 实现 Token 存储 | 2.1.1 | api/services/token-refresh.ts | ✅   |
| 2.1.3  | 完善登录页面    | 2.1.2 | views/auth/Login.vue          | ✅   |
| 2.1.4  | 实现登出功能    | 2.1.3 | auth.ts + token-refresh.ts    | ✅   |

> **已完成功能**:
>
> - 登录 API (`authApi.login`)
> - Token 自动刷新机制 (401 错误静默刷新)
> - 登出功能 (`authApi.logout` + 清除本地 Token)
> - 会话管理 (`getActiveSessions`, `revokeSession`)
> - 权限查询 (`getPermissions`)
>
> **架构说明**: Token 管理采用服务层 (`api/services/token-refresh.ts`) 而非 Pinia Store，更贴近 API 层设计

### 2.2 权限模块 ✅

| 任务ID | 任务描述                | 依赖  | 产出                         | 状态 |
| ------ | ----------------------- | ----- | ---------------------------- | ---- |
| 2.2.1  | 实现权限检查 composable | -     | composables/usePermission.ts | ✅   |
| 2.2.2  | 实现路由守卫            | 2.2.1 | router/guards/permission.ts  | ✅   |
| 2.2.3  | 集成 RBAC 权限控制      | 2.2.2 | -                            | ✅   |

### 2.3 通用组件 ✅

| 任务ID | 任务描述                | 依赖         | 产出                             | 状态 |
| ------ | ----------------------- | ------------ | -------------------------------- | ---- |
| 2.3.1  | 创建 AppHeader 组件     | -            | components/common/AppHeader.vue  | ✅   |
| 2.3.2  | 创建 AppSidebar 组件    | -            | components/common/AppSidebar.vue | ✅   |
| 2.3.3  | 创建 DefaultLayout 布局 | 2.3.1, 2.3.2 | layouts/DefaultLayout.vue        | ✅   |

---

## 阶段三：业务功能开发（Week 3-4）

### 3.1 管理员模块 ⏳

| 页面     | 路由               | 优先级 |
| -------- | ------------------ | ------ |
| 用户管理 | /admin/users       | P0     |
| 角色管理 | /admin/roles       | P0     |
| 权限管理 | /admin/perms       | P1     |
| 菜单管理 | /admin/menus       | P1     |
| 性能监控 | /admin/performance | P2     |

### 3.2 设备管理模块 ⏳

| 页面         | 路由               | 优先级 |
| ------------ | ------------------ | ------ |
| 设备列表     | /device/list       | P0     |
| 设备状态监控 | /device/status     | P0     |
| 设备详情     | /device/detail/:id | P1     |

### 3.3 作业线管理 ⏳

| 页面       | 路由                 | 优先级 |
| ---------- | -------------------- | ------ |
| 作业线列表 | /workline/list       | P0     |
| 作业线详情 | /workline/detail/:id | P1     |

### 3.4 回调管理 ⏳

| 页面     | 路由           | 优先级 |
| -------- | -------------- | ------ |
| 回调列表 | /callback/list | P0     |
| 回调日志 | /callback/log  | P1     |

### 3.5 系统模块 ⏳

| 页面            | 路由                  | 优先级 |
| --------------- | --------------------- | ------ |
| 审计日志        | /sys/audit            | P1     |
| 系统事件（SSE） | /api/v1/events/stream | P2     |

---

## 阶段四：优化与部署（Week 5-6）

### 4.1 性能优化 🔄

- [x] 路由懒加载
- [x] 组件按需加载
- [ ] 图片优化
- [x] 缓存策略

### 4.2 测试 ⏳

- [ ] 单元测试
- [ ] E2E 测试
- [ ] 测试覆盖率报告

### 4.3 部署 🔄

- [x] Docker 镜像构建
- [x] 生产环境配置
- [ ] CI/CD 流程验证

---

## 快速开始指南

### 开发环境启动

```bash
# 1. 切换到 Node.js 22 LTS
nvm use 22

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev

# 4. 访问
open http://localhost:5173
```

### 生产构建

```bash
# 构建生产版本
pnpm run build

# 预览构建结果
pnpm run preview
```

### Docker 部署

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f
```

---

## 优先级说明

| 优先级 | 说明               | 示例               |
| ------ | ------------------ | ------------------ |
| **P0** | 核心功能，必须完成 | 用户登录、设备列表 |
| **P1** | 重要功能，尽量完成 | 设备详情、审计日志 |
| **P2** | 辅助功能，可延后   | 性能监控、系统事件 |

---

## 当前阻塞问题

| 问题ID | 问题描述                                        | 解决方案            | 状态      |
| ------ | ----------------------------------------------- | ------------------- | --------- |
| #1     | ~~pnpm install 内存溢出~~                       | 使用 Node.js 22 LTS | ✅ 已解决 |
| #2     | ~~unplugin-vue-components 版本不存在~~          | 更新到 31.0.0       | ✅ 已解决 |
| #3     | ~~pinia-plugin-persistedstate peer dependency~~ | 升级 Pinia 到 3.x   | ✅ 已解决 |

---

## 更新日志

| 日期       | 版本 | 更新内容                                              |
| ---------- | ---- | ----------------------------------------------------- |
| 2026-03-07 | 1.2  | 同步 2.2/2.3 完成状态，更新 4.1/4.3 部分完成项        |
| 2026-03-05 | 1.1  | 完成 1.3 开发工具配置（Stylelint、Git Hooks、VSCode） |
| 2026-03-04 | 1.0  | 初始版本                                              |
