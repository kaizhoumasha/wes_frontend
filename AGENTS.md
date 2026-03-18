# Repository Guidelines

## 项目结构与模块组织

- `src/` 是主应用目录：`api/` 放 alova 请求层与生成权限码，`components/` 放通用 UI 与 CRUD 组件，`composables/` 放复用逻辑，`views/` 放页面，`router/` 放路由与守卫，`stores/` 放 Pinia 状态，`assets/` 放样式与静态资源。
- `docs/` 存放 CRUD、智能搜索、时区、契约同步等专题文档；`scripts/` 存放 API 类型生成、权限同步、契约校验、Git worktree 等脚本。
- 环境配置文件位于 `.env.development` 与 `.env.production`；构建产物输出到 `dist/`。

## 构建、测试与开发命令

- `pnpm dev`：启动本地开发服务器，默认端口 `5173`。
- `pnpm build`：生成生产构建；`pnpm build:dev`：按开发模式构建。
- `pnpm type:check`：执行 `vue-tsc --noEmit`。
- `pnpm lint`：依次运行类型检查、ESLint、Prettier、Stylelint，是提交前的基础质量门禁。
- `pnpm contract:test`、`pnpm contract:verify`、`pnpm type:generate`：用于接口契约校验与类型生成。
- `./scripts/git-worktree.sh add feature-name`：创建并行开发 worktree。

## 代码风格与命名约定

- 仅使用 Vue 3 Composition API 与 `<script setup>`；TypeScript 维持严格模式。
- `src/` 内路径统一使用 `@/` 别名导入，优先复用 `src/types/` 与 `src/api/types/` 中的领域类型。
- 复用优先：共享逻辑放 `composables/`，通用组件放 `components/common/` 或 `components/ui/`。
- 命名遵循现有模式：组件使用 `PascalCase.vue`，组合式函数使用 `useXxx.ts`，页面按 `src/views/<feature>/` 组织。

## 测试指南

- 当前没有独立单元测试框架，主要质量门禁是 `pnpm lint` 与按需执行的契约校验脚本。
- 涉及 API 或 Schema 变更时，至少运行相关契约命令；新增验证脚本时，采用清晰命名，例如 `feature-name.test.ts`。

## Commit 与 Pull Request 规范

- 提交信息遵循 Conventional Commits，例如：`feat(users): ...`、`fix(table): ...`、`refactor(users): ...`、`chore(sync): ...`。
- 每次 commit 聚焦单一主题，不混入无关改动；PR 需说明变更内容、影响范围、验证步骤，并为 UI 变更附截图。

## 配置与架构注意事项

- 大改动前先阅读 `CLAUDE.md`；业务代码不要直接读取 `import.meta.env`，统一通过 `src/config/env.ts` 或 `useEnv()`。
- 认证守卫与 token 刷新逻辑已集中在 `src/router/index.ts` 与 `src/api/client.ts`，扩展时优先复用现有流程。
