# 阶段三：用户管理模块开发规范与实施计划

> **项目**: P9 WES 前端项目  
> **阶段**: 阶段三（业务功能开发）  
> **模块**: 用户管理（`/admin/users`）  
> **文档版本**: 1.0  
> **创建日期**: 2026-03-07

---

## 1. 文档目标

本文档用于指导前端正式进入“阶段三：业务功能开发”后的第一个核心模块——**用户管理**的落地实施。目标是：

1. 基于后端 `用户` 相关代码与现有 OpenAPI/Schema 能力，明确前端功能边界。
2. 结合当前前端真实工程结构，制定**可执行、可复用、不过度设计**的开发规范。
3. 明确哪些能力**已经存在，必须复用**；哪些能力需要在用户管理模块中补齐。
4. 输出分阶段实施计划、交付物、验收标准与风险提示，作为后续开发基线。

---

## 2. 后端契约结论（用户模块）

### 2.1 后端核心实现位置

用户管理后端实现位于 `../wes_backend`：

- 路由：`../wes_backend/src/app/admin/v1/user.py`
- 模型：`../wes_backend/src/app/admin/models/user.py`
- 服务：`../wes_backend/src/app/admin/services/user_service.py`
- 仓储：`../wes_backend/src/app/admin/repositories/user_repository.py`
- 认证聚合接口：`../wes_backend/src/app/auth/v1/auth.py`

### 2.2 当前确认可用的用户相关接口

基于 `BaseAPI` 自动生成 + 自定义路由，前端应按如下契约接入：

| 能力         | 方法     | 路径                            | 用途            |
| ------------ | -------- | ------------------------------- | --------------- |
| 创建用户     | `POST`   | `/api/v1/users`                 | 新建用户        |
| 更新用户     | `PUT`    | `/api/v1/users/{id}`            | 编辑用户        |
| 删除用户     | `DELETE` | `/api/v1/users/{id}`            | 软删除/永久删除 |
| 获取详情     | `GET`    | `/api/v1/users/{id}`            | 拉取用户详情    |
| 查询列表     | `POST`   | `/api/v1/users/query`           | 分页查询用户    |
| 恢复用户     | `POST`   | `/api/v1/users/{id}/restore`    | 回收站恢复      |
| 回收站列表   | `GET`    | `/api/v1/users/trash`           | 查看已删除用户  |
| 批量恢复     | `POST`   | `/api/v1/users/trash/restore`   | 批量恢复        |
| 批量永久删除 | `DELETE` | `/api/v1/users/trash/permanent` | 批量永久删除    |
| 缓存统计     | `GET`    | `/api/v1/users/stats/cache`     | 管理辅助信息    |

### 2.3 用户数据模型结论

后端 `UserResponse` 当前关键字段：

- `id: number`
- `username: string`
- `email: string`
- `full_name?: string | null`
- `is_superuser: boolean`
- `is_multi_login: boolean`
- `roles: RoleResponse[]`
- `created_at`
- `updated_at`

后端 `UserCreate` 当前字段：

- `username`
- `email`
- `full_name?`
- `password`

后端 `UserUpdate` 当前字段：

- `username?`
- `email?`
- `full_name?`

### 2.4 用户初始化上下文接口

前端登录后初始化，不应拆散重复请求，而应优先使用：

- `GET /api/v1/auth/my`

该接口一次性返回：

- 当前用户信息 `user`
- 当前用户权限 `permissions`
- 当前用户菜单树 `menus`

**结论**：阶段三用户管理接入时，页面权限和菜单展示应继续建立在 `/auth/my` 聚合能力之上，不要自行重复拼装“用户信息 + 权限 + 菜单”的初始化流程。

---

## 3. 当前前端已具备能力（必须复用）

以下能力已在当前前端仓库实现，**禁止重复造轮子**。

### 3.1 API 与错误处理层

已存在：

- `src/api/client.ts`：统一请求客户端、Token 自动刷新、统一响应拆包、统一错误通知
- `src/api/base/crud-api.ts`：标准 CRUD API 泛型封装
- `src/composables/useCrudApi.ts`：列表/详情/创建/更新/删除状态管理
- `src/composables/useRequest.ts`：通用请求状态管理

**规范要求**：

- 用户管理的列表与 CRUD 主流程必须优先基于 `userApi` + `useCrudApi` 实现。
- 非标准 CRUD 场景（如缓存统计、用户初始化）才使用 `useRequest`。
- 禁止在页面里直接散写 `loading / error / page / pageSize / total` 的重复状态逻辑。

### 3.2 权限与菜单层

已存在：

- `src/composables/usePermission.ts`
- `src/router/guards/permission.ts`
- `src/composables/useMenu.ts`
- `src/api/modules/menu.ts`
- `src/api/modules/auth.ts`

**规范要求**：

- 页面访问控制继续使用路由守卫与 `meta.permission`。
- 按钮显隐继续使用 `usePermission()`。
- 菜单渲染继续基于后端返回菜单树，不新增本地硬编码菜单树。
- 权限仅用于前端交互控制，不作为安全边界；所有实际权限校验以后端为准。

### 3.3 表单验证层

已存在：

- `src/types/generated/zod-schemas.ts`
- `src/types/zod-extensions.ts`
- `docs/ZOD_VALIDATION.md`
- 示例：`src/views/examples/UserFormExample.vue`

**规范要求**：

- 用户创建/编辑表单必须优先复用自动生成的 `UserCreateSchema`、`UserUpdateSchema`。
- 如需补充前端特有校验，仅允许在 `src/types/zod-extensions.ts` 中扩展。
- 禁止在页面中手写一套与后端约束重复且可能漂移的校验规则。

### 3.4 图标与布局层

已存在：

- `src/layouts/DefaultLayout.vue`
- `src/components/common/AppHeader.vue`
- `src/components/common/AppSidebar.vue`
- `src/components/ui/AppIcon.vue`
- `docs/ICON_USAGE_GUIDE.md`

**规范要求**：

- 用户管理页面必须接入现有默认布局。
- 菜单图标继续使用 `AppIcon` 渲染后端返回图标。
- 页面内部 UI 优先使用 Element Plus 组件，样式微调用 Tailwind 工具类，不新增平行 UI 体系。

---

## 4. 用户管理模块范围定义

### 4.1 本阶段必须交付（P0）

1. 用户列表页（分页、搜索、基础筛选）
2. 创建用户
3. 编辑用户
4. 删除用户（软删除）
5. 页面级权限控制
6. 按钮级权限控制
7. 表单验证与错误反馈
8. 列表刷新与操作后状态回收

### 4.2 建议纳入首轮但可拆分（P1）

1. 用户详情抽屉/弹窗
2. 回收站视图
3. 恢复用户
4. 缓存统计面板
5. 角色展示优化（标签/摘要）

### 4.3 暂不在首轮实现（避免范围膨胀）

1. 角色分配编辑（后端当前用户接口未体现专用分配入口，不应臆造）
2. 批量导入/导出
3. 高级组合筛选构建器 UI
4. 动态路由平台化改造
5. 通用后台管理框架重构

---

## 5. 工程化落地原则

### 5.1 先复用，后抽象

用户管理是阶段三第一个业务模块，原则是：

- **先用现有抽象完成业务闭环**
- **只在出现第二个以上明确复用场景时，再升级为通用组件/通用 composable**

因此本模块不建议一开始就抽象出：

- 通用后台列表引擎
- 通用弹窗表单工厂
- 通用过滤器 DSL 生成器
- 通用资源权限注册系统

### 5.2 “最小必要新增”原则

允许新增的内容应该仅覆盖以下缺口：

1. 用户管理页面组件
2. 与用户模块绑定的页面级 composable
3. 用户模块专属常量/映射
4. 必要的路由拆分

### 5.3 与当前真实工程结构保持一致

虽然技术选型文档中规划过 `stores/`、`router/routes/` 等更完整形态，但**当前真实仓库**仍以：

- `src/api/modules/*`
- `src/composables/*`
- `src/views/*`
- `src/router/index.ts`

为主。

**实施建议**：

- 本轮以最小改造接入用户管理，不强制先做 Pinia 体系。
- 页面局部状态优先放在页面 composable 中。
- 仅当路由条目开始明显增多时，再同步拆分 `src/router/routes/`。

---

## 6. 推荐目录落位

建议用户管理按如下结构扩展：

```text
src/
├── views/
│   └── admin/
│       └── users/
│           ├── UserListPage.vue          # 用户列表主页面
│           ├── components/
│           │   ├── UserTable.vue         # 表格区
│           │   ├── UserToolbar.vue       # 搜索/操作区
│           │   ├── UserFormDialog.vue    # 创建/编辑弹窗
│           │   └── UserDetailDrawer.vue  # 详情抽屉（如首轮实现）
│           └── composables/
│               ├── useUserListPage.ts    # 页面数据编排
│               └── useUserForm.ts        # 表单提交逻辑
├── api/
│   └── modules/
│       └── user.ts                       # 已存在，按需增强
└── router/
    └── index.ts                          # 首轮可继续接入；后续再拆 routes/
```

### 目录职责说明

- `UserListPage.vue`：页面骨架与区域编排，不堆业务细节。
- `components/*`：只承载展示与事件透传，不直接耦合请求。
- `composables/useUserListPage.ts`：页面状态、CRUD 调用、权限布尔值、弹窗开关。
- `composables/useUserForm.ts`：表单 schema、字段映射、提交流程、提交态。

---

## 7. API 接入规范

### 7.1 继续复用现有 `userApi`

当前已存在：

- `src/api/modules/user.ts`

其已基于 `createCrudApi()` 封装了标准能力，首轮应继续使用，不重写并行的 `userService.ts`、`usersApi.ts`、`requestUserList()` 等重复层。

### 7.2 `userApi` 建议增强项

仅允许增强**用户模块特有、且确实需要**的 API 封装，例如：

- `getCacheStats()`
- `getTrashList()` 的语义别名（如有必要）
- 显式的筛选构建辅助函数

### 7.3 查询过滤规范

列表查询应基于 `CrudApi.query(options)` 已有能力：

```ts
await userApi.query({
  page: 1,
  pageSize: 20,
  filters: {
    username: { op: 'ilike', value: '%admin%' },
    is_superuser: false
  },
  sort: [{ field: 'updated_at', order: 'desc' }]
})
```

**规范要求**：

- 优先使用字段级明确过滤，不依赖臆测的 `keyword` 后端行为。
- 需要模糊查询时，优先用 `ilike`。
- 复杂过滤也必须走现有 `filters -> normalizeFilters()` 机制，不重新造一套查询协议。

### 7.4 权限码处理规范

后端权限文档中存在 `get/detail` 表述差异，前端不要靠猜测写死详情权限。

**统一要求**：

- 页面访问：使用 `admin:user:list`
- 创建按钮：使用 `admin:user:create`
- 编辑按钮：使用 `admin:user:update`
- 删除按钮：使用 `admin:user:delete`
- 详情相关权限：**以 `/auth/my` 返回的真实权限集合为准**

建议在用户模块内部收敛权限常量，例如：

```ts
export const USER_PERMISSION = {
  page: 'admin:user:list',
  create: 'admin:user:create',
  update: 'admin:user:update',
  delete: 'admin:user:delete'
} as const
```

---

## 8. 页面交互与组件规范

### 8.1 页面骨架建议

用户管理页建议分为四个区域：

1. 页面标题区：标题、说明、刷新入口
2. 工具栏区：搜索、筛选、新建按钮
3. 表格区：列表、角色列、状态列、操作列
4. 分页区：页码、页大小、总数

### 8.2 弹窗策略

首轮推荐：

- 创建/编辑：使用 `ElDialog`
- 详情查看：如实现，使用 `ElDrawer`

原因：

- 与 Element Plus 当前生态保持一致
- 结构简单，适合阶段三快速交付
- 不需要引入额外弹层抽象

### 8.3 表格列建议

P0 首轮建议列：

- 用户名 `username`
- 邮箱 `email`
- 姓名 `full_name`
- 超级用户 `is_superuser`
- 多端登录 `is_multi_login`
- 角色 `roles`
- 更新时间 `updated_at`
- 操作列

### 8.4 操作列规范

操作列最少包括：

- 编辑
- 删除

如首轮加入详情：

- 查看详情

按钮显隐必须使用权限判断：

- `hasPermission(USER_PERMISSION.create)`
- `hasPermission(USER_PERMISSION.update)`
- `hasPermission(USER_PERMISSION.delete)`

---

## 9. 表单实现规范

### 9.1 创建/编辑表单统一策略

- 创建表单：基于 `UserCreateSchema`
- 编辑表单：基于 `UserUpdateSchema`
- 表单库：继续使用 `vee-validate`
- 校验桥接：使用 `@vee-validate/zod`

### 9.2 字段映射规范

创建表单字段：

- `username`
- `email`
- `full_name`
- `password`

编辑表单字段：

- `username`
- `email`
- `full_name`

**注意**：

- `password` 不应在编辑表单里默认出现，除非后端明确提供密码变更专用能力。
- `is_superuser`、`is_multi_login` 当前不应直接开放编辑，除非后端与权限模型明确允许。

### 9.3 初始值与回填规范

- 创建：使用空初始值
- 编辑：通过 `fetchById(id)` 拉取详情回填
- 回填时需做 `null -> ''` 的显示层兼容，但提交时按 schema 约束输出

### 9.4 提交反馈规范

必须统一提供：

- 提交按钮 loading
- 成功消息
- 失败消息
- 提交成功后关闭弹窗并刷新当前列表

---

## 10. 路由与权限接入规范

### 10.1 首轮路由策略

在 `src/router/index.ts` 中先接入静态路由即可：

- 路径：`/admin/users`
- 名称：`AdminUsers`
- 布局：`DefaultLayout`
- 元信息：
  - `requiresAuth: true`
  - `title: '用户管理'`
  - `permission: 'admin:user:list'`

### 10.2 后续可升级但首轮不强制

当阶段三页面数量增加后，再统一拆分：

- `src/router/routes/admin.ts`
- `src/router/routes/device.ts`
- `src/router/routes/sys.ts`

### 10.3 菜单联动原则

- 侧边栏显示继续以后端菜单树为准。
- 前端静态路由路径必须与后端菜单 `path` 保持一致。
- 如果后端菜单中用户管理路径不是 `/admin/users`，以前后端最终协商路径为准，不在前端自行偏离。

---

## 11. 状态管理规范

### 11.1 当前阶段不引入用户模块 Pinia Store

原因：

- 当前仓库尚未形成稳定 `stores/` 体系
- 用户列表状态主要是页面局部状态
- 现有 composable 已足够承载 CRUD 场景

### 11.2 哪些状态放哪里

放页面 composable：

- 列表数据
- 分页状态
- 搜索条件
- 当前编辑对象
- 弹窗开关
- 提交 loading

放全局现有能力：

- 当前登录用户：沿用认证初始化链路
- 权限：沿用 `usePermission()`
- 菜单：沿用 `useMenu()`

---

## 12. 用户管理首轮实施计划

### 12.1 里程碑划分

#### M1：页面骨架与路由接入

交付物：

- 用户管理页面路由
- 基础页面骨架
- 页面标题/工具栏/表格/分页区域

完成标准：

- 登录后可访问 `/admin/users`
- 无权限时可正确被路由守卫拦截

#### M2：列表查询闭环

交付物：

- 基于 `useCrudApi(userApi)` 的列表查询
- 搜索与分页
- 刷新能力

完成标准：

- 能稳定展示用户列表
- 翻页、筛选、刷新行为正确

#### M3：创建/编辑闭环

交付物：

- `UserFormDialog`
- 创建用户
- 编辑用户
- 表单校验

完成标准：

- 创建成功后列表刷新
- 编辑成功后列表刷新
- 校验错误可见且与后端约束一致

#### M4：删除与权限闭环

交付物：

- 删除操作
- 操作按钮权限控制
- 页面权限控制补齐

完成标准：

- 无删除权限时不显示删除按钮
- 删除成功后列表状态正确回收

#### M5：体验优化与补充能力（可选）

交付物：

- 详情抽屉
- 回收站
- 恢复能力
- 空状态/异常状态优化

完成标准：

- 页面具备完整管理体验

### 12.2 开发顺序建议

1. 路由 + 页面空壳
2. 列表查询
3. 搜索筛选
4. 新建弹窗
5. 编辑弹窗
6. 删除
7. 权限显隐
8. 可选增强（详情/回收站）

---

## 13. 验收标准

### 13.1 功能验收

- 可打开用户管理页面
- 可分页查看用户列表
- 可按用户名/邮箱进行筛选
- 有权限时可创建/编辑/删除
- 无权限时按钮不展示且路由受限
- 表单校验生效
- 请求失败时有统一错误反馈

### 13.2 工程验收

- 不重复实现 API 请求基础层
- 不重复实现权限控制基础层
- 不重复实现菜单缓存/权限缓存逻辑
- 不手写重复验证规则
- 目录职责清晰，页面/组件/composable 边界明确
- 命名符合现有仓库风格

### 13.3 代码质量验收

- `pnpm run type:check` 通过
- `pnpm run lint:eslint` 通过
- 页面无明显状态错乱/重复请求/权限闪烁问题

---

## 14. 风险与注意事项

### 14.1 权限码命名可能存在历史差异

后端文档中存在 `admin:user:get` 与路由生成逻辑中 `detail` 命名差异。

**处理策略**：

- 页面列表权限先以 `admin:user:list` 为准。
- 详情行为的权限判断不要硬推断，优先以 `/auth/my` 返回权限实际值为准。
- 如需页面内显式常量，应在联调时确认后统一收口。

### 14.2 `userApiExtended.searchByUsername()` 暂不建议直接作为主搜索方案

当前该方法使用 `keyword` 过滤，但后端是否将其映射为通用搜索字段未在用户模块代码中直接体现。

**处理策略**：

- 首轮列表搜索以显式字段过滤为主。
- 如后端确认支持 `keyword`，再升级为统一搜索入口。

### 14.3 不要提前实现角色分配

当前用户模块后端 CRUD 响应中会返回 `roles`，但**未看到明确的前端可直接使用的角色分配专用接口约定**。

**处理策略**：

- 首轮只展示角色信息，不实现角色编辑。
- 角色分配作为后续角色管理/用户高级编辑的独立任务。

---

## 15. 最终实施结论

用户管理模块应采用“**基于现有基础设施快速交付首个业务模块**”的策略落地：

- 请求层复用 `userApi`、`CrudApi`、`useCrudApi`
- 权限层复用 `usePermission` 与路由守卫
- 菜单层复用 `/auth/my` 与 `useMenu`
- 表单层复用 Zod 自动生成 schema + vee-validate
- 页面层新增最小必要组件与 composable

本模块的目标不是建立一套新的后台框架，而是**在当前工程基础上，沉淀一条可复制到角色管理、权限管理、设备管理的标准业务开发路径**。

---

## 16. 推荐下一步

建议按以下顺序正式进入编码：

1. 新增 `/admin/users` 路由与 `UserListPage.vue`
2. 完成列表页查询与分页闭环
3. 接入创建/编辑弹窗
4. 接入删除与权限显隐
5. 视进度补充详情/回收站

如果需要，下一步可直接基于本指导文档继续输出：

- 用户管理模块的**详细任务拆解清单**
- 用户管理模块的**页面/组件文件脚手架设计**
- 用户管理模块的**首批代码实现**
