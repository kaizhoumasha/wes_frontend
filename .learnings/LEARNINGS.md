# Learnings

Corrections, insights, and knowledge gaps captured during development.

**Categories**: correction | insight | knowledge_gap | best_practice
**Areas**: frontend | backend | infra | tests | docs | config
**Statuses**: pending | in_progress | resolved | wont_fix | promoted | promoted_to_skill

## Status Definitions

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
