# 智能搜索能力首批代码实现方案

> **项目**: P9 WES 前端项目  
> **能力主题**: 智能搜索（Smart Search）  
> **文档版本**: v1.0  
> **创建日期**: 2026-03-07  
> **前置文档**: `docs/SMART_SEARCH_DESIGN_V1.md`、`docs/SMART_SEARCH_COMPONENT_ARCHITECTURE.md`、`docs/TASKS_SMART_SEARCH.md`、`docs/USER_MANAGEMENT_SEARCH_CONFIG.md`

---

## 1. 文档目标

本文档用于把“智能搜索能力”从设计文档推进到**首批代码可实施方案**。

它回答的是以下问题：

1. 第一批应该先写哪些文件。
2. 每个文件首版应包含哪些内容。
3. 哪些能力先做，哪些能力延后。
4. 如何以最小风险接入用户管理页。
5. 如何避免在编码阶段走偏或过度设计。

本文档不直接替代代码实现，但其粒度应足以支持开发者按步骤落地。

---

## 2. 实施总原则

## 2.1 先协议，后状态，最后 UI

智能搜索不是先画 UI 再拼逻辑，而应遵循：

1. 先定义类型协议
2. 再实现编译器
3. 再实现统一状态源
4. 最后实现主搜索框、Popover、高级搜索弹窗

原因：

- 搜索的复杂度根源在“条件模型”而不是“界面样式”
- 若先写 UI，很容易把协议耦合在组件内部
- 若协议先冻结，后续 UI 与业务接入都更稳

## 2.2 第一批只做 MVP 闭环

首批代码实现必须聚焦以下闭环：

- 主搜索框可展示条件 Tag
- Popover 可生成条件
- 高级搜索弹窗可编辑条件
- 条件可编译为 `FilterGroup`
- 用户管理页能使用该结果驱动列表查询

首批不做：

- OR / NOT 图形化条件组
- 收藏夹管理中心
- 服务端持久化收藏夹
- 搜索高亮
- 搜索历史

## 2.3 不破坏现有 CRUD 页面

智能搜索是新增能力，不是对现有所有列表页的强制重写。

首批落地要求：

- 不破坏 `src/composables/useCrudApi.ts:1`
- 不破坏 `src/api/base/crud-api.ts:1` 的现有简写筛选调用方式
- 用户管理页作为首个试点页面独立接入

---

## 3. 第一批代码落地顺序

建议严格按如下顺序开发：

### Phase 1：协议与编译

1. `src/types/search.ts`
2. `src/utils/search-compiler.ts`
3. `src/api/base/crud-api.ts` 类型增强（仅最小改动）

### Phase 2：统一状态源

4. `src/composables/useSmartSearch.ts`

### Phase 3：基础 UI 组件

5. `src/components/search/SearchConditionTag.vue`
6. `src/components/search/SmartSearchBar.vue`
7. `src/components/search/panels/SearchFieldPanel.vue`
8. `src/components/search/panels/SearchQuickPanel.vue`
9. `src/components/search/panels/SearchFavoritePanel.vue`
10. `src/components/search/SearchPopoverPanel.vue`

### Phase 4：高级编辑能力

11. `src/components/search/ConditionEditorRow.vue`
12. `src/components/search/FavoriteSearchList.vue`
13. `src/components/search/AdvancedSearchDialog.vue`

### Phase 5：业务接入

14. 用户管理页定义字段配置与收藏夹配置
15. 用户管理页接入搜索组件与状态源
16. 用户管理页联调查询

---

## 4. Phase 1：协议与编译实现方案

## 4.1 `src/types/search.ts`

### 首版必须包含

```ts
export type SearchDataType = 'text' | 'number' | 'date' | 'boolean' | 'enum'

export type SearchOperator =
  | 'contains'
  | 'equals'
  | 'notEquals'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'in'
  | 'isEmpty'
  | 'notEmpty'

export interface SearchFieldDef {
  key: string
  label: string
  dataType: SearchDataType
  searchable?: boolean
  defaultOperator?: SearchOperator
  quickOps?: SearchOperator[]
  options?: Array<{ label: string; value: unknown }>
  placeholder?: string
}

export type SearchKeywordKind = 'empty' | 'text' | 'number' | 'boolean' | 'date'

export interface SearchCondition {
  id: string
  field: string
  operator: SearchOperator
  value?: unknown
  label: string
  source?: 'manual' | 'quick' | 'favorite'
}

export interface SearchFavorite {
  id: string
  name: string
  conditions: SearchCondition[]
  scope?: string
}

export interface QuickSearchPreset {
  id: string
  label: string
  description?: string
  conditions: Array<Omit<SearchCondition, 'id' | 'label'>>
}

export interface SmartSearchState {
  keyword: string
  activeField?: string
  conditions: SearchCondition[]
  favorites: SearchFavorite[]
  popoverOpen: boolean
  advancedDialogOpen: boolean
}
```

### 首版不要放入

- UI 主题类型
- 样式类名
- 页面专属业务字段
- 请求函数

### 代码要求

- 保持纯类型文件
- 不引入 Vue
- 尽量避免业务耦合命名

---

## 4.2 `src/utils/search-compiler.ts`

### 首版建议实现函数

```ts
export function buildConditionLabel(
  draft: Omit<SearchCondition, 'id' | 'label'>,
  fieldDefs: SearchFieldDef[]
): string

export function compileCondition(
  condition: SearchCondition,
  fieldDefs: SearchFieldDef[]
): FilterCondition | null

export function compileConditions(
  conditions: SearchCondition[],
  fieldDefs: SearchFieldDef[]
): FilterGroup | undefined
```

### 首版实现要求

#### `buildConditionLabel`

- 根据字段 label + operator + value 生成自然语言文案
- 文案规则优先支持：
  - `contains`
  - `equals`
  - `startsWith`
  - 布尔 `equals`

#### `compileCondition`

- 文本字段：
  - `contains -> ilike + %value%`
  - `startsWith -> ilike + value%`
  - `equals -> eq`
- 布尔字段：
  - `equals -> eq`
- 暂不支持的操作符返回 `null` 或明确注释说明

#### `compileConditions`

- 过滤掉 `null` 结果
- 空数组返回 `undefined`
- 非空数组统一编译为：

```ts
{
  couple: 'and',
  conditions: [...]
}
```

### 首版实现禁区

- 不支持 OR 组
- 不支持嵌套组
- 不支持异步逻辑
- 不依赖页面配置以外的全局状态

---

## 4.3 `src/api/base/crud-api.ts` 最小增强

### 改动目标

当前 `QueryOptions.filters` 类型过于保守。建议最小改动为：

```ts
type QueryFilters = Record<string, unknown> | FilterGroup

export interface QueryOptions extends PaginationParams {
  filters?: QueryFilters
  sort?: Array<{ field: string; order: 'asc' | 'desc' }>
  max_depth?: number
  include_deleted?: boolean
}
```

### 运行时逻辑建议

现有 `normalizeFilters()` 保留，只增加类型友好度，不重写逻辑。

### 首版要求

- 不修改现有页面调用方式
- 不影响 `filters: { username: 'admin' }` 这类旧调用
- 不在此阶段扩展额外查询能力

---

## 5. Phase 2：`useSmartSearch` 实现方案

## 5.1 文件

- `src/composables/useSmartSearch.ts`

## 5.2 首版职责

- 管理 `keyword`
- 管理 `activeField`
- 管理 keyword 类型解析结果与可选字段集合
- 管理条件数组
- 管理收藏夹
- 管理系统快捷预设
- 管理 Popover / Dialog 开关
- 输出编译结果

## 5.3 推荐内部结构

```ts
export function useSmartSearch(options: UseSmartSearchOptions): UseSmartSearchReturn {
  // 1. state
  // 2. computed
  // 3. condition actions
  // 4. favorite actions
  // 5. ui state actions
  // 6. compile action
  // 7. return api
}
```

## 5.4 首版必须提供的方法

- `setKeyword`
- `setActiveField`
- `addCondition`
- `removeCondition`
- `replaceCondition`
- `clearConditions`
- `applyFavorite`
- `applyQuickPreset`
- `buildConditionFromActiveField`
- `compileToFilterGroup`
- `openPopover / closePopover`
- `openAdvancedDialog / closeAdvancedDialog`

## 5.5 ID 生成建议

首版不引入复杂 UUID 库，可直接：

```ts
const conditionId = `cond_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
```

### 原因

- 足够满足前端条件项唯一性
- 无需额外依赖

## 5.6 首版逻辑要求

### `addCondition`

- 自动补齐 `id`
- 自动调用 `buildConditionLabel`
- 条件写入状态数组

### `replaceCondition`

- 替换指定条件
- 自动重新生成 `label`

### `applyFavorite`

- 将收藏夹中的条件批量插入
- 建议重新生成新 `id`，避免重复 key

### `applyQuickPreset`

- 将系统快捷预设中的条件批量插入
- 预设不依赖 keyword

### `buildConditionFromActiveField`

- 使用当前高亮字段 + `keyword` 生成条件
- 默认操作符取自字段配置 `defaultOperator`
- 文本值原样进入条件
- 布尔值需先解析为 `true / false`

### `compileToFilterGroup`

- 委托 `search-compiler.ts`
- composable 不直接写协议转换逻辑

---

## 6. Phase 3：基础 UI 组件实现方案

## 6.1 `SearchConditionTag.vue`

### 首版目标

- 渲染标签文案
- 删除按钮
- 可选来源样式

### 技术建议

- 基于 `ElTag`
- 删除按钮可用 `closable` 或自定义 close icon

### 实现注意

- 文案过长时需截断
- 但 hover 应可看到完整内容（tooltip 可后续加）

---

## 6.2 `SmartSearchBar.vue`

### 首版目标

- 渲染多个条件 Tag
- 提供一个输入区
- 支持点击/聚焦打开 Popover
- 提供高级搜索入口
- 支持 Backspace 删除最后一个 Tag
- 支持 `ArrowUp / ArrowDown` 切换左栏字段高亮
- 支持 `Enter` 直接按默认操作符生成条件

### 技术建议

- 外层自定义容器，不直接用 `ElInput` 作为全部容器
- 内部使用原生 `input` 或轻量输入节点承载 keyword
- Tag 使用 `SearchConditionTag`
- 打开 Popover 使用 `ElPopover`

### 为什么不直接用纯 `ElInput`

因为主搜索框需要：

- 多 Tag 内嵌
- 输入光标
- 自定义清空区
- 高级搜索按钮

纯 `ElInput` 不适合作为最终容器。

### 首版事件建议

- `update:keyword`
- `remove-condition`
- `open-popover`
- `open-advanced`
- `clear`
- `keydown-up`
- `keydown-down`
- `keydown-enter`

---

## 6.3 `SearchFieldPanel.vue`

### 首版目标

- 展示可搜索字段
- 高亮当前 activeField
- 点击切换字段

### 技术建议

- 使用垂直列表
- 当前项高亮
- 可使用 `ElScrollbar`

### 首版不做

- 字段分组
- 字段拖拽
- 字段搜索

---

## 6.4 `SearchQuickPanel.vue`

### 首版目标

- 展示系统固定快速预设
- 点击预设后即添加一条或一组条件

### 实现建议

不要一开始做成复杂规则引擎。首版直接由页面传入 `QuickSearchPreset[]`，中栏只做展示与事件转发。

### 推荐辅助函数

```ts
function normalizeQuickPreset(
  preset: QuickSearchPreset
): Array<Omit<SearchCondition, 'id' | 'label'>>
```

### 首版生成策略

- 系统快速预设完全独立于 keyword
- keyword 仅参与左栏字段选择后的默认操作符建条件流程
- 中栏预设可一键生成 1 条或多条条件

---

## 6.5 `SearchFavoritePanel.vue`

### 首版目标

- 展示收藏夹列表
- 点击应用收藏夹
- 无收藏时显示空状态

### 技术建议

- 使用简洁列表项
- 每项展示名称和条件数（可选）

---

## 6.6 `SearchPopoverPanel.vue`

### 首版目标

- 三栏整体布局
- 接收字段、keyword、系统预设、收藏夹
- 抛出：字段切换 / 快捷预设应用 / 收藏夹应用

### 技术建议

- 容器层只做布局与转发
- 不重复持有本地条件状态

### 响应式要求

- 宽屏三栏
- 中屏双层压缩
- 窄屏上下堆叠

### 交互补充

- 主输入框焦点保持在 input 内
- `ArrowUp / ArrowDown` 仅切换左栏高亮字段
- `Enter` 使用左栏高亮字段的默认操作符生成条件
- 中栏始终展示固定系统预设

---

## 7. Phase 4：高级搜索弹窗实现方案

## 7.1 `ConditionEditorRow.vue`

### 首版目标

- 编辑单个条件
- 字段切换 -> 操作符切换 -> 值控件切换

### 首版支持控件

- `text` → `ElInput`
- `boolean` → `ElSelect`

### 为什么先只做这两类

因为用户管理首个试点目前只需要：

- 文本字段
- 布尔字段

数字和日期控件可以在后续业务接入时再补。

---

## 7.2 `FavoriteSearchList.vue`

### 首版目标

- 为高级搜索弹窗复用收藏夹列表
- 避免与 Popover 右栏重复写一套列表 UI

---

## 7.3 `AdvancedSearchDialog.vue`

### 首版目标

- 展示当前所有条件
- 支持新增、编辑、删除、清空
- 支持应用收藏夹
- 点击“应用搜索”后通知页面触发查询

### 技术建议

- 使用 `ElDialog`
- 左侧：条件列表
- 右侧：条件编辑器 + 收藏夹区
- 底部：`清空全部 / 取消 / 应用搜索`

### 首版实现策略

建议直接编辑共享状态，不引入临时副本。

### 原因

- 可以降低同步复杂度
- 首版更容易确保主搜索框和弹窗状态一致

### 风险控制

- 取消按钮语义是“关闭弹窗”，不是“回滚所有改动”
- 若未来要求支持草稿回滚，再单独升级为草稿模式

---

## 8. Phase 5：用户管理页接入方案

## 8.1 建议新增文件

首版可先在用户管理模块内新增：

- `src/views/admin/users/search-config.ts`

用于承载：

- `userSearchFields`
- `userSearchFavorites`

### 为什么单独抽文件

- 避免页面文件过重
- 便于后续复用和独立维护

---

## 8.2 页面接入步骤

### Step 1

创建搜索配置：

- `userSearchFields`
- `userSearchFavorites`

### Step 2

在用户管理页面调用：

```ts
const smartSearch = useSmartSearch({
  fields: userSearchFields,
  favorites: userSearchFavorites
})
```

### Step 3

定义统一应用函数：

```ts
async function applySmartSearch() {
  await fetchList({
    page: 1,
    filters: smartSearch.compileToFilterGroup(),
    sort: [{ field: 'updated_at', order: 'desc' }]
  })
}
```

### Step 4

将以下动作绑定到 `applySmartSearch()`：

- 快速条件插入后
- 收藏夹应用后
- 高级搜索点击“应用搜索”后
- 删除 Tag 后
- 清空条件后

### Step 5

将普通刷新与搜索刷新区分：

- 搜索应用：回到第 1 页
- 普通刷新：保持当前页码

---

## 9. 第一批代码提交建议

建议按以下顺序提交，降低 review 难度：

### Commit 1

- `feat(search): add smart search types and compiler`

### Commit 2

- `feat(search): add useSmartSearch composable`

### Commit 3

- `feat(search): add smart search bar and popover panels`

### Commit 4

- `feat(search): add advanced search dialog`

### Commit 5

- `feat(user): integrate smart search into user management`

---

## 10. 首批实现后的验证建议

## 10.1 类型验证

- `search.ts` 类型是否被组件与页面正确复用
- `compileToFilterGroup()` 返回值是否与 `QueryOptions.filters` 兼容

## 10.2 状态验证

- 主搜索框加条件后，弹窗是否同步
- 弹窗改条件后，主搜索框是否同步
- 收藏夹应用后，条件数组是否正确生成新 ID

## 10.3 页面联调验证

- 搜索应用是否回到第一页
- 刷新是否保留当前条件
- 删除最后一个 Tag 后是否恢复默认查询
- 搜索与现有分页逻辑是否冲突

---

## 11. 首批实现禁区

- 不要同时实现所有字段类型编辑器
- 不要引入复杂条件组编辑器
- 不要把收藏夹持久化一并带上
- 不要先写漂亮动画再补协议层
- 不要绕开 `useSmartSearch` 在页面里直接组装条件

---

## 12. 最终结论

智能搜索能力首批实现，应以“最小完整闭环”为目标：

- 有稳定协议
- 有统一状态源
- 有主搜索框
- 有 Popover 三栏
- 有高级搜索弹窗
- 有用户管理首个落地

只要按本方案实施，就可以在不推翻现有 `wes_frontend` 请求与页面结构的前提下，建立一套真正具备产品亮点的搜索能力基线。

---

## 13. 推荐下一步

现在有两个合理选择：

1. 继续输出 **《智能搜索首批代码骨架清单》**
2. 直接开始第一批代码实现，从以下文件起步：
   - `src/types/search.ts`
   - `src/utils/search-compiler.ts`
   - `src/composables/useSmartSearch.ts`
