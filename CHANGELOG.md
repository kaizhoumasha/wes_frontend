# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
