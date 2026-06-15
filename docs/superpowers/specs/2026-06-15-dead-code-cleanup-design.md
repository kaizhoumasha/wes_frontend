# 死代码清理设计

日期: 2026-06-15
分支建议: `chore/dead-code-cleanup-2026-06`

## 1. 目标

按 KISS / YAGNI / 外科手术式编辑原则，移除当前 `wes_frontend` 仓库中**确认零产品引用**的死代码。每一项删除都必须能从仓库静态引用关系上证明无用，避免误删生成器产物、自动导入产物或仍在被测试 / 路由懒加载使用的代码。

非目标：

- 不修改自动生成的 API 模块（`src/api/modules/admin.ts`、`callback.ts`、`resource.ts`）——它们由 `pnpm generate:types` 从 OpenAPI 派生，删除属于契约同步范畴。
- 不动 DEV-only 的 debug 路由 / 视图（`src/views/debug/smart-search-debug.vue`、`src/views/components/StandardDialogDemo.vue`）——已用 `import.meta.env.DEV` 守卫，不进生产 bundle。
- 不动顶层未跟踪的 LLM 痕迹文件（`HEARTBEAT.md`、`SOUL.md` 等）——已被 `.gitignore` 忽略。

## 2. 范围

### 2.1 删除清单

```
源码：
  src/composables/useCachedState.ts          # 0 引用
  src/composables/useLruCache.ts             # 0 引用
  src/composables/useTableDensity.ts         # 0 引用
  src/composables/useTableFullscreen.ts      # 0 引用
  src/composables/useToolbarActions.ts       # 0 引用（仅注释提及）
  src/components/search/ConditionEditorRow.vue  # 仅 components.d.ts 自动声明
  src/components/runtime/trace/TraceFocusPanel.vue        # 仅测试 mount
  src/components/runtime/trace/TraceRelatedSidebar.vue    # 仅测试 stub
  src/components/runtime/trace/TraceCaseHero.vue          # 仅 components.d.ts
  src/components/runtime/trace/TraceHealthPipeline.vue    # 仅 components.d.ts
  src/components/runtime/devices/DeviceDetailPanel.vue    # 仅 components.d.ts
  src/views/examples/UserFormExample.vue     # 路由清理后无引用

测试：
  tests/unit/components/runtime/traceFocusPanelTimelineGroups.test.ts  # 整文件测被删组件

根目录：
  TODOS_kaideMacBook-Pro.local_Mar-28-193148-2026_CaseConflict.md  # git mv 大小写冲突遗留（已确认 git tracked）
```

### 2.2 同步修改清单

```
src/router/routes/base.ts
  - 删除 examples/user-form 路由条目（第 35-40 行）

src/components/common/CrudToolbar.vue
  - 第 121 行注释「由 useToolbarActions 返回的 filteredActions」改为
    「由 CrudPageController 派生的 filteredActions」（useToolbarActions.ts 同
    commit 删除，注释成幽灵注释）

tests/unit/views/runtime/traceExplorerLayout.test.ts
  - 第 197 行：移除 stubs.TraceRelatedSidebar
  - 第 400-406 行：删除整个 it 块「keeps case detail focused on the current case
    instead of related cases」——验证目标（TraceRelatedSidebar 不存在）随组件被
    删而失去意义

tests/unit/scripts/menu-manifest.test.ts
  - 第 54-62 行 fixture 项「DebugExample」（用 examples/UserFormExample.vue
    作 component 路径）保留意图：测试「无 menu 字段的路由不会进 manifest」的负面
    用例。仅替换 component 路径为任一仍存在的视图（例如 '@/views/dashboard/Dashboard.vue'）。
    不修改其他字段、不删除 fixture。

src/types/components.d.ts
  - 由 unplugin-vue-components 在 `pnpm build:dev` 闸门跑通时自动重生成，
    无需手动改动；diff 中会出现该文件被删除的组件类型声明被移除

TODOS.md
  - 顶部 TODOs 区域追加一条：「CI 接入 knip / ts-prune 死代码检测」（详见 §8）
```

## 3. 验证策略

每次提交前必须连续通过以下闸门：

| 顺序 | 命令             | 期望                                                              |
| ---- | ---------------- | ----------------------------------------------------------------- |
| 1    | `pnpm lint`      | 0 warnings（已包含 `type:check` + ESLint + Prettier + Stylelint） |
| 2    | `pnpm test`      | 全部通过（vitest run）                                            |
| 3    | `pnpm build:dev` | 构建成功，触发 `components.d.ts` 重生成                           |

任一失败立即停止；调试时如需丢弃当前 commit，使用 `git revert HEAD` 而非
`git reset --hard`，避免销毁未提交的本地修改。

## 4. 提交计划

合并为单个 commit：

### Commit: `chore: 清理已证明的死代码`

- 删除 §2.1 列出的所有源码 / 测试 / 根目录文件
- 修改 §2.2 列出的同步项
- commit message 主体按死代码类别分小段说明（合并冲突遗留、未引用 composables、
  拓扑重构遗留组件、demo 路由）以保留可读性

风险评估：低。删除清单全部经过 §7 三轮扫描验证零引用；测试调整局限在两处明
确位置，由 §3 闸门兜底。

## 5. 失败回滚

```bash
git checkout develop && git pull
git checkout -b chore/dead-code-cleanup-2026-06
# 编辑、按 §3 闸门验证
# 如某步失败：
#   - 已 commit：`git revert HEAD` 反向提交（保留追溯）
#   - 未 commit：`git restore <file>` 单文件还原；不要用 reset --hard
```

最终通过 PR 合并到 develop。

## 6. 已确认不删

| 项                                                         | 原因                                                                                                  |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/api/modules/admin.ts` / `callback.ts` / `resource.ts` | OpenAPI 自动生成产物（文件头有 `AUTO GENERATED START` 标记），删除会被下次 `pnpm generate:types` 还原 |
| `src/views/debug/smart-search-debug.vue`                   | DEV-only 路由（`debug.ts` 中 `if (!import.meta.env.DEV) return []`）                                  |
| `src/views/components/StandardDialogDemo.vue`              | 同上，DEV-only                                                                                        |
| `src/api/contract/helpers.ts`                              | 被 `src/api/contract/client.ts` 通过相对路径 `from './helpers'` 引用                                  |

## 7. 扫描方法（执行前重跑）

清理列表「0 引用」结论可能因新增提交而过期，**正式执行前需对 §2.1 全部 12
个文件做以下三轮 ripgrep 扫描，任何一轮命中即从清单中下架并复核**。

```bash
# 设 NAME 为去后缀的基名（如 TraceFocusPanel）
# 1) PascalCase 模板用法 / 类型引用 / import：
rg -n "<${NAME}\b|\b${NAME}\b" src/ tests/ scripts/ artifacts/ \
  --type ts --type vue --type tsx \
  | grep -v "components.d.ts" \
  | grep -v "<file 自身 path>"

# 2) kebab-case 模板用法（unplugin-vue-components 双向解析）：
rg -n "<${KEBAB}\b|</${KEBAB}>" src/ tests/ --type vue
# 例：TraceFocusPanel → trace-focus-panel

# 3) 动态组件 / 字符串引用：
rg -n ":is=.*${NAME}|component:.*${NAME}|import.*['\"].*${NAME}" src/ tests/ scripts/
```

辅助约束：

- `unplugin-auto-import` 仅自动导入 vue / pinia / vue-router 内置 API（见 `src/types/auto-imports.d.ts`），未自动导入项目内 composables/utils，所以 composables 文件级 grep 即可定夺。
- `unplugin-vue-components` 自动注册组件 — `components.d.ts` 中存在但 PascalCase + kebab-case + 动态绑定三轮均未命中的组件 = 死代码。
- 路由懒加载使用字符串路径 import，已展开扫描所有 `routes/*.ts`。
- 测试文件单独标注「测试孤儿」（产品代码无引用，仅测试 import）：本次列表中 `TraceFocusPanel.vue` 和 `TraceRelatedSidebar.vue` 属此类，已和用户确认作为死代码删除。

## 8. 后续 / TODOS

清理完成后将以下一项加入 `TODOS.md`，本 PR 不实施：

- **CI 引入死代码静态分析（knip 或 ts-prune）**
  - **What**：在 `pnpm lint` 闸门中加一个 `knip` 步骤，自动检测未使用的 export / 未注册组件 / 未引用文件，CI 强制 0 warnings。
  - **Why**：本次清理证明仓库会自然累积死代码（5 个零引用 composables、5 个零引用组件、1 个测试孤儿）。靠人肉 grep 复盘不可持续。
  - **Pros**：未来死代码不会再累积成需要专项 PR 清理的程度；新增组件 / composable 后若未挂上即被 CI 拦截。
  - **Cons**：knip 需要配置忽略名单（OpenAPI 自动生成模块、DEV-only 路由等）；初次接入预计 30-60min 调优误报。
  - **Context**：本仓库为 Vue 3 + Vite + unplugin-vue-components 项目，knip 对该栈支持良好（参考其 docs 中的 vue plugin 配置）；ts-prune 是更轻的备选但对 Vue SFC 支持差。
  - **Depends on**：本次死代码清理 PR 合入 develop。

## 9. 附：bundle 影响参考记录

清理删除的全部为「未在产品上挂载」的组件 / composables，Vite tree-shaking 应
该早已在生产构建中将其裁掉。本 PR 调试通过后记录删除前后 `dist/` 大小变化作
为参考（不作为闸门）：

```bash
# 删除前
pnpm build && du -sh dist
# 删除后（同环境同 commit hash 顺手对比）
pnpm build && du -sh dist
```

预期：差异接近 0（证明 tree-shaking 已生效）；如出现明显减小则说明历史
bundle 中携带了无效代码，反而是清理的正向证据。

## CROSS-MODEL CONSENSUS（本次 review 决策）

| 议题           | review (Claude)        | 外部 (Codex)               | 决策                       |
| -------------- | ---------------------- | -------------------------- | -------------------------- |
| commit 切分    | 4 commit               | 1 commit                   | 1 commit（合并）           |
| 验证闸门       | type:check → lint 顺序 | lint 已含 type:check，重复 | 1 步 lint（已合并）        |
| 回滚           | reset --hard           | revert HEAD                | revert HEAD                |
| 扫描方法       | 文件级 grep            | 漏 kebab/动态              | 三轮 ripgrep（已写入 §7）  |
| 幽灵注释       | 顺手清                 | 未提                       | 顺手清 CrudToolbar.vue:121 |
| 测试孤儿 it 块 | 删整个                 | 未提                       | 删整个 it 块               |
| bundle 量化    | 未提                   | 应量化                     | 记录不闸（§9）             |
| knip 接入      | 后续                   | 后续                       | TODO（§8）                 |

## GSTACK REVIEW REPORT

| Review        | Trigger               | Why                             | Runs | Status       | Findings                                                                             |
| ------------- | --------------------- | ------------------------------- | ---- | ------------ | ------------------------------------------------------------------------------------ |
| CEO Review    | `/plan-ceo-review`    | Scope & strategy                | 0    | —            | 未运行（清理任务，非战略变更）                                                       |
| Codex Review  | `/codex review`       | Independent 2nd opinion         | 1    | issues_found | 16 个 outside voice findings，6 个 substantive 全部 resolved 为 cross-model decision |
| Eng Review    | `/plan-eng-review`    | Architecture & tests (required) | 1    | CLEAR        | 4 findings, 0 critical gaps, 0 unresolved                                            |
| Design Review | `/plan-design-review` | UI/UX gaps                      | 0    | —            | 不适用（无 UI 改动）                                                                 |
| DX Review     | `/plan-devex-review`  | Developer experience gaps       | 0    | —            | 不适用                                                                               |

- **CODEX:** 16 个挑战 — 4 个 substantive 转为 cross-model tension 已被用户决策吸收（commit 合并 / 闸门合并 / git revert / 三轮扫描）；6 个事实性修正已直接吸收到 spec；其余在内部 review 已 captured 或归类为不重要文字差异
- **CROSS-MODEL:** Claude 内部 review + Codex 共识：清理范围、清理判定、保留项 三点完全一致；分歧仅在 commit 切分粒度、闸门顺序、扫描覆盖度等执行细节上，全部按 codex 建议吸收（用户选择）
- **VERDICT:** ENG CLEARED — ready to implement

NO UNRESOLVED DECISIONS
