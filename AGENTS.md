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
- `pnpm test`：运行 Vitest 单元测试；`pnpm contract:test`、`pnpm contract:verify`：执行接口契约门禁。
- `pnpm contract:freeze -- --backend-root /path/to/wes_backend`：从指定的干净后端 `develop` checkout 冻结 canonical OpenAPI；`pnpm generate:types`、`pnpm generate:zod`：从该快照生成类型与 Zod Schema。
- `pnpm generate:permissions -- --backend-root /path/to/wes_backend`、`pnpm permission:verify -- --backend-root /path/to/wes_backend`：生成并校验权限常量。
- `./scripts/git-worktree.sh add feature-name`：仅在需要并行隔离时创建 worktree。

## 分支与 Worktree 流程

- 默认使用普通 Git Flow 分支：日常单任务开发从 `develop` 切 `feature/*`、`fix/*`、`chore/*` 等分支即可，不默认使用 worktree。
- 基础分支统一使用 `develop`。创建功能/修复分支前先更新 `develop`，PR 默认以 `develop` 为 base；除发布、回滚、生产补丁等特殊流程外，不从 `main` 直接拉日常开发分支。
- 仅在确实需要隔离时使用 worktree：长线重构、保留当前现场处理紧急修复、PR review 期间继续其他工作，或需要并行运行两套本地环境。

- 主仓库路径：`/Users/kaizhou/codeDev/wes_frontend`
- Worktree 根目录：`/Users/kaizhou/codeDev/wes_frontend-worktrees`
- 新建 worktree 必须放在上述根目录下，不要放进主仓库内部。
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

- 单元测试使用 Vitest，测试文件集中在 `tests/unit/`；基础质量门禁包括 `pnpm test`、`pnpm lint` 与相关契约校验脚本。
- 涉及 API、Schema 或生成器变更时，至少运行相关契约命令，并验证同一输入再次生成无差异；新增测试时采用清晰命名，例如 `feature-name.test.ts`。

## Commit 与 Pull Request 规范

- 提交信息遵循 Conventional Commits，例如：`feat(users): ...`、`fix(table): ...`、`refactor(users): ...`、`chore(sync): ...`。
- 提交信息说明默认使用中文；推荐保留 Conventional Commit 的 type/scope，冒号后的摘要与正文使用中文。
- 每次 commit 聚焦单一主题，不混入无关改动；PR 需说明变更内容、影响范围、验证步骤，并为 UI 变更附截图。

## 配置与架构注意事项

- 当前仓库是前端项目，后端是独立代码库。涉及后端实现、接口逻辑或服务端代码时，应通过显式 `WES_BACKEND_ROOT` 切换到实际后端 checkout；前端 worktree 不得用 `../wes_backend` 推断后端位置。
- 完整前后端本机调试由 `$WES_BACKEND_ROOT/scripts/dev-env.sh` 唯一编排；执行前把 `WES_FRONTEND_ROOT` 设为当前前端 checkout，再在后端仓库运行 `up`，用 `check` 验证，用 `logs frontend` 排障。当前仓库的 `docker-compose.yml` 只用于独立生产构建预览，不得作为联调入口。
- 联调容器通过源码挂载和 Vite HMR 热更新；依赖安装必须使用 frozen lockfile。`package.json` 或 `pnpm-lock.yaml` 变化后重新运行后端 `dev-env.sh up`，不得让容器隐式修改锁文件。
- 大改动前先阅读 `CLAUDE.md`；业务代码不要直接读取 `import.meta.env`，统一通过 `src/config/env.ts` 或 `useEnv()`。
- 认证守卫与 token 刷新逻辑已集中在 `src/router/guards/`、`src/app/bootstrap-auth-context.ts` 与 `src/api/client.ts`，扩展时优先复用现有流程。

## Deploy Configuration (configured by /setup-deploy)

- Platform: Custom，后端仓库所有的 Jenkins/orchestrator
- Production URL:
- Staging URL: http://100.94.216.118
- Deploy workflow: `$WES_BACKEND_ROOT/Jenkinsfile.test-deploy`，使用 `DEPLOY_SCOPE=FRONTEND`
- Deploy status command: 按 `$WES_BACKEND_ROOT/docs/devops/prod-release-deploy.md` 核对 immutable release evidence、frontend image digest 与 OCI source revision
- Merge method: squash
- Project type: web app
- Post-deploy health check: 联调首页、静态资源、`/health` 与管理员 login/logout

### Custom deploy hooks

- Pre-merge: `pnpm test && pnpm lint && pnpm build && pnpm contract:test && pnpm contract:verify`
- Deploy trigger: 只允许从后端发布链路以已批准的 frontend candidate/digest 触发；禁止从本仓库直接 Compose、SSH 或重新构建现场源码
- Deploy status: 核对后端 release evidence、frontend 容器 image digest 与 OCI source revision 三者一致
- Health check: `http://100.94.216.118/`、`http://100.94.216.118/health`、关键静态资源与管理员 login/logout

## 任务执行与授权

- 根据变更风险选择最小充分流程；未知风险按高风险处理。大型/高风险功能或 Bug 使用 RED → DEV → GREEN；小型/低风险优先复用既有测试或可靠替代验证。
- 纯人类可读文档、注释、规则和发布元数据不走代码式 TDD，以审阅、链接/路径、结构和 diff 检查验证。
- 只选择覆盖当前任务的最小 Skill 集合；已批准计划、纯文档或元数据调整不重复设计流程。
- 写入前检查工作树状态；目标路径与其他活动任务冲突时先协调或隔离，保留不相关的 dirty 现场。
- 只读 Review、实施、Commit、Push、创建 PR、Merge 和 Deploy 分别需要独立授权。

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:

- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
