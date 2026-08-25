# CRUD 开发指南

**版本**: 1.4
**最后更新**: 2026-08-26
**适用**: P9 MCS 前端项目

---

## 概述

本指南介绍如何使用通用 CRUD 组件快速构建标准增删改查功能。

### 核心概念

```
OpenAPI 合同事实
  └─ 字段名、类型、format、required
       ↓
defineCrudResourceFieldBundle()  ← 字段装配入口
  └─ 合并后端事实和前端 UI 差异
       ↓
createCrudPageConfigFromResource()  ← 页面配置
  └─ 组装列表 / 表单 / 搜索 / 详情
```

**黄金法则**: `backend` 描述字段从哪里来，`fields` 只写前端 UI 差异。

## 当前架构基线（2026-04 更新）

> 本指南已按当前仓库实现同步。若你在其他历史设计/任务文档中看到 `userApi`、`useCrudApi`、`src/api/base/crud-api.ts` 等旧术语，请以本文件为准。
>
> 菜单由 `createRoutes()` 装配的静态路由唯一拥有。`useMenu()` 根据 `meta.menu` 与当前权限集合实时投影导航树，不请求后端菜单、不生成 menu manifest，也没有数据库同步步骤。

当前项目的 CRUD / API 约定如下：

- 生成模块对外统一导出 `xxxApiMethods`
- 页面配置层统一声明 `resource.methods`，不再声明 `resource.api`
- 页面框架内部会从 `methods` 派生 `requestAdapter`
- 若业务代码需要直接发请求，优先使用 `xxxApiMethods(...).send()`
- 通用基础层主入口为 `src/api/base/crud-request-adapter.ts`
- 旧入口 `src/api/base/crud-api.ts`、`src/composables/useCrudApi.ts` 已删除

---

## 5 分钟快速开始

### Step 0: 前置准备（后端契约同步）

**⚠️ 重要：开发新功能前，必须先从后端同步最新的 OpenAPI 契约！**

```bash
# 1. 从指定的 clean develop checkout 冻结当前契约
pnpm contract:freeze -- --backend-root /path/to/wes_backend

# 2. 从 canonical OpenAPI 快照生成 TypeScript 类型
pnpm generate:types

# 3. 生成 Zod Schema（用于表单验证）
pnpm generate:zod

# 4. 从 canonical 权限快照生成权限常量（离线）
pnpm generate:permissions
```

**坑点预警**：如果跳过后端同步，可能出现：

- 类型错误（`RoleResponse` 不存在）
- 权限常量缺失（`ADMIN_PERMISSIONS.role` 未定义）
- Zod Schema 未生成（`RoleCreateSchema` 未找到）

**下一步：检查后端提供的 API 能力**

同步完成后，务必查看生成模块与 `src/api/base/crud-request-adapter.ts`，确认后端提供了哪些标准能力与扩展 methods：

```typescript
// 查看生成的 API 类型，确认支持的操作
export interface SoftDeleteCrudApiMethods<TItem, TCreate, TUpdate> {
  getById(
    id: number,
    options?: { query?: unknown; config?: ContractRequestConfig }
  ): MethodLike<TItem>
  query(options?: QueryOptionsInput, config?: ContractRequestConfig): MethodLike<unknown>
  create(data: TCreate, config?: ContractRequestConfig): MethodLike<TItem>
  update(id: number, data: TUpdate, config?: ContractRequestConfig): MethodLike<TItem>
  delete(
    id: number,
    options?: { query?: unknown; config?: ContractRequestConfig }
  ): MethodLike<unknown>
  getTrash(options?: QueryOptionsInput, config?: ContractRequestConfig): MethodLike<unknown>
  restore(id: number, config?: ContractRequestConfig): MethodLike<TItem>
  batchDelete(
    ids: number[],
    config?: ContractRequestConfig
  ): MethodLike<unknown> | Array<MethodLike<unknown>>
}
```

**常见遗漏的能力**：

| 能力          | 检查方式                                   | 前端配置                                                              |
| ------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| 软删除/回收站 | 检查是否有 `trash`、`restore` 端点         | 生成 `SoftDeleteCrudApiMethods` + `features.trash: { enabled: true }` |
| 批量操作      | 检查是否有 `bulkDelete`、`bulkUpdate` 端点 | 目前需手动实现                                                        |
| 导出          | 检查是否有 `export` 端点                   | 需自定义按钮调用                                                      |
| 高级搜索      | 检查 `query` 端点参数                      | 使用智能搜索组件                                                      |
| **额外 API**  | 检查 `{id}/xxx` 子资源端点                 | 通过 `extensions` 添加自定义操作                                      |

**额外 API 能力示例**（用户管理）：

```typescript
// src/api/modules/users.ts
const USER_RESET_PASSWORD_PATH = '/api/v1/users/{id}/reset-password'
const USER_ASSIGN_ROLES_PATH = '/api/v1/users/{id}/assign-roles'

export const usersApiMethods = {
  ...baseUsersApiMethods, // 基础 CRUD methods

  resetPassword(
    params: { id: number },
    data: ResetUserPasswordInput,
    config?: ContractRequestConfig
  ) {
    return contractMethods.put(USER_RESET_PASSWORD_PATH, {
      params,
      body: data,
      config
    })
  },

  assignRoles(
    params: { id: number },
    data: { role_ids: number[] },
    config?: ContractRequestConfig
  ) {
    return contractMethods.put(USER_ASSIGN_ROLES_PATH, {
      params,
      body: data,
      config
    })
  }
}
```

然后在页面配置中通过 `extensions` 使用：

```typescript
// pageConfig.ts
export function createUserPageConfig(
  openAssignRolesDialog: (user: User) => void,
  openResetPasswordDialog: (user: User) => void
) {
  return createCrudPageConfigFromResource({
    resource: USER_PAGE_RESOURCE,
    fieldConfig: userPageFieldConfig,
    extensions: {
      rowActions: createUserRowActions(openAssignRolesDialog, openResetPasswordDialog)
    }
  })
}
```

**实际踩坑**：角色管理开发时差点遗漏了回收站功能，后来发现后端提供了完整的软删除端点（`trash`、`restore`、`permanent`），前端只需要启用 `features.trash` 即可。

---

### Step 1: 创建 API（2 分钟）

```typescript
// src/api/modules/product.ts
import {
  createSoftDeleteCrudRequestAdapterMethods,
  type SoftDeleteCrudResourceCollectionPath
} from '@/api/base/crud-request-adapter'

const PRODUCT_PATH = '/api/v1/products' satisfies SoftDeleteCrudResourceCollectionPath

export type Product = CrudItem<typeof PRODUCT_PATH>
export type CreateProductInput = CrudCreateInput<typeof PRODUCT_PATH>
export type UpdateProductInput = CrudUpdateInput<typeof PRODUCT_PATH>

export const productApiMethods = createSoftDeleteCrudRequestAdapterMethods({
  collection: PRODUCT_PATH,
  item: `${PRODUCT_PATH}/{id}` as const,
  query: `${PRODUCT_PATH}/query` as const,
  restore: `${PRODUCT_PATH}/{id}/restore` as const,
  trash: `${PRODUCT_PATH}/trash` as const,
  trashRestore: `${PRODUCT_PATH}/trash/restore` as const,
  trashPermanentDelete: `${PRODUCT_PATH}/trash/permanent` as const
})
```

### Step 2: 配置字段（2 分钟）

```typescript
// src/views/admin/products/config/fieldConfig.ts
import { defineCrudResourceFieldBundle } from '@/components/common/crud-page/resourceFieldBuilder'
import { ProductCreateSchema, ProductUpdateSchema } from '@/types/zod-extensions'

export const { fields: PRODUCT_FIELDS, fieldConfig: productPageFieldConfig } =
  defineCrudResourceFieldBundle<Product, CreateProductInput, UpdateProductInput>({
    backend: {
      readSchema: 'ProductResponse',
      createSchema: 'ProductCreate',
      updateSchema: 'ProductUpdate',
      labelOverrides: { name: '商品名称' }
    },
    fields: [
      {
        key: 'name',
        table: { fixed: 'left', width: 180 },
        form: { required: true },
        search: {}
      },
      {
        key: 'price',
        table: { sortable: true },
        form: { type: 'number' }
      }
    ],
    storageKey: 'wes-product-table-columns'
  })
```

### Step 3: 创建页面配置（1 分钟）

```typescript
// src/views/admin/products/config/pageConfig.ts
import { createCrudPageConfigFromResource } from '@/components/common/crud-page/createCrudPageConfigFromResource'
import { productPageFieldConfig } from './fieldConfig'
import { productApiMethods } from '@/api/modules/product'

export function createProductPageConfig() {
  return createCrudPageConfigFromResource({
    resource: {
      key: 'products',
      title: { text: '商品管理', icon: 'ep:goods' },
      methods: productApiMethods,
      permissions: ADMIN_PERMISSIONS.product
    },
    fieldConfig: productPageFieldConfig,
    features: {
      trash: { enabled: true },
      create: { label: '新增商品' }
    }
  })
}
```

### Step 4: 创建页面组件（30 秒）

```vue
<!-- src/views/admin/products/ProductListPage.vue -->
<template>
  <CrudPageContainer :config="config" />
</template>

<script setup lang="ts">
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import { createProductPageConfig } from './config/pageConfig'

const config = createProductPageConfig()
</script>
```

### Step 5: 添加路由与菜单元数据

```typescript
// src/router/index.ts
{
  path: 'products',
  name: 'ProductList',
  component: () => import('@/views/admin/products/ProductListPage.vue'),
  meta: {
    title: '商品管理',
    permission: ADMIN_PERMISSIONS.product.page,
    menu: {
      name: 'admin:product:menu',
      icon: 'ep:goods',
      sortOrder: 1
    }
  }
}
```

菜单层级直接来自嵌套路由；`meta.permission` / `meta.permissions` 与路由守卫共用 `hasRouteAccess()`。权限上下文加载完成后，`useMenu()` 会自动更新，无需执行额外命令。

---

## 标准开发流程（详细版）

### Step 0: 前置准备（后端契约同步）

**开发任何新功能之前，必须执行以下步骤同步后端契约：**

```bash
# 1. 从指定的 clean develop checkout 冻结当前契约
pnpm contract:freeze -- --backend-root /path/to/wes_backend

# 2. 从 canonical OpenAPI 快照生成 TypeScript 类型
pnpm generate:types

# 3. 生成 Zod Schema（表单验证用）
pnpm generate:zod

# 4. 从 canonical 权限快照生成权限常量（离线）
pnpm generate:permissions

# 5. 验证生成结果
ls src/api/generated/openapi-types.ts         # 查看生成的类型
ls src/types/generated/zod-schemas.ts         # 查看 Zod schemas
ls src/api/generated/permissions/index.ts     # 查看权限常量入口
```

**同步后必做：检查后端 API 能力**

查看生成的类型或 OpenAPI 文档，确认后端提供了哪些端点：

```typescript
// 标准 CRUD 端点
createCrudRequestAdapterMethods({
  collection: '/api/v1/products',
  item: '/api/v1/products/{id}',
  create: '/api/v1/products',
  update: '/api/v1/products/{id}',
  delete: '/api/v1/products/{id}',
  query: '/api/v1/products/query'
})

// 软删除端点（额外能力）
createSoftDeleteCrudRequestAdapterMethods({
  // ...标准端点
  restore: '/api/v1/products/{id}/restore', // 单条恢复
  trash: '/api/v1/products/trash', // 回收站列表
  trashRestore: '/api/v1/products/trash/restore', // 批量恢复
  trashPermanentDelete: '/api/v1/products/trash/permanent' // 批量彻底删除
})
```

**常见遗漏**：

- **软删除/回收站**：后端提供了 `trash`、`restore` 端点，但前端用了 `createCrudRequestAdapterMethods` 而不是 `createSoftDeleteCrudRequestAdapterMethods`
- **批量操作**：后端提供了 `bulkDelete`，但前端未实现批量选择功能
- **导出**：后端提供了 `export` 端点，但前端未添加导出按钮
- **额外 API 能力**：后端提供了 `{id}/assign-roles`、`{id}/reset-password` 等子资源端点，但前端只实现了基础 CRUD

**额外 API 能力实现方式**：

```typescript
// 1. API 层：扩展基础 CRUD methods
export const usersApiMethods = {
  ...baseUsersApiMethods,
  assignRoles(
    params: { id: number },
    data: { role_ids: number[] },
    config?: ContractRequestConfig
  ) {
    return contractMethods.put(USER_ASSIGN_ROLES_PATH, {
      params,
      body: data,
      config
    })
  }
}

// 2. 创建自定义行操作
export function createUserRowActions(
  openAssignRolesDialog: (user: User) => void
): CrudPageRowAction<User>[] {
  return [
    {
      key: 'assign-roles',
      label: '分配角色',
      type: 'primary',
      icon: 'lucide:user-plus',
      onClick: user => openAssignRolesDialog(user)
    }
  ]
}

// 3. 页面配置：通过 extensions 注入
export function createUserPageConfig(openAssignRolesDialog: (user: User) => void) {
  return createCrudPageConfigFromResource({
    resource: USER_PAGE_RESOURCE,
    fieldConfig: userPageFieldConfig,
    extensions: {
      rowActions: createUserRowActions(openAssignRolesDialog)
    }
  })
}
```

**为什么必须这样做？**

前端 CRUD 组件依赖后端 OpenAPI 契约生成的类型和 Schema。如果后端新增了 `Role` 资源但前端未同步：

- `RoleResponse` 类型不存在 → TypeScript 报错
- `RoleCreateSchema` 未生成 → 表单验证无法工作
- `ADMIN_PERMISSIONS.role` 未定义 → 权限检查失效

---

### 完整目录结构

```
src/
├── api/modules/{resource}.ts              # API 层
├── views/admin/{resource}s/
│   ├── config/
│   │   ├── fieldConfig.ts                 # 字段配置
│   │   └── pageConfig.ts                  # 页面配置
│   └── {Resource}ListPage.vue             # 页面组件
└── router/index.ts                        # 路由配置
```

### Step 1: API 层详解

**关键点**：

- 路径必须与后端 OpenAPI 契约完全一致
- 使用 `createSoftDeleteCrudRequestAdapterMethods`（支持回收站）或 `createCrudRequestAdapterMethods`（标准）
- 类型自动从路径推导

**踩坑记录**：

- ❌ 不要添加不存在的端点（如 `bulkDelete`），会导致 TypeScript 错误
- ✅ 只配置后端实际提供的端点

### Step 2: 字段配置详解

**自动推断的字段**（无需重复声明）：

- `label`（从 OpenAPI schema）
- `form.type`（从 schema format）
- `search.dataType`（从 schema type）
- `boolean/date` 的 formatter

**需要手动声明的**（前端 UI 投影）：

- 列宽、固定列、排序
- `visibleFrom` 响应式断点
- `readonly`、`required` 覆盖
- 搜索 favorites / quick presets

### Step 3: 页面配置详解

```typescript
const ROLE_PAGE_RESOURCE = {
  key: 'roles', // 资源标识，用于 localStorage
  title: {
    // 页面标题
    text: '角色管理',
    subtitle: '管理系统角色', // 可选
    icon: 'ep:collection-tag' // 可选
  },
  trashTitle: {
    /* 回收站标题 */
  }, // 启用回收站时需要
  methods: roleApiMethods,
  permissions: ADMIN_PERMISSIONS.role,
  optimisticUpdate: true, // 乐观更新
  defaultSort: [{ field: 'updated_at', order: 'desc' }]
}

const ROLE_PAGE_FEATURES = {
  trash: { enabled: true, label: '回收站' },
  create: { label: '新增角色', dialogTitle: '创建角色' },
  edit: { dialogTitle: '编辑角色' },
  // 软删除特有
  restore: { label: '恢复角色' },
  batchRestore: { label: '批量恢复' },
  permanentDelete: { label: '彻底删除' },
  batchPermanentDelete: { label: '批量彻底删除' }
}
```

### Step 4: 路由配置详解

```typescript
{
  path: 'roles',
  name: 'RoleList',
  meta: {
    requiresAuth: true,
    title: '角色管理',                    // 页面标题
    permission: ADMIN_PERMISSIONS.role.page,  // 页面访问权限
    menu: {
      name: 'admin:role:menu',           // 菜单唯一标识
      icon: 'ep:collection-tag',         // 菜单图标
      sortOrder: 98                      // 排序（越小越靠前）
    }
  }
}
```

### Step 5: 菜单投影详解

- `createRoutes()` 是生产路由树唯一装配入口，菜单层级沿用嵌套 `children`。
- `meta.menu.name` 必须稳定且非空；标题优先使用 `meta.menu.title`，否则使用 `meta.title`。
- `meta.menu.icon`、`sortOrder` 和 `hidden` 只描述前端展示；不要在页面或后端重复维护菜单记录。
- `meta.permission` 表示单一必需权限，`meta.permissions` 表示任一满足；菜单投影与路由守卫复用相同判断。
- 权限上下文未完成初始化时菜单为空；临时加载失败应走统一重试页，不能回退到未授权菜单。

---

## 常见坑点记录（基于实际开发）

### 坑点 1: 忘记同步后端契约

**现象**：

- `RoleResponse` 类型不存在
- `RoleCreateSchema` 找不到
- `ADMIN_PERMISSIONS.role` 未定义

**原因**：后端已新增 API，但前端未同步 OpenAPI 契约。

**解决**：

```bash
# 开发新功能前必须执行
pnpm contract:freeze -- --backend-root /path/to/wes_backend
pnpm generate:types    # 生成 TypeScript 类型
pnpm generate:zod     # 生成 Zod Schema
pnpm generate:permissions  # 从 canonical 权限快照生成权限常量
```

**检查清单**：

- [ ] 已从指定的 clean develop checkout 冻结 canonical OpenAPI
- [ ] 执行了 `pnpm generate:types`
- [ ] 执行了 `pnpm generate:zod`
- [ ] 执行了 `pnpm generate:permissions`

---

### 坑点 2: 遗漏后端 API 能力

**现象**：

- 页面缺少回收站功能，但后端提供了软删除端点
- 用户问"为什么不能批量删除"，但后端提供了 `bulkDelete` 端点
- 需要导出功能时才发现后端有 `export` 端点未使用
- **产品说"怎么没有分配角色按钮"，但后端有 `{id}/assign-roles` 端点**

**原因**：只关注基础 CRUD，没检查后端提供的完整 API 能力。

**解决**：

同步契约后，立即检查后端提供的端点：

```bash
# 查看生成的 API 类型文件
cat src/api/modules/role.ts
# 或查看 Swagger 文档
open http://localhost:8001/api/docs
```

**API 能力检查清单**：

| 检查项            | 后端特征                           | 前端配置                                         |
| ----------------- | ---------------------------------- | ------------------------------------------------ |
| 软删除            | 有 `trash`、`restore` 端点         | 使用 `createSoftDeleteCrudRequestAdapterMethods` |
| 回收站            | 有 `trashPermanentDelete` 端点     | `features.trash: { enabled: true }`              |
| 批量操作          | 有 `bulkDelete`、`bulkUpdate` 端点 | 需手动实现批量选择                               |
| 导出              | 有 `export` 端点                   | 添加自定义导出按钮                               |
| 高级查询          | `query` 端点支持复杂参数           | 使用智能搜索组件                                 |
| **额外 API 能力** | 有 `{id}/xxx` 子资源端点           | 通过 `extensions` 添加自定义操作                 |

**额外 API 能力实现**（以用户管理的"分配角色"为例）：

```typescript
// 1. API 层：扩展基础 CRUD methods
export const usersApiMethods = {
  ...baseUsersApiMethods, // 基础 CRUD methods

  // 额外能力：分配角色
  assignRoles(params: { id: number }, data: { role_ids: number[] }, config?: ContractRequestConfig) {
    return contractMethods.put('/api/v1/users/{id}/assign-roles', {
      params,
      body: data,
      config
    })
  }
}

// 2. 创建自定义行操作
createUserRowActions(openAssignRolesDialog: (user: User) => void) {
  return [
    {
      key: 'assign-roles',
      label: '分配角色',
      type: 'primary',
      icon: 'lucide:user-plus',
      onClick: user => openAssignRolesDialog(user)
    }
  ]
}

// 3. 页面配置：注入扩展
export function createUserPageConfig(openAssignRolesDialog) {
  return createCrudPageConfigFromResource({
    resource: USER_PAGE_RESOURCE,
    extensions: {
      rowActions: createUserRowActions(openAssignRolesDialog)
    }
  })
}
```

**实际案例**：

1. **角色管理开发**：最初只用了 `createCrudRequestAdapterMethods`，后来发现后端支持软删除，改为 `createSoftDeleteCrudRequestAdapterMethods` 并启用 `features.trash`，回收站功能立即生效。

2. **用户管理开发**：后端提供了 `assign-roles` 和 `reset-password` 端点，通过 `extensions.rowActions` 添加自定义行操作，实现完整的用户管理能力。

---

### 坑点 3: 新路由没有出现在菜单中

**现象**：页面路由可访问，但侧边栏没有对应菜单项。

**原因**：路由缺少有效 `meta.menu.name` / 标题、被标记为 `hidden`，或当前权限集合不满足 `meta.permission(s)`。

**解决**：检查该路由是否由 `createRoutes()` 装配、`meta.menu` 是否完整，以及 `/auth/my` 返回的权限是否已成功 hydrate；不要增加后端菜单记录或第二份菜单 JSON。

### 坑点 3: API 端点不存在导致类型错误

**现象**：`role.ts` 中出现 `bulkDelete` 类型错误。

**原因**：后端 OpenAPI 合同中没有该端点，不能随意添加。

**解决**：只使用后端实际提供的端点。

```typescript
// ❌ 错误
export const roleApi = createSoftDeleteCrudRequestAdapterMethods({
  // ...
  bulkDelete: `${ROLE_PATH}/bulk` as const // 不存在！
})

// ✅ 正确
export const roleApi = createSoftDeleteCrudRequestAdapterMethods({
  collection: ROLE_PATH,
  item: `${ROLE_PATH}/{id}` as const
  // ...只配置实际存在的端点
})
```

### 坑点 3: 字段配置重复声明

**现象**：字段配置冗长，大量重复。

**原因**：没有利用 `backend` 自动推断。

**解决**：`backend` 声明一次，只覆盖差异。

```typescript
// ❌ 错误：重复声明
{
  key: 'name',
  label: '名称',           // 重复，backend 已提供
  table: { label: '名称' }, // 重复
  form: { label: '名称' }   // 重复
}

// ✅ 正确：只覆盖 UI 差异
{
  key: 'name',
  table: { fixed: 'left', width: 150 },
  form: { readonly: true }
}
```

### 坑点 4: 表格列不显示

**现象**：表格没有列。

**原因**：忘记设置 `visibleFrom` 或 `storageKey` 冲突。

**解决**：

- 至少设置 `visibleFrom: 'mobile'`
- 确保 `storageKey` 全局唯一

```typescript
{
  key: 'name',
  table: {
    visibleFrom: 'mobile',  // ✅ 必须设置
    width: 150
  }
}
```

### 坑点 5: 权限常量引用错误

**现象**：权限检查不生效。

**原因**：使用了错误的权限路径。

**解决**：使用生成的 `ADMIN_PERMISSIONS` 常量。

```typescript
// ❌ 错误
permission: 'role:page'

// ✅ 正确
import { ADMIN_PERMISSIONS } from '@/api/generated/permissions'
permission: ADMIN_PERMISSIONS.role.page
```

---

## 故障排查速查

| 问题                | 排查                               | 解决                                                                  |
| ------------------- | ---------------------------------- | --------------------------------------------------------------------- |
| 类型/Zod/权限找不到 | 是否同步了后端契约                 | 按“Step 0: 前置准备”执行 freeze → types/Zod/permissions               |
| 缺少回收站/额外 API | 检查后端 OpenAPI 端点              | 使用 `createSoftDeleteCrudRequestAdapterMethods` 或 `extensions` 扩展 |
| 路由未出现在菜单    | 检查 `meta.menu`、嵌套路由和权限   | 修正静态路由元数据并确认权限上下文已初始化                            |
| 表格列不显示        | 检查 `visibleFrom` 和 `storageKey` | 设置 `visibleFrom: 'mobile'`，确保 key 唯一                           |
| 表单字段类型错误    | 检查 OpenAPI schema 推断           | 在 `form` 中显式覆盖 `type`                                           |
| 权限检查不生效      | 检查权限常量引用                   | 使用 `ADMIN_PERMISSIONS.xxx`                                          |
| 列配置不持久化      | 检查 localStorage                  | 使用命名空间前缀如 `wes-xxx`                                          |
| 类型推断失败        | 检查泛型参数                       | 显式传递 `<Item, Create, Update>`                                     |

---

## 最佳实践

### 1. 字段配置优先级

配置优先级（从高到低）：

1. `fields` 中的显式配置
2. `backend.labelOverrides` 中的覆盖
3. OpenAPI schema 默认值

### 2. Storage Key 命名

```typescript
// ✅ 使用项目前缀
storageKey: 'wes-{resource}-table-columns'

// ❌ 避免通用名称
storageKey: 'table-columns' // 可能冲突
```

### 3. 响应式列显示

```typescript
{
  key: 'description',
  table: {
    visibleFrom: 'tablet',  // tablet 及以上显示
    minWidth: 200
  }
}
```

### 4. 表单验证

```typescript
import { useForm } from 'vee-validate'
import { ProductCreateSchema } from '@/types/zod-extensions'

// ✅ 直接传递 Zod schema（v4.6+）
const { handleSubmit } = useForm<CreateProductInput>({
  validationSchema: ProductCreateSchema
})

// ❌ 不要包裹 toTypedSchema（v4.x 不需要）
validationSchema: toTypedSchema(ProductCreateSchema)
```

---

## 详细参考

### 响应式断点

| 断点      | 宽度           | 用途 |
| --------- | -------------- | ---- |
| `mobile`  | < 768px        | 手机 |
| `tablet`  | 768px - 1279px | 平板 |
| `desktop` | ≥ 1280px       | 桌面 |

### 字段配置完整类型

```typescript
interface CrudFieldConfig {
  key: string
  label?: string
  table?: {
    visibleFrom?: 'mobile' | 'tablet' | 'desktop'
    fixed?: 'left' | 'right'
    width?: number
    minWidth?: number
    sortable?: boolean
    formatter?: (value: any, row: any) => VNode | string
  }
  form?: {
    type?: 'input' | 'textarea' | 'number' | 'select' | 'date' | 'switch'
    required?: boolean
    readonly?: boolean
    placeholder?: string
  }
  search?: {
    dataType?: 'string' | 'number' | 'date' | 'boolean'
    defaultOperator?: 'eq' | 'like' | 'gt' | 'lt'
  }
}
```

### 相关文档

- [时区处理指南](./TIMEZONE_HANDLING.md)
- [Zod 验证指南](./ZOD_VALIDATION.md)
- [智能搜索组件架构](./SMART_SEARCH_COMPONENT_ARCHITECTURE.md)

---

## 更新日志

| 版本 | 日期       | 更新内容                                      |
| ---- | ---------- | --------------------------------------------- |
| 1.3  | 2026-03-26 | 精简结构，添加"5分钟快速开始"和"常见坑点"章节 |
| 1.2  | 2026-03-26 | 新增标准开发流程章节                          |
| 1.0  | 2026-03-14 | 初始版本                                      |
