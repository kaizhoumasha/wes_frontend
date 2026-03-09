# 智能搜索能力设计文档 v1

> **项目**: P9 WES 前端项目  
> **能力主题**: 智能搜索（Smart Search）  
> **文档版本**: v1.0  
> **创建日期**: 2026-03-07  
> **适用阶段**: 阶段三及后续业务模块开发

---

## 1. 文档目标

本文档用于为 `wes_frontend` 定义一套**可复用、可扩展、具备产品辨识度**的智能搜索能力。

该能力将作为后续：

- 用户管理
- 角色管理
- 设备管理
- 作业线管理
- 审计日志

等后台列表型页面的统一搜索入口。

本文档的目标不是对当前项目已有“普通搜索栏”做局部修补，而是：

1. 借鉴 `happy-table` 的交互逻辑与过滤协议设计。
2. 基于当前项目真实技术栈（Vue 3 + Element Plus + alova + `useCrudApi`）进行**重新设计**。
3. 形成一套具备工程可实施性的搜索能力规范，包括：
   - 产品目标
   - 信息架构
   - 交互流程
   - 数据模型
   - 组件设计
   - API 映射
   - 实施步骤
   - 约束条件与验收标准

---

## 2. 设计背景

### 2.1 为什么搜索能力要单独设计

后台业务系统中的列表页面数量多、筛选维度多、查询频率高。传统的：

- 输入框 + 查询按钮
- 若干零散筛选项
- 一个“高级筛选”按钮

通常会导致以下问题：

1. 查询表达能力弱，复杂查询需要频繁切换弹窗。
2. 已应用条件不可视，用户不知道当前列表为何被筛选。
3. 高级筛选与主搜索入口割裂，学习成本高。
4. 每个业务页面各自实现搜索逻辑，难以统一体验。
5. 搜索与分页、刷新、收藏、结果反馈无法形成完整闭环。

因此，搜索能力需要提升为**独立的产品能力**，而不是页面附属控件。

### 2.2 借鉴来源

本方案借鉴 `happy-table` 的以下设计思想：

- 统一过滤协议：`FilterConfig`
- 条件 Tag 可视化表达
- 快速搜索与普通过滤共存
- 输入容器内显示已选项/Tag 的交互模式

参考实现位置：

- `../happy-table/packages/core/src/types/index.ts`
- `../happy-table/packages/core/src/plugins/core/filtering-plugin.ts`
- `../happy-table/packages/core/src/components/shared/FilterBar.vue`
- `../happy-table/packages/core/src/components/primitives/HtSelect/HtSelectTrigger.vue`

### 2.3 本项目约束

本方案必须适配 `wes_frontend` 当前真实工程条件：

- UI 基础组件：Element Plus
- 请求层：`src/api/client.ts`
- CRUD 请求封装：`src/api/base/crud-api.ts`
- 列表状态封装：`src/composables/useCrudApi.ts`
- 通用请求状态：`src/composables/useRequest.ts`
- 权限体系：`src/composables/usePermission.ts`

**重要约束**：

- 不沿用当前项目旧式普通搜索栏交互。
- 不引入与 Element Plus 平行的新 UI 组件体系。
- 不改造现有 API 主体架构，只在必要处做最小增强。
- 搜索能力必须可落到当前后端分页查询协议上。

---

## 3. 设计原则

### 3.1 条件优先，而非文本优先

搜索不是“输入一段文本”，而是“构建一组查询条件”。

### 3.2 主搜索框是条件编排器，不是普通 Input

主搜索框要能承载：

- 条件 Tag
- 输入光标
- Popover 工作台入口
- 快速条件插入

### 3.3 高级搜索弹窗是核心组件，而非附加功能

主搜索框负责高频快用，高级搜索弹窗负责完整编辑；两者共同构成完整搜索能力。

### 3.4 搜索状态必须可视化

所有已生效条件必须以可读、可删除、可编辑的 Tag 或条件条形式呈现。

### 3.5 搜索能力与列表能力解耦，但与查询协议强绑定

搜索 UI 层独立设计，但最终必须稳定映射到统一查询协议。

### 3.6 先做高价值 MVP，再做复杂逻辑扩展

首版先解决 80% 高频场景，不在一开始引入复杂逻辑树编辑器。

---

## 4. 能力边界

## 4.1 本能力包含

1. 主搜索框（Smart Search Bar）
2. 搜索 Popover（三栏工作台）
3. 高级搜索弹窗（完整条件编辑器）
4. 条件 Tag 体系
5. 快速搜索模板体系
6. 收藏夹搜索条件体系
7. 条件编译为后端查询条件的映射能力
8. 与分页/刷新/重置联动的搜索状态管理

## 4.2 本能力不包含

1. 全文搜索引擎能力
2. AI 自然语言搜索解释器
3. 复杂可视化布尔表达式拖拽编辑器（首版不做）
4. 跨用户共享收藏夹（首版不做）
5. 搜索结果服务端高亮（首版不做）

---

## 5. 产品定位

### 5.1 一句话定义

智能搜索能力是一套面向后台业务列表的**条件驱动式搜索系统**，通过主搜索框、Popover 工作台与高级搜索弹窗的协同，帮助用户以更低认知成本构建复杂查询。

### 5.2 用户价值

- 看得见：已应用条件始终可见
- 改得快：Tag 可删可编，条件可以快速调整
- 学得会：主入口和高级模式统一心智
- 复用强：收藏夹复用高频查询
- 一致性高：多业务模块共用统一搜索语言

### 5.3 适用页面

优先适用于：

- 数据表格列表页
- 分页查询页
- 审计/日志页
- 带多条件筛选的管理页

---

## 6. 信息架构

智能搜索能力由 4 个核心部分组成：

```text
智能搜索能力
├── 主搜索框（高频入口）
├── Popover 工作台（快速条件构建）
├── 高级搜索弹窗（完整条件编辑）
└── 条件状态系统（Tag / 收藏夹 / 已应用条件）
```

### 6.1 主搜索框

职责：

- 展示已应用条件 Tag
- 提供文本输入入口
- 打开 Popover
- 打开高级搜索弹窗
- 提供清空与快捷操作

### 6.2 Popover 工作台

职责：

- 快速选择字段
- 快速构建条件
- 快速应用收藏夹
- 尽量减少打开高级弹窗的频率

### 6.3 高级搜索弹窗

职责：

- 完整查看当前条件集
- 新增/编辑/删除条件
- 批量调整条件
- 将当前条件保存为收藏（后续）
- 承接复杂查询需求

### 6.4 条件状态系统

职责：

- 统一维护已应用条件
- 统一给主搜索框和高级搜索弹窗使用
- 统一编译成 API 查询协议

---

## 7. 交互模型

## 7.1 主搜索框交互

主搜索框不是普通输入框，而是：

- `Tag 容器`
- `输入光标`
- `Popover 触发器`
- `高级搜索入口`

### 交互规则

1. 点击搜索框：打开 Popover。
2. 输入文本：Popover 保持打开，输入焦点始终留在主输入框内，用户可持续补充 keyword。
3. 当 `keyword` 非空时：`ArrowUp / ArrowDown` 不移动输入焦点，而是切换左栏字段高亮。
4. 当左栏已有高亮字段时：`Enter` 使用该字段的默认操作符生成条件，并插入为一个 Tag。
5. 已存在条件：以 Tag 形式展示在输入容器内。
6. Backspace：当输入为空时，优先删除最后一个 Tag。
7. 点击 Tag：进入该条件的编辑流程（可进入高级搜索弹窗）。
8. 点击清空：移除所有条件并恢复默认查询。
9. `Escape`：关闭 Popover，但不清空当前 keyword。

---

## 7.2 Popover 工作台交互

Popover 为三栏布局：

```text
┌─────────────────────────────────────────────────────────────┐
│ 左栏：字段列表 │ 中栏：快速搜索条件 │ 右栏：个人收藏夹      │
└─────────────────────────────────────────────────────────────┘
```

### 左栏：字段列表

职责：

- 选择当前活动字段
- 承接主输入框的键盘高亮切换
- 根据 keyword 类型决定字段是否可快速承接

点击字段后：

- 字段进入高亮态
- 若用户按下 `Enter`，则按字段默认操作符生成条件

字段可选中规则：

- 文本字段：始终可选中
- 布尔字段：仅当 keyword 可解析为布尔值时可选中，例如 `1 / 0 / true / false / 是 / 否`
- 数值字段：仅当 keyword 可解析为数值时可选中
- 日期字段：仅当 keyword 可解析为日期时可选中（首版可预留，不要求用户管理页落地）

展示建议：

- 所有字段都可展示，但当前 keyword 不可承接的字段应置灰
- 键盘高亮只在“可承接当前 keyword 的字段集合”中循环

### 中栏：快速搜索条件

职责：

- 展示系统提供的固定快速搜索预设
- 支持直接点击插入一条或一组条件
- 不根据 keyword 动态生成候选条件

中栏预设示例：

- 超级管理员
- 允许多端登录
- 管理员账号
- 最近 7 天登录（若页面已具备对应字段）

点击后：

- 立即生成一条或多条 `SearchCondition`
- 插入到搜索框中成为一个或多个 Tag
- 自动触发查询

### 右栏：个人收藏夹

职责：

- 展示用户常用条件模板
- 一键应用一组条件

点击收藏夹后：

- 批量插入条件
- 条件立即显示为多个 Tag
- 自动触发查询

### 主输入框 + 左栏 键盘协同规则

这是主搜索能力的核心交互：

1. 用户输入 keyword。
2. Popover 打开，但输入焦点仍留在主输入框内。
3. 用户按 `ArrowUp / ArrowDown`，左栏字段高亮切换。
4. 用户可继续输入补充 keyword，例如从 `张` 补成 `张三`。
5. 用户按 `Enter`，使用当前高亮字段的默认操作符生成条件。

示例：

- 输入 `张`：可高亮 `用户名 / 邮箱 / 姓名` 等文本字段。
- 输入 `true`：可高亮文本字段，也可高亮 `超级用户 / 多端登录` 等布尔字段。
- 输入 `1`：可高亮文本字段，也可高亮布尔字段；若页面存在数值字段，也应纳入可选集合。

### Popover 与高级搜索弹窗的分工

- Popover：快、轻、常用
- 高级搜索弹窗：全、深、完整

---

## 7.3 高级搜索弹窗交互

高级搜索弹窗是搜索能力的**专业模式**。

### 职责

1. 查看当前所有条件
2. 新增条件
3. 编辑条件
4. 删除条件
5. 批量清空
6. 应用收藏夹
7. 后续支持保存为收藏

### 弹窗结构建议

```text
┌──────────────────────────────────────────────────┐
│ 标题区：高级搜索                                │
├──────────────────────────────────────────────────┤
│ 左：条件列表      │ 右：条件编辑器 / 收藏夹      │
├──────────────────────────────────────────────────┤
│ 底部：清空全部 / 取消 / 应用搜索                │
└──────────────────────────────────────────────────┘
```

### 建议交互

- 点击“高级搜索”按钮打开弹窗
- 左侧列出全部条件
- 选中某条条件后右侧进入编辑器
- 新增条件时使用字段+操作符+值的分步输入方式
- 点击“应用搜索”后：
  - 关闭弹窗
  - 同步主搜索框 Tag
  - 触发列表刷新

---

## 8. 数据模型设计

## 8.1 搜索字段定义

```ts
export interface SearchFieldDef {
  key: string
  label: string
  dataType: 'text' | 'number' | 'date' | 'boolean' | 'enum'
  searchable?: boolean
  quickOps?: SearchOperator[]
  options?: Array<{ label: string; value: unknown }>
  placeholder?: string
}
```

字段定义职责：

- 告诉 UI 字段长什么样
- 告诉中栏该字段支持哪些快捷操作
- 告诉条件编辑器该用什么输入控件

---

## 8.2 操作符定义

```ts
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
```

该定义应尽量与后端/底层过滤协议保持一致。

---

## 8.3 搜索条件模型

```ts
export interface SearchCondition {
  id: string
  field: string
  operator: SearchOperator
  value?: unknown
  label: string
  source?: 'manual' | 'quick' | 'favorite'
}
```

说明：

- `id`：用于编辑/删除/定位
- `label`：用于 Tag 展示
- `source`：用于区分条件来源，便于埋点与调试

---

## 8.4 收藏夹模型

```ts
export interface SearchFavorite {
  id: string
  name: string
  conditions: SearchCondition[]
  scope?: string
}
```

### 收藏夹约束

- 首版允许页面级静态收藏夹
- 第二版再支持用户维度持久化

---

## 8.5 搜索状态模型

```ts
export interface SmartSearchState {
  keyword: string
  activeField?: string
  conditions: SearchCondition[]
  favorites: SearchFavorite[]
  popoverOpen: boolean
  advancedDialogOpen: boolean
}
```

---

## 9. 查询协议映射

## 9.1 参考基线

`happy-table` 统一使用 `FilterConfig[]` 作为过滤协议。  
`wes_frontend` 当前通过 `CrudApi.query(options)` 向后端发送：

- `filters`
- `sort`
- `limit`
- `offset`

其中 `filters` 在运行时已支持标准 `FilterGroup` 结构透传。

## 9.2 当前项目目标协议

智能搜索最终统一编译为：

```ts
interface FilterCondition {
  field: string
  op:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'ge'
    | 'lt'
    | 'le'
    | 'in'
    | 'nin'
    | 'ilike'
    | 'between'
    | 'is_null'
    | 'not_null'
  value?: unknown
}

interface FilterGroup {
  couple: 'and' | 'or' | 'not'
  conditions: Array<FilterCondition | FilterGroup>
}
```

## 9.3 映射规则

### 文本类

| SearchOperator | API op               | value 规则 |
| -------------- | -------------------- | ---------- |
| `contains`     | `ilike`              | `%value%`  |
| `startsWith`   | `ilike`              | `value%`   |
| `endsWith`     | `ilike`              | `%value`   |
| `equals`       | `eq`                 | 原值       |
| `notEquals`    | `ne`                 | 原值       |
| `isEmpty`      | `is_null` 或空串策略 | 无         |
| `notEmpty`     | `not_null`           | 无         |

### 数值类

| SearchOperator | API op    |
| -------------- | --------- |
| `gt`           | `gt`      |
| `gte`          | `ge`      |
| `lt`           | `lt`      |
| `lte`          | `le`      |
| `between`      | `between` |

### 枚举 / 布尔类

| SearchOperator | API op |
| -------------- | ------ |
| `equals`       | `eq`   |
| `in`           | `in`   |
| `notEquals`    | `ne`   |

## 9.4 条件组合规则

首版统一采用：

- 所有条件使用 `AND` 组合

即：

```ts
{
  couple: 'and',
  conditions: [...compiledConditions]
}
```

### 为什么首版不做 OR

- OR 组编辑器会明显提高 UI 与数据模型复杂度
- 大多数业务后台页面的首轮需求以 AND 条件为主
- 可以在 v2 通过高级搜索弹窗扩展条件组能力

---

## 10. 与当前项目底层能力的结合方式

## 10.1 可复用能力

### 请求与错误处理

- `src/api/client.ts`
- `src/composables/useRequest.ts`

### 列表数据流

- `src/api/base/crud-api.ts`
- `src/composables/useCrudApi.ts`

### UI 组件

- `ElPopover`
- `ElDialog`
- `ElTag`
- `ElInput`
- `ElButton`
- `ElScrollbar`
- `ElSelect`
- `ElDatePicker`
- `ElSwitch`

## 10.2 不应复用的部分

以下内容不应沿用现有旧设计：

- 普通表单式搜索栏布局
- 页面散写的查询输入框与按钮逻辑
- 每个业务页各自定义搜索协议

## 10.3 底层建议增强项

建议在后续实现前，先对 `src/api/base/crud-api.ts` 做一个小增强：

```ts
type QueryFilters = Record<string, unknown> | FilterGroup
```

原因：

- 当前运行时可透传 `FilterGroup`
- 但类型层没有显式表达，会影响搜索能力开发体验

---

## 11. 组件与分层设计

## 11.1 推荐目录结构

```text
src/
├── components/
│   └── search/
│       ├── SmartSearchBar.vue
│       ├── SearchConditionTag.vue
│       ├── SearchPopoverPanel.vue
│       ├── AdvancedSearchDialog.vue
│       ├── ConditionEditorRow.vue
│       ├── FavoriteSearchList.vue
│       └── panels/
│           ├── SearchFieldPanel.vue
│           ├── SearchQuickPanel.vue
│           └── SearchFavoritePanel.vue
├── composables/
│   └── useSmartSearch.ts
└── types/
    └── search.ts
```

## 11.2 分层职责

### `useSmartSearch.ts`

职责：

- 管理搜索状态
- 条件新增/删除/编辑
- 收藏夹应用
- 编译查询协议
- 提供给页面使用的动作方法

### `SmartSearchBar.vue`

职责：

- 展示 Tag 与输入区域
- 打开/关闭 Popover
- 打开高级搜索弹窗
- 对外抛出搜索动作

### `SearchPopoverPanel.vue`

职责：

- 三栏整体布局
- 协调字段/快捷条件/收藏夹联动

### `AdvancedSearchDialog.vue`

职责：

- 完整条件编辑工作台
- 承接复杂搜索编辑

### `ConditionEditorRow.vue`

职责：

- 编辑单条条件
- 根据字段类型切换不同输入控件

---

## 12. `useSmartSearch` 设计建议

## 12.1 对外接口建议

```ts
export interface UseSmartSearchOptions {
  fields: SearchFieldDef[]
  favorites?: SearchFavorite[]
  autoApply?: boolean
}

export interface UseSmartSearchReturn {
  state: Ref<SmartSearchState>
  conditions: ComputedRef<SearchCondition[]>
  hasConditions: ComputedRef<boolean>
  addCondition: (condition: SearchCondition) => void
  removeCondition: (id: string) => void
  updateCondition: (id: string, updates: Partial<SearchCondition>) => void
  clearConditions: () => void
  applyFavorite: (favoriteId: string) => void
  compileToFilterGroup: () => FilterGroup | undefined
  openPopover: () => void
  closePopover: () => void
  openAdvancedDialog: () => void
  closeAdvancedDialog: () => void
}
```

## 12.2 设计要求

- 所有条件操作必须为纯状态操作
- 编译逻辑与 UI 解耦
- 所有查询动作通过统一 `compileToFilterGroup()` 输出
- 不允许页面各自散写条件编译逻辑

---

## 13. 页面接入模式

## 13.1 推荐接入方式

以用户管理页为例：

1. 页面定义字段配置 `SearchFieldDef[]`
2. 页面调用 `useSmartSearch()` 获取状态与编译结果
3. 页面在搜索变化后调用 `fetchList()`
4. `fetchList()` 将 `compileToFilterGroup()` 结果传给 `userApi.query()`

## 13.2 推荐伪代码

```ts
const smartSearch = useSmartSearch({
  fields: userSearchFields,
  favorites: userSearchFavorites
})

async function handleSearchApply() {
  await fetchList({
    page: 1,
    filters: smartSearch.compileToFilterGroup(),
    sort: [{ field: 'updated_at', order: 'desc' }]
  })
}
```

## 13.3 页面约束

- 页面不直接维护条件结构
- 页面只负责：
  - 定义字段配置
  - 定义收藏夹
  - 接收搜索结果并触发查询

---

## 14. 用户管理首个落地方案

## 14.1 字段建议

```ts
const userSearchFields: SearchFieldDef[] = [
  {
    key: 'username',
    label: '用户名',
    dataType: 'text',
    quickOps: ['contains', 'equals', 'startsWith']
  },
  { key: 'email', label: '邮箱', dataType: 'text', quickOps: ['contains', 'equals'] },
  { key: 'full_name', label: '姓名', dataType: 'text', quickOps: ['contains', 'equals'] },
  { key: 'is_superuser', label: '超级用户', dataType: 'boolean', quickOps: ['equals'] },
  { key: 'is_multi_login', label: '多端登录', dataType: 'boolean', quickOps: ['equals'] }
]
```

## 14.2 字段默认操作符建议

- `username` → `contains`
- `email` → `contains`
- `full_name` → `contains`
- `is_superuser` → `equals`
- `is_multi_login` → `equals`

## 14.3 系统快捷预设建议

首版中栏应优先提供固定系统预设，而不是根据 keyword 拼装候选项：

- 超级管理员
- 允许多端登录
- 管理员账号
- 企业邮箱用户
- 最近 7 天登录（仅在后端与页面字段已支持时启用）

## 14.4 收藏夹建议

- 管理员账号
- 超级用户
- 允许多端登录用户
- 企业邮箱用户

---

## 15. MVP 范围

## 15.1 v1 必做

1. 主搜索框
2. 条件 Tag 展示
3. Popover 三栏布局
4. 字段选择
5. 快速条件生成
6. 收藏夹应用
7. 高级搜索弹窗
8. 条件新增/删除/编辑
9. 条件编译成 `FilterGroup`
10. 用户管理页首个落地

## 15.2 v1 不做

1. OR / NOT 可视化条件组编辑
2. 收藏夹持久化管理
3. 跨页面共享收藏夹
4. 服务端搜索高亮
5. AI 搜索建议

---

## 16. 约束条件

### 16.1 技术约束

- 必须使用 Vue 3 Composition API
- 必须使用 Element Plus 作为基础 UI
- 不引入新的大型状态管理方案
- 不推翻现有 `CrudApi` 请求体系

### 16.2 工程约束

- 搜索组件必须职责清晰
- 条件编译逻辑不可散落在页面中
- 不允许页面私自定义不统一的条件协议
- 高级搜索弹窗与主搜索框必须共享同一状态源

### 16.3 产品约束

- 主搜索框必须是高频入口
- 高级搜索弹窗必须承接复杂查询
- 已应用条件必须始终可视化
- 搜索/分页/刷新必须形成闭环

---

## 17. 实施步骤建议

### 第一步：定义协议与数据模型

产出：

- `src/types/search.ts`
- 搜索字段、条件、收藏夹、状态模型

### 第二步：实现 `useSmartSearch`

产出：

- `src/composables/useSmartSearch.ts`
- 条件管理、编译、收藏夹应用能力

### 第三步：实现主搜索框 + Popover

产出：

- `SmartSearchBar.vue`
- `SearchPopoverPanel.vue`
- `SearchConditionTag.vue`

### 第四步：实现高级搜索弹窗

产出：

- `AdvancedSearchDialog.vue`
- `ConditionEditorRow.vue`

### 第五步：接入用户管理页

产出：

- 用户管理页搜索能力首个落地版本

### 第六步：增强底层 Query 类型（可并行）

产出：

- `QueryOptions.filters` 支持 `FilterGroup`

---

## 18. 验收标准

## 18.1 功能验收

- 主搜索框可显示多个条件 Tag
- 输入时可打开 Popover
- 可通过字段 + 快速条件生成查询条件
- 可通过收藏夹应用一组条件
- 可通过高级搜索弹窗编辑全部条件
- 条件应用后可正确触发列表查询
- 删除某个条件后列表可同步刷新

## 18.2 工程验收

- 搜索能力有统一类型定义
- 搜索能力有统一 composable
- 页面未散写条件协议转换逻辑
- 不重复实现请求层与状态层

## 18.3 体验验收

- 搜索条件可读性强
- 查询反馈清晰
- 高级模式与快速模式切换自然
- 多条件情况下仍保持清晰易懂

---

## 19. 风险与注意事项

### 19.1 风险一：首版过度追求复杂布尔逻辑

建议：

- 首版只做 AND
- 把 OR/NOT 放在 v2

### 19.2 风险二：UI 先行而协议不稳

建议：

- 优先冻结 `SearchCondition` 与 `FilterGroup` 映射关系
- 再做具体 UI

### 19.3 风险三：页面私自绕开搜索能力

建议：

- 页面必须通过 `useSmartSearch` 使用智能搜索
- 不允许额外造一套页面内查询结构

### 19.4 风险四：收藏夹过早持久化

建议：

- 首版先静态配置或 session 级别
- 后续再做服务端持久化

---

## 20. 最终结论

智能搜索能力应被视为 `wes_frontend` 的一项**核心产品能力**，其实现路径应为：

- 借鉴 `happy-table` 的交互逻辑与过滤协议思想
- 基于当前项目现有底层能力进行重构
- 不继承当前旧搜索栏设计
- 先做可落地 MVP，再逐步演进为完整搜索系统

本设计文档将作为后续：

- 用户管理搜索实现
- 通用搜索组件建设
- 高级搜索交互规范
- 多业务模块统一搜索体验

的基线文档。

---

## 21. 推荐下一步

建议在本设计文档确认后，继续产出以下文档之一：

1. **《智能搜索组件拆解与文件结构设计》**
2. **《用户管理模块搜索字段与收藏夹配置清单》**
3. **《智能搜索能力开发任务清单》**
4. **《智能搜索能力首批代码实现方案》**
