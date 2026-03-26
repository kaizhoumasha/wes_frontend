# CRUD 开发指南

**版本**: 1.3
**最后更新**: 2026-03-26
**适用**: P9 WES 前端项目

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

---

## 5 分钟快速开始

### Step 0: 前置准备（后端契约同步）

**⚠️ 重要：开发新功能前，必须先从后端同步最新的 OpenAPI 契约！**

```bash
# 1. 确保后端服务已启动
# http://localhost:8001/api/openapi.json 应能访问

# 2. 生成 TypeScript 类型（从 OpenAPI）
pnpm type:generate

# 3. 生成 Zod Schema（用于表单验证）
pnpm zod:generate

# 4. 生成权限常量
pnpm permission:generate
```

**坑点预警**：如果跳过后端同步，可能出现：

- 类型错误（`RoleResponse` 不存在）
- 权限常量缺失（`ADMIN_PERMISSIONS.role` 未定义）
- Zod Schema 未生成（`RoleCreateSchema` 未找到）

**下一步：检查后端提供的 API 能力**

同步完成后，务必查看 `src/api/base/crud-api.ts` 确认后端提供了哪些端点：

```typescript
// 查看生成的 API 类型，确认支持的操作
export interface SoftDeleteCrudApiEndpoints {
  collection: string // 列表查询
  item: string // 单条查询
  create: string // 创建
  update: string // 更新
  delete: string // 删除
  query: string // 高级查询
  // 软删除特有
  restore?: string // 恢复（软删除资源才有）
  trash?: string // 回收站列表
  trashRestore?: string // 批量恢复
  trashPermanentDelete?: string // 批量彻底删除
}
```

**常见遗漏的能力**：

| 能力          | 检查方式                                   | 前端配置                                                        |
| ------------- | ------------------------------------------ | --------------------------------------------------------------- |
| 软删除/回收站 | 检查是否有 `trash`、`restore` 端点         | `createSoftDeleteCrudApi` + `features.trash: { enabled: true }` |
| 批量操作      | 检查是否有 `bulkDelete`、`bulkUpdate` 端点 | 目前需手动实现                                                  |
| 导出          | 检查是否有 `export` 端点                   | 需自定义按钮调用                                                |
| 高级搜索      | 检查 `query` 端点参数                      | 使用智能搜索组件                                                |
| **额外 API**  | 检查 `{id}/xxx` 子资源端点                 | 通过 `extensions` 添加自定义操作                                |

**额外 API 能力示例**（用户管理）：

```typescript
// src/api/modules/user.ts
const USER_RESET_PASSWORD_PATH = '/api/v1/users/{id}/reset-password'
const USER_ASSIGN_ROLES_PATH = '/api/v1/users/{id}/assign-roles'

export const userApi = {
  ...baseUserApi, // 基础 CRUD

  // 额外能力：重置密码
  async resetPassword(id: number, data: ResetUserPasswordInput) {
    return await contractClient.put(USER_RESET_PASSWORD_PATH, {
      params: { id },
      body: data
    })
  },

  // 额外能力：分配角色
  async assignRoles(id: number, roleIds: number[]) {
    return await contractClient.put(USER_ASSIGN_ROLES_PATH, {
      params: { id },
      body: { role_ids: roleIds }
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
  createSoftDeleteCrudApi,
  type SoftDeleteCrudResourceCollectionPath
} from '@/api/base/crud-api'

const PRODUCT_PATH = '/api/v1/products' satisfies SoftDeleteCrudResourceCollectionPath

export type Product = CrudItem<typeof PRODUCT_PATH>
export type CreateProductInput = CrudCreateInput<typeof PRODUCT_PATH>
export type UpdateProductInput = CrudUpdateInput<typeof PRODUCT_PATH>

export const productApi = createSoftDeleteCrudApi({
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
import { productApi } from '@/api/modules/product'

export function createProductPageConfig() {
  return createCrudPageConfigFromResource({
    resource: {
      key: 'products',
      title: { text: '商品管理', icon: 'ep:goods' },
      api: productApi,
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

### Step 5: 添加路由并同步菜单

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
      parentName: 'admin:system:menu',
      icon: 'ep:goods',
      sortOrder: 1
    }
  }
}
```

```bash
# 同步菜单到数据库
# ⚠️ Worktree 开发时必须指定路径！
bash scripts/data/sync_menus.sh \
  --frontend-path /Users/kaizhou/SynologyDrive/works/wes_frontend-worktrees/your_feature
```

---

## 标准开发流程（详细版）

### Step 0: 前置准备（后端契约同步）

**开发任何新功能之前，必须执行以下步骤同步后端契约：**

```bash
# 1. 确保后端服务已启动
# 访问 http://localhost:8001/docs 确认 OpenAPI 文档可用

# 2. 生成 TypeScript 类型
pnpm type:generate

# 3. 生成 Zod Schema（表单验证用）
pnpm zod:generate

# 4. 生成权限常量
pnpm permission:generate

# 5. 验证生成结果
ls src/types/generated/      # 查看生成的类型
ls src/types/zod-extensions.ts  # 查看 Zod schemas
ls src/api/generated/permissions.ts  # 查看权限常量
```

**同步后必做：检查后端 API 能力**

查看生成的类型或 OpenAPI 文档，确认后端提供了哪些端点：

```typescript
// 标准 CRUD 端点
createCrudApi({
  collection: '/api/v1/products',
  item: '/api/v1/products/{id}',
  create: '/api/v1/products',
  update: '/api/v1/products/{id}',
  delete: '/api/v1/products/{id}',
  query: '/api/v1/products/query'
})

// 软删除端点（额外能力）
createSoftDeleteCrudApi({
  // ...标准端点
  restore: '/api/v1/products/{id}/restore', // 单条恢复
  trash: '/api/v1/products/trash', // 回收站列表
  trashRestore: '/api/v1/products/trash/restore', // 批量恢复
  trashPermanentDelete: '/api/v1/products/trash/permanent' // 批量彻底删除
})
```

**常见遗漏**：

- **软删除/回收站**：后端提供了 `trash`、`restore` 端点，但前端用了 `createCrudApi` 而不是 `createSoftDeleteCrudApi`
- **批量操作**：后端提供了 `bulkDelete`，但前端未实现批量选择功能
- **导出**：后端提供了 `export` 端点，但前端未添加导出按钮
- **额外 API 能力**：后端提供了 `{id}/assign-roles`、`{id}/reset-password` 等子资源端点，但前端只实现了基础 CRUD

**额外 API 能力实现方式**：

```typescript
// 1. API 层：扩展基础 CRUD
export const userApi = {
  ...baseUserApi,
  async assignRoles(id: number, roleIds: number[]) {
    return await contractClient.put(USER_ASSIGN_ROLES_PATH, {
      params: { id },
      body: { role_ids: roleIds }
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
- 使用 `createSoftDeleteCrudApi`（支持回收站）或 `createCrudApi`（标准）
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
  api: roleApi,
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
      parentName: 'admin:system:menu',   // 父菜单（子菜单必需）
      icon: 'ep:collection-tag',         // 菜单图标
      sortOrder: 98                      // 排序（越小越靠前）
    }
  }
}
```

### Step 5: 菜单同步详解

**Worktree 开发坑点** ⚠️：

```bash
# ❌ 错误：默认读取主仓库，菜单不会同步到数据库
bash ~/SynologyDrive/works/wes_backend/scripts/data/sync_menus.sh

# ✅ 正确：指定 worktree 路径
bash ~/SynologyDrive/works/wes_backend/scripts/data/sync_menus.sh \
  --frontend-path /Users/kaizhou/SynologyDrive/works/wes_frontend-worktrees/role_manage

# 预览模式（不写入数据库，仅查看解析结果）
bash scripts/data/sync_menus.sh \
  --frontend-path /path/to/worktree \
  --preview
```

**为什么需要 `--frontend-path`**：

- `sync_menus.sh` 默认读取 `~/SynologyDrive/works/wes_frontend`
- Worktree 开发时代码在 `wes_frontend-worktrees/{branch}`
- 必须显式指定路径，否则读取的是主仓库的代码（可能不包含新菜单）

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
pnpm type:generate    # 生成 TypeScript 类型
pnpm zod:generate     # 生成 Zod Schema
pnpm permission:generate  # 生成权限常量
```

**检查清单**：

- [ ] 后端服务已启动（http://localhost:8001/docs 可访问）
- [ ] 执行了 `pnpm type:generate`
- [ ] 执行了 `pnpm zod:generate`
- [ ] 执行了 `pnpm permission:generate`

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
# 或查看 OpenAPI 文档
open http://localhost:8001/docs
```

**API 能力检查清单**：

| 检查项            | 后端特征                           | 前端配置                            |
| ----------------- | ---------------------------------- | ----------------------------------- |
| 软删除            | 有 `trash`、`restore` 端点         | 使用 `createSoftDeleteCrudApi`      |
| 回收站            | 有 `trashPermanentDelete` 端点     | `features.trash: { enabled: true }` |
| 批量操作          | 有 `bulkDelete`、`bulkUpdate` 端点 | 需手动实现批量选择                  |
| 导出              | 有 `export` 端点                   | 添加自定义导出按钮                  |
| 高级查询          | `query` 端点支持复杂参数           | 使用智能搜索组件                    |
| **额外 API 能力** | 有 `{id}/xxx` 子资源端点           | 通过 `extensions` 添加自定义操作    |

**额外 API 能力实现**（以用户管理的"分配角色"为例）：

```typescript
// 1. API 层：扩展基础 CRUD
export const userApi = {
  ...baseUserApi,  // 基础 CRUD 能力

  // 额外能力：分配角色
  async assignRoles(id: number, roleIds: number[]) {
    return await contractClient.put('/api/v1/users/{id}/assign-roles', {
      params: { id },
      body: { role_ids: roleIds }
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

1. **角色管理开发**：最初只用了 `createCrudApi`，后来发现后端支持软删除，改为 `createSoftDeleteCrudApi` 并启用 `features.trash`，回收站功能立即生效。

2. **用户管理开发**：后端提供了 `assign-roles` 和 `reset-password` 端点，通过 `extensions.rowActions` 添加自定义行操作，实现完整的用户管理能力。

---

### 坑点 3: Worktree 开发时菜单同步失败

**现象**：运行 `sync_menus.sh` 后数据库没有新菜单。

**原因**：脚本默认读取主仓库路径，不是当前 worktree。

**解决**：始终使用 `--frontend-path` 参数指定 worktree 路径。

```bash
# 通用模板
bash scripts/data/sync_menus.sh \
  --frontend-path "$(pwd)"
```

### 坑点 3: API 端点不存在导致类型错误

**现象**：`role.ts` 中出现 `bulkDelete` 类型错误。

**原因**：后端 OpenAPI 合同中没有该端点，不能随意添加。

**解决**：只使用后端实际提供的端点。

```typescript
// ❌ 错误
export const roleApi = createSoftDeleteCrudApi({
  // ...
  bulkDelete: `${ROLE_PATH}/bulk` as const // 不存在！
})

// ✅ 正确
export const roleApi = createSoftDeleteCrudApi({
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

| 问题                 | 排查                               | 解决                                                |
| -------------------- | ---------------------------------- | --------------------------------------------------- |
| 类型/Zod/权限找不到  | 是否同步了后端契约                 | 执行 `pnpm type:generate` 和 `pnpm zod:generate`    |
| 缺少回收站/额外 API  | 检查后端 OpenAPI 端点              | 使用 `createSoftDeleteCrudApi` 或 `extensions` 扩展 |
| 菜单同步后数据库没有 | 检查 `--frontend-path` 是否正确    | 使用绝对路径指定 worktree                           |
| 表格列不显示         | 检查 `visibleFrom` 和 `storageKey` | 设置 `visibleFrom: 'mobile'`，确保 key 唯一         |
| 表单字段类型错误     | 检查 OpenAPI schema 推断           | 在 `form` 中显式覆盖 `type`                         |
| 权限检查不生效       | 检查权限常量引用                   | 使用 `ADMIN_PERMISSIONS.xxx`                        |
| 列配置不持久化       | 检查 localStorage                  | 使用命名空间前缀如 `wes-xxx`                        |
| 类型推断失败         | 检查泛型参数                       | 显式传递 `<Item, Create, Update>`                   |

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

## 自动化检查（Hooks）

可以通过 Hooks 自动检查后端 API 能力，避免遗漏。

### Claude Code Hook（推荐）

项目已配置 `.claude/settings.json`，当对话中提到开发新功能时自动触发检查：

```bash
# 触发关键词示例
"帮我开发一个商品管理页面"
"create a new order api"
"添加用户分配角色功能"
```

**Hook 会检查**：

- 后端服务是否启动
- API 契约是否需要同步
- 是否遗漏软删除/额外 API 能力

### Git Pre-commit Hook

提交前自动检查 API 模块变更：

```bash
# 安装 hook（worktree 需指定主仓库路径）
ln -s "$(pwd)/scripts/hooks/pre-commit-check-api" \
  /Users/kaizhou/SynologyDrive/works/wes_frontend/.git/hooks/pre-commit

# 手动运行检查
bash scripts/hooks/pre-commit-check-api
```

**Hook 会阻止提交的情况**：

- 后端 API 已变更但未同步契约
- 检测到软删除端点但使用了 `createCrudApi`

```bash
# 绕过检查强制提交
git commit --no-verify
```

---

## 更新日志

| 版本 | 日期       | 更新内容                                      |
| ---- | ---------- | --------------------------------------------- |
| 1.3  | 2026-03-26 | 精简结构，添加"5分钟快速开始"和"常见坑点"章节 |
| 1.2  | 2026-03-26 | 新增标准开发流程章节                          |
| 1.0  | 2026-03-14 | 初始版本                                      |
