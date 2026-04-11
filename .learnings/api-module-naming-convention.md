# API 模块命名约定导致的导入错误

## 问题现象

类型检查报错：

```
Cannot find module '@/api/modules/role' or its corresponding type declarations.
```

## 根本原因

**命名约定冲突**：

| 层级                  | 命名规则            | 示例                            | 来源               |
| --------------------- | ------------------- | ------------------------------- | ------------------ |
| **后端 API 路径**     | 复数形式（RESTful） | `/api/v1/admin/roles`           | FastAPI 路由设计   |
| **前端 API 模块文件** | 复数形式            | `roles.ts`                      | 契约同步脚本       |
| **前端类型名**        | 复数形式            | `RolesItem`, `CreateRolesInput` | 自动生成           |
| **后端 Schema 名**    | 单数形式            | `RoleCreate`, `RoleUpdate`      | Pydantic 模型名    |
| **前端 Zod Schema**   | 单数形式            | `RoleCreateSchema`              | 与后端 Schema 对齐 |

前端导入代码使用了错误的单数形式：

```typescript
// 错误：文件名和类型名都不匹配
import type { Role, CreateRoleInput } from '@/api/modules/role'
import { roleApi } from '@/api/modules/role'
```

## 解决方案

修正导入路径和类型名称为复数形式：

```typescript
// 正确：匹配自动生成的 API 模块
import type { RolesItem, CreateRolesInput } from '@/api/modules/roles'
import { rolesApi } from '@/api/modules/roles'
```

**泛型参数也需要修正**：

```typescript
// 错误
defineCrudResourceFieldBundle<Role, CreateRoleInput, UpdateRoleInput>

// 正确
defineCrudResourceFieldBundle<RolesItem, CreateRolesInput, UpdateRolesInput>
```

## 关键知识点

### 契约同步脚本的命名逻辑

**脚本位置**：`scripts/generate-api-types.ts`

**命名规则**：

- API 模块文件名：从后端路径 `/api/v1/admin/roles` 提取资源名 `roles`（复数）
- 类型名：`Roles` + 后缀（`Item`、`CreateInput`、`UpdateInput`）
- API 实例：`rolesApi`（复数）

**Zod Schema 命名例外**：

- Zod Schema 从后端 Pydantic Schema 名生成
- 后端 Schema 是单数形式（`RoleCreate`），前端 Zod 也是单数（`RoleCreateSchema`）

### 如何判断正确的导入路径

**步骤 1：查看 API 模块文件**

```bash
ls src/api/modules/
# 看到文件名：roles.ts（复数）
```

**步骤 2：查看导出的类型**

```typescript
// src/api/modules/roles.ts
export type RolesItem = ...
export type CreateRolesInput = ...
export type UpdateRolesInput = ...
export const rolesApi = ...
```

**步骤 3：检查 Zod Schema**

```bash
grep "RoleCreate" src/types/generated/zod-schemas.ts
# 输出：RoleCreateSchema（单数）
```

### 常见的命名约定

| 类型       | 后端命名                | 前端 API 类型 | 前端 Zod Schema      |
| ---------- | ----------------------- | ------------- | -------------------- |
| **User**   | `/api/v1/admin/users`   | `UsersItem`   | `UserCreateSchema`   |
| **Role**   | `/api/v1/admin/roles`   | `RolesItem`   | `RoleCreateSchema`   |
| **Menu**   | `/api/v1/admin/menus`   | `MenusItem`   | `MenuCreateSchema`   |
| **Device** | `/api/v1/admin/devices` | `DevicesItem` | `DeviceCreateSchema` |

**规律**：

- API 类型：复数（资源名 + 后缀）
- Zod Schema：单数（资源名单数 + 后缀）

## 防止再次发生

**导入前必查**：

```bash
# 1. 查看 API 模块文件名
ls src/api/modules/ | grep <resource>

# 2. 查看导出的类型名
grep "export type" src/api/modules/<resource>.ts

# 3. 使用 IntelliSense（VS Code）
import type { | } from '@/api/modules/<resource>'  # 光标在 | 处，自动提示可用类型
```

**约定总结**：

- ✅ API 模块导入：使用复数形式（`roles.ts` → `RolesItem`）
- ✅ Zod Schema 导入：使用单数形式（`RoleCreateSchema`）
- ✅ API 实例导入：使用复数形式（`rolesApi`）

**自动化建议**：
考虑在契约同步脚本中添加注释，标注导出的类型名：

```typescript
// ==================== AUTO GENERATED START ====================
/**
 * 自动生成的 API 模块
 *
 * 导出的类型（复数形式）：
 * - RolesItem
 * - CreateRolesInput
 * - UpdateRolesInput
 * - rolesApi
 *
 * 对应的 Zod Schema（单数形式）：
 * - RoleCreateSchema (src/types/generated/zod-schemas.ts)
 * - RoleUpdateSchema
 */
```

## 相关文件

- 修复位置：
  - `src/views/admin/roles/config/fieldConfig.ts`
  - `src/views/admin/roles/config/pageConfig.ts`
- API 模块：`src/api/modules/roles.ts`
- 类型定义：`src/api/generated/openapi-types.ts`
- Zod Schema：`src/types/generated/zod-schemas.ts`

## 发现时间

2026-04-09
