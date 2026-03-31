# OpenAPI 类型生成脚本重写设计

> 日期：2026-03-31
> 目标脚本：[scripts/generate-api-types.ts](/Users/kaizhou/SynologyDrive/works/wes_frontend/scripts/generate-api-types.ts)

## 背景

后端 API 节点已经重构为统一路径结构：

- `/api/v1/{module}/{model}`
- `/api/v1/{module}/{model}/{id}`
- `/api/v1/{module}/{model}/...`

现有 `scripts/generate-api-types.ts` 仍保留以下旧假设：

- 先生成总入口 `src/api/generated/api-clients.ts`，再由 `src/api/modules/*.ts` 二次转发
- 通过 `operationId`、资源前缀、单复数映射来猜测方法名和模块名
- 通过 `detectResourcePrefixes`、`toSingular` 等硬编码修补命名差异
- 对模块生成和 API 聚合存在重复职责

这导致脚本对后端节点结构变化不稳定，也不符合“按 model 直接生成调用入口”的目标。

## 目标

重写 `scripts/generate-api-types.ts`，让前端生成链路满足以下要求：

1. 仅基于 OpenAPI `paths` 与 `components.schemas` 生成产物
2. 按 `/api/v1/{module}/{model}` 的路径事实分组，而不是按 `operationId` 猜测资源
3. 继续生成：
   - `src/api/generated/openapi-types.ts`
   - `src/api/generated/openapi-metadata.ts`
4. 停止生成：
   - `src/api/generated/api-clients.ts`
5. 直接生成最终业务入口：
   - `src/api/modules/<camelModel>.ts`
6. 重新生成时保留每个模块文件中的手工扩展区，不能被覆盖
7. 去除 `detectResourcePrefixes` 以及类似的命名/资源硬编码
8. 接受本次顺手将业务代码迁移到“按 model 机械命名”的新规范

## 非目标

本次设计不包含以下内容：

- 不调整 `src/components/common/crud-page/resourceFieldBuilder.ts` 对 `openapi-metadata.ts` 的依赖方式
- 不改变 `src/api/base/crud-api.ts` 的核心契约接口
- 不删除未带生成 marker 的手工模块文件
- 不引入 AST 写回或代码格式化框架，模块生成采用稳定文本模板

## 最终产物结构

重写后，`pnpm type:generate` 的输出职责收敛为三类：

### 1. 契约类型

- `src/api/generated/openapi-types.ts`

职责：

- 作为 OpenAPI paths/components 的编译期单一来源
- 继续被 `src/api/contract/types.ts`、`src/api/base/crud-api.ts`、生成模块文件直接引用

### 2. 字段元数据

- `src/api/generated/openapi-metadata.ts`

职责：

- 为 CRUD 页面字段系统提供 schema 字段元信息
- 保留当前能力：title、description、required、nullable、enum、ref、items、长度/数值约束

### 3. 按 model 生成的 API 入口

- `src/api/modules/<camelModel>.ts`

职责：

- 直接作为页面、composable、store 的最终 API 入口
- 在同一个文件中组合：
  - 标准 CRUD 主干
  - 非标准业务动作方法
  - 自动生成的类型导出
  - 手工扩展区

## 命名规范

本次重写明确采用“按 model 机械命名”，不再做英语单复数修正。

规则如下：

1. 从路径中的 `{model}` 取原始字符串
2. 仅做字符规范化：
   - kebab-case -> camelCase
   - snake_case -> camelCase
3. 不做单数化
4. 不维护例外映射表

示例：

- `users` -> 文件 `src/api/modules/users.ts`，导出 `usersApi`
- `api-applications` -> 文件 `src/api/modules/apiApplications.ts`，导出 `apiApplicationsApi`
- `work_lines` -> 文件 `src/api/modules/workLines.ts`，导出 `workLinesApi`

类型命名同样机械生成，例如：

- `UsersItem`
- `CreateUsersInput`
- `UpdateUsersInput`

这一规则优先于历史命名习惯。后续业务引用同步迁移到新名称。

## 分组与识别策略

### 1. 资源分组

脚本仅按路径分组：

- 匹配规则：`^/api/v\\d+/([^/]+)/([^/]+)(?:/.*)?$`
- 分组键：`{module}:{model}`
- 集合路径：`/api/v1/{module}/{model}`

任何不符合该结构的路径，跳过模块生成，但仍保留在 `openapi-types.ts` 中。

### 2. CRUD 识别

脚本不再用资源名词表推断 CRUD 类型，只通过约定路径是否存在判定。

标准 CRUD 条件：

- `POST {collection}`
- `GET {collection}/{id}`
- `PUT {collection}/{id}`
- `DELETE {collection}/{id}`
- `POST {collection}/query`

软删除 CRUD 条件：

- 满足标准 CRUD
- 且存在 `POST {collection}/{id}/restore`
- 且存在 `GET {collection}/trash`
- 且存在 `POST {collection}/trash/restore`
- 且存在 `DELETE {collection}/trash/permanent`

批量删除单独检测：

- `DELETE {collection}/bulk`

### 3. 非标准方法识别

对于同一 group 中不属于 CRUD 主干的端点，统一作为额外动作方法生成到同一个模块文件内。

方法名不再来自 `operationId` 猜测，而是来自“相对 collection path 的剩余路径 + HTTP method”。

示例，假设 collection path 为 `/api/v1/admin/users`：

- `PUT /api/v1/admin/users/{id}/reset-password` -> `resetPassword`
- `POST /api/v1/admin/users/{id}/assign-roles` -> `assignRoles`
- `GET /api/v1/admin/users/stats/cache` -> `statsCache`

`{id}`、`{node_id}` 等路径参数片段不会进入方法名。

若剩余路径为空，则说明是 CRUD 主干，不单独生成业务方法。

## 模块文件模板

每个 `src/api/modules/<camelModel>.ts` 使用统一模板。

### 自动区

自动区负责输出：

- import
- `COLLECTION_PATH`
- 基础类型导出
- `baseXxxApi`
- 自动生成的额外动作方法
- 最终 `xxxApi`

### 手工区

手工区必须永久保留，不随重新生成被覆盖。

固定 marker：

```ts
// ==================== AUTO GENERATED START ====================
// auto generated content
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================
// manual extensions
// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================
// manual config
// ==================== CUSTOM CONFIG END ====================
```

模块文件更新规则：

1. 文件不存在：
   - 创建完整模板
2. 文件存在且 marker 完整：
   - 仅替换 `AUTO GENERATED START/END` 之间的内容
   - `CUSTOM METHODS` 与 `CUSTOM CONFIG` 原样保留
3. 文件存在但 marker 缺失、顺序错误或结构损坏：
   - 脚本直接报错并停止
   - 不尝试覆盖
4. 文件存在但 marker 外还有未知内容：
   - 脚本直接报错并停止
   - 防止误删手工代码

## 自动生成模块的类型与 API 结构

### 1. CRUD 资源

若资源满足标准 CRUD，模块自动生成：

- `const COLLECTION_PATH = '...'`
- `export type XxxItem = CrudItem<typeof COLLECTION_PATH>`
- `export type CreateXxxInput = CrudCreateInput<typeof COLLECTION_PATH>`
- `export type UpdateXxxInput = CrudUpdateInput<typeof COLLECTION_PATH>`
- `const baseXxxApi = createCrudApi(...)` 或 `createSoftDeleteCrudApi(...)`
- `export const xxxApi = { ...baseXxxApi, ...generatedExtraMethods }`

### 2. 纯业务资源

若资源不满足标准 CRUD：

- 不生成 `baseCrudApi`
- 直接生成：
  - `export const xxxApi = { methodA, methodB, ... }`

### 3. 额外动作方法

每个方法直接使用：

- `contractClient`
- `ContractRequestConfig`
- `ContractResponseData`
- `paths[...]` 中的 path/query/body 类型

不再通过 `src/api/generated/api-clients.ts` 中转。

## 旧逻辑删除范围

重写时删除或废弃以下旧设计：

- `detectResourcePrefixes`
- 基于 `operationId` 资源前缀猜测的方法命名逻辑
- `toSingular` 及不规则复数映射
- 生成 `src/api/generated/api-clients.ts` 的整套流程
- 生成后再导入 `xxxGeneratedApi` 的模块拼装模式

保留或复用以下能力：

- 获取 OpenAPI spec
- 生成 `openapi-types.ts`
- 生成 `openapi-metadata.ts`
- 生成文件后做 TypeScript 语法校验
- 自动删除不再匹配当前 OpenAPI 分组的旧自动生成模块文件

## 脚本内部建议结构

`scripts/generate-api-types.ts` 重构为以下职责分层：

### 1. OpenAPI 读取层

- `fetchOpenApiSpec`
- `getSchemas`
- `extractEndpoints`

### 2. 分析层

- `parseModuleModelFromPath`
- `groupEndpointsByModuleModel`
- `detectCrudCapabilities`
- `classifyCrudEndpoints`
- `buildRelativeEndpointDescriptor`
- `buildMethodNameFromRelativePath`

### 3. 代码生成层

- `generateOpenApiTypesFile`
- `generateOpenApiMetadataFile`
- `generateModuleAutoSection`
- `generateNewModuleTemplate`
- `mergeModuleWithCustomSections`

### 4. 安全校验层

- `validateGeneratedFile`
- `validateModuleMarkers`
- `findUnknownContentOutsideMarkers`
- `collectStaleGeneratedModules`

### 5. 主流程

按固定顺序执行：

1. 拉取 spec
2. 生成 `openapi-types.ts`
3. 生成 `openapi-metadata.ts`
4. 按 group 生成或更新 `src/api/modules/*.ts`
5. 校验每个输出文件语法
6. 输出 stale module 警告

## 迁移策略

由于命名改为“按 model 机械命名”，需要同步迁移业务层引用。

迁移范围包括但不限于：

- `src/composables/**`
- `src/views/**`
- `src/components/**`
- `docs/**` 中示例代码

迁移内容：

- import 路径：
  - `@/api/modules/user` -> `@/api/modules/users`
- API 对象名：
  - `userApi` -> `usersApi`
- 类型名：
  - `User` -> `UsersItem`
  - `CreateUserInput` -> `CreateUsersInput`
  - `UpdateUserInput` -> `UpdateUsersInput`

对 `auth`、`login`、`refresh` 这类天然非复数 model，直接按 model 机械命名。

## 错误处理与安全边界

### 1. 不自动删除过时模块

若后端删除某个 model，对应本地模块文件可能仍包含手工区。

因此脚本行为为：

- 识别并列出 stale module 文件
- 输出警告清单
- 不自动删除

### 2. marker 异常立即失败

以下情况直接失败退出：

- 缺少任意手工区 marker
- marker 顺序不合法
- 自动区外存在未知代码

### 3. 类型问题通过后续校验暴露

若后端删除了自动生成方法，而手工区仍引用旧方法：

- 重新生成不会覆盖手工区
- `pnpm type:check` 负责暴露失效引用

## 测试与验证

脚本重写完成后，最低验证集为：

1. `pnpm type:generate`
2. `pnpm type:check`
3. 抽查至少三个 model：
   - 一个标准 CRUD 资源
   - 一个软删除 CRUD 资源
   - 一个纯业务资源
4. 验证重新生成时：
   - 自动区更新
   - 手工区保留
   - marker 异常时安全失败

## 风险

### 1. 命名迁移影响面大

业务代码当前广泛使用旧命名，迁移会触及多个 composable、view 和文档示例。

### 2. 旧模块中可能存在手工逻辑

需要先通过 marker 机制保住已有手工区，再做文件级重建。

### 3. 纯路径驱动命名可能与个别历史习惯不一致

这是有意取舍，用规则稳定性替代语义修饰。

## 最终决策摘要

1. 采用方案 B：删除 `api-clients.ts`，直接生成 `src/api/modules/*.ts`
2. 保留 `openapi-types.ts` 与 `openapi-metadata.ts`
3. 按 `{module}:{model}` 路径事实分组
4. 完全移除资源前缀检测、单复数映射、`operationId` 资源猜测
5. 采用按 model 机械命名，并同步迁移业务层引用
6. 每个模块文件强制使用“自动区 + 手工区”模板
7. 重新生成时绝不覆盖手工扩展区
