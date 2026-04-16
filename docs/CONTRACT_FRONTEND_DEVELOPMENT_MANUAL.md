# 前端契约开发指导手册

本文档用于指导团队成员在“后端新增或调整 API 契约”后，如何在前端快速、统一地完成接入工作。

目标是让开发成员拿到一套新契约后，可以直接判断接入类型、落模块、落页面、联调验证，并完成交付。

## 0. 当前实现基线（2026-04）

> 本手册已按当前仓库实现同步。当前前端接入契约的统一约定如下：
>
> - 生成模块对外导出 `xxxApiMethods`
> - 标准资源页面在 `createCrudPageConfigFromResource()` 中声明 `resource.methods`
> - 页面框架内部从 `methods` 自动桥接出 `requestAdapter`
> - 业务代码直接请求时优先使用 `xxxApiMethods(...).send()`
> - 基础能力入口为 `src/api/base/crud-request-adapter.ts` 与 `src/composables/useCrudRequestAdapter.ts`

## 1. 适用范围

本文档适用于以下场景：

- 后端新增一个标准资源，例如用户、设备、角色、菜单
- 后端为现有资源新增业务动作，例如重置密码、启用、停用、下发指令
- 后端新增纯业务动作接口，例如登录、刷新 token、获取当前用户、获取我的菜单

## 2. 开发目标

前端接入契约时，统一达成以下目标：

- 统一使用生成契约作为类型来源
- 统一使用资源模块的 `xxxApiMethods` 作为页面入口
- 统一使用通用 CRUD 能力承接标准资源
- 统一将资源附加动作挂在同一资源模块中
- 统一将权限、页面配置、表单 schema、搜索 schema 围绕资源模块组织

## 3. 契约来源与核心文件

本章节分成两类：

- 团队成员在接业务时需要直接操作的文件
- 架构层已经提供好的公共支撑文件

### 3.1 团队成员需要直接操作的文件

#### 3.1.1 生成契约文件

- `src/api/generated/openapi-types.ts`

用途：

- 查看新增路径、方法、请求体、响应体、schema
- 作为前端接入新契约时的类型来源

团队成员操作方式：

- 通过 `pnpm type:generate` 更新
- 接入前先查看目标路径和目标 schema

#### 3.1.2 业务 API 模块

- `src/api/modules/*.ts`

用途：

- 一个资源对应一个资源模块
- 在模块中组装标准 CRUD 主干
- 在模块中追加资源附加业务动作
- 向页面层导出稳定的 methods 和类型

团队成员操作方式：

- 新增资源时新增对应模块
- 扩展资源动作时更新对应模块

#### 3.1.3 页面配置层

- `src/views/**/config/pageConfig.ts`
- `src/views/**/config/fieldConfig.ts`
- `src/views/**/config/actionConfig.ts`

用途：

- 接入资源页面的表格、表单、搜索、排序、扩展动作
- 连接资源模块与通用 CRUD 页面框架

团队成员操作方式：

- 新增页面时补齐配置文件
- 新增业务动作时同步补齐页面动作配置

#### 3.1.4 权限生成物

- `src/api/generated/permissions/**`

用途：

- 为页面、按钮、扩展动作提供权限常量

团队成员操作方式：

- 通过 `pnpm permission:generate` 更新
- 在页面配置和动作配置中接入对应权限

### 3.2 架构层公共支撑文件

#### 3.2.1 契约请求层

- `src/api/contract/types.ts`
- `src/api/contract/client.ts`

用途：

- 从 OpenAPI 契约中推导路径、请求、响应类型
- 提供受契约约束的请求调用方式

说明：

- 这是架构层公共能力
- 业务接入时直接复用

#### 3.2.2 通用 CRUD 基类

- `src/api/base/crud-request-adapter.ts`

用途：

- 承接标准资源的详情、查询、创建、更新、删除能力
- 为页面层提供统一的 CRUD API 接口

说明：

- 这是架构层公共能力
- 团队成员在接标准资源时复用该能力

#### 3.2.3 通用 CRUD 页面框架

- `src/components/common/crud-page/**`
- `src/composables/useCrudRequestAdapter.ts`
- `src/composables/useCrudListPage.ts`

用途：

- 承接标准资源页面的列表、搜索、表单、动作和状态管理

说明：

- 这是页面层公共支撑
- 团队成员在业务页面中按约定接入

## 4. 契约接入的三种模式

### 4.1 标准 CRUD 资源

标准 CRUD 资源通常具备以下路径形态：

- `POST /resource`
- `GET /resource/{id}`
- `PUT /resource/{id}`
- `DELETE /resource/{id}`
- `POST /resource/query`

这类资源统一接入方式：

- 在 `src/api/modules/xxx.ts` 中建立资源模块
- 使用生成的 `baseXxxApiMethods` / `xxxApiMethods` 组装标准 CRUD 能力
- 在页面配置中直接接入该资源模块

### 4.2 标准 CRUD 资源 + 附加业务动作

这类资源在标准 CRUD 主干之外，还拥有额外动作，例如：

- `PUT /users/{id}/reset-password`
- `POST /devices/{id}/dispatch`
- `POST /roles/{id}/bind-permissions`

这类资源统一接入方式：

- 先建立标准 CRUD 主干
- 再将附加业务动作挂到同一个资源模块对象上
- 页面继续统一消费该资源模块的 `methods`

### 4.3 纯业务动作接口

例如：

- 登录
- 刷新 token
- 获取当前用户信息
- 获取我的菜单

这类接口统一接入方式：

- 在 `src/api/modules/xxx.ts` 中显式定义业务方法
- 页面、store、composable 直接消费该模块方法

## 5. 开发步骤

下面的步骤是团队统一执行顺序。

### 步骤 1：同步契约生成物

- [ ] 拉取后端最新契约
- [ ] 执行 `pnpm type:generate`
- [ ] 按需执行 `pnpm zod:generate`
- [ ] 按需执行 `pnpm permission:generate`
- [ ] 检查新增路径、schema、operation 是否进入生成文件

### 步骤 2：识别资源结构

- [ ] 确认资源集合路径
- [ ] 确认详情路径
- [ ] 确认查询路径
- [ ] 确认附加业务动作路径
- [ ] 确认每个路径的方法、请求体、响应体、路径参数、查询参数、权限点

### 步骤 3：建立 API 模块

- [ ] 在 `src/api/modules/` 下新增或更新对应模块
- [ ] 为资源定义路径常量
- [ ] 导出该资源的实体类型、创建类型、更新类型
- [ ] 组装标准 CRUD 主干
- [ ] 追加附加业务动作方法

### 步骤 4：建立页面配置

- [ ] 在页面配置中接入资源模块
- [ ] 定义表格列
- [ ] 定义搜索字段
- [ ] 定义创建表单
- [ ] 定义编辑表单
- [ ] 定义扩展业务动作

### 步骤 5：接入权限

- [ ] 将标准 CRUD 权限接入页面配置
- [ ] 将附加动作权限接入扩展动作
- [ ] 校验不同角色下的可见性与可执行性

### 步骤 6：联调验证

- [ ] 联调列表
- [ ] 联调详情
- [ ] 联调创建
- [ ] 联调更新
- [ ] 联调删除
- [ ] 联调附加业务动作
- [ ] 联调搜索、排序、分页

### 步骤 7：质量门禁

- [ ] 执行 `pnpm type:check`
- [ ] 执行 `pnpm contract:test`
- [ ] 按需执行 `pnpm contract:verify`
- [ ] 执行 `pnpm lint:all`

## 6. 用户管理完整示例

用户管理是“标准 CRUD 资源 + 附加业务动作”的典型示例。

### 6.1 资源主干

用户管理包含以下标准资源路径：

- `/api/v1/users`
- `/api/v1/users/{id}`
- `/api/v1/users/query`

对应前端主干能力：

- 查询用户列表
- 获取用户详情
- 创建用户
- 编辑用户
- 删除用户

### 6.2 附加业务动作

用户管理还包含附加动作：

- `/api/v1/users/{id}/reset-password`

对应前端附加能力：

- 管理员为指定用户重置密码

### 6.3 API 模块组织方式

文件位置：

- `src/api/modules/users.ts`

组织方式：

1. 定义资源集合路径
2. 使用生成器产生的 `baseUsersApiMethods` 作为标准 CRUD 主干
3. 导出 `UsersItem`、`CreateUsersInput`、`UpdateUsersInput`
4. 为 `resetPassword` 定义输入输出类型
5. 将 `resetPassword` 追加到 `usersApiMethods`

模块结构示意：

```ts
const USER_COLLECTION_PATH = '/api/v1/users'
const USER_RESET_PASSWORD_PATH = '/api/v1/users/{id}/reset-password'

const baseUsersApiMethods = createSoftDeleteCrudRequestAdapterMethods({
  collection: USER_COLLECTION_PATH,
  item: `${USER_COLLECTION_PATH}/{id}` as const,
  query: `${USER_COLLECTION_PATH}/query` as const,
  restore: `${USER_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${USER_COLLECTION_PATH}/trash` as const,
  trashRestore: `${USER_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${USER_COLLECTION_PATH}/trash/permanent` as const
})

export const usersApiMethods = {
  ...baseUsersApiMethods,

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
  }
}
```

### 6.4 页面配置组织方式

文件位置：

- `src/views/admin/users/config/pageConfig.ts`
- `src/views/admin/users/config/fieldConfig.ts`
- `src/views/admin/users/config/actionConfig.ts`

页面层接入方式：

- `pageConfig.ts` 中统一使用 `methods: usersApiMethods`
- `fieldConfig.ts` 中定义列表字段、搜索字段、表单字段
- `actionConfig.ts` 中追加“重置密码”业务动作

### 6.5 用户管理开发检查清单

- [ ] 用户资源模块已建立
- [ ] 用户列表、详情、创建、更新、删除能力已接入
- [ ] 重置密码动作已接入
- [ ] 用户页面配置已完成
- [ ] 用户表单 schema 已完成
- [ ] 用户搜索字段已完成
- [ ] 用户权限已接入
- [ ] 用户页面路由已接入
- [ ] 用户页面联调通过

## 7. 资源模块标准模板

### 7.1 标准 CRUD 资源模板

适用场景：

- 资源具备统一 CRUD 主干
- 页面以标准列表 + 表单形态为主

模板步骤：

- [ ] 定义资源集合路径
- [ ] 使用生成器导出的 `xxxApiMethods` 或 `createCrudRequestAdapterMethods`
- [ ] 导出资源实体类型
- [ ] 导出创建类型
- [ ] 导出更新类型
- [ ] 在页面中直接消费该模块

### 7.2 标准 CRUD + 附加动作模板

适用场景：

- 资源具备统一 CRUD 主干
- 资源还存在一个或多个业务动作

模板步骤：

- [ ] 建立标准 CRUD 主干
- [ ] 为附加动作定义路径
- [ ] 为附加动作定义输入输出类型
- [ ] 将附加动作追加到资源模块
- [ ] 在页面扩展动作中接入该方法

### 7.3 纯业务动作接口模板

适用场景：

- 接口本身不承接资源型列表/详情/创建/更新/删除

模板步骤：

- [ ] 定义路径常量
- [ ] 定义请求类型
- [ ] 定义响应类型
- [ ] 在模块中定义显式业务方法
- [ ] 在 composable、store 或页面中调用

## 8. 页面接入标准

页面开发时统一按下面的组织方式推进：

### 8.1 标准 CRUD 页面

- [ ] `pageConfig.ts` 接入资源模块
- [ ] `fieldConfig.ts` 定义字段、搜索、表单
- [ ] 使用 `createCrudPageConfigFromResource`
- [ ] 标准创建、编辑、删除流程接入

### 8.2 带附加动作的 CRUD 页面

- [ ] 标准 CRUD 页面配置完成
- [ ] `actionConfig.ts` 接入附加动作
- [ ] 附加动作具备表单、提示、刷新逻辑
- [ ] 附加动作具备权限控制

## 9. 常用命令

### 9.1 契约同步

```bash
pnpm type:generate
pnpm zod:generate
pnpm permission:generate
```

### 9.2 质量检查

```bash
pnpm type:check
pnpm contract:test
pnpm contract:verify
pnpm lint:all
```

## 10. 团队开发清单

团队成员拿到一个新契约后，按下面清单执行即可。

### 10.1 契约准备

- [ ] 已同步后端最新契约
- [ ] 已生成最新 OpenAPI 类型
- [ ] 已生成最新权限常量

### 10.2 API 模块

- [ ] 已建立资源模块
- [ ] 已导出资源实体类型
- [ ] 已导出创建/更新类型
- [ ] 已接入附加业务动作

### 10.3 页面配置

- [ ] 已完成页面配置
- [ ] 已完成表单 schema
- [ ] 已完成搜索 schema
- [ ] 已完成扩展动作配置

### 10.4 权限与导航

- [ ] 已接入权限
- [ ] 已接入路由
- [ ] 已接入菜单

### 10.5 联调与验收

- [ ] 列表通过
- [ ] 详情通过
- [ ] 创建通过
- [ ] 更新通过
- [ ] 删除通过
- [ ] 附加动作通过
- [ ] 权限校验通过
- [ ] `type:check` 通过
- [ ] `contract:test` 通过
- [ ] `lint:all` 通过

## 11. 一句话开发约定

团队统一采用以下开发方式：

- 一个资源对应一个资源模块
- 标准 CRUD 主干通过统一基类接入
- 资源附加业务动作挂载在同一资源模块中
- 页面统一消费该资源模块
- 契约类型统一从 OpenAPI 生成物推导
