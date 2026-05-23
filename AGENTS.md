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
- `pnpm contract:test`、`pnpm contract:verify`、`pnpm generate:types`：用于接口契约校验与类型生成。
- `./scripts/git-worktree.sh add feature-name`：仅在需要并行隔离时创建 worktree。

## 分支与 Worktree 流程

- 默认使用普通 Git Flow 分支：日常单任务开发从 `develop` 切 `feature/*`、`fix/*`、`chore/*` 等分支即可，不默认使用 worktree。
- 基础分支统一使用 `develop`。创建功能/修复分支前先更新 `develop`，PR 默认以 `develop` 为 base；除发布、回滚、生产补丁等特殊流程外，不从 `main` 直接拉日常开发分支。
- 仅在确实需要隔离时使用 worktree：长线重构、保留当前现场处理紧急修复、AI agent 执行大计划、PR review 期间继续其他工作，或需要并行运行两套本地环境。

- 主仓库路径：`/Users/kaizhou/SynologyDrive/works/wes_frontend`
- Worktree 根目录：`/Users/kaizhou/SynologyDrive/works/worktrees/wes_frontend`
- 新建 worktree 必须放在上述根目录下，不要放进主仓库内部，也不要散落在 `/Users/kaizhou/SynologyDrive/works` 顶层。
- Worktree 目录名使用 branch slug：把分支名里的 `/` 替换成 `-`，例如 `feature/runtime-monitoring` → `feature-runtime-monitoring`。
- 推荐使用 `./scripts/git-worktree.sh add <branch>` 创建 worktree；脚本会自动使用统一根目录并安装依赖。
- 每个 worktree 必须维护自己的 `.env.*`、`node_modules`、缓存和本地运行状态；不要复用其它 worktree 的本地状态。
- 完成后使用 `./scripts/git-worktree.sh remove <branch>` 或 `git worktree remove <path>` 清理，再执行 `git worktree prune`。

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
- 提交信息说明默认使用中文；推荐保留 Conventional Commit 的 type/scope，冒号后的摘要与正文使用中文。
- 每次 commit 聚焦单一主题，不混入无关改动；PR 需说明变更内容、影响范围、验证步骤，并为 UI 变更附截图。

## 配置与架构注意事项

- 当前仓库是前端项目；后端是独立代码库，位于 `../wes_backend`。涉及后端实现、接口逻辑或服务端代码时，应切换到对应后端仓库处理，避免在当前前端仓库中混淆修改。
- 大改动前先阅读 `CLAUDE.md`；业务代码不要直接读取 `import.meta.env`，统一通过 `src/config/env.ts` 或 `useEnv()`。
- 认证守卫与 token 刷新逻辑已集中在 `src/router/index.ts` 与 `src/api/client.ts`，扩展时优先复用现有流程。
