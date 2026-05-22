# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0.1] - 2026-05-13

### Changed

- 运行监控中心拆解为 6 个独立模块：运行总览、工作线监控、Trace 追溯、Hold 处置、沙箱测试、设备运行时
- SSE 连接管理统一为 Pinia store 单例，消除每页面独立连接
- Trace 追溯和沙箱测试恢复为可见菜单入口
- 42 个运行时组件按模块目录重组 (overview/monitor/trace/holds/sandbox/devices)

### Added

- 新增 Hold 列表页，支持类型/状态筛选和 Promise.allSettled 容错聚合
- 新增设备运行时网格视图，跨工作线聚合设备状态卡片
- 新增工作线目录搜索（纯前端过滤名称/编码/区域）
- 新增 Trace 对比视图（并排时间线 + 分叉点自动检测高亮）
- 新增浏览器桌面通知（急停/Hold 事件推送，60s 防抖，权限降级）

### Fixed

- Trace 对比视图改用 Promise.allSettled 处理单Trace查询失败

### Removed

- 移除 WorklineRuntimePage 巨页面（被 WorklineMonitorPage 替换）
- 移除 useWorklineMode composable

## [0.3.0.0] - 2026-05-12

### Added

- 新增工作线运行态控制台，现场可在同一页面查看设备拓扑、Session、任务队列、健康状态和安全事件。
- 新增 Runtime Hold 页面与释放处置组件，支持查看阻断原因、证据、冲突、检查清单和处置表单。
- 新增沙盒工作台，支持组合设备事件、提交结果、查看待处理队列和验证安全锁状态。
- 新增 Trace 调查视图、执行路径、时间线分组、阻断点和后续动作面板，便于从失败链路直接定位原因。
- 新增 StandardDrawer、运行态 store、Runtime SSE、运行态显示/优先级/安全工具函数及对应单元测试。

### Changed

- 运行态、设备、工作线、回调日志、审计日志和管理页配置同步到最新后端 OpenAPI 契约。
- OpenAPI 类型生成改为分文件输出并泛型化响应类型，减少单文件元数据体积。
- 全局视觉系统、布局、标准对话框、详情面板和表格操作列对齐当前运行态控制台体验。
- 登录与鉴权启动流程补齐超级管理员通配权限，前端路由新增 Runtime Hold 与 Trace 重定向入口。

### Fixed

- 修复运行态兼容路由、分支测试、急停清除权限、审计/API 访问日志详情字段和菜单路由同步问题。
- 修复 Vitest 在当前 Node 环境下没有可用 `localStorage`/`sessionStorage` 导致认证相关测试失败的问题。
- 修复沙盒结果流、安全锁、Trace 时间线、Runtime Hold 页面和运行态路由同步的回归测试覆盖。

### Removed

- 移除旧插件状态字段消费和 StandardDialog 旧常量依赖，收敛到当前运行态与抽屉交互模型。

## [0.2.0.0] - 2026-04-28

### Added

- 新增任务驱动的运行监控 Dashboard，可直接查看系统健康、优先级队列、设备健康和近期 Trace 状态。
- 新增工作线运行态主视图，将设备拓扑、活跃 Session、失败 Trace 和设备详情合并到工作线上下文中。
- 新增 Trace 处置台深链能力，支持按 Trace、Session、Request、Command、Dispatch 等锚点进入案件调查。
- 新增 Sandbox 调试台，支持待处理 Outbox、Replay Inbox 和人工 Session 操作入口。
- 新增运行时标签、优先级分类、路由查询、sticky context 和 API wrapper 的关键路径测试。

### Changed

- 将设备运行监控入口并入工作线运行态，管理端设备/工作线页面的运行态入口统一跳转到新的运行监控路径。
- 重构运行监控组件体系，统一状态徽标、Trace 列表、设备详情、拓扑、系统裁决和空态体验。
- 更新运行时 API 类型、Zod schema、契约同步记录和权限同步记录，以匹配当前后端契约。
- 优化 SSE 客户端在可恢复断线、重连和 stale connection 场景下的状态与日志行为。

### Fixed

- 修复运行监控 SPA 导航时 SSE 可恢复断线污染控制台的问题。
- 修复带 `deviceId` 直接进入工作线运行态时设备详情面板不会自动打开的问题。
- 修复 Trace 列表业务标识显示优先级，优先展示 `barcode` / `business_key`，并修复空失败域展示。
- 修复运行监控浅色模式、滚动、Trace 案件锚点、路由同步和布局平衡相关问题。

### Removed

- 移除独立的 `/runtime/devices` 和旧 `/runtime/overview` 运行监控页面实现，改由 Dashboard 与 Workline 承担主流程。

## [0.1.0.0] - 2026-03-26

### Added

- 新增角色管理 CRUD 功能（RoleListPage、fieldConfig、pageConfig）
- 添加后端 API 能力自动检查 Hooks（.claude/hooks/check-backend-api.sh）
- 添加 Git Pre-commit Hook 检查 API 契约（scripts/hooks/pre-commit-check-api）
- 新增用户管理扩展 API（resetPassword、assignRoles）

### Changed

- 重构 CRUD 开发指南（docs/CRUD_DEVELOPMENT_GUIDE.md），添加：
  - 5 分钟快速开始指南
  - 后端契约同步说明（Step 0）
  - API 能力检查清单
  - 常见坑点记录
  - 自动化检查 Hooks 配置
- 优化详情组件性能与样式（CrudDetailBody、CrudDetailPanel、CrudDetailSection）
- 更新 Claude Code 配置（.claude/settings.json）

### Fixed

- 修复 CrudDetailActions.vue Map 内存泄漏（使用 delete 替代 set false）
- 修复 check-backend-api.sh 管道逻辑错误
- 优化 shell 脚本效率，减少重复文件读取

## [0.0.1] - 2026-03-14

### Added

- 初始项目结构
- 基础 CRUD 组件架构
- 用户认证系统
