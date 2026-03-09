# 智能搜索组件拆解与文件结构设计

> **项目**: P9 WES 前端项目  
> **能力主题**: 智能搜索（Smart Search）  
> **文档版本**: v1.0  
> **创建日期**: 2026-03-07  
> **前置文档**: `docs/SMART_SEARCH_DESIGN_V1.md`

---

## 1. 文档目标

本文档用于在《智能搜索能力设计文档 v1》的基础上，进一步明确：

1. 智能搜索能力的组件拆分方案。
2. 每个组件、composable、类型文件的职责边界。
3. 各组件之间的通信方式与依赖关系。
4. 首版实现顺序、复用策略、工程规范与禁区。

本文档强调的是：**如何真正开始开发**。

---

## 2. 设计前提

### 2.1 本文档解决的问题

当我们确认“智能搜索”是一项独立产品能力后，开发上会立刻面临这些问题：

- 主搜索框里哪些逻辑放组件，哪些放 composable？
- Popover 三栏应该拆成几个组件？
- 高级搜索弹窗怎么和主搜索框共享状态？
- 条件 Tag 的显示与编辑如何解耦？
- 页面应该拿到什么 API，才能接入 `useCrudApi`？

本文件就是为这些问题给出**可执行结构**。

### 2.2 当前工程约束

当前仓库应沿用以下底层能力：

- 请求层：`src/api/client.ts`
- CRUD 层：`src/api/base/crud-api.ts`
- 列表状态层：`src/composables/useCrudApi.ts`
- 通用请求态：`src/composables/useRequest.ts`
- UI 组件层：Element Plus

### 2.3 本文档不做的事

- 不定义最终视觉稿
- 不写完整实现代码
- 不扩展后端 API
- 不讨论 AI 搜索语义

---

## 3. 总体组件分层

智能搜索能力建议拆成三层：

```text
表现层（Components）
├── SmartSearchBar
├── SearchPopoverPanel
├── AdvancedSearchDialog
├── SearchConditionTag
├── ConditionEditorRow
└── 各子面板组件

状态层（Composable）
└── useSmartSearch

协议层（Types / Compiler）
├── search.ts
└── search-compiler.ts（可选拆出）
```

### 3.1 分层原则

- **表现层**：只关心展示、输入、事件抛出。
- **状态层**：关心条件状态、收藏夹、弹窗状态、编译结果。
- **协议层**：关心类型定义与查询协议转换。

### 3.2 必须坚持的边界

- 条件编译逻辑不得写在 Vue 组件中。
- 组件不得直接操作 `CrudApi.query()`。
- 页面不得散写条件的增删改查逻辑。
- 高级搜索弹窗与主搜索框必须共享同一套搜索状态。

---

## 4. 推荐目录结构

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
│       ├── EmptySearchState.vue
│       └── panels/
│           ├── SearchFieldPanel.vue
│           ├── SearchQuickPanel.vue
│           ├── SearchFavoritePanel.vue
│           └── SearchConditionListPanel.vue
├── composables/
│   └── useSmartSearch.ts
├── types/
│   └── search.ts
└── utils/
    └── search-compiler.ts
```

### 4.1 为什么这样拆

- `components/search/`：保证搜索能力有独立的组件空间。
- `useSmartSearch.ts`：作为整个能力的唯一状态入口。
- `types/search.ts`：集中定义搜索协议，避免页面各自扩展。
- `utils/search-compiler.ts`：可选拆分，用于承载纯函数编译逻辑，减轻 composable 复杂度。

---

## 5. 核心文件职责定义

## 5.1 `src/types/search.ts`

### 职责

集中定义智能搜索能力的所有核心类型：

- 搜索字段定义
- 操作符定义
- 搜索条件
- 收藏夹
- 搜索状态
- 编译结果类型
- 事件载荷类型

### 必须包含的类型

- `SearchFieldDef`
- `SearchOperator`
- `SearchCondition`
- `SearchFavorite`
- `SmartSearchState`
- `QuickSearchPreset`
- `SearchKeywordKind`
- `CompiledSearchResult`

### 禁止放入

- Vue `ref/computed` 类型
- 组件 Props 类型和内部私有样式类型
- 任何与 Element Plus 直接耦合的 UI 类型

---

## 5.2 `src/utils/search-compiler.ts`

### 职责

将内部 `SearchCondition[]` 编译为当前项目使用的 API 查询条件结构。

### 推荐函数

```ts
compileCondition(condition: SearchCondition, fieldDefs: SearchFieldDef[]): FilterCondition | null
compileConditions(conditions: SearchCondition[], fieldDefs: SearchFieldDef[]): FilterGroup | undefined
buildConditionLabel(condition: Omit<SearchCondition, 'label'>, fieldDefs: SearchFieldDef[]): string
```

### 设计要求

- 必须为纯函数
- 不依赖 Vue
- 不依赖组件实例
- 可单独单元测试

### 禁止做的事

- 发送请求
- 访问浏览器存储
- 打开弹窗

---

## 5.3 `src/composables/useSmartSearch.ts`

### 职责

这是整个搜索能力的核心状态源。

负责：

- 当前关键字
- 当前活动字段
- 当前条件列表
- Popover 开关
- 高级搜索弹窗开关
- 收藏夹应用
- 条件增删改
- 编译结果输出
- 页面接入辅助方法

### 推荐对外接口

```ts
export interface UseSmartSearchReturn {
  state: Ref<SmartSearchState>
  conditions: ComputedRef<SearchCondition[]>
  hasConditions: ComputedRef<boolean>
  activeField: ComputedRef<SearchFieldDef | undefined>
  addCondition: (draft: Omit<SearchCondition, 'id' | 'label'>) => void
  removeCondition: (id: string) => void
  replaceCondition: (id: string, draft: Omit<SearchCondition, 'id' | 'label'>) => void
  clearConditions: () => void
  setKeyword: (keyword: string) => void
  setActiveField: (fieldKey?: string) => void
  applyFavorite: (favoriteId: string) => void
  compileToFilterGroup: () => FilterGroup | undefined
  openPopover: () => void
  closePopover: () => void
  openAdvancedDialog: () => void
  closeAdvancedDialog: () => void
}
```

### 内部建议拆分

如果 `useSmartSearch.ts` 变大，可内部按逻辑拆分为：

- keyword 管理
- 条件管理
- 收藏夹管理
- UI 状态管理
- 编译能力调用

但**对外仍保持一个统一 composable**。

### 为什么必须统一状态源

因为以下组件必须保持同步：

- 主搜索框中的 Tag
- Popover 中正在构建的条件
- 高级搜索弹窗中的条件清单

若不是同一状态源，会立刻出现状态漂移。

---

## 5.4 `src/components/search/SmartSearchBar.vue`

### 职责

主搜索框是整个搜索能力的高频入口，负责：

- 展示条件 Tag
- 提供输入区域
- 打开 Popover
- 打开高级搜索弹窗
- 删除条件 Tag
- 清空条件

### 它不是普通输入框

它的本质是：

- 条件容器
- 输入入口
- 搜索控制台入口

### 推荐 Props

```ts
interface Props {
  conditions: SearchCondition[]
  keyword: string
  placeholder?: string
  loading?: boolean
}
```

### 推荐 Emits

```ts
interface Emits {
  'update:keyword': [value: string]
  'remove-condition': [id: string]
  'open-popover': []
  'open-advanced': []
  clear: []
}
```

### 组件内允许处理的逻辑

- 输入框聚焦/点击交互
- Backspace 删除最后一个 Tag
- Tag 删除按钮交互
- 清空按钮显示条件

### 不应处理的逻辑

- 条件编译
- 收藏夹应用
- 请求触发
- 条件合法性判定

---

## 5.5 `src/components/search/SearchConditionTag.vue`

### 职责

负责渲染单个条件 Tag。

### 建议能力

- 展示条件文案
- 显示来源图标（可选）
- 删除按钮
- 点击进入编辑（后续可支持）

### 设计要求

- 必须足够轻量
- 不嵌入复杂逻辑
- 要能适配不同来源（手动/快捷/收藏）

---

## 5.6 `src/components/search/SearchPopoverPanel.vue`

### 职责

承载主搜索框下拉 Popover 的整体布局与区域协调。

### 内部结构

- 左：`SearchFieldPanel`
- 中：`SearchQuickPanel`
- 右：`SearchFavoritePanel`

### 推荐 Props

```ts
interface Props {
  fields: SearchFieldDef[]
  activeField?: string
  keyword: string
  quickPresets: QuickSearchPreset[]
  favorites: SearchFavorite[]
}
```

### 推荐 Emits

```ts
interface Emits {
  'select-field': [fieldKey: string]
  'apply-condition': [draft: Omit<SearchCondition, 'id' | 'label'>]
  'apply-favorite': [favoriteId: string]
  'open-advanced': []
}
```

### 设计要求

- 三栏布局必须支持响应式
- 中栏内容必须来自页面配置的固定系统预设，而不是 keyword 驱动的临时候选
- 左栏必须支持由主输入框键盘事件驱动高亮切换
- 右栏必须支持空状态展示

---

## 5.7 `src/components/search/panels/SearchFieldPanel.vue`

### 职责

展示可搜索字段列表。

### 行为要求

- 高亮当前活动字段
- 点击字段切换活动上下文
- 非 searchable 字段不应出现
- 输入焦点保留在主搜索框时，也要支持通过 `ArrowUp / ArrowDown` 驱动字段高亮
- 对当前 keyword 不兼容的字段应置灰，并跳过键盘高亮循环

### 建议展示信息

- 字段名称
- 字段类型图标（可选）
- 是否已参与当前搜索（可选）
- 是否可承接当前 keyword（可选，用置灰/辅助文案表达）

---

## 5.8 `src/components/search/panels/SearchQuickPanel.vue`

### 职责

展示页面级系统快捷预设，并负责把预设转换为条件草稿或条件组。

### 它是效率核心区

例如用户管理页中栏可直接提供：

- 超级管理员
- 允许多端登录
- 管理员账号
- 企业邮箱用户
- 最近 7 天登录（若业务字段已支持）

### 推荐输出方式

点击任一候选项：

- 直接生成一条或多条条件草稿
- 通知上层添加条件
- 不在本组件内部操作状态源

### 明确边界

- 不消费 keyword 生成文案
- 不负责字段高亮切换
- 不承担输入解析职责

---

## 5.8A 主输入框与 Popover 键盘协同

### 目标

借鉴 `happy-table` 的 combobox / popover 键盘行为，但重构为本项目的条件式搜索体验。

### 交互要求

- 输入焦点始终停留在主搜索框 input 内
- `ArrowDown`：打开 Popover 并高亮下一个可选字段
- `ArrowUp`：打开 Popover 并高亮上一个可选字段
- `Enter`：用当前高亮字段的默认操作符生成条件
- `Escape`：关闭 Popover
- `Backspace`：在 keyword 为空时删除最后一个条件 Tag

### 字段可选规则

- 文本字段：始终可选
- 布尔字段：仅当 keyword 可解析为 `true / false / 1 / 0 / 是 / 否` 时可选
- 数值字段：仅当 keyword 为合法数值时可选
- 日期字段：仅当 keyword 为合法日期字面量时可选

### 架构约束

- 键盘事件监听归 `SmartSearchBar.vue`
- 字段可选计算归 `useSmartSearch.ts`
- 字段渲染与高亮表现归 `SearchFieldPanel.vue`
- 条件生成归 `useSmartSearch.ts + search-compiler.ts`

---

## 5.9 `src/components/search/panels/SearchFavoritePanel.vue`

### 职责

展示个人收藏夹条件模板。

### MVP 职责

- 展示收藏项列表
- 点击应用收藏项
- 无收藏时显示空态

### 首版不做

- 收藏夹重命名
- 收藏夹排序拖拽
- 收藏夹分组

---

## 5.10 `src/components/search/AdvancedSearchDialog.vue`

### 职责

作为“完整条件编辑器”，负责承接复杂查询编辑。

### 内部结构建议

- 条件清单区
- 条件编辑区
- 收藏夹区（可先简化）
- 底部操作区

### 推荐 Props

```ts
interface Props {
  modelValue: boolean
  conditions: SearchCondition[]
  fields: SearchFieldDef[]
  favorites: SearchFavorite[]
}
```

### 推荐 Emits

```ts
interface Emits {
  'update:modelValue': [value: boolean]
  'add-condition': [draft: Omit<SearchCondition, 'id' | 'label'>]
  'update-condition': [payload: { id: string; draft: Omit<SearchCondition, 'id' | 'label'> }]
  'remove-condition': [id: string]
  'clear-all': []
  'apply-favorite': [favoriteId: string]
  apply: []
}
```

### 它不应该做什么

- 不直接发送请求
- 不直接依赖页面列表组件
- 不存储独立条件副本（除非明确设计为临时草稿模式）

### 首版建议模式

首版建议使用“直接编辑共享状态 + 点击应用触发查询”的模式。  
不要引入复杂的“临时草稿副本 + diff 合并”。

---

## 5.11 `src/components/search/ConditionEditorRow.vue`

### 职责

编辑单条条件。

### 根据字段类型切换控件

- `text` → `ElInput`
- `number` → `ElInputNumber`
- `date` → `ElDatePicker`
- `boolean` → `ElSelect`
- `enum` → `ElSelect`

### 操作符联动

不同字段类型显示不同操作符：

- 文本：`contains / equals / startsWith / endsWith / isEmpty / notEmpty`
- 数值：`equals / gt / gte / lt / lte / between`
- 日期：`equals / gte / lte / between`
- 布尔：`equals`
- 枚举：`equals / in / notEquals`

### 设计要求

- 输入控件和字段类型必须强关联
- 字段变更时操作符与值必须自动重置或校正

---

## 5.12 `src/components/search/FavoriteSearchList.vue`

### 职责

抽离收藏夹列表展示逻辑，供：

- Popover 右栏
- 高级搜索弹窗

复用。

### 价值

避免收藏夹列表在多个容器里重复实现。

---

## 5.13 `src/components/search/EmptySearchState.vue`

### 职责

统一空状态表现，例如：

- 暂无收藏夹
- 暂无可用快捷条件
- 暂无已配置搜索字段

### 为什么需要单独组件

智能搜索区域的空状态会频繁出现，单独抽出可以统一体验与文案。

---

## 6. 组件通信关系

## 6.1 推荐通信方式

统一采用：

- 页面持有 `useSmartSearch()`
- 页面将状态和操作分发给各组件
- 子组件只通过事件回传用户动作

### 推荐数据流

```text
Page
 └─ useSmartSearch()
     ├─ SmartSearchBar
     │   └─ SearchConditionTag
     ├─ SearchPopoverPanel
     │   ├─ SearchFieldPanel
     │   ├─ SearchQuickPanel
     │   └─ SearchFavoritePanel
     └─ AdvancedSearchDialog
         ├─ SearchConditionListPanel
         ├─ ConditionEditorRow
         └─ FavoriteSearchList
```

## 6.2 为什么不用 provide/inject 作为主通信方式

虽然可以用 `provide/inject`，但首版不建议：

- 难以追踪状态来源
- 不利于页面显式控制搜索行为
- 会增加调试成本

首版建议用显式 `props + emits`。

---

## 7. 与页面的接入边界

## 7.1 页面应该做什么

页面负责：

- 提供字段配置
- 提供收藏夹配置
- 接收编译结果
- 调用列表查询方法
- 管理页面自己的分页、排序、业务动作

## 7.2 页面不应该做什么

页面不负责：

- 条件结构定义
- 条件编译逻辑
- Tag 显示逻辑
- 快速条件生成逻辑
- 收藏夹应用逻辑

---

## 8. 用户管理页接入示例边界

用户管理页只需要提供：

### 8.1 搜索字段配置

- `username`
- `email`
- `full_name`
- `is_superuser`
- `is_multi_login`

### 8.2 收藏夹配置

- 管理员账号
- 超级用户
- 多端登录用户
- 公司邮箱用户

### 8.3 查询触发函数

```ts
async function applySmartSearch() {
  await fetchList({
    page: 1,
    filters: smartSearch.compileToFilterGroup(),
    sort: [{ field: 'updated_at', order: 'desc' }]
  })
}
```

### 8.4 为什么这样设计

因为页面的唯一职责应是：

- “把搜索结果用到当前业务数据查询上”

而不是“重新定义搜索能力本身”。

---

## 9. 响应式布局要求

## 9.1 SmartSearchBar

- 桌面端：Tag + 输入区 + 操作按钮同行展示
- 中尺寸：Tag 区优先，按钮紧凑化
- 小屏：允许 Tag 区换行，按钮折叠

## 9.2 SearchPopoverPanel

- 桌面端：三栏布局
- 中尺寸：左栏固定，右两栏压缩
- 小屏：切换为上下堆叠布局，不强行三栏并排

## 9.3 AdvancedSearchDialog

- 桌面端：左右双栏
- 小屏：上下布局

### 设计原则

- 先保证信息结构不丢失
- 再考虑视觉密度
- 不允许为了响应式把高级搜索功能隐藏掉

---

## 10. 实施顺序建议

### Phase A：先做协议层

1. `src/types/search.ts`
2. `src/utils/search-compiler.ts`

### Phase B：再做状态层

3. `src/composables/useSmartSearch.ts`

### Phase C：实现主搜索框链路

4. `SearchConditionTag.vue`
5. `SmartSearchBar.vue`
6. `SearchFieldPanel.vue`
7. `SearchQuickPanel.vue`
8. `SearchFavoritePanel.vue`
9. `SearchPopoverPanel.vue`

### Phase D：实现高级搜索能力

10. `ConditionEditorRow.vue`
11. `FavoriteSearchList.vue`
12. `AdvancedSearchDialog.vue`

### Phase E：业务落地

13. 用户管理页接入
14. 联调 `FilterGroup` 查询

---

## 11. 约束与禁区

## 11.1 禁止事项

- 禁止在页面内直接拼接复杂过滤协议
- 禁止让多个搜索组件各自维护独立条件副本
- 禁止把请求逻辑塞进搜索组件
- 禁止在未冻结条件协议前先写复杂 UI 动画
- 禁止首版引入 OR/AND 图形化条件树编辑

## 11.2 必须遵守

- `useSmartSearch` 是唯一状态源
- `search-compiler.ts` 必须为纯函数
- 高级搜索弹窗与主搜索框必须双向一致
- 首版以用户管理为首个试点页面

---

## 12. 开发完成后的验证建议

### 12.1 单体组件验证

- Tag 删除是否正确
- 输入焦点保留在主搜索框时，左栏字段高亮是否能被键盘正确切换
- 中栏是否始终展示固定系统预设，而不随 keyword 漂移
- 收藏夹应用是否正确插入条件
- 高级搜索弹窗是否能编辑已存在条件

### 12.2 状态一致性验证

- 主搜索框添加条件后，高级搜索弹窗是否同步
- 高级搜索弹窗修改条件后，Tag 是否同步
- 清空条件后，Popover 与弹窗是否都恢复默认状态

### 12.3 页面联调验证

- 搜索条件是否正确编译为 `FilterGroup`
- 查询是否会自动回到第一页
- 刷新是否保留当前搜索条件
- 删除单个 Tag 后列表是否正确刷新

---

## 13. 最终结论

智能搜索能力的工程实现必须坚持：

- 用组件分层保持可维护性
- 用 composable 保持统一状态
- 用纯函数编译器保持协议稳定
- 用页面接入边界保持业务清晰

本文件定义的结构，足以支持首版在用户管理页落地，并为后续角色管理、设备管理等页面复用提供稳定基础。

---

## 14. 推荐下一步

建议继续产出以下文档之一：

1. **《智能搜索能力开发任务清单》**
2. **《用户管理模块搜索字段与收藏夹配置清单》**
3. **《智能搜索能力首批代码实现方案》**
