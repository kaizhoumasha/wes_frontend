# Learnings

Corrections, insights, and knowledge gaps captured during development.

**Categories**: correction | insight | knowledge_gap | best_practice
**Areas**: frontend | backend | infra | tests | docs | config
**Statuses**: pending | in_progress | resolved | wont_fix | promoted | promoted_to_skill

## Status Definitions

---

## [LRN-20260323-001] best_practice

**Logged**: 2026-03-23T09:19:04Z
**Priority**: high
**Status**: pending
**Area**: backend

### Summary

静态软删除路由必须先于动态 `/{id}` 路由注册，否则会出现契约正确但运行时误匹配的问题

### Details

本次用户管理回收站联调中，前端调用 `POST /api/v1/users/trash/restore` 持续返回 422。起初容易误判为批量恢复请求体格式错误，但后端返回的验证错误明确指向：

- `field: "path -> id"`
- `message: "Input should be a valid integer, unable to parse string as an integer"`

这说明请求并没有落到 `/trash/restore`，而是被后端路由匹配成了 `/{id}/restore`，并把字符串 `"trash"` 当成了路径参数 `id`。进一步核对后端 `BaseAPI._register_soft_delete_routes` 发现，当前注册顺序是：

1. `POST /{id}/restore`
2. `GET /trash`
3. `POST /trash/restore`
4. `DELETE /trash/permanent`

在 FastAPI/Starlette 下，这种“动态路径先于静态路径”注册会导致 `/trash/restore` 被 `/{id}/restore` 抢先匹配。结果是：

- OpenAPI 契约仍然生成正确
- 前端类型检查和契约测试仍然通过
- 但运行时请求被错误路由吞掉

这类问题说明：动态/静态路径冲突场景下，不能只依赖 OpenAPI 结果，必须核对真实路由定义和注册顺序。

### Suggested Action

将后端软删除路由约定补充为明确规则，并写入后端 BaseAPI 规范：

1. 静态路径必须先于动态路径注册
2. 对软删除资源，推荐顺序为：
   - `/trash`
   - `/trash/restore`
   - `/trash/permanent`
   - `/{id}/restore`
3. 针对这类路由冲突，增加一条后端集成测试，覆盖 `/trash/restore` 不应被 `/{id}/restore` 匹配

### Metadata

- Source: conversation
- Related Files:
  - /Users/kaizhou/SynologyDrive/works/wes_backend/src/core/base_api.py
  - src/api/base/crud-api.ts
- Tags: backend, fastapi, routing, soft-delete, contract-runtime-gap

---

## [LRN-20260323-002] best_practice

**Logged**: 2026-03-23T09:19:04Z
**Priority**: high
**Status**: pending
**Area**: frontend

### Summary

后台管理系统中的 API 缓存应采用“显式开启”策略，不能按所有 GET 默认缓存

### Details

本次用户管理回收站接入后，`GET /api/v1/users/trash` 出现 `HitCache`，导致恢复或删除操作后列表不能实时刷新。根因不是回收站逻辑本身，而是全局请求客户端此前对所有 GET 默认启用了中等时长缓存。

这类默认策略在后台管理场景下风险很高，因为大量 GET 接口实际上都是强一致数据：

- 列表查询
- 详情查询
- 回收站查询
- 权限相关实时状态

如果统一按 HTTP 方法缓存，就会把本应实时刷新的资源一并缓存，问题表现往往是：

- 操作成功但页面没变
- 二次刷新才更新
- 很难第一时间定位到是缓存命中

本次最终改法是把 API 级缓存收回到：

- 全局默认 `GET: cacheFor = 0`
- 仅对“允许短暂过期的只读接口”在调用处显式传 `cacheFor`

### Suggested Action

将前端 API 缓存策略固化为项目约定：

1. `apiClient` 默认关闭 GET 缓存
2. 只有菜单、纯配置、静态字典等只读资源才允许显式缓存
3. CRUD 列表、详情、回收站、权限接口默认禁止缓存
4. 若启用缓存，调用处必须说明缓存目的和 TTL 选择理由

### Metadata

- Source: conversation
- Related Files:
  - src/api/client.ts
  - src/constants/cache.ts
  - src/api/modules/auth.ts
  - src/api/modules/menu.ts
- Tags: frontend, cache, alova, admin-panel, consistency

---

## [LRN-20260311-001] best_practice

**Logged**: 2026-03-11T00:00:00+08:00
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary

Vue Router 页面组件中 `height: 100%` 会因父链存在无高度组件而失效，应改用 `calc(100vh - ...)` 直接计算

### Details

**问题背景**：为 UserTable 实现"分页器固定底部、表格内部滚动"功能时，持续出现分页器被挤出可视口的问题。

**根本原因**：Vue Router 渲染页面组件时，父链为：

```
DefaultLayout → RouterView → Anonymous Component (functional) → BaseTransition → UserListPage
```

`BaseTransition` 和 `Anonymous Component` 均无明确高度，导致 `UserListPage` 的 `height: 100%` 基于内容高度而非视口高度，flex 子元素无法正确分配空间。

**错误尝试过程**：

1. ❌ 用 JavaScript + ResizeObserver 动态计算高度 → 产生"向上收缩"动画，因初始值与实际值有差距
2. ❌ 纯 CSS flex 方案（移除 height 属性）→ el-table 没有 height 时不启用内部滚动
3. ❌ DataTable 直接设 `height="100%"` → 100% 包含了分页器空间，分页器被挤出
4. ❌ 在 DefaultLayout 的 `.page-main` 上修复 → 问题在页面组件层，不在布局层
5. ✅ 在 UserListPage 上用 `calc(100vh - var(--layout-header-height) - var(--layout-page-padding) * 2)` 直接计算

**最终方案**：

```css
/* DefaultLayout.vue - 定义布局变量 */
.default-layout {
  --layout-header-height: 64px;
  --layout-page-padding: 24px;
}

/* UserListPage.vue - 直接计算，绕过父链高度继承 */
.user-list-page {
  height: calc(100vh - var(--layout-header-height) - var(--layout-page-padding) * 2);
}

/* UserTable.vue - 包装器隔离 DataTable 和分页器 */
.user-table__table-wrapper {
  flex: 1;
  min-height: 0; /* 关键：允许 flex 子元素缩小 */
  overflow: hidden;
}
```

### Suggested Action

在本项目中，所有需要"占满剩余视口高度"的页面组件，都应使用 `calc(100vh - ...)` 而非 `height: 100%`。

### Metadata

- Source: user_feedback
- Related Files: src/views/admin/users/UserListPage.vue, src/views/admin/users/components/UserTable.vue, src/layouts/DefaultLayout.vue
- Tags: layout, height, flex, vue-router, el-table, pagination
- Pattern-Key: harden.page-height-calculation
- Recurrence-Count: 1
- First-Seen: 2026-03-11

---

## [LRN-20260311-002] best_practice

**Logged**: 2026-03-11T00:00:00+08:00
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary

el-table 必须传入 `height` 属性才能启用内部滚动；纯 CSS flex 方案无法替代

### Details

Element Plus 的 `el-table` 组件只有在接收到 `height` 或 `max-height` prop 时，才会在 `.el-table__body-wrapper` 上设置 `overflow: auto`，启用内部滚动。

如果不传 `height`，无论外层 CSS 如何设置，表格都会展开全部内容，不会出现滚动条。

**正确做法**：

```html
<!-- 用包装器 div 承载 flex: 1，DataTable 内部用 height="100%" -->
<div class="table-wrapper">
  <!-- flex: 1; min-height: 0 -->
  <DataTable
    height="100%"
    ...
  />
</div>
```

**错误做法**：

```html
<!-- 不传 height，依赖 CSS 控制滚动 → 不生效 -->
<DataTable ... />
```

### Suggested Action

凡是需要表格内部滚动的场景，必须给 DataTable/el-table 传入 `height` 属性，推荐值为 `"100%"` 配合包装器使用。

### Metadata

- Source: user_feedback
- Related Files: src/views/admin/users/components/UserTable.vue, src/components/ui/table/DataTable.vue
- Tags: el-table, height, scroll, element-plus
- Pattern-Key: harden.el-table-height
- Recurrence-Count: 1
- First-Seen: 2026-03-11
- See Also: LRN-20260311-001

---

## [LRN-20260311-003] best_practice

**Logged**: 2026-03-11T00:00:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: frontend

### Summary

Flex 布局中 `min-height: 0` 是允许子元素缩小的关键，缺少它会导致内容溢出

### Details

CSS Flex 布局中，flex 子元素的默认 `min-height` 是 `auto`（基于内容），这会阻止元素缩小到内容大小以下。

当需要某个 flex 子元素"占据剩余空间但不超出父容器"时，必须显式设置 `min-height: 0`：

```css
.table-wrapper {
  flex: 1;
  min-height: 0; /* 没有这行，内容会溢出父容器 */
  overflow: hidden;
}
```

这是 flex 布局中最常见的"陷阱"之一，在嵌套 flex 容器中尤为重要。

### Suggested Action

凡是 flex 子元素需要"可缩小"的场景，都要检查是否需要 `min-height: 0`（垂直方向）或 `min-width: 0`（水平方向）。

### Metadata

- Source: conversation
- Related Files: src/views/admin/users/components/UserTable.vue
- Tags: flex, min-height, css, layout
- Pattern-Key: harden.flex-min-height
- Recurrence-Count: 1
- First-Seen: 2026-03-11
- See Also: LRN-20260311-001

---

## [LRN-20260311-004] knowledge_gap

**Logged**: 2026-03-11T00:00:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: frontend

### Summary

参考外部库实现时，必须先分析项目结构差异，不能直接套用

### Details

在修复表格高度问题时，参考了 happy-table 项目的实现。happy-table 使用 CSS calc() 计算高度，但其组件结构与本项目不同：

- happy-table：组件自包含，直接控制自身高度
- 本项目：页面组件嵌套在 Vue Router + BaseTransition 中，高度继承链断裂

直接套用 happy-table 的 CSS flex 方案（移除 height 属性）导致问题未解决，浪费了调试时间。

**正确做法**：参考外部实现时，先用 Vue DevTools 分析组件树和高度继承链，再决定适配方案。

### Suggested Action

遇到布局问题时，优先用 Vue DevTools 查看组件树，确认父链中是否有无高度的中间组件（如 BaseTransition、functional component）。

### Metadata

- Source: user_feedback
- Related Files: src/views/admin/users/UserListPage.vue
- Tags: vue-devtools, layout, debugging, component-tree
- Pattern-Key: insight.analyze-before-adapt
- Recurrence-Count: 1
- First-Seen: 2026-03-11
- See Also: LRN-20260311-001

---

| Status              | Meaning                                                      |
| ------------------- | ------------------------------------------------------------ |
| `pending`           | Not yet addressed                                            |
| `in_progress`       | Actively being worked on                                     |
| `resolved`          | Issue fixed or knowledge integrated                          |
| `wont_fix`          | Decided not to address (reason in Resolution)                |
| `promoted`          | Elevated to CLAUDE.md, AGENTS.md, or copilot-instructions.md |
| `promoted_to_skill` | Extracted as a reusable skill                                |

## Skill Extraction Fields

When a learning is promoted to a skill, add these fields:

```markdown
**Status**: promoted_to_skill
**Skill-Path**: skills/skill-name
```

---

## [LRN-20260306-001] git_worktree_workflow_enforcement

**Logged**: 2026-03-06T18:55:00+08:00
**Priority**: critical
**Status**: pending
**Area**: config

### Summary

Git Worktree 工作流必须强制执行,禁止在 develop/main 分支直接开发

### Details

项目 CLAUDE.md 明确规定禁止在 develop/main 分支直接开发,必须使用 Git Worktree 创建功能分支。但在实际开发中,开发者可能忽略此规则直接在 develop 分支提交代码。

**违规场景**:

- 直接在 develop 分支执行 `git add` + `git commit`
- 未使用 `./scripts/git-worktree.sh add feature-xxx` 创建 worktree

**正确流程**:

1. `./scripts/git-worktree.sh add feature-xxx`
2. `cd ../wes_frontend-worktrees/feature-xxx`
3. 开发 → commit → push
4. 创建 PR 合并到 develop
5. `./scripts/git-worktree.sh remove feature-xxx`

### Suggested Action

1. 添加 pre-commit hook 检测当前分支,拒绝在 develop/main 分支提交
2. 在 CI/CD 中添加分支保护规则
3. 在 CLAUDE.md 中增加违规后果说明

---

## [LRN-20260322-001] best_practice

**Logged**: 2026-03-22T20:05:00+08:00
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary

普通搜索条件与高级搜索规则可以同时生效，但不应把普通条件带入高级搜索编辑区，只能以用户语言提示其并行生效关系

### Details

这次高级搜索重构中，用户明确指出一个关键 UX 问题：当页面里已经有普通搜索条件时，再打开高级搜索，不应该把这些普通条件自动带入高级搜索对话框，否则用户会误以为自己正在编辑同一套条件树，造成认知混乱。

验证后确认更合理的交互分层是：

- 普通条件继续显示在搜索栏标签区
- 高级搜索对话框只编辑高级规则自身
- 如果两者会并行生效，只在对话框顶部用用户语言提示，例如“当前还有 N 个普通条件，应用后会与这里的高级规则一起生效”
- 不暴露 `FilterGroup`、编译结果、后端结构等实现概念

这条规则适用于所有“快速搜索 + 高级筛选”组合场景，核心是避免把“运行时组合关系”误表现成“同一编辑对象”。

### Suggested Action

后续所有搜索类界面若同时支持普通条件与高级规则，应默认采用“分开展示、并行生效、用户语言提示”的模式，不要把普通条件并入高级搜索编辑区。

### Metadata

- Source: conversation
- Related Files: src/components/search/AdvancedSearchDialog.vue, src/components/common/CrudToolbar.vue, src/composables/useSmartSearch.ts
- Tags: search, advanced-search, ux, information-architecture, mental-model

---

## [LRN-20260322-002] best_practice

**Logged**: 2026-03-22T20:05:00+08:00
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary

高级搜索对话框的初始焦点必须按“打开来源 + 当前条件状态”定位，不能默认落到关闭按钮或 Footer

### Details

本次会话里对高级搜索做了一轮高标准 UX 评审，最终沉淀出一套可复用的焦点策略：

- 从字段点击进入高级搜索时，首焦点落到刚创建那条条件的主编辑控件，通常是值输入区
- 已有高级条件时，优先聚焦第一条未完成条件；如果都已完整，再聚焦第一条条件的主编辑控件
- 空白状态打开时，聚焦 `+ 条件`
- 清空全部后，焦点回到 `+ 条件`
- 应用收藏替换条件后，焦点进入新的第一条条件
- 关闭对话框后，焦点恢复到打开它的触发元素

这套策略的价值不在于“某个页面刚好这么写”，而在于它符合弹窗编辑任务的主路径设计：用户打开对话框是为了继续编辑，不是为了先操作关闭、取消或底部按钮。

### Suggested Action

后续所有可编辑型对话框，尤其是筛选器、规则构建器、表单向导，都应优先定义“首焦点规则”和“关闭回焦规则”，并在组件层暴露可编程 focus 能力。

### Metadata

- Source: conversation
- Related Files: src/components/search/AdvancedSearchDialog.vue, src/components/search/advanced-search/FilterGroupBuilder.vue, src/components/search/advanced-search/FilterConditionRow.vue, src/components/search/advanced-search/ConditionValueInput.vue
- Tags: dialog, focus, accessibility, keyboard, advanced-search, ux

---

## [LRN-20260322-003] knowledge_gap

**Logged**: 2026-03-22T20:05:00+08:00
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary

本项目做前端 mock 或浏览器自动化走查时，API 成功响应码必须使用字符串成功码（如 `\"1000\"`），不能返回数字 `200`

### Details

在真实页面 `/admin/users` 的 Playwright 走查中，最初为了绕过登录与后端 CORS，采用浏览器侧 route mock 返回菜单和用户列表数据。第一次 mock 虽然结构上接近成功响应，但前端仍然报错：

```text
TypeError: code.startsWith is not a function
```

继续排查发现，本项目的响应码体系不是 HTTP 风格判断，而是字符串业务码，`isSuccessCode` 会直接对 `code` 执行 `startsWith('1')`。因此：

- `code: 200` 会报错，因为是 number
- `code: "200"` 也会被视为失败，因为不以 `1` 开头
- 正确 mock 应为 `code: "1000"` 这类字符串成功码

这是一条高复用的项目级 gotcha。以后做调试页、Playwright 走查、手写接口 mock 时，如果忘记这一点，会把“mock 格式错误”误判成“页面逻辑 bug”。

### Suggested Action

后续所有本地 mock、浏览器 route mock、调试页假数据都要统一使用项目响应包格式，并优先复用真实成功码 `\"1000\"`。

### Metadata

- Source: conversation
- Related Files: src/api/constants/response-codes.ts, src/api/client.ts, src/api/base/crud-api.ts
- Tags: mock, playwright, api, response-code, debugging, project-gotcha

### Metadata

- Source: user_feedback
- Related Files: scripts/git-worktree.sh, CLAUDE.md
- Tags: git, workflow, enforcement
- Recurrence-Count: 1
- First-Seen: 2026-03-06
- Last-Seen: 2026-03-06

---

## [LRN-20260306-002] non_functional_commit_exception

**Logged**: 2026-03-06T18:55:00+08:00
**Priority**: medium
**Status**: pending
**Area**: config

### Summary

非功能性提交(如修复 .gitignore)可以例外直接在 develop 分支提交

### Details

Git Worktree 工作流规定所有开发必须在功能分支进行,但存在例外场景:

- 修复配置文件错误(.gitignore, .eslintrc 等)
- 修复脚本 bug(如 git-worktree.sh)
- 紧急安全补丁
- 文档更新(README, CLAUDE.md)

这些非功能性提交如果也走 worktree 流程,会增加不必要的复杂度。

**判断标准**:

- 不涉及业务逻辑代码
- 不影响功能实现
- 修复影响所有开发者的基础设施问题
- 需要立即生效

### Suggested Action

在 CLAUDE.md 中明确定义"非功能性提交"的范围和审批流程:

1. 配置文件修复
2. 脚本 bug 修复
3. 文档更新
4. 需要技术负责人审批

### Metadata

- Source: user_feedback
- Related Files: CLAUDE.md
- Tags: git, workflow, exception
- Recurrence-Count: 1
- First-Seen: 2026-03-06
- Last-Seen: 2026-03-06

---

## [LRN-20260306-003] frontend_backend_contract_validation

**Logged**: 2026-03-06T18:55:00+08:00
**Priority**: high
**Status**: pending
**Area**: frontend

### Summary

前端开发必须参考后端实际代码,不能凭空想象 API 契约

### Details

在实现权限模块时,用户明确要求"参考后端代码,不要凭空想象"。这暴露了一个常见问题:前端开发者可能基于假设或过时文档实现功能,导致:

- API 调用参数错误
- 响应数据结构不匹配
- 权限逻辑与后端不一致
- 集成测试失败

**正确做法**:

1. 阅读后端源码(FastAPI 路由定义、Pydantic 模型)
2. 查看 OpenAPI 文档(/docs)
3. 与后端开发者确认契约
4. 使用 TypeScript 类型定义强制契约

**本项目实践**:

- 后端路径: `/Users/kaizhou/SynologyDrive/works/wes_backend`
- API 文档: http://localhost:8001/docs
- 类型生成: `pnpm run zod:generate`

### Suggested Action

1. 在 CLAUDE.md 中添加"前后端契约验证"章节
2. 要求所有 API 对接前先阅读后端代码
3. 建立前后端类型同步机制(OpenAPI → TypeScript)
4. Code Review 时检查 API 调用是否与后端一致

### Metadata

- Source: user_feedback
- Related Files: CLAUDE.md, src/api/
- Tags: api, contract, validation, frontend-backend
- Recurrence-Count: 1
- First-Seen: 2026-03-06
- Last-Seen: 2026-03-06

---

## [LRN-20260306-004] code_review_priority_system

**Logged**: 2026-03-06T18:55:00+08:00
**Priority**: medium
**Status**: pending
**Area**: docs

### Summary

建立代码审查优先级系统(P0/P1/P2/P3)提高修复效率

### Details

在权限模块开发中,用户进行了多轮代码审查,使用优先级标记问题:

- **P0**: 阻塞性问题,必须立即修复(如权限加载失败不抛出错误)
- **P1**: 重要问题,影响核心功能(如登出顺序错误)
- **P2**: 一般问题,影响用户体验(如缺少权限提示)
- **P3**: 优化建议,不影响功能(如删除未使用代码)

这种优先级系统的优势:

1. 明确修复顺序,避免纠结次要问题
2. 提高沟通效率,减少来回讨论
3. 帮助开发者理解问题严重性
4. 便于追踪修复进度

### Suggested Action

1. 在 CLAUDE.md 中添加"代码审查优先级定义"
2. 制定每个优先级的修复时限(P0: 立即, P1: 当天, P2: 本周, P3: 下次迭代)
3. 在 PR 模板中添加优先级标签
4. 建立优先级与测试覆盖率的关联(P0 必须有测试)

### Metadata

- Source: user_feedback
- Related Files: CLAUDE.md, .github/pull_request_template.md
- Tags: code-review, priority, workflow
- Recurrence-Count: 1
- First-Seen: 2026-03-06
- Last-Seen: 2026-03-06

---

## [LRN-20260307-001] semantic_state_management_pattern

**Logged**: 2026-03-07T01:00:00+08:00
**Priority**: high
**Status**: promoted
**Category**: best_practice
**Area**: frontend

### Summary

使用语义化状态标志区分"未加载"和"加载后为空",避免重复请求

### Resolution

- **Resolved**: 2026-03-07T01:30:00Z
- **Commit**: 073f64e
- **Promoted**: state-management-semantic-flags (Serena memory)
- **Notes**: 已提升到项目 memory，供后续复用

### Details

**问题场景**: 实现菜单加载时,使用 `menuTree.value.length === 0` 判断是否需要加载。当后端返回空菜单 `[]` 时,每次进入布局都会触发新的加载请求。

**错误代码**:

```typescript
// ❌ 错误: 无法区分"未加载"和"加载后为空"
if (menuTree.value.length === 0) {
  await loadMenus()
}
```

**根因分析**: 空数组 `[]` 是合法的业务状态,不应该被当作"未加载"信号。

**正确做法**: 引入独立的 `hasLoaded` 语义标志

```typescript
// ✅ 正确: 使用独立的语义标志
const hasLoaded = ref(false)
export const isMenuLoaded = computed(() => hasLoaded.value)

const loadMenus = async (forceRefresh = false) => {
  if (!forceRefresh && hasLoaded.value) {
    return // 已尝试加载,无论结果如何都跳过
  }
  // ... 加载逻辑
  hasLoaded.value = true // 加载尝试完成后设置
}

const hydrateMenus = (menuResponses: MenuTreeResponse[]) => {
  const menus = menuResponses.map(toMenuItem)
  setMenuState(menus)
  hasLoaded.value = true // 直接注入数据时也要设置
}
```

**适用场景**:

- 数据初始化(权限、菜单、配置等)
- 可能返回空结果的异步操作
- 需要区分"未开始"、"进行中"、"成功(空)"、"失败"等状态

### Suggested Action

**Promote**: 提升到 CLAUDE.md 作为通用模式

在 CLAUDE.md 的"关键架构模式"章节添加:

````markdown
### 状态管理模式: 语义化状态标志

**原则**: 使用独立的状态标志表示"加载状态",而非依赖数据本身

**模式**:

```typescript
// 1. 定义语义标志
const hasLoaded = ref(false)
const isLoading = ref(false)
const loadError = ref<Error | null>(null)

// 2. 导出计算属性供外部使用
export const isLoaded = computed(() => hasLoaded.value)
export const isPending = computed(() => isLoading.value)

// 3. 加载函数
const loadData = async (forceRefresh = false) => {
  if (!forceRefresh && hasLoaded.value) return

  isLoading.value = true
  try {
    const data = await api.fetch()
    setData(data)
    hasLoaded.value = true
  } catch (error) {
    loadError.value = error
    hasLoaded.value = true // 失败也算"已尝试加载"
  } finally {
    isLoading.value = false
  }
}
```
````

**为什么**: 空数组 `[]`、空对象 `{}`、空字符串 `""` 都是合法的业务状态,不能用作"未加载"的判断依据。

````

### Metadata

- Source: bug_fix
- Related Files: src/composables/useMenu.ts, src/layouts/DefaultLayout.vue
- Tags: state-management, vue3, composable, async
- Pattern-Key: semantic_state.loaded_flag
- Recurrence-Count: 1
- First-Seen: 2026-03-07
- Last-Seen: 2026-03-07

---

## [LRN-20260307-002] api_contract_nullable_precision

**Logged**: 2026-03-07T01:00:00+08:00
**Priority**: high
**Status**: promoted
**Category**: correction
**Area**: frontend

### Summary

前端类型定义必须与后端契约精确匹配,包括可空性

### Details

**问题场景**: 后端 `ApiPermissionInfo` 的 `method` 和 `path` 字段定义为 `str | None`,但前端定义为必填 `string`,导致类型不匹配。

**错误代码**:
```typescript
// ❌ 后端: method: str | None
// ❌ 前端: method: string (必填)
export interface ApiPermissionInfo {
  method: string  // 类型不匹配!
  path: string   // 类型不匹配!
}
````

**根因分析**: 前端开发者可能基于"权限通常有 method/path"的假设,而非实际查看后端代码。

**正确做法**: 完全对齐后端契约

```typescript
// ✅ 精确匹配后端类型
export interface ApiPermissionInfo {
  method?: string | null // 后端: str | None
  path?: string | null // 后端: str | None
}
```

**验证方法**:

1. 阅读后端 Pydantic 模型定义
2. 查看 OpenAPI 文档的 schema 部分
3. 使用 `pnpm run zod:generate` 自动生成类型

**相关学习**: LRN-20260306-003 (frontend_backend_contract_validation)

### Suggested Action

**Promote**: 提升到 CLAUDE.md 强化前后端契约验证

在 CLAUDE.md 的"后端 API 对接规范"章节添加:

```markdown
### 类型契约对齐规则

**强制规则**: 前端类型必须与后端 Pydantic 模型精确匹配,包括:

- 必填/可选(?)
- 可空类型(| null)
- 数组/单值
- 枚举值范围

**验证清单**:

- [ ] 阅读后端 `src/app/*/v1/*.py` 中的 Pydantic 模型
- [ ] 对比 OpenAPI 文档(/docs)的 JSON Schema
- [ ] 运行 `pnpm run zod:generate` 自动生成并对比
- [ ] 检查 Nullable 字段是否使用 `| null`

**常见错误**:

- 后端 `str | None` → 前端 `string` ❌ (缺少 `| null`)
- 后端 `list[str]` → 前端 `string` ❌ (类型错误)
- 后端 `Literal["a", "b"]` → 前端 `string` ❌ (缺少枚举限制)
```

### Metadata

- Source: user_feedback
- Related Files: src/api/modules/auth.ts, src/types/generated/zod-schemas.ts
- Tags: typescript, api-contract, frontend-backend
- Pattern-Key: contract.type_nullable_precision
- See Also: LRN-20260306-003
- Recurrence-Count: 1
- First-Seen: 2026-03-07
- Last-Seen: 2026-03-07

---

## [LRN-20260307-003] semantic_consistency_across_layers

**Logged**: 2026-03-07T01:00:00+08:00
**Priority**: medium
**Status**: promoted
**Category**: best_practice
**Area**: frontend

### Summary

跨层代码应使用统一的语义标志,避免语义分散

### Details

**问题场景**:

- `useMenu.ts` 导出 `isMenuLoaded` 计算属性
- `DefaultLayout.vue` 却直接使用 `menuTree.value.length === 0` 判断
- 导致语义不一致: `useMenu` 认为"已加载",但 `DefaultLayout` 认为"未加载"

**错误代码**:

```typescript
// useMenu.ts 中定义
export const isMenuLoaded = computed(() => hasLoaded.value)

// DefaultLayout.vue 中未使用
if (menuTree.value.length === 0) {
  // ❌ 语义不一致
  await loadMenus()
}
```

**正确做法**: 直接使用 composable 暴露的语义接口

```typescript
// ✅ 使用 composable 的语义接口
const { selectMenu, isMenuLoaded, loadMenus } = useMenu()

if (!isMenuLoaded.value) {
  // ✅ 语义一致
  await loadMenus()
}
```

**原则**: Composable 暴露的接口应该成为唯一的语义来源

**适用场景**:

- 状态判断(是否加载、是否错误、是否为空)
- 操作触发(加载数据、清除缓存)
- 计算属性(设备类型、权限状态)

### Suggested Action

在代码审查中检查:

1. 是否绕过 composable 直接访问内部状态
2. 是否使用不同的语义表达相同概念
3. composable 暴露的接口是否完整

### Metadata

- Source: user_feedback
- Related Files: src/composables/useMenu.ts, src/layouts/DefaultLayout.vue
- Tags: vue3, composable, semantic-consistency
- Pattern-Key: semantic.consistency_across_layers
- Recurrence-Count: 1
- First-Seen: 2026-03-07
- Last-Seen: 2026-03-07

---

## [LRN-20260307-004] element_plus_deep_selector_styling

**Logged**: 2026-03-07T01:00:00+08:00
**Priority**: low
**Status**: promoted
**Category**: best_practice
**Area**: frontend

### Summary

使用 CSS `:deep()` 伪类覆盖 Element Plus 组件内部样式

### Details

**问题场景**: Element Plus 的子菜单组件自动渲染箭头图标,与自定义箭头冲突,导致出现两个箭头。

**解决方案**: 使用 `:deep()` 伪类隐藏 Element Plus 默认元素

```css
/* 隐藏 Element Plus 默认的子菜单箭头图标 */
.sidebar-menu :deep(.el-sub-menu__icon-arrow) {
  display: none !important;
}

/* 自定义箭头旋转逻辑 */
.menu-arrow {
  transition: transform 0.3s ease;
}

.el-sub-menu.is-opened > .el-sub-menu__title .menu-arrow {
  transform: rotate(90deg);
}
```

**关键点**:

1. `:deep()` (Vue 3) 或 `::v-deep` (Vue 2) 穿透作用域
2. 选择器必须精确到 Element Plus 的内部类名
3. 使用 `!important` 提高优先级
4. 避免过度全局污染(限定在父容器内)

**适用场景**:

- 修改 Element Plus 组件默认样式
- 覆盖第三方 UI 庄件样式
- 需要保持作用域隔离的深度样式

### Suggested Action

记录到项目样式指南中,作为 Element Plus 样式覆盖的标准模式。

### Metadata

- Source: bug_fix
- Related Files: src/components/common/AppSidebar.vue, src/components/common/SidebarMenuItem.vue
- Tags: element-plus, css, vue3, styling
- Pattern-Key: ui.deep_selector_override
- Recurrence-Count: 1
- First-Seen: 2026-03-07
- Last-Seen: 2026-03-07

---

## [LRN-20260307-003] correction

**Logged**: 2026-03-07T00:00:00+08:00
**Priority**: high
**Status**: pending
**Area**: frontend

### Summary

搜索能力参考项目修正为 happy-table，而非 happyGrid；后续分析应以 happy-table/packages/core/src/components/DataGrid.vue 为主。

### Details

用户明确指出此前给错参考项目。正确参考仓库为 /Users/kaizhou/SynologyDrive/works/happy-table，核心参考文件为 packages/core/src/components/DataGrid.vue。后续关于主搜索框、工具栏、Popover、Tag 条件、收藏夹等分析，必须优先依据 happy-table 的实现模式，而不是 happyGrid。

### Suggested Action

重新阅读 happy-table 中 DataGrid 及相关搜索组件、类型、事件流，重新提炼智能搜索设计。

### Metadata

- Source: user_feedback
- Related Files: .learnings/LEARNINGS.md
- Tags: correction, happy-table, datagrid, search, toolbar

## [LRN-20260307-004] correction

**Logged**: 2026-03-07T00:00:00+08:00
**Priority**: high
**Status**: pending
**Area**: frontend

### Summary

Popover 中栏不应根据 keyword 动态生成候选条件；中栏应承载系统提供的固定快速搜索条件，keyword 仅用于左栏字段选择后的默认操作符条件生成。

### Details

用户明确说明：主搜索框打开 Popover 后，中栏应该是系统提供的一些快速搜索条件，如“最近 7 天登录”“超级管理员”等，不需要与 keyword 交互。正确交互是：当 keyword 有值时，打开 Popover 后聚焦到左侧字段列表；上下键快速切换字段，回车键选中字段，并使用该字段类型的默认操作符生成搜索条件。后续设计必须以此为准，而不是把中栏设计为 keyword 驱动的动态候选区。

### Suggested Action

修正搜索设计文档：中栏改为固定快速搜索条件面板；keyword 仅用于左栏字段选择后的一键生成逻辑；补充键盘交互规则（上下键/回车/ESC）。

### Metadata

- Source: user_feedback
- Related Files: docs/SMART_SEARCH_DESIGN_V1.md, docs/SMART_SEARCH_COMPONENT_ARCHITECTURE.md, docs/TASKS_SMART_SEARCH.md, docs/USER_MANAGEMENT_SEARCH_CONFIG.md, docs/SMART_SEARCH_IMPLEMENTATION_PLAN_V1.md
- Tags: correction, smart-search, popover, keyboard, quick-search

---

## [LRN-20260307-005] correction

**Logged**: 2026-03-07T02:30:00+08:00
**Priority**: high
**Status**: pending
**Area**: frontend

### Summary

主搜索框的键盘事件应驱动左栏字段高亮，但输入焦点必须继续停留在输入框；字段可选集合要随 keyword 类型扩展，而非只允许文本字段。

### Details

用户进一步澄清：当 keyword 有值时，打开 Popover 后“不是聚焦到左侧字段”，而是输入焦点仍在主输入框中，用户可继续输入；同时 `ArrowUp / ArrowDown` 驱动左栏字段高亮切换，`Enter` 选中当前字段，并按该字段默认操作符生成条件。字段可选规则也需更细：

- 文本输入时至少可选文本字段
- `1 / 0 / true / false / 是 / 否` 等布尔字面量输入时，可同时选中文本字段与布尔字段
- 数值输入时，可同时选中文本字段与数值字段（若业务页存在数值列）

这意味着搜索能力设计不能把“键盘高亮切换”误写成“焦点转移”，也不能把左栏字段候选简化为仅文本字段。

### Suggested Action

在智能搜索设计与实现方案中补充：输入焦点规则、keyword 类型解析规则、可选字段计算规则、默认操作符建条件规则。

### Metadata

- Source: user_feedback
- Related Files: docs/SMART_SEARCH_DESIGN_V1.md, docs/SMART_SEARCH_COMPONENT_ARCHITECTURE.md, docs/TASKS_SMART_SEARCH.md, docs/USER_MANAGEMENT_SEARCH_CONFIG.md, docs/SMART_SEARCH_IMPLEMENTATION_PLAN_V1.md
- Tags: correction, smart-search, keyboard, focus-management, field-eligibility
- See Also: LRN-20260307-004

## [LRN-20260308-001] correction

**Logged**: 2026-03-08T00:00:00+08:00
**Priority**: medium
**Status**: pending
**Area**: docs

### Summary

评审代码时误把“用户管理页未实现”当作智能搜索实现缺陷的一部分

### Details

用户明确指出当前阶段用户管理页尚未实现，因此代码评审应仅聚焦智能搜索能力本身（类型、编译器、composable、组件、调试页与基础集成能力），不应将业务页面未落地视作本轮功能性缺陷。

### Suggested Action

后续评审先确认本轮交付边界，再区分“智能搜索能力缺陷”和“业务接入尚未开始”。

### Metadata

- Source: user_feedback
- Related Files: src/components/search/SmartSearchBar.vue, src/composables/useSmartSearch.ts, src/utils/search-compiler.ts
- Tags: review-scope, correction, smart-search

---

## [LRN-20260309-006] vue*router_5*语法变更

**Logged**: 2026-03-09T18:48:00+08:00
**Priority**: high
**Status**: resolved
**Category**: best_practice
**Area**: frontend

### Summary

Vue Router 5 弃用了导航守卫中的 `next()` 回调语法，应直接使用 return 返回。

### Details

在 Vue Router 5 中，导航守卫函数不再接收 `next()` 回调，而是直接返回值：

**旧语法 (Vue Router 4):**

```typescript
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth !== false && !token) {
    return next('/login')
  }
  return next()
})
```

**新语法 (Vue Router 5):**

```typescript
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth !== false && !token) {
    return '/login'
  }
  return
})
```

**返回重定向对象:**

```typescript
// 旧写法
return next({
  path: '/403',
  query: { redirect: to.fullPath }
})

// 新写法
return {
  path: '/403',
  query: { redirect: to.fullPath }
}
```

### Resolution

- **Resolved**: 2026-03-09
- **Notes**: 已更新 src/router/guards/permission.ts 和 src/router/index.ts

### Metadata

- Source: simplify
- Related Files: src/router/guards/permission.ts, src/router/index.ts
- Tags: vue-router, vue5, breaking-change

---

## [LRN-20260309-007] 组件响应式使用\_shallowRef

**Logged**: 2026-03-09T18:48:00+08:00
**Priority**: medium
**Status**: resolved
**Category**: best_practice
**Area**: frontend

### Summary

Vue 组件存储在响应式对象中会导致性能警告，应使用 `shallowRef` 替代 `ref`。

### Details

当 Vue 组件被存储在 `ref()` 中时，Vue 会使组件对象变为响应式，从而触发警告：

```
[Vue warn]: Vue received a Component that was made a reactive object.
This can lead to unnecessary performance overhead...
```

**问题代码:**

```typescript
import { ref } from 'vue'
import { MonitorIcon } from '@/icons'

const statistics = ref([
  { icon: MonitorIcon, label: '设备' } // 组件被响应式化
])
```

**解决方案:**

```typescript
import { shallowRef } from 'vue'

const statistics = shallowRef([
  { icon: MonitorIcon, label: '设备' } // 组件保持非响应式
])
```

`shallowRef` 只跟踪引用本身，不跟踪对象/数组的内部属性。这对于不需要响应式的静态数据（如图标组件）非常适用。

### Resolution

- **Resolved**: 2026-03-09
- **Notes**: 已更新 src/views/dashboard/Dashboard.vue

### Metadata

- Source: simplify
- Related Files: src/views/dashboard/Dashboard.vue
- Tags: vue3, performance, shallowref

---

## [LRN-20260309-008] 智能聚焦UX模式

**Logged**: 2026-03-09T18:48:00+08:00
**Priority**: low
**Status**: resolved
**Category**: best_practice
**Area**: frontend

### Summary

登录表单出错时，根据已有输入智能定位最需要修正的输入框。

### Details

登录失败时，智能的焦点定位可以改善用户体验：

1. **用户名为空** → 聚焦用户名输入框
2. **用户名有值** → 聚焦密码输入框（密码错误的可能性更大）

**实现方式:**

```typescript
// 登录失败时的智能聚焦
const shouldFocusPassword = form.username.length > 0
setTimeout(() => {
  if (shouldFocusPassword) {
    passwordInput.value?.focus()
  } else {
    usernameInput.value?.focus()
  }
}, 100)
```

**回车键导航:**

- 用户名输入框 → 按回车键，验证后聚焦密码框
- 密码输入框 → 按回车键，提交表单

### Resolution

- **Resolved**: 2026-03-09
- **Notes**: 已在 src/composables/useLoginForm.ts 和 src/views/auth/Login.vue 实现

### Metadata

- Source: user_request
- Related Files: src/composables/useLoginForm.ts, src/views/auth/Login.vue
- Tags: ux, forms, accessibility

---

## [LRN-20260309-009] 使用常量替代字符串字面量

**Logged**: 2026-03-09T18:48:00+08:00
**Priority**: medium
**Status**: resolved
**Category**: best_practice
**Area**: frontend

### Summary

使用定义的常量（ClientErrorCode）而非字符串字面量来表示错误码。

### Details

**问题代码 (字符串字面量):**

```typescript
const AUTH_ERROR_CODES = ['2010', '2011', '2012', '2014']
if (code === '2013') { ... }
```

**解决方案 (使用常量):**

```typescript
import { ClientErrorCode } from '@/api/constants/response-codes'

const AUTH_ERROR_CODES = [
  ClientErrorCode.UNAUTHORIZED,      // '2010'
  ClientErrorCode.INVALID_CREDENTIALS, // '2011'
  ClientErrorCode.INVALID_TOKEN,      // '2012'
  ClientErrorCode.TOKEN_MISSING        // '2014'
]

if (code === ClientErrorCode.TOKEN_EXPIRED) { ... }  // '2013'
```

**优势:**

- 类型安全（自动补全、防止拼写错误）
- 语义清晰（代码意图明确）
- 易于重构（在一处修改即可）
- 自带文档（悬停显示描述）

### Resolution

- **Resolved**: 2026-03-09
- **Notes**: 已更新 src/api/client.ts, src/api/services/auth-error-handler.ts, src/utils/guard-error-handler.ts

### Metadata

- Source: simplify
- Related Files: src/api/client.ts, src/api/services/auth-error-handler.ts, src/utils/guard-error-handler.ts
- Tags: typescript, constants, maintainability

---

## [LRN-20260309-010] token刷新失败处理

**Logged**: 2026-03-09T18:48:00+08:00
**Priority**: high
**Status**: resolved
**Category**: best_practice
**Area**: frontend

### Summary

当 token 刷新失败（2013 错误）时，应将其视为认证错误并清除所有认证状态。

### Details

Token 过期（2013）会触发刷新尝试。如果刷新失败，应用应该：

1. 清除无效 token 和所有认证状态
2. 重定向到登录页面
3. 显示用户友好的提示消息

**实现模式:**

```typescript
if (code === ClientErrorCode.TOKEN_EXPIRED) {
  try {
    const newToken = await handle401Error()
    // 使用新 token 重试
  } catch {
    // 刷新失败 - 作为认证错误处理
    const authError = new ApiResponseError(code, message, timestamp)
    await handleAuthError(authError, { showMessage: true })
    throw authError
  }
}
```

**不要静默忽略刷新失败** - 这会让用户处于看似已登录但无法调用 API 的损坏状态。

### Resolution

- **Resolved**: 2026-03-09
- **Notes**: 已在 src/api/client.ts 实现统一错误处理

### Metadata

- Source: bug_fix
- Related Files: src/api/client.ts, src/api/services/auth-error-handler.ts
- Tags: auth, token-refresh, error-handling

---

---

## [LRN-20260312-001] knowledge_gap

**Logged**: 2026-03-12T15:30:00+08:00
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary

CSS @media 查询不支持 CSS 变量（CSS 规范限制），必须使用固定值

### Details

**问题背景**：在提取响应式断点常量时，尝试将媒体查询中的硬编码断点值替换为 CSS 变量：

```css
/* ❌ 错误：媒体查询不支持 CSS 变量 */
@media (width >= var(--breakpoint-mobile)) and (width < var(--breakpoint-tablet)) {
  /* ... */
}
```

**错误信息**：

```
Stylelint: Unexpected invalid media query "(width >= var(--breakpoint-mobile))"
```

**根本原因**：

- `@media` 查询是**编译时**（parse-time）评估，CSS 解析器在加载样式表时就需要确定媒体查询
- CSS 变量是**运行时**（runtime）计算，依赖 DOM 渲染和样式继承
- 这是 CSS 规范的设计限制，非浏览器 bug

**解决方案 - 三层断点管理架构**：

1. **Tailwind 配置** (`tailwind.config.js`)

   ```js
   screens: {
     sm: '480px',
     md: '768px',
     xl: '1280px'
   }
   ```

   用于 Tailwind 类：`@media (min-width: md)`

2. **TypeScript 常量** (`src/constants/breakpoints.ts`)

   ```ts
   export const BREAKPOINTS = {
     SMALL: 480,
     MOBILE: 768,
     DESKTOP: 1280
   } as const

   export function getDeviceType(width: number): DeviceType
   export function isBreakpoint(width: number, breakpoint: Breakpoint): boolean
   ```

   用于 JS/TS 代码：`isBreakpoint(window.innerWidth, BREAKPOINTS.DESKTOP)`

3. **CSS 变量** (`globals.css`)

   ```css
   :root {
     --search-min-width: 480px;
     --search-max-width: 1280px;
   }

   /* ✅ 组件样式可以使用 CSS 变量 */
   .search-box {
     min-width: var(--search-min-width);
     max-width: var(--search-max-width);
   }

   /* ❌ 媒体查询必须使用固定值 */
   @media (width >= 768px) and (width < 1280px) {
     /* ... */
   }
   ```

   用于组件样式：`min-width: var(--search-min-width)`

4. **媒体查询** (`*.vue`)
   ```css
   /* 必须使用固定值，在注释中说明参考文件 */
   /* 参考：src/constants/breakpoints.ts, tailwind.config.js */
   @media (width >= 768px) and (width < 1280px) {
     /* ... */
   }
   ```

**关键原则**：
| 使用场景 | 可以用 CSS 变量？ | 示例 |
|---------|------------------|------|
| **@media 查询** | ❌ 不可以 | `@media (width >= 768px)` |
| **组件样式** | ✅ 可以 | `min-width: var(--search-min-width)` |
| **属性值** | ✅ 可以 | `color: var(--text-color)` |
| **calc()** | ✅ 可以 | `width: calc(100% - var(--spacing))` |

**文档化依赖关系**：
在媒体查询上方添加注释说明参考文件，确保三层数据保持同步：

```css
/* 注意：@media 查询不支持 CSS 变量，必须使用固定值 */
/* 参考：src/constants/breakpoints.ts, tailwind.config.js */
@media (width >= 768px) and (width < 1280px) {
  /* ... */
}
```

### Suggested Action

已在项目中实施三层架构：

- ✅ 创建 `src/constants/breakpoints.ts`
- ✅ 更新 `tailwind.config.js` 添加断点配置
- ✅ 更新 `src/assets/styles/globals.css` 添加 CSS 变量
- ✅ 更新 Serena memory: `debugging-lessons-vue3-responsive-layout`

后续改进：

- [ ] 编写"响应式设计最佳实践"文档，包含此限制说明
- [ ] 添加 ESLint 规则检测媒体查询中的魔法数字，强制添加注释说明

### Metadata

- Source: error | user_feedback
- Related Files:
  - src/constants/breakpoints.ts
  - tailwind.config.js
  - src/assets/styles/globals.css
  - src/views/admin/users/components/UserToolbar.vue
- Tags: css, media-query, css-variables, responsive-design, breakpoint
- Pattern-Key: css.media-query-no-variables
- Recurrence-Count: 1
- First-Seen: 2026-03-12
- Last-Seen: 2026-03-12

### Resolution

- **Resolved**: 2026-03-12T15:30:00+08:00
- **Notes**: 创建三层断点管理架构，在 Serena memory 中记录"问题 6: CSS 媒体查询不支持变量"，所有 lint 检查通过

---

## [LRN-20260316-001] best_practice

**Logged**: 2026-03-16T09:30:00+08:00
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary

通用 CRUD 组件重构模式：使用 CrudPageLayout + CrudToolbar + CrudTable 替代自定义页面组件

### Details

通过将用户管理页面从自定义组件迁移至通用 CRUD 组件：

- 代码行数减少 51% (630 行 → 306 行)
- 复用通用组件和 composable
- 保留业务特定逻辑（列配置、操作列）

**重构前架构**：

```
UserListPage.vue (~250 行)
├── UserToolbar.vue (~80 行)     # 自定义工具栏
├── UserTable.vue (~100 行)      # 自定义表格
└── useUserListPage.ts (~200 行) # 自定义页面逻辑
总计：~630 行
```

**重构后架构**：

```
UserListPage.vue (~306 行)
├── CrudPageLayout (通用)
├── CrudToolbar (通用)
├── CrudTable (通用)
├── useCrudListPage (通用)
├── useCrudToolbar (通用)
└── useUserTableColumns (保留，列配置)
总计：~306 行 (净减少 324 行)
```

### 迁移步骤

1. **创建 V2 版本并行测试**
   - 复制原页面为 `UserListPageV2.vue`
   - 添加测试路由 `/admin/users-v2`
   - 在开发环境中并行测试

2. **实现通用组件集成**
   - 替换 `UserToolbar` → `CrudToolbar`
   - 替换 `UserTable` → `CrudTable`
   - 替换 `useUserListPage` → `useCrudListPage`
   - 保留业务特定逻辑：
     - `useUserTableColumns.ts` - 列配置 composable
     - `tableColumns.ts` - 操作列定义

3. **验证 V2 功能完整**
   - 智能搜索功能
   - 表格排序、分页
   - 行选择、批量操作
   - 列配置持久化
   - 响应式断点显示

4. **更新主路由指向 V2**

   ```typescript
   // src/router/index.ts
   {
     path: 'admin/users',
     name: 'UserList',
     component: () => import('@/views/admin/users/UserListPage.vue'),
     meta: {
       requiresAuth: true,
       permission: 'admin:user:list',
       title: '用户管理',
     },
   },
   // 删除 /admin/users-v2 测试路由
   ```

5. **删除旧版文件和测试路由**
   - `UserListPage.vue` (旧版)
   - `UserToolbar.vue`
   - `UserTable.vue`
   - `useUserListPage.ts`

6. **运行 lint 验证**
   ```bash
   pnpm lint  # TypeScript + ESLint + Prettier + Stylelint
   ```

### 关键保留逻辑

**列配置 Composable** (`useUserTableColumns.ts`):

```typescript
// 响应式断点系统
export type ColumnVisibleFrom = 'desktop' | 'tablet' | 'mobile'

// 预创建 Map 避免重复创建 (效率优化)
const DEFAULT_COLUMN_CONFIG_MAP = new Map(DEFAULT_COLUMN_CONFIG.map(column => [column.key, column]))
```

**操作列构建器** (`tableColumns.ts`):

```typescript
export function buildUserActionsColumn(options: {
  canEdit?: boolean
  canResetPassword?: boolean
  canDelete?: boolean
  onEdit?: (user: User) => void
  onResetPassword?: (user: User) => void
  onDelete?: (user: User) => void
}): TableColumnConfig {
  // 构建操作按钮数组
  return buildActionsColumn(buttons, { ... })
}
```

### Suggested Action

此重构模式可推广至其他 CRUD 页面：

- 角色管理页
- 权限管理页
- 设备管理页
- 作业线管理页

每个页面的迁移成本约 2-4 小时，代码减少 40-60%。

### Metadata

- Source: conversation
- Related Files:
  - src/views/admin/users/UserListPage.vue
  - src/components/common/CrudPageLayout.vue
  - src/components/common/CrudToolbar.vue
  - src/components/common/CrudTable.vue
  - src/composables/useCrudListPage.ts
  - src/views/admin/users/composables/useUserTableColumns.ts
  - src/views/admin/users/tableColumns.ts
- Tags: crud, refactoring, component-reuse, composable, vue3
- Pattern-Key: refactor.crud_migration
- Recurrence-Count: 1
- First-Seen: 2026-03-16
- Last-Seen: 2026-03-16

### Resolution

- **Resolved**: 2026-03-16T09:30:00+08:00
- **Commit**: 540e0a8
- **Notes**: 已完成迁移并提交，代码减少 1317 行，lint 检查全部通过

---

---

## [LRN-20250326-001] knowledge_gap

**Logged**: 2026-03-26T14:05:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: frontend

### Summary

使用 Git worktree 开发新功能时，运行菜单同步脚本未能同步新菜单，原因是脚本默认读取主仓库而非当前 worktree。

### Details

项目强制使用 Git worktree 开发模式（`feature/*` 分支在独立目录）。`sync_menus.sh` 脚本默认解析 `/Users/kaizhou/SynologyDrive/works/wes_frontend/src/router/index.ts`（主仓库 develop 分支），但开发中的代码在 worktree 目录（如 `wes_frontend-worktrees/role_manage`）。

这导致：

- 新添加的路由（如角色管理）在主仓库中不存在
- 运行脚本后数据库中没有新菜单
- 用户困惑为什么同步不成功

### Suggested Action

使用 `--frontend-path` 参数指定当前 worktree 路径：

```bash
# 预览模式
bash scripts/data/sync_menus.sh --frontend-path /Users/kaizhou/SynologyDrive/works/wes_frontend-worktrees/role_manage --preview

# 正式同步
bash scripts/data/sync_menus.sh --frontend-path /Users/kaizhou/SynologyDrive/works/wes_frontend-worktrees/role_manage
```

或在合并到主仓库后再运行同步脚本。

### Metadata

- Source: error
- Related Files:
  - `wes_backend/scripts/data/sync_menus.sh`
  - `wes_backend/scripts/data/sync_menus.py`
  - `wes_backend/src/utils/frontend_menu_parser.py`
- Tags: git-worktree, menu-sync, development-workflow

### Resolution

- **Resolved**: 2026-03-26T14:10:00+08:00
- **Solution**: 使用 `--frontend-path` 参数指定 worktree 路径后成功同步
- **Notes**: 这是 worktree 开发模式的固有问题，脚本设计时假设在 main worktree 中运行

---

## [LRN-20250328-001] backend-unstable-api-migration

**Logged**: 2026-03-28T14:00:00Z
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary

后端 API 不稳定时，完全迁移到 OpenAPI 生成客户端优于手动维护，因为契约变更会立即在编译期暴露而非运行时。

### Details

用户最初担心"后端还在开发阶段，API 并不是稳定的，会经常变"，犹豫是否迁移到生成客户端。

经过架构审查，决定采用**完全迁移**方案（而非渐进式），原因：

1. **路径漂移从隐式变显式**：手动维护时，后端变更导致前端路径漂移，问题在运行时暴露；生成客户端让契约不匹配立即表现为编译错误
2. **迁移成本是一次性的**：完成迁移后，后端变更只需重新生成客户端，无需手动修改多处代码
3. **契约驱动开发**：强制前后端保持契约同步，问题发现更早

### Suggested Action

对于类似"后端不稳定，是否使用生成代码"的决策场景，推荐完全迁移方案。

### Metadata

- Source: architecture_decision
- Related Files: src/api/modules/\*.ts, scripts/generate-api-types.ts
- Tags: openapi, contract-driven, api-client
- **See Also**: LRN-20260323-001 (路由顺序问题)

### Resolution

- **Resolved**: 2026-03-28T14:30:00Z
- **Commit/PR**: #13
- **Notes**: 迁移后类型检查、测试、契约验证全部通过

---

## [LRN-20250328-002] readonly-resource-factory-limitation

**Logged**: 2026-03-28T14:00:00Z
**Priority**: medium
**Status**: resolved
**Area**: frontend

### Summary

只读资源（如 auditLog）无法使用 createCrudResourceApi/createSoftDeleteCrudApi，因为 TypeScript 类型约束要求必须存在 POST/PUT/DELETE 端点。

### Details

`CrudResourceCollectionPath` 类型约束要求资源必须同时满足：

- POST /collection (创建)
- GET /{id} (详情)
- PUT /{id} (更新)
- DELETE /{id} (删除)
- POST /query (查询)

auditLog 只有 GET /{id} 和 POST /query，因此被类型系统排除。

解决方案：手动实现只读接口，或等待出现第 2-3 个类似需求时提取公共工厂函数。

### Suggested Action

- 当前：保持手动实现（遵循 YAGNI 原则）
- 未来：当出现多个只读资源时，添加 createReadonlyResourceApi 工厂函数

### Metadata

- Source: debugging
- Related Files: src/api/base/crud-api.ts, src/api/modules/auditLog.ts
- Tags: typescript, crud, factory-pattern, readonly

### Resolution

- **Resolved**: 2026-03-28T14:30:00Z
- **Notes**: auditLog.ts 手动实现 getById 和 query 方法，复用 PaginationData 类型

---

## [LRN-20250328-003] hybrid-api-architecture-pattern

**Logged**: 2026-03-28T14:00:00Z
**Priority**: medium
**Status**: resolved
**Area**: frontend

### Summary

项目采用三层混合架构处理不同 API 资源：生成客户端 + CRUD 工厂 + 手动实现。

### Details

| 资源类型      | 实现方式                  | 示例                         |
| ------------- | ------------------------- | ---------------------------- |
| 纯 CRUD       | `createSoftDeleteCrudApi` | workline, device, role       |
| CRUD + 自定义 | 工厂 + 生成客户端别名     | user, menu, apiApplication   |
| 只读资源      | 手动实现                  | auditLog                     |
| 直接透传      | 导出生成客户端            | callback, event, performance |

关键决策：自定义方法通过生成客户端别名实现，而非重新实现：

```typescript
export const userApi = {
  ...baseUserApi,
  resetPassword: userGeneratedApi.password // 别名
}
```

### Suggested Action

后续新增 API 模块时，按此分类选择实现方式。

### Metadata

- Source: best_practice
- Related Files: src/api/modules/\*.ts
- Tags: architecture, api-pattern, code-generation

---

## [LRN-20250328-004] pagination-data-import-dry

**Logged**: 2026-03-28T14:00:00Z
**Priority**: low
**Status**: resolved
**Area**: frontend

### Summary

工程审查中发现 PaginationData 在 auditLog.ts 中重复定义，应从 crud-api.ts 导入。

### Details

原始代码：

```typescript
// auditLog.ts
export interface PaginationData<TItem> { ... }  // ❌ 重复定义
```

修复后：

```typescript
import type { PaginationData } from '@/api/base/crud-api' // ✅ 复用
```

### Suggested Action

审查时主动检查类型导出复用，避免重复定义。

### Metadata

- Source: code_review
- Related Files: src/api/modules/auditLog.ts
- Tags: dry, types, review

### Resolution

- **Resolved**: 2026-03-28T13:45:00Z
- **Commit**: a11ea9a

---
