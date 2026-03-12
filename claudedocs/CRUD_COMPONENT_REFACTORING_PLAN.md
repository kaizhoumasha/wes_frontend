# 通用 CRUD 组件重构设计计划

> **版本**: v1.4 (评审定稿)
> **更新日期**: 2026-03-12

### **v1.4 更新日志 (架构师评审)**

- **架构优化**: 采纳“严格分离无头逻辑与视图编排”原则。
  - `useCrudListPage` 不再返回操作视图的 `handleCancelSelection` 方法。
  - `useCrudListPage` 转而暴露 `selectedItems` 状态和纯粹的 `clearSelectionState` 方法。
  - `handleCancelSelection` 作为视图编排函数，在页面组件中定义，负责同时调用 `crudTableRef.clearSelection()` (更新视图) 和 `clearSelectionState()` (更新状态)。
- **API 优化**: 优化 `useCrudListPage` 的返回值，按职责（`state`, `dialogs`, `actions` 等）进行分组，提升开发者体验 (DX)。
- **API 增强**:
  - `CrudTable` 的 `error` prop 类型拓宽为 `Error | string | null`，增强错误处理能力。
  - `CrudToolbar` 的 `props` 接口补全 `searchPlaceholder?: string` 定义。
- **文档完善**: 新增“决策 7”，阐明“无头 Composable”与“视图编排 Component”的协作模式。更新了所有相关示例代码以匹配 v1.4 最终设计。

### **v1.3 更新日志**

- **核心优化**: ToolbarActions 采用“配置优先，插槽兜底”混合方案.
  - 新增 `useToolbarActions` Composable，通过配置对象定义按钮（支持权限过滤、条件显示、loading 状态）.
  - `CrudToolbar` 新增 `actions` prop，接收配置后自动渲染标准按钮.
  - 保留 `#actions` 插槽作为逃生舱，满足复杂定制场景.
- **架构澄清**: 明确 CrudToolbar 内部结构——搜索区和控制区是内部实现，标题区和操作区是插槽.
- **分页位置确定**: `CrudPagination` 集成到 `CrudTable` 内部，不对外暴露为独立组件.
- **新增设计决策**: 补充决策 3（ToolbarActions 混合方案）、决策 4（分页位置）、决策 5（组件层次 ≠ Composable 层次）.

### **v1.1 更新日志**

- **核心优化**: 重构 `CrudToolbar` 组件的 API. 不再传递大量与搜索相关的独立 `props` 和 `emits`, 而是直接接收 `smartSearch` 对象.
  - **收益**: 大幅降低父组件与 `CrudToolbar` 之间的耦合, 简化了父组件模板, 提升了组件的封装性和长期可维护性.
- **文档同步**: 更新了 "组件 API 设计" 和 "使用示例" 部分以反映新的 API 设计.

---

## 📋 目录

1. [现状分析](#现状分析)
2. [设计目标](#设计目标)
3. [架构设计](#架构设计)
4. [组件 API 设计](#组件-api-设计)
5. [Composable API 设计](#composable-api-设计)
6. [设计决策说明](#设计决策说明)
7. [实施路线图](#实施路线图)
8. [风险评估](#风险评估)
9. [使用示例](#使用示例)

---

## 现状分析

### 用户管理模块结构

```
src/views/admin/users/
├── UserListPage.vue              # 页面编排层
├── components/
│   ├── UserToolbar.vue           # 工具栏（4段式布局）
│   ├── UserTable.vue             # 表格+分页
│   ├── UserFormDialog.vue        # 表单弹窗（业务特定）
│   └── TableColumnConfigDialog.vue  # 列配置弹窗
├── composables/
│   ├── useUserListPage.ts        # 页面逻辑编排
│   └── useUserTableColumns.ts    # 表格列定义（业务特定）
├── search-config.ts              # 搜索配置（业务特定）
└── constants.ts                  # 权限常量（业务特定）
```

### 已有的通用能力

| Composable/Component | 位置                       | 功能                      | 复用性  |
| -------------------- | -------------------------- | ------------------------- | ------- |
| `useCrudApi`         | `src/composables/`         | CRUD 操作、分页、乐观更新 | ✅ 通用 |
| `useSmartSearch`     | `src/composables/`         | 智能搜索、条件管理        | ✅ 通用 |
| `useLruCache`        | `src/composables/`         | LRU 缓存                  | ✅ 通用 |
| `usePermission`      | `src/composables/`         | 权限检查                  | ✅ 通用 |
| `useTableFullscreen` | `src/composables/`         | 全屏控制                  | ✅ 通用 |
| `useTableDensity`    | `src/composables/`         | 密度控制                  | ✅ 通用 |
| `DataTable`          | `src/components/ui/table/` | 数据表格                  | ✅ 通用 |
| `SmartSearchBar`     | `src/components/search/`   | 搜索栏                    | ✅ 通用 |

### 需要抽象的部分

| 组件/逻辑            | 当前状态              | 抽象难度 | 优先级 |
| -------------------- | --------------------- | -------- | ------ |
| 页面布局（上-中-下） | 硬编码在 UserListPage | 低       | 🔴 高  |
| 工具栏（4段式）      | 硬编码在 UserToolbar  | 中       | 🔴 高  |
| 表格+分页集成        | 硬编码在 UserTable    | 低       | 🟡 中  |
| 页面逻辑编排         | useUserListPage       | 中       | 🔴 高  |
| 批量操作逻辑         | useUserListPage       | 低       | 🟡 中  |

---

## 设计目标

### 核心原则

1. **DRY（Don't Repeat Yourself）**: 消除重复代码，提取可复用逻辑
2. **灵活性**: 通过插槽和配置支持业务定制
3. **类型安全**: 使用 TypeScript 泛型确保类型推断
4. **向后兼容**: 不破坏现有用户管理功能
5. **渐进式重构**: 分阶段实施，降低风险

### 成功标准

- ✅ 新增角色管理、设备管理等模块时，代码量减少 60%+
- ✅ 所有 CRUD 页面遵循统一的设计规范
- ✅ 类型检查通过，无 `any` 类型
- ✅ 响应式布局在所有断点下正常工作
- ✅ 现有用户管理功能不受影响

---

## 架构设计

### 抽象层次

```
┌─────────────────────────────────────────────────────────┐
│  业务层（Business Layer）                                 │
│  - RoleListPage.vue                                      │
│  - DeviceListPage.vue                                    │
│  - role-search-config.ts                                 │
│  - ROLE_PERMISSION                                       │
└─────────────────────────────────────────────────────────┘
                          ↓ 使用
┌─────────────────────────────────────────────────────────┐
│  通用组件层（Generic Component Layer）                    │
│  - CrudPageLayout.vue                                    │
│  - CrudToolbar.vue                                       │
│  - CrudTable.vue                                         │
└─────────────────────────────────────────────────────────┘
                          ↓ 使用
┌─────────────────────────────────────────────────────────┐
│  通用逻辑层（Generic Logic Layer）                        │
│  - useCrudListPage<T>()                                  │
│  - useCrudToolbar()                                      │
└─────────────────────────────────────────────────────────┘
                          ↓ 使用
┌─────────────────────────────────────────────────────────┐
│  基础层（Foundation Layer）                               │
│  - useCrudApi<T>()                                       │
│  - useSmartSearch()                                      │
│  - DataTable.vue                                         │
└─────────────────────────────────────────────────────────┘
```

### 组件职责划分

| 组件              | 职责             | 可定制性                                                  |
| ----------------- | ---------------- | --------------------------------------------------------- |
| `CrudPageLayout`  | 上-中-下布局容器 | 插槽：toolbar, table, pagination                          |
| `CrudToolbar`     | 4段式工具栏      | 插槽：title, actions, controls; Props: `smartSearch` 对象 |
| `CrudTable`       | 表格+分页集成    | Props：columns, data, pagination                          |
| `useCrudListPage` | 逻辑编排         | 泛型：实体类型、API 接口                                  |

---

## 组件 API 设计

### 1. CrudPageLayout

**职责**: 提供上-中-下三段式布局容器

**Props**:

```typescript
interface CrudPageLayoutProps {
  /** 工具栏和表格之间的间距（px） */
  gap?: number
}
```

**Slots**:

```typescript
{
  /** 工具栏插槽 */
  toolbar: () => VNode
  /** 表格插槽 */
  table: () => VNode
  /** 分页插槽（可选，如果表格组件自带分页则不需要） */
  pagination?: () => VNode
}
```

**使用示例**:

```vue
<CrudPageLayout>
  <template #toolbar>
    <CrudToolbar ... />
  </template>
  <template #table>
    <CrudTable ... />
  </template>
</CrudPageLayout>
```

---

### 2. CrudToolbar (v1.4 优化)

**职责**: 提供4段式工具栏布局. 内部消化 `smartSearch` 逻辑, 对外暴露简洁的接口.

**Props**:

```typescript
import type { PropType } from 'vue'
import type { useSmartSearch } from '@/composables/useSmartSearch'
import type { useCrudToolbar } from '@/composables/useCrudToolbar'

interface ToolbarTitleConfig {
  /** 主标题文本 */
  text: string
  /** 副标题（可选） */
  subtitle?: string
  /** 图标组件（Element Plus 图标） */
  icon?: Component
  /** 是否在有选中项时显示选中数量和取消选中按钮 */
  showSelectedCount?: boolean
}

interface CrudToolbarProps {
  /**
   * useSmartSearch composable 的完整返回对象.
   * 组件内部将直接调用此对象的属性和方法, 无需在父组件手动绑定.
   */
  smartSearch: ReturnType<typeof useSmartSearch>

  /**
   * 工具栏状态对象，由 useCrudToolbar 返回.
   * 聚合了工具栏所需的所有状态（UI 状态 + 批量操作状态）.
   */
  toolbarState: {
    /** 是否加载中 (用于刷新按钮) */
    loading: boolean
    /** 选中的数量 */
    selectedCount: number
    /** 批量删除是否加载中 */
    batchDeleteLoading: boolean
    /** 是否全屏 */
    isFullscreen: boolean
    /** 当前密度 */
    density: TableDensity
  }

  /**
   * 标题配置对象（可选）.
   * 组件内部自动渲染标准标题布局（图标 + 主标题 + 副标题）.
   * 如果不传此 prop，则必须使用 #title 插槽自定义标题区.
   */
  title?: ToolbarTitleConfig

  /**
   * 操作按钮配置数组（可选）.
   * 由 useToolbarActions 返回的 filteredActions，组件内部自动渲染标准按钮.
   * 如果不传此 prop，则必须使用 #actions 插槽自定义操作区.
   */
  actions?: ToolbarAction[]

  /**
   * 搜索栏的占位文本 (v1.4 新增)
   */
  searchPlaceholder?: string
}
```

**Slots**:

```typescript
{
  /** 标题区插槽（逃生舱，优先级高于 title prop） */
  title?: (props: { selectedCount: number }) => VNode
  /** 操作区插槽（逃生舱，优先级高于 actions prop） */
  actions?: (props: { selectedCount: number }) => VNode
  /** 批量操作区插槽（有选中项时显示） */
  batchActions?: (props: { selectedCount: number }) => VNode
  /** 控制区插槽（默认显示刷新/全屏/密度/列配置） */
  controls?: () => VNode
}
```

**渲染优先级**:

- **标题区**: `#title` 插槽 > `title` prop > 不显示
- **操作区**: `#actions` 插槽 > `actions` prop > 不显示

**使用示例**:

```vue
<!-- 配置方式（推荐） -->
<CrudToolbar
  :smart-search="smartSearch"
  :toolbar-state="toolbarState"
  :title="{ text: '用户管理', icon: User, showSelectedCount: true }"
  :actions="filteredActions"
  search-placeholder="搜索用户..."
  @refresh="handleRefresh"
  @batch-delete="handleBatchDelete"
  @cancel-selection="handleCancelSelection"
  @search="() => handleSearch()"
  @toggle-fullscreen="toggleFullscreen"
  @change-density="setDensity"
  @open-column-config="openColumnConfig"
/>

<!-- 插槽方式（逃生舱） -->
<CrudToolbar :smart-search="smartSearch" :toolbar-state="toolbarState">
  <template #title="{ selectedCount }">
    <h2 v-if="selectedCount === 0">
      <el-icon><User /></el-icon>
      <span>用户管理</span>
    </h2>
    <div v-else>已选中 {{ selectedCount }} 项</div>
  </template>
</CrudToolbar>
```

**Emits**:

```typescript
{
  // 操作相关
  (e: 'create'): void
  (e: 'refresh'): void
  (e: 'batch-delete'): void
  (e: 'cancel-selection'): void
  (e: 'search'): void // 搜索事件, 由组件内部的 SmartSearchBar 触发后透传

  // 控制相关
  (e: 'toggle-fullscreen'): void
  (e: 'change-density', density: TableDensity): void
  (e: 'open-column-config'): void
}
```

**使用示例**:

```vue
<!-- v1.2：只需传入 2 个对象 Props -->
<CrudToolbar
  :smart-search="smartSearch"
  :toolbar-state="toolbarState"
  @create="openCreateDialog"
  @refresh="handleRefresh"
  @batch-delete="handleBatchDelete"
  @cancel-selection="handleCancelSelection"
  @search="() => handleSearch()"
  @toggle-fullscreen="toggleFullscreen"
  @change-density="setDensity"
  @open-column-config="openColumnConfig"
>
  <template #title="{ selectedCount }">
    <h2 v-if="selectedCount === 0">
      <el-icon><User /></el-icon>
      <span>用户管理</span>
    </h2>
    <div v-else>
      已选中 {{ selectedCount }} 项
    </div>
  </template>
</CrudToolbar>
```

---

### 3. CrudTable (v1.4 优化)

**职责**: 集成 DataTable + 分页器 + 状态管理

**Props**:

```typescript
interface CrudTableProps<T = any> {
  /** 表格数据 */
  data: T[]
  /** 表格列定义 */
  columns: TableColumn[]
  /** 是否加载中 */
  loading?: boolean
  /**
   * 错误信息或 Error 对象 (v1.4 增强)
   * 可接收 Error 对象以获取更丰富的错误上下文.
   */
  error?: Error | string | null
  /** 分页配置 */
  pagination: PaginationState
  /** 密度 */
  density?: TableDensity
  /** 是否显示选择列 */
  showSelection?: boolean
  /** 空状态文本 */
  emptyText?: string
  /** 空状态操作文本 */
  emptyActionText?: string
}
```

**Slots**:

```typescript
{
  /** 空状态插槽 */
  empty?: () => VNode
  /** 错误状态插槽 (v1.4 增强) */
  error?: (props: { error: Error | string | null }) => VNode
}
```

**Emits**:

```typescript
{
  (e: 'selection-change', selected: T[]): void
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'retry'): void
  (e: 'create'): void
}
```

**Expose**:

```typescript
{
  /** 清空选中状态 */
  clearSelection: () => void
}
```

---

## Composable API 设计

### 1. useCrudListPage (v1.4 优化)

**职责**: 整合 CRUD 逻辑、搜索逻辑、批量操作逻辑，作为页面的核心“无头”逻辑引擎。

**类型定义**:

```typescript
interface UseCrudListPageOptions<T extends EntityWithId, C, U> {
  /** API 接口 */
  api: CrudApi<T, C, U>

  /** 搜索字段定义 */
  searchFields: SearchFieldDef[]

  /** 快速搜索预设 */
  quickPresets?: QuickSearchPreset[]

  /** 收藏夹列表 */
  favorites?: SearchFavorite[]

  /** 权限常量 */
  permissions?: {
    create: string
    update: string
    delete: string
  }

  /** 初始分页大小 */
  pageSize?: number

  /** 是否启用乐观更新 */
  optimisticUpdate?: boolean
}

// v1.4: 返回值按职责分组，提升可读性和 DX
interface UseCrudListPageReturn<T, C, U> {
  // 核心状态
  state: {
    data: Ref<PaginatedResponse<T> | null>
    loading: Ref<boolean>
    error: Ref<Error | null>
    pagination: PaginationState
    selectedItems: Ref<T[]>
    selectedCount: Ref<number>
    hasSelection: Ref<boolean>
    batchDeleteLoading: Ref<boolean>
    getCachedData: (id: number) => T | undefined
  }

  // 搜索相关
  search: {
    instance: ReturnType<typeof useSmartSearch>
    handleSearch: (page?: number) => Promise<void>
    handleRefresh: () => Promise<void>
  }

  // 弹窗相关
  dialogs: {
    formOpen: Ref<boolean>
    editingId: Ref<number | null>
    key: Ref<number>
    openCreate: () => void
    openEdit: (id: number) => void
    close: () => void
  }

  // 批量选择相关
  selection: {
    handleSelectionChange: (selected: T[]) => void
    clearSelectionState: () => void // v1.4: 纯状态清除函数
    handleBatchDelete: () => Promise<void>
  }

  // API 操作
  apiActions: {
    handleCreate: (formData: C) => Promise<T | null>
    handleEdit: (id: number, formData: U) => Promise<T | null>
    handleDelete: (id: number) => Promise<boolean>
  }

  // 权限
  permissions: ReturnType<typeof usePermission>
}
```

**使用示例**:

```typescript
// v1.4: 使用分组后的返回值
const { state, search, dialogs, selection, apiActions, permissions } = useCrudListPage<
  User,
  CreateUserInput,
  UpdateUserInput
>({
  api: userApi,
  searchFields: userSearchFields
  // ... 其他选项
})

// 在模板中使用:
// :loading="state.loading"
// @click="dialogs.openCreate()"
// @search="() => search.handleSearch()"
```

---

### 2. useCrudToolbar

**职责**: 管理工具栏相关 UI 状态（全屏、密度、列配置），并将外部传入的批量操作状态聚合为 `toolbarState` 对象，供 `CrudToolbar` 组件直接消费.

**类型定义**:

```typescript
interface UseCrudToolbarOptions {
  /**
   * 来自 useCrudListPage 的外部状态引用.
   * useCrudToolbar 不拥有这些状态，只是将它们聚合进 toolbarState.
   */
  externalState: {
    loading: Ref<boolean>
    selectedCount: Ref<number>
    batchDeleteLoading: Ref<boolean>
  }
}

interface UseCrudToolbarReturn {
  // 全屏状态
  isFullscreen: Ref<boolean>
  toggleFullscreen: () => void

  // 密度状态
  density: Ref<TableDensity>
  setDensity: (density: TableDensity) => void

  // 列配置对话框状态
  columnConfigDialogOpen: Ref<boolean>
  openColumnConfig: () => void
  closeColumnConfig: () => void

  /**
   * 聚合后的工具栏状态对象，直接传给 CrudToolbar 的 :toolbar-state.
   * 内部是一个 computed，自动响应所有状态变化.
   */
  toolbarState: ComputedRef<{
    loading: boolean
    selectedCount: number
    batchDeleteLoading: boolean
    isFullscreen: boolean
    density: TableDensity
  }>
}
```

**使用示例**:

```typescript
const {
  isFullscreen,
  toggleFullscreen,
  density,
  setDensity,
  columnConfigDialogOpen,
  openColumnConfig,
  toolbarState // ← 直接传给 CrudToolbar
} = useCrudToolbar({
  externalState: {
    loading,
    selectedCount,
    batchDeleteLoading
  }
})
```

---

### 3. useToolbarActions

**职责**: 通过配置对象定义操作按钮，自动处理权限过滤和条件显示.

**类型定义**:

```typescript
interface ToolbarAction {
  /** 按钮唯一标识 */
  key: string
  /** 按钮文本 */
  label: string
  /** 按钮图标（Element Plus 图标组件） */
  icon?: Component
  /** 按钮类型 */
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** 点击处理函数 */
  handler: () => void | Promise<void>
  /** 权限代码（可选，如果提供则自动进行权限检查） */
  permission?: string
  /** 条件显示函数（可选，返回 false 则隐藏按钮） */
  showWhen?: () => boolean
  /** 是否加载中 */
  loading?: Ref<boolean> | boolean
}

interface UseToolbarActionsOptions {
  /** 操作按钮配置数组 */
  actions: ToolbarAction[]
}

interface UseToolbarActionsReturn {
  /**
   * 过滤后的操作按钮数组（computed）.
   * 自动根据权限和 showWhen 条件过滤.
   */
  filteredActions: ComputedRef<ToolbarAction[]>
}
```

**使用示例**:

```typescript
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { useToolbarActions } from '@/composables/useToolbarActions'
import { USER_PERMISSION } from './constants'

const createLoading = ref(false)

const { filteredActions } = useToolbarActions({
  actions: [
    {
      key: 'create',
      label: '新增用户',
      icon: Plus,
      type: 'primary',
      handler: openCreateDialog,
      permission: USER_PERMISSION.create,
      loading: createLoading
    },
    {
      key: 'import',
      label: '批量导入',
      icon: Upload,
      handler: openImportDialog,
      permission: USER_PERMISSION.create,
      showWhen: () => !hasSelection.value // 有选中项时隐藏
    },
    {
      key: 'export',
      label: '导出数据',
      icon: Download,
      handler: handleExport,
      showWhen: () => data.value?.items.length > 0 // 有数据时才显示
    }
  ]
})

// 在模板中使用
// <CrudToolbar :actions="filteredActions" ... />
```

---

## 设计决策说明

### 决策 1：CrudToolbar 接收对象 Props 而非展开 Props

**问题**: 工具栏需要多个状态（搜索状态、批量操作状态、UI 状态），如何传递？

**选择**: 将相关状态封装为对象（`smartSearch`, `toolbarState`），而非展开为独立 Props.

**权衡**:

| 方案                       | 优点                     | 缺点                              |
| -------------------------- | ------------------------ | --------------------------------- |
| 展开为独立 Props           | 每个 Prop 语义清晰       | 接口臃肿，维护困难（3处同步修改） |
| **封装为对象（当前方案）** | 接口简洁，父组件模板干净 | 需要理解对象内部结构              |

**结论**: 对象封装更符合"组件是逻辑的视图"这一原则，`CrudToolbar` 是 `smartSearch` 和 `toolbarState` 的视图层.

---

### 决策 2：Composable 职责划分（聚合 vs 拆分）

**问题**: 批量操作逻辑（`selectedCount`, `batchDeleteLoading`, `handleCancelSelection`）应该放在哪里？

**选择**: 保持在 `useCrudListPage` 中（聚合方案），`useCrudToolbar` 只负责聚合状态，不拥有数据逻辑.

**权衡**:

| 方案                 | 优点                                           | 缺点                                     |
| -------------------- | ---------------------------------------------- | ---------------------------------------- |
| **聚合方案（当前）** | 数据流单向清晰，调试容易，无跨 composable 依赖 | `useCrudListPage` 返回值较多             |
| 拆分方案             | 职责更细化                                     | 两个 composable 需要相互传参，增加复杂度 |

**结论**: 当前阶段优先选择聚合方案。`useCrudToolbar` 通过 `externalState` 参数接收来自 `useCrudListPage` 的状态引用，只做聚合，不做逻辑处理.

**未来演进路径**（当模块复杂度增加时可考虑）:

```
当前：useCrudListPage → 返回 selectedCount, batchDeleteLoading
                ↓ 传入
         useCrudToolbar（聚合为 toolbarState）

未来（可选）：useCrudBatchSelection（独立管理批量选择逻辑）
                ↓ 传入
         useCrudListPage（只关注 CRUD + 搜索）
                ↓ 传入
         useCrudToolbar（聚合为 toolbarState）
```

---

### 决策 3：ToolbarActions 混合方案（配置优先，插槽兜底）

**问题**: 每个业务模块的操作按钮各不相同（用户管理有"新增用户"，角色管理有"新增角色"+"权限配置"），如何平衡通用性和定制性？

**选择**: 采用"配置优先，插槽兜底"的混合方案.

**权衡**:

| 方案                 | 优点                                           | 缺点                                     |
| -------------------- | ---------------------------------------------- | ---------------------------------------- |
| 纯插槽方案           | 最大灵活性                                     | 每个页面都要写重复的按钮模板             |
| 纯配置方案           | 简洁，易于维护                                 | 无法满足复杂定制（如嵌套菜单、特殊交互） |
| **混合方案（当前）** | 80% 场景用配置（简洁），20% 场景用插槽（灵活） | 需要理解两种用法                         |

**实现细节**:

1. **配置方式**（推荐，适用于标准按钮）:

   ```vue
   <CrudToolbar :actions="filteredActions" ... />
   ```

   - 通过 `useToolbarActions` 定义按钮配置
   - 自动处理权限过滤、条件显示、loading 状态
   - 组件内部渲染标准 `el-button`

2. **插槽方式**（逃生舱，适用于复杂定制）:

   ```vue
   <CrudToolbar ...>
     <template #actions>
       <el-dropdown>...</el-dropdown>  <!-- 复杂交互 -->
     </template>
   </CrudToolbar>
   ```

   - 完全自定义操作区内容
   - 适用于下拉菜单、按钮组、特殊布局等场景

**结论**: 配置方式覆盖大部分场景，插槽方式作为兜底，避免过度抽象.

---

### 决策 4：CrudPagination 位置（集成 vs 独立）

**问题**: 分页器应该作为独立组件暴露，还是集成到 `CrudTable` 内部？

**选择**: 集成到 `CrudTable` 内部，不对外暴露为独立组件.

**权衡**:

| 方案                 | 优点                                             | 缺点                                         |
| -------------------- | ------------------------------------------------ | -------------------------------------------- |
| **集成方案（当前）** | 减少组件层级，API 更简洁，分页与表格状态天然同步 | 灵活性稍低（但实际场景中分页总是与表格绑定） |
| 独立组件方案         | 理论上更灵活                                     | 增加组件层级，需要手动同步状态，实际无收益   |

**实现细节**:

- `CrudTable` 接收 `pagination` prop（包含 `page`, `pageSize`, `total`）
- 内部自动渲染 `el-pagination`
- 通过 `@page-change` 和 `@size-change` 事件通知父组件

**结论**: 分页器与表格是强绑定关系，集成方案更符合实际使用场景.

---

### 决策 5：组件层次 ≠ Composable 层次

**问题**: `CrudToolbar` 内部有搜索区、控制区等子区域，是否应该拆分为子组件（如 `ToolbarSearchSection`, `ToolbarControlSection`）并对外暴露？

**选择**: 内部实现细节不对外暴露，保持组件 API 简洁.

**权衡**:

| 方案                 | 优点                                       | 缺点                                           |
| -------------------- | ------------------------------------------ | ---------------------------------------------- |
| **内部实现（当前）** | API 简洁，使用者无需关心内部结构，易于重构 | 内部复杂度稍高（但可控）                       |
| 暴露子组件方案       | 理论上更"组件化"                           | API 复杂，使用者需要理解内部结构，增加学习成本 |

**核心原则**:

- **组件层次**: 面向使用者，暴露最小必要接口（`CrudPageLayout` → `CrudToolbar` → `CrudTable`）
- **Composable 层次**: 面向逻辑复用，按职责拆分（`useCrudListPage`, `useCrudToolbar`, `useToolbarActions`）
- **两者独立**: 组件可以内部使用多个 Composable，Composable 也可以被多个组件使用

**实例**:

```
组件层次（对外）:
CrudToolbar（单一组件，4 个插槽）
  ├─ #title
  ├─ #actions
  ├─ #batchActions
  └─ #controls

Composable 层次（内部逻辑）:
useCrudToolbar（UI 状态管理）
useToolbarActions（按钮配置管理）
useSmartSearch（搜索逻辑，外部传入）
```

**结论**: 组件设计追求简洁易用，Composable 设计追求逻辑复用，两者职责不同.

---

### 决策 6：标题区配置化（与 ToolbarActions 保持一致）

**问题**: 标题区在所有 CRUD 页面中结构高度相似（图标 + 主标题 + 副标题 + 选中状态），是否也应该配置化？

**选择**: 与 ToolbarActions 保持一致，采用"配置优先，插槽兜底"方案.

**标准布局**:

```
┌─────────────────────────────────────────────────────────┐
│  [ICON]  主标题                                           │
│  [ICON]  副标题（可选）                                   │
│                                                           │
│  有选中项时：已选中 N 项  [取消选中]                      │
└─────────────────────────────────────────────────────────┘
```

- 图标占两行高度（与主标题+副标题对齐）
- `showSelectedCount: true` 时，有选中项自动切换为"已选中 N 项 + 取消选中按钮"

**权衡**:

| 方案                 | 优点                                 | 缺点                                    |
| -------------------- | ------------------------------------ | --------------------------------------- |
| 纯插槽方案           | 最大灵活性                           | 每个页面都要写重复的标题模板（约 8 行） |
| **配置方案（当前）** | 消除重复，统一布局，自动处理选中状态 | 特殊布局需要插槽兜底                    |

**结论**: 标题区结构固定，配置化可消除每个页面 ~8 行重复代码，同时保留插槽作为逃生舱.

---

### 决策 7：严格分离“无头”逻辑与“视图”编排 (v1.4 新增)

**问题**: Composable 中的函数是否应该直接或间接地操作组件的 `ref` 实例？

**选择**: 严格禁止。Composable 应当是“无头(Headless)”的，它只管理状态和纯逻辑，不应感知任何视图层（Component）的实现细节。视图与逻辑的“连接”工作应由组件的 `<script setup>` (视图编排层) 负责。

**权衡**:

| 方案                      | 优点                                     | 缺点                                 |
| ------------------------- | ---------------------------------------- | ------------------------------------ |
| **分离方案（当前 v1.4）** | 职责边界清晰，逻辑可独立测试，代码更健壮 | 需要在组件中编写少量“胶水”代码       |
| 混合方案（v1.3 初版设计） | 组件代码看似更少                         | 破坏了分层，逻辑与视图耦合，难以测试 |

**实例：`handleCancelSelection` 的演变**

- **v1.3 设计**: `useCrudListPage` 返回 `handleCancelSelection`，该函数需要隐式地知道 `crudTableRef` 才能工作。
- **v1.4 方案**:
  1. `useCrudListPage` 只提供纯状态管理：`selectedItems` 和 `clearSelectionState()`。
  2. `CrudTable` 暴露 `clearSelection()` 方法。
  3. `UserListPage.vue` (视图编排层) 定义 `handleCancelSelection` 函数，它负责**编排**：
     ```typescript
     function handleCancelSelection() {
       // 1. 命令视图更新
       crudTableRef.value?.clearSelection()
       // 2. 命令状态更新
       selection.clearSelectionState()
     }
     ```

**结论**: 这种分离确保了 `useCrudListPage` 成为一个高度可移植、可独立测试的纯逻辑单元，是更健壮、更可维护的架构模式。

---

## 实施路线图

### 阶段 1: 创建通用组件（1-2 天）

**任务**:

1. ✅ 创建 `CrudPageLayout.vue`
2. ✅ 创建 `CrudToolbar.vue`
3. ✅ 创建 `CrudTable.vue`
4. ✅ 编写单元测试

**验收标准**:

- 组件 API 符合设计文档
- 响应式布局在所有断点下正常工作
- TypeScript 类型检查通过

---

### 阶段 2: 创建通用 Composables（1-2 天）

**任务**:

1. ✅ 创建 `useCrudListPage.ts`
2. ✅ 创建 `useCrudToolbar.ts`
3. ✅ 编写单元测试

**验收标准**:

- 泛型类型推断正确
- 所有功能与 `useUserListPage` 对齐
- 测试覆盖率 > 80%

---

### 阶段 3: 重构用户管理模块（1 天）

**任务**:

1. ✅ 使用新组件重构 `UserListPage.vue`
2. ✅ 使用新 composable 重构逻辑
3. ✅ 删除旧的 `UserToolbar.vue`（保留 `UserTable.vue` 作为过渡）
4. ✅ 回归测试

**验收标准**:

- 功能与重构前完全一致
- 代码量减少 40%+
- 无 TypeScript 错误

---

### 阶段 4: 应用到新模块（2-3 天）

**任务**:

1. ✅ 创建角色管理模块（使用新组件）
2. ✅ 创建设备管理模块（使用新组件）
3. ✅ 验证可复用性

**验收标准**:

- 新模块代码量 < 300 行
- 遵循统一设计规范
- 响应式布局正常

---

### 阶段 5: 文档和示例（1 天）

**任务**:

1. ✅ 编写使用指南
2. ✅ 提供模板代码
3. ✅ 更新 CLAUDE.md

**验收标准**:

- 文档清晰易懂
- 示例代码可直接运行
- 包含常见问题解答

---

## 风险评估

### 高风险

| 风险                 | 影响                       | 缓解措施                     |
| -------------------- | -------------------------- | ---------------------------- |
| 泛型类型推断失败     | 开发体验差，类型安全性降低 | 充分测试，提供类型辅助函数   |
| 响应式布局断点不一致 | UI 在某些屏幕尺寸下错乱    | 严格遵循设计规范，多设备测试 |
| 重构破坏现有功能     | 用户管理模块不可用         | 渐进式重构，充分回归测试     |

### 中风险

| 风险             | 影响                 | 缓解措施               |
| ---------------- | -------------------- | ---------------------- |
| 插槽设计不够灵活 | 无法满足特殊业务需求 | 提供足够的插槽和配置项 |
| 性能问题         | 大数据量下卡顿       | 使用虚拟滚动，优化渲染 |

### 低风险

| 风险     | 影响                 | 缓解措施           |
| -------- | -------------------- | ------------------ |
| 学习成本 | 团队成员需要时间适应 | 提供详细文档和示例 |

---

## 重构用户管理

### 重构后的 UserListPage (v1.4)

按照 v1.4 最终设计方案重构，展示“视图编排层”如何连接“逻辑层”和“视图层”。

**重构前后对比**：

- **重构前**：UserListPage.vue (~250 行) + UserToolbar.vue (~80 行) + useUserListPage.ts (~200 行)
- **重构后**：UserListPage.vue (~130 行，使用通用组件和 Composables）

**重构步骤**：

**1. 保持搜索配置不变 (`search-config.ts`)**
**2. 保持权限常量不变 (`constants.ts`)**
**3. 重构页面 (`UserListPage.vue`)**：

```vue
<template>
  <CrudPageLayout>
    <template #toolbar>
      <CrudToolbar
        :smart-search="search.instance"
        :toolbar-state="toolbarState"
        :title="{ text: '用户管理', icon: User, showSelectedCount: true }"
        :actions="filteredActions"
        search-placeholder="搜索用户名、邮箱、手机号..."
        @refresh="search.handleRefresh"
        @batch-delete="selection.handleBatchDelete"
        @cancel-selection="handleCancelSelection"
        @search="() => search.handleSearch()"
        @toggle-fullscreen="toggleFullscreen"
        @change-density="setDensity"
        @open-column-config="openColumnConfig"
      />
    </template>

    <template #table>
      <CrudTable
        ref="crudTableRef"
        :data="state.data?.items ?? []"
        :columns="columns"
        :loading="state.loading"
        :error="state.error"
        :pagination="state.pagination"
        :density="density"
        empty-text="暂无用户数据"
        empty-action-text="创建第一个用户"
        @selection-change="selection.handleSelectionChange"
        @page-change="page => search.handleSearch(page)"
        @size-change="handleSizeChange"
        @retry="search.handleRefresh"
        @create="dialogs.openCreate"
      />
    </template>
  </CrudPageLayout>

  <!-- 以下弹窗保持不变 -->
  <UserFormDialog
    v-if="dialogs.formOpen"
    :key="dialogs.key"
    :open="dialogs.formOpen"
    :user-id="dialogs.editingId"
    :get-cached-data="state.getCachedData"
    @update:open="dialogs.close"
    @submit="handleSubmit"
  />

  <AdvancedSearchDialog
    v-if="search.instance.state.value"
    v-model="search.instance.state.value.advancedDialogOpen"
    :conditions="search.instance.conditions.value"
    :fields="userSearchFields"
    :favorites="userSearchFavorites"
    @replace-conditions="search.instance.replaceConditions"
  />

  <TableColumnConfigDialog v-model="columnConfigDialogOpen" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { User, Plus } from '@element-plus/icons-vue'
import { useCrudListPage } from '@/composables/useCrudListPage'
import { useCrudToolbar } from '@/composables/useCrudToolbar'
import { useToolbarActions } from '@/composables/useToolbarActions'
import { useUserTableColumns } from './composables/useUserTableColumns'
import {
  userApi,
  type CreateUserInput,
  type UpdateUserInput,
  type User as UserType
} from '@/api/modules/user'
import { userSearchFields, userQuickPresets, userSearchFavorites } from './search-config'
import { USER_PERMISSION } from './constants'
import CrudPageLayout from '@/components/common/CrudPageLayout.vue'
import CrudToolbar from '@/components/common/CrudToolbar.vue'
import CrudTable from '@/components/common/CrudTable.vue'
import UserFormDialog from './components/UserFormDialog.vue'
import AdvancedSearchDialog from '@/components/search/AdvancedSearchDialog.vue'
import TableColumnConfigDialog from './components/TableColumnConfigDialog.vue'

const crudTableRef = ref<InstanceType<typeof CrudTable> | null>(null)

// ==================== 页面逻辑 (from Composable) ====================
const { state, search, dialogs, selection, apiActions, permissions } = useCrudListPage<
  UserType,
  CreateUserInput,
  UpdateUserInput
>({
  api: userApi,
  searchFields: userSearchFields,
  quickPresets: userQuickPresets,
  favorites: userSearchFavorites,
  permissions: USER_PERMISSION,
  pageSize: 20,
  optimisticUpdate: true
})

// ==================== 工具栏状态 ====================
const {
  isFullscreen,
  toggleFullscreen,
  density,
  setDensity,
  columnConfigDialogOpen,
  openColumnConfig,
  toolbarState
} = useCrudToolbar({
  externalState: {
    loading: state.loading,
    selectedCount: state.selectedCount,
    batchDeleteLoading: state.batchDeleteLoading
  }
})

// ==================== 操作按钮配置 ====================
const { filteredActions } = useToolbarActions({
  actions: [
    {
      key: 'create',
      label: '新增用户',
      icon: Plus,
      type: 'primary',
      handler: dialogs.openCreate,
      permission: permissions.create
    }
  ]
})

// ==================== 表格列定义（业务特定）====================
const { columns } = useUserTableColumns({
  onEdit: dialogs.openEdit,
  onDelete: apiActions.handleDelete
})

// ==================== 视图编排逻辑 (in Component) ====================
function handleSizeChange(size: number) {
  state.pagination.pageSize = size
  search.handleSearch(1)
}

async function handleSubmit(formData: CreateUserInput | UpdateUserInput) {
  const success = dialogs.editingId.value
    ? await apiActions.handleEdit(dialogs.editingId.value, formData as UpdateUserInput)
    : await apiActions.handleCreate(formData as CreateUserInput)
  if (success) dialogs.close()
}

// v1.4: 视图编排函数，连接 V 和 M
function handleCancelSelection() {
  crudTableRef.value?.clearSelection() // 指令 View 更新
  selection.clearSelectionState() // 指令 Model 更新
}
</script>
```

### 重构收益

**代码量对比**：

- **重构前**：UserListPage.vue (~250 行) + UserToolbar.vue (~80 行) = 330 行
- **重构后**：UserListPage.vue (~115 行)
- **减少**：215 行（65%）

**接口复杂度对比**：

| 指标       | 重构前                 | 重构后 (v1.3)      | 改进   |
| ---------- | ---------------------- | ------------------ | ------ |
| 组件文件数 | 2 个（Page + Toolbar） | 1 个（Page）       | -50%   |
| Props 传递 | 10+ 个独立 Props       | 4 个对象 Props     | -60%   |
| 标题区     | 硬编码在模板（~8 行）  | 配置驱动（1 行）   | -87%   |
| 操作按钮   | 硬编码在模板           | 配置驱动           | 更灵活 |
| 状态管理   | 分散在多个文件         | 集中在 Composables | 更清晰 |

**功能完整性**：

- ✅ 所有 CRUD 操作保持不变
- ✅ 智能搜索功能保持不变
- ✅ 批量操作功能保持不变
- ✅ 权限控制保持不变
- ✅ 响应式布局保持不变

---

### 扩展示例：新增角色管理模块

重构完成后，新增角色管理模块只需 ~130 行代码：

```vue
<!-- RoleListPage.vue：复用通用组件，只需关注业务差异 -->
<script setup lang="ts">
// 与 UserListPage 结构完全一致，只替换业务相关的部分：
// - roleApi → userApi
// - ROLE_PERMISSION → USER_PERMISSION
// - roleSearchFields → userSearchFields
// - useRoleTableColumns → useUserTableColumns
// - 操作按钮配置（角色管理额外有"权限配置"按钮）

const { filteredActions } = useToolbarActions({
  actions: [
    {
      key: 'create',
      label: '新增角色',
      icon: Plus,
      type: 'primary',
      handler: openCreateDialog,
      permission: ROLE_PERMISSION.create
    },
    {
      key: 'permission-config',
      label: '权限配置',
      icon: Setting,
      handler: openPermissionConfig,
      permission: ROLE_PERMISSION.update,
      showWhen: () => hasSelection.value
    }
  ]
})
</script>
```

### 复杂定制示例：使用 #actions 插槽（逃生舱）

当操作区需要下拉菜单等复杂交互时，使用插槽覆盖配置：
<template #actions>

<!-- 完全自定义，不受 :actions prop 限制 -->

<el-button type="primary" @click="openCreateDialog">
<el-icon><Plus /></el-icon> 新增
</el-button>
<el-dropdown @command="handleBatchCommand">
<el-button>批量操作 <el-icon><ArrowDown /></el-icon></el-button>
<template #dropdown>
<el-dropdown-menu>
<el-dropdown-item command="export">导出选中</el-dropdown-item>
<el-dropdown-item command="disable" divided>批量禁用</el-dropdown-item>
</el-dropdown-menu>
</template>
</el-dropdown>
</template>
</CrudToolbar>

````

```vue
<CrudToolbar :smart-search="smartSearch" :toolbar-state="toolbarState">

---

## 总结

### 关键收益

1. **代码复用**: 新增 CRUD 模块代码量减少 60%+
2. **一致性**: 所有模块遵循统一设计规范
3. **类型安全**: 泛型设计确保类型推断
4. **可维护性**: 集中管理通用逻辑，易于维护
5. **灵活性**: 插槽机制支持业务定制

### 下一步行动

1. ✅ 评审设计方案
2. ✅ 创建 feature 分支
3. ✅ 按阶段实施重构
4. ✅ 代码审查和测试
5. ✅ 合并到 develop 分支

---

**文档维护者**: 前端团队
**最后更新**: 2026-03-12 (v1.4)
````
