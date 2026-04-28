# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
