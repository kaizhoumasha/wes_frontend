# CRUD 开发指南

**版本**: 1.0
**最后更新**: 2026-03-14
**适用**: P9 WES 前端项目

---

## 概述

本指南介绍如何使用项目中的通用 CRUD 组件和 Composables 快速构建标准的增删改查功能模块。

### 架构分层

```
┌─────────────────────────────────────────────────────────────┐
│                      View Layer (页面层)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │CrudPageContainer│  │CrudTable     │  │ CrudToolbar          │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │CrudFormDialog│  │ColumnConfigDialog│  │ (业务特定组件)     │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Logic Layer (逻辑层)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │useCrudListPage│ │useTableColumns│ │ useSmartSearch       │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │useCrudApi   │  │usePermission │  │ (业务特定 Composables)│ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Formatter Layer (格式化层)                  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ createBooleanTagFormatter  │ createDateTimeFormatter    ││
│  │ createArrayTagFormatter    │ createStatusTagFormatter   ││
│  │ createActionsFormatter     │ buildActionsColumn         ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 快速开始

### 最小化示例（配置驱动）

```vue
<!-- src/views/admin/products/ProductListPage.vue -->
<template>
  <CrudPageContainer :config="config" />
</template>

<script setup lang="ts">
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import { useProductPageConfig } from './useProductPageConfig'

const config = useProductPageConfig()
</script>
```

```ts
// src/views/admin/products/useProductPageConfig.ts
import { defineCrudPageConfig } from '@/components/common/crud-page/defineCrudPageConfig'

export function useProductPageConfig() {
  return defineCrudPageConfig({
    resource: {
      key: 'products',
      title: {
        text: '商品管理',
        subtitle: '管理系统商品',
        icon: 'ep:goods'
      },
      api: productApi,
      permissions: PRODUCT_PERMISSION,
      pageSize: 20,
      defaultSort: [{ field: 'updated_at', order: 'desc' }]
    },
    search: {
      fields: productSearchFields,
      quickPresets: productQuickPresets,
      favorites: productSearchFavorites,
      placeholder: '搜索商品名称、SKU...'
    },
    table: {
      selectable: true,
      columnResizable: true,
      defaultSort: { field: 'updated_at', order: 'descending' },
      columns: {
        defaultColumns: DEFAULT_PRODUCT_COLUMNS,
        createManager: useProductTableColumns
      }
    },
    form: {
      createSchema: ProductCreateSchema,
      updateSchema: ProductUpdateSchema,
      fieldConfig: PRODUCT_FORM_FIELDS
    }
  })
}
```

### 推荐分层

- 页面组件：只保留 `CrudPageContainer` 与 `config` 接入
- 页面配置：单独放在 `useXxxPageConfig.ts`
- 资源列配置：单独放在 `useXxxTableColumns.ts`
- 业务特例：通过 `extensions.toolbarActions` / `extensions.rowActions` 注入

---

## 核心组件详解

### 1. useCrudListPage - CRUD 逻辑引擎

**位置**: `src/composables/useCrudListPage.ts`

**功能**: 整合 CRUD 操作、搜索、批量操作、权限控制的"无头"逻辑引擎。

#### API

```typescript
interface UseCrudListPageOptions<T, C, U> {
  api: CrudApi<T, C, U> // CRUD API 实例
  searchFields: SearchFieldDef[] // 搜索字段定义
  quickPresets?: QuickSearchPreset[] // 快速搜索预设
  permissions?: {
    // 权限常量
    create: string
    update: string
    delete: string
  }
  pageSize?: number // 分页大小（默认 20）
  optimisticUpdate?: boolean // 乐观更新（默认 false）
  autoRefresh?: boolean // 自动刷新（默认 true，与 optimisticUpdate 互斥）
  defaultSort?: SortField[] // 默认排序
}
```

#### 返回值（按职责分组）

```typescript
const {
  // 核心状态
  state: {
    data: Ref<T[] | null>           // 表格数据
    loading: Ref<boolean>           // 加载状态
    error: Ref<Error | null>        // 错误信息
    pagination: PaginationState     // 分页状态
    selectedItems: Ref<T[]>         // 选中项
    selectedCount: Ref<number>      // 选中数量
    hasSelection: Ref<boolean>      // 是否有选中项
    batchDeleteLoading: Ref<boolean>// 批量删除加载状态
    sortState: Ref<SortField[] | null> // 排序状态
    getCachedData: (id: number) => T | undefined // 获取缓存数据
  },

  // 搜索相关
  search: {
    instance: ReturnType<typeof useSmartSearch> // 搜索实例
    handleSearch: (page?: number) => Promise<void>
    handleRefresh: () => Promise<void>
    handleSortChange: (sort: {...}) => Promise<void>
  },

  // 弹窗相关
  dialogs: {
    formOpen: Ref<boolean>
    editingId: Ref<number | null>
    key: Ref<number>                // 用于强制刷新弹窗
    openCreate: () => void
    openEdit: (id: number) => void
    close: () => void
  },

  // 批量选择相关
  selection: {
    handleSelectionChange: (selected: T[]) => void
    clearSelectionState: () => void
    handleBatchDelete: () => Promise<void>
  },

  // API 操作
  apiActions: {
    handleCreate: (formData: C) => Promise<T | null>
    handleEdit: (id: number, formData: U) => Promise<T | null>
    handleDelete: (id: number) => Promise<boolean>
  },

  // 权限
  permissions: {
    create: ComputedRef<boolean>
    update: ComputedRef<boolean>
    delete: ComputedRef<boolean>
  }
}
```

#### 使用示例

```typescript
const { state, search, dialogs, selection, apiActions, permissions } = useCrudListPage<
  User,
  CreateUserInput,
  UpdateUserInput
>({
  api: userApi,
  searchFields: USER_SEARCH_FIELDS,
  quickPresets: [
    { label: '超级用户', filters: [{ field: 'is_superuser', operator: 'eq', value: true }] },
    { label: '正常状态', filters: [{ field: 'is_active', operator: 'eq', value: true }] }
  ],
  permissions: USER_PERMISSION,
  pageSize: 20,
  optimisticUpdate: true, // 乐观更新，删除后不自动刷新
  defaultSort: [{ field: 'created_at', order: 'desc' }]
})
```

---

### 2. useTableColumns - 列配置管理

**位置**: `src/composables/useTableColumns.ts`

**功能**: 管理表格列的断点可见性、宽度、顺序、持久化。

#### API

```typescript
interface UseTableColumnsOptions {
  storageKey: string // localStorage 存储键
  defaultColumns: ColumnConfig[] // 默认列配置
  reorderLockedKeys?: string[] // 锁定顺序的列 key
}

interface ColumnConfig {
  key: string // 列唯一标识
  label: string // 列标签
  visibleFrom: 'desktop' | 'tablet' | 'mobile' | null // 可见断点
  width?: number // 列宽
  fixed?: 'left' | 'right' | null // 固定位置
  reorderLocked?: boolean // 锁定顺序
  hideable?: boolean // 允许隐藏
}
```

#### 返回值

```typescript
const {
  columnConfig, // Ref<ColumnConfig[]> - 当前列配置
  visibleColumnKeys, // ComputedRef<string[]> - 可见列 key
  updateConfig, // (config: ColumnConfig[]) => void - 更新配置
  updateColumnWidth, // (key: string, width: number) => void - 更新列宽
  resetConfig, // () => void - 恢复默认
  isColumnVisibleAtBreakpoint // (key: string, breakpoint: ColumnBreakpoint) => boolean
} = useTableColumns({
  storageKey: 'wes-user-table-columns',
  defaultColumns: DEFAULT_COLUMNS,
  reorderLockedKeys: ['username'] // 用户名列表锁定顺序
})
```

#### 断点可见性规则

| 断点      | 可见条件                                 |
| --------- | ---------------------------------------- |
| `mobile`  | `visibleFrom === 'mobile'`               |
| `tablet`  | `visibleFrom === 'tablet'` 或 `'mobile'` |
| `desktop` | `visibleFrom !== null`                   |

**继承规则**: 移动设备可见 → 平板可见 → PC 可见

---

### 3. buildTableColumnsByBreakpoint - 列构建工具

**位置**: `src/composables/useTableColumns.ts`

**功能**: 根据断点和列配置构建实际的表格列定义。

```typescript
function buildTableColumnsByBreakpoint(
  columnConfigs: ColumnConfig[],
  breakpoint: ColumnBreakpoint,
  columnMap: Map<string, TableColumnConfig>
): TableColumnConfig[]
```

#### 使用示例

```typescript
import { computed } from 'vue'
import { buildTableColumnsByBreakpoint } from '@/composables/useTableColumns'
import {
  createBooleanTagFormatter,
  createDateTimeFormatter
} from '@/components/common/table/formatters'

// 定义列配置
const USER_COLUMN_DEFINITIONS = [
  {
    key: 'username',
    label: '用户名',
    visibleFrom: 'mobile',
    column: { width: 120, fixed: 'left' }
  },
  {
    key: 'is_superuser',
    label: '超级用户',
    visibleFrom: 'desktop',
    column: {
      width: 100,
      sortable: true,
      formatter: createBooleanTagFormatter({ trueType: 'danger', falseType: 'info' })
    }
  },
  {
    key: 'updated_at',
    label: '更新时间',
    visibleFrom: 'tablet',
    column: {
      width: 160,
      formatter: createDateTimeFormatter()
    }
  }
]

// 构建 Map
const COLUMN_MAP = new Map(
  USER_COLUMN_DEFINITIONS.map(def => [
    def.key,
    {
      field: def.key,
      title: def.label,
      ...def.column
    } as TableColumnConfig
  ])
)

// 在组件中使用
const tableColumns = computed(() =>
  buildTableColumnsByBreakpoint(columnConfig.value, currentBreakpoint.value, COLUMN_MAP)
)
```

---

### 4. 通用格式化器工厂

**位置**: `src/components/common/table/formatters.ts`

提供常用的表格格式化器，支持配置化选项。

#### createBooleanTagFormatter - 布尔值标签

```typescript
import { createBooleanTagFormatter } from '@/components/common/table/formatters'

// 简单用法
formatter: createBooleanTagFormatter()

// 自定义配置
formatter: createBooleanTagFormatter({
  trueLabel: '是',
  falseLabel: '否',
  trueType: 'success',
  falseType: 'info',
  size: 'small'
})
```

#### createDateTimeFormatter - 日期时间格式化

```typescript
import { createDateTimeFormatter, createDateFormatter } from '@/components/common/table/formatters'

// 完整日期时间
formatter: createDateTimeFormatter()

// 自定义格式
formatter: createDateTimeFormatter({ format: 'yyyy/MM/dd HH:mm' })

// 相对时间
formatter: createDateTimeFormatter({ relative: true }) // "3 小时前"

// 仅日期
formatter: createDateFormatter() // yyyy-MM-dd
```

#### createArrayTagFormatter - 数组标签（多对多关系）

```typescript
import { createArrayTagFormatter } from '@/components/common/table/formatters'

// 简单用法
slots: { default: createArrayTagFormatter({ labelField: 'name' }) }

// 自定义配置
slots: { default: createArrayTagFormatter({
  labelField: 'name',
  emptyLabel: '无角色',
  size: 'small',
  tagType: 'info',
  maxVisible: 3 // 超过 3 个显示 "+N"
})}
```

#### createStatusTagFormatter - 状态标签

```typescript
import { createStatusTagFormatter } from '@/components/common/table/formatters'

// 简单映射
formatter: createStatusTagFormatter({
  active: '启用',
  inactive: '禁用',
  pending: '待审核'
})

// 详细配置（带颜色和圆点）
formatter: createStatusTagFormatter({
  active: { type: 'success', label: '启用', dot: true },
  inactive: { type: 'info', label: '禁用' },
  pending: { type: 'warning', label: '待审核' }
})
```

#### buildActionsColumn - 操作列构建器

```typescript
import { buildActionsColumn, type ActionButtonConfig } from '@/components/common/table/formatters'

const actionsColumn = buildActionsColumn(
  [
    {
      label: '编辑',
      type: 'primary',
      onClick: row => handleEdit(row)
    },
    {
      label: '删除',
      type: 'danger',
      popconfirm: {
        title: '确认删除？',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      },
      onClick: row => handleDelete(row)
    }
  ],
  {
    field: 'operations',
    width: 200,
    fixed: 'right',
    reorderLocked: true,
    hideable: false
  }
)
```

---

### 5. TableColumnConfigDialog - 列配置对话框

**位置**: `src/components/common/TableColumnConfigDialog.vue`

**功能**: 提供列配置 UI，支持拖拽排序、断点可见性设置。

#### Props

```typescript
interface Props {
  columnConfig: ColumnConfig[] // 当前列配置
  defaultColumns: ColumnConfig[] // 默认列配置（用于恢复默认）
}
```

#### Emits

```typescript
interface Emits {
  (e: 'update:config', config: ColumnConfig[]): void
}
```

#### 使用示例

```vue
<template>
  <TableColumnConfigDialog
    v-model="dialogOpen"
    :column-config="columnConfig"
    :default-columns="DEFAULT_COLUMNS"
    @update:config="updateConfig"
  />
</template>

<script setup lang="ts">
import TableColumnConfigDialog from '@/components/common/TableColumnConfigDialog.vue'
import { useTableColumns, DEFAULT_COLUMNS } from '@/composables/useTableColumns'

const { columnConfig, updateConfig } = useTableColumns({ ... })
const dialogOpen = defineModel<boolean>('configDialogOpen', { default: false })
</script>
```

#### 业务模块包装器（推荐）

为每个业务模块创建专属包装器，固化配置：

```vue
<!-- src/views/admin/products/components/ProductColumnConfigDialog.vue -->
<template>
  <TableColumnConfigDialog
    v-model="visible"
    :column-config="columnConfig"
    :default-columns="DEFAULT_PRODUCT_COLUMNS"
    @update:config="updateConfig"
  />
</template>

<script setup lang="ts">
import TableColumnConfigDialog from '@/components/common/TableColumnConfigDialog.vue'
import {
  useProductTableColumns,
  DEFAULT_PRODUCT_COLUMNS
} from '../../composables/useProductTableColumns'

const { columnConfig, updateConfig } = useProductTableColumns()
const visible = defineModel<boolean>({ default: false })
</script>
```

---

## 完整示例：用户管理页

### 1. 定义列配置 Composable

```typescript
// src/views/admin/users/config/resourceSchema.ts

import {
  useTableColumns,
  type ColumnConfig,
  type ColumnBreakpoint
} from '@/composables/useTableColumns'
import {
  createBooleanTagFormatter,
  createDateTimeFormatter,
  createArrayTagFormatter
} from '@/components/common/table/formatters'

// 列定义
export const USER_TABLE_COLUMN_DEFINITIONS = [
  {
    key: 'username',
    label: '用户名',
    visibleFrom: 'mobile',
    fixed: 'left',
    reorderLocked: true,
    hideable: false,
    column: { width: 120 }
  },
  {
    key: 'email',
    label: '邮箱',
    visibleFrom: 'mobile',
    column: { minWidth: 180 }
  },
  {
    key: 'is_superuser',
    label: '超级用户',
    visibleFrom: 'desktop',
    column: {
      width: 100,
      sortable: true,
      formatter: createBooleanTagFormatter({ trueType: 'danger', falseType: 'info' })
    }
  },
  {
    key: 'roles',
    label: '角色',
    visibleFrom: 'mobile',
    column: {
      width: 150,
      slots: {
        default: createArrayTagFormatter({ labelField: 'name', emptyLabel: '无角色' })
      }
    }
  },
  {
    key: 'updated_at',
    label: '更新时间',
    visibleFrom: 'tablet',
    column: {
      width: 160,
      sortable: true,
      formatter: createDateTimeFormatter()
    }
  }
]

// 转换为 ColumnConfig
export const DEFAULT_COLUMN_CONFIG: ColumnConfig[] = USER_TABLE_COLUMN_DEFINITIONS.map(def => ({
  key: def.key,
  label: def.label,
  visibleFrom: def.visibleFrom,
  width: typeof def.column.width === 'number' ? def.column.width : undefined,
  fixed: def.fixed ?? null,
  reorderLocked: def.reorderLocked ?? false,
  hideable: def.hideable ?? true
}))

// Composable 导出
export function useUserColumnManager() {
  const {
    columnConfig,
    visibleColumnKeys,
    updateConfig,
    updateColumnWidth,
    resetConfig,
    isColumnVisibleAtBreakpoint
  } = useTableColumns({
    storageKey: 'wes-user-table-columns',
    defaultColumns: DEFAULT_COLUMN_CONFIG,
    reorderLockedKeys: ['username']
  })

  function buildTableColumns(breakpoint: ColumnBreakpoint) {
    return buildTableColumnsByBreakpoint(
      columnConfig.value,
      breakpoint,
      new Map(
        USER_TABLE_COLUMN_DEFINITIONS.map(def => [
          def.key,
          {
            field: def.key,
            title: def.label,
            ...def.column,
            fixed: def.fixed ?? undefined,
            configurable: true
          } as TableColumnConfig
        ])
      )
    )
  }

  return {
    columnConfig,
    visibleColumnKeys,
    updateConfig,
    updateColumnWidth,
    resetConfig,
    isColumnVisibleAtBreakpoint,
    buildTableColumns
  }
}
```

### 2. 构建页面组件

```vue
<!-- src/views/admin/users/UserListPageV2.vue -->
<template>
  <CrudPageContainer>
    <!-- 工具栏 -->
    <CrudToolbar
      :search-config="{ fields: userSearchFields }"
      :permission="permissions.create"
      @search="search.handleSearch"
      @refresh="search.handleRefresh"
      @create="dialogs.openCreate"
    />

    <!-- 表格 -->
    <CrudTable
      :data="state.data"
      :columns="tableColumns"
      :loading="state.loading"
      :row-key="row => row.id"
      v-model:selection="state.selectedItems"
      @selection-change="selection.handleSelectionChange"
      @sort-change="search.handleSortChange"
      @column-width-change="updateColumnWidth"
    />

    <!-- 表单对话框 -->
    <CrudFormDialog
      v-model="dialogs.formOpen"
      :editing-id="dialogs.editingId"
      :key="dialogs.key"
      @submit="handleFormSubmit"
    />

    <!-- 列配置对话框 -->
    <TableColumnConfigDialog
      v-model="configDialogOpen"
      :column-config="columnConfig"
      :default-columns="DEFAULT_COLUMN_CONFIG"
      @update:config="updateConfig"
    />
  </CrudPageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCrudListPage } from '@/composables/useCrudListPage'
import { useUserColumnManager, DEFAULT_COLUMN_CONFIG } from './config/resourceSchema'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { userApi, type User, type CreateUserInput, type UpdateUserInput } from '@/api/modules/user'
import { USER_PERMISSION } from './config/permissions'
import { userSearchFields } from './config/resourceSchema'
import CrudFormDialog from '@/components/common/CrudFormDialog.vue'
import TableColumnConfigDialog from '@/components/common/TableColumnConfigDialog.vue'

// ==================== Composables ====================

const { state, search, dialogs, selection, apiActions, permissions } = useCrudListPage<
  User,
  CreateUserInput,
  UpdateUserInput
>({
  api: userApi,
  searchFields: userSearchFields,
  permissions: USER_PERMISSION,
  pageSize: 20,
  optimisticUpdate: true
})

const { columnConfig, updateConfig, updateColumnWidth, buildTableColumns } = useUserColumnManager()
const { breakpoint } = useBreakpoint()

// ==================== 计算属性 ====================

const tableColumns = computed(() => buildTableColumns(breakpoint.value))

// ==================== 状态 ====================

const configDialogOpen = ref(false)

// ==================== 表单提交 ====================

async function handleFormSubmit(values: CreateUserInput | UpdateUserInput) {
  if (dialogs.editingId.value) {
    await apiActions.handleEdit(dialogs.editingId.value, values as UpdateUserInput)
  } else {
    await apiActions.handleCreate(values as CreateUserInput)
  }
}
</script>
```

---

## 最佳实践

### 1. Composable 组织

```
src/views/admin/users/
├── config/
│   ├── pageConfig.ts            # 页面容器配置
│   ├── permissions.ts           # 权限常量
│   └── resourceSchema.ts        # 资源字段与列管理 schema
└── UserListPageV2.vue           # 主页面
```

### 2. 类型安全

始终使用泛型参数，确保类型推断正确：

```typescript
// ✅ 推荐
const { apiActions } = useCrudListPage<User, CreateUserInput, UpdateUserInput>({ ... })

async function handleFormSubmit(values: CreateUserInput | UpdateUserInput) {
  if (dialogs.editingId.value) {
    await apiActions.handleEdit(dialogs.editingId.value, values as UpdateUserInput)
  } else {
    await apiActions.handleCreate(values as CreateUserInput)
  }
}
```

### 3. 列配置持久化

```typescript
// 使用有意义的 storageKey
useTableColumns({
  storageKey: 'wes-user-table-columns', // 格式：wes-{module}-table-columns
  defaultColumns: DEFAULT_COLUMNS,
  reorderLockedKeys: ['username']
})
```

### 4. 格式化器复用

```typescript
// ✅ 推荐：使用通用格式化器工厂
import { createBooleanTagFormatter, createDateTimeFormatter } from '@/components/common/table/formatters'

column: {
  formatter: createBooleanTagFormatter({ trueType: 'danger', falseType: 'info' })
}

// ❌ 避免：重复定义
column: {
  formatter: (value: unknown) => h(ElTag, { type: value ? 'success' : 'info' }, ...)
}
```

### 5. 权限检查

```typescript
// 在模板中使用 computed 权限
<CrudToolbar :permission="permissions.create" @create="dialogs.openCreate" />

<!-- 操作按钮 -->
<template #actions="{ row }">
  <ElButton
    v-if="permissions.update"
    link
    type="primary"
    @click="dialogs.openEdit(row.id)"
  >
    编辑
  </ElButton>
</template>
```

---

## 迁移指南

### 从旧代码迁移到新架构

#### 步骤 1: 定义列配置

将原有的列定义重构为使用通用格式化器：

```typescript
// 旧代码
const columns = [
  {
    field: 'is_active',
    title: '状态',
    formatter: (value: unknown) => {
      return h(
        ElTag,
        { type: value ? 'success' : 'info' },
        { default: () => (value ? '启用' : '禁用') }
      )
    }
  }
]

// 新代码
import { createBooleanTagFormatter } from '@/components/common/table/formatters'

const columnDefs = [
  {
    key: 'is_active',
    label: '状态',
    visibleFrom: 'mobile',
    column: {
      formatter: createBooleanTagFormatter({
        trueLabel: '启用',
        falseLabel: '禁用',
        trueType: 'success'
      })
    }
  }
]
```

#### 步骤 2: 使用 useCrudListPage

```typescript
// 旧代码
const data = ref([])
const loading = ref(false)
const pagination = ref({ page: 1, pageSize: 20, total: 0 })

async function fetchData() {
  loading.value = true
  try {
    const result = await api.list({ offset: ..., limit: ... })
    data.value = result.items
    pagination.value.total = result.total
  } finally {
    loading.value = false
  }
}

// 新代码
const { state, search, dialogs, apiActions } = useCrudListPage({
  api: userApi,
  searchFields: SEARCH_FIELDS,
  pageSize: 20
})
```

#### 步骤 3: 使用通用组件

```vue
<!-- 旧代码 -->
<template>
  <div class="user-list">
    <div class="toolbar">...</div>
    <el-table
      :data="data"
      v-loading="loading"
    >
      ...
    </el-table>
    <el-pagination
      v-model:current-page="pagination.page"
      ...
    />
    <user-form-dialog
      v-model="dialogOpen"
      ...
    />
  </div>
</template>

<!-- 新代码 -->
<template>
  <CrudPageContainer>
    <CrudToolbar ... />
    <CrudTable
      :data="state.data"
      :loading="state.loading"
      ...
    />
    <CrudFormDialog
      v-model="dialogs.formOpen"
      ...
    />
  </CrudPageContainer>
</template>
```

---

## 故障排查

### 问题 1: 列配置不持久化

**检查**:

1. `storageKey` 是否唯一且有意义
2. localStorage 是否被浏览器阻止
3. 默认配置是否包含所有必需字段

**解决**:

```typescript
useTableColumns({
  storageKey: 'wes-user-table-columns', // ✅ 使用命名空间前缀
  defaultColumns: DEFAULT_COLUMNS
})
```

### 问题 2: 类型推断失败

**检查**:

1. 是否正确传递泛型参数
2. API 类型是否与 Composable 匹配

**解决**:

```typescript
// ✅ 明确泛型参数
useCrudListPage<User, CreateUserInput, UpdateUserInput>({ ... })
```

### 问题 3: 格式化器不生效

**检查**:

1. 是否正确导入格式化器
2. 列配置是否包含 `formatter` 或 `slots.default`

**解决**:

```typescript
// 检查列定义
{
  key: 'is_active',
  column: {
    formatter: createBooleanTagFormatter() // ✅ 确保有 formatter
  }
}
```

---

## 相关文档

- [时区处理指南](./TIMEZONE_HANDLING.md)
- [Zod 验证指南](./ZOD_VALIDATION.md)
- [智能搜索组件架构](./SMART_SEARCH_COMPONENT_ARCHITECTURE.md)
- [用户管理页任务文档](./TASKS_PHASE3_USER_MANAGEMENT.md)

---

## 更新日志

| 版本 | 日期       | 更新内容                                   |
| ---- | ---------- | ------------------------------------------ |
| 1.0  | 2026-03-14 | 初始版本，包含 CRUD 核心组件和格式化器工厂 |
