# 前端旧运行域与陈旧契约清理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 删除已经失去后端合同支撑的前端运行域、WorkLine 插件配置和 Device 运行态闭包，建立可信的当前 OpenAPI/权限基线，并让前端在不保留兼容代码的前提下恢复为可构建、可验证的干净状态。

**Architecture:** 清理按“入口 → 业务消费者 → 领域闭包 → 生成契约 → 文档真源”推进。认证、通用 CRUD、alova 客户端和契约/权限生成工具属于架构基础能力；旧运行看板、运行案件、Hold、沙箱、插件 manifest、设备运行态操作及其无人消费的 SSE 闭包属于已经失效的业务能力。清理阶段不实现新的平面场景或动态快照 UI，也不保留重定向、空页面、适配器或 no-op API；清理完成后再以当前后端 `plane/scene`、`plane/snapshot` 和操作端点为真源编写独立重写计划。

**Tech Stack:** Vue 3、TypeScript 5.9、Vite 7、Pinia、alova、Vitest、openapi-typescript、Zod、pnpm 10、FastAPI OpenAPI。

## Global Constraints

- 这是未发布系统：直接替换，不做字段别名、双读双写、兼容重定向、旧数据迁移、空壳页面或旧接口封装。
- 本计划只负责清理和恢复可信基线，不实现新运行中心、平面场景、动态快照、人工处置台或 Phase 8 业务 UI。
- 行为变更严格执行 RED → GREEN；纯文档迁移只做链接、存在性和保护范围检查，不新增测试代码。
- `docs/hardware/` 若执行时存在，必须保持字节级不变；当前前端仓库未发现该目录，但不能据此删除未来出现的厂商原始文档。
- 基础能力不能用业务页面验收：保留 `src/api/client.ts`、`src/api/contract/`、通用 CRUD 和认证/权限框架；`components/common`、`components/ui` 与 `api/base` 不得反向导入业务 `api/modules`。删除仅服务旧运行业务的 SSE、store、组件、类型和工具。
- 仅因“以后也许能复用”而无人引用的代码不属于基础能力，按 YAGNI 删除；需要时由后续重写按新合同重新引入。
- 不修改当前主检出中已有的 `.permission-sync-record.json`、`.serena/memories/api-contract-alignment-rules.md`、`.serena/project.yml`、`AGENTS.md` 用户变更。实际执行必须使用干净 worktree。
- 每个提交只包含本任务列出的文件；不得把后端、外部归档目录或无关脏文件纳入前端提交。

---

## Planning Baseline and Decisions

### 已确认的时间边界

- 前端最后同步提交：`9c5346d43d15a3af6c975d05bd128730236df93d`，时间为 2026-06-18。
- 该次前端合同快照对应的后端提交：`0db2d1be7800e54f576f15309d6dde2a36311fae`。
- 编写本计划时观察到的后端 `develop`：`fd0f76f651e164f4633801eea20f97504c0a313b`；它比 `origin/develop` 领先 3 个提交，因此这里只作为分析证据，不能作为执行时硬编码版本。
- 从旧快照到当前后端，OpenAPI operation 约由 194 收敛为 164，schema 约由 326 收敛为 222；旧运行域、插件 manifest 和设备运行态合同的大量删除不是“小改字段”，而是能力边界已经更换。

### 后端变化到前端动作的映射

| 后端事实                                                                                           | 清理动作                                          | 本计划是否重写新能力 |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------- |
| `/api/v1/workline/runtime/**`、插件 options/manifest、integration-debug、runtime-hold 等旧端点退出 | 删除旧运行中心、插件配置工作台及其消费者          | 否                   |
| WorkLine 不再包含 `plugin_key`、`contract_version`，改为通用配置、运行配置和诊断配置               | 收敛为当前静态主数据 CRUD，移除插件选择和运行入口 | 仅同步静态 CRUD      |
| Device 不再包含 host/port/protocol/vendor/capability/运行状态字段，也不再暴露前端运行态维护动作    | 收敛为静态设备主数据 CRUD                         | 仅同步静态 CRUD      |
| 新增 `work_lines/{id}/plane/scene` 与 `plane/snapshot`                                             | 作为后续运行中心重写的唯一平面数据入口            | 否                   |
| 沙箱、reconciliation、safety 等操作端点仍存在                                                      | 不以“端点存在”证明旧 UI 仍正确；旧 UI 全部退出    | 否                   |
| 新增 `/api/v1/wms/events`                                                                          | 明确为 WMS→WES 系统接口，不生成浏览器调用模块     | 否                   |
| 权限集合变化                                                                                       | 从冻结后端重新生成权限码和同步记录                | 是，生成产物同步     |

### 清理终态

1. `/runtime/**` 路由、菜单、重定向和沉浸式布局特例不存在。
2. WorkLine 与 Device 页面仅展示和编辑当前后端静态主数据；没有运行看板、案件、调试清理、插件 manifest、设备运行态操作。
3. `src/views/runtime/`、`src/components/runtime/` 及其领域 store/type/utils/tests/smoke 脚本不存在。
4. OpenAPI 快照能追溯到执行时冻结的后端 commit，校验覆盖完整文档而非仅 `components.schemas`，离线校验不会静默跳过。
5. 系统到系统入口不会被包装成浏览器 API 模块。
6. 过期过程文档位于项目外归档根；当前真源与 `docs/hardware/` 留在项目内。
7. 类型、单元测试、契约、权限、lint、生产构建全部通过。

## Engineering Review Decisions

以下结论已在 `/plan-eng-review` 中确认，执行时不得重新降级为兼容、人工约定或成功跳过：

1. `src/api/modules/workline.ts` 的生成器自定义区会跨生成保留，必须显式删除 `RuntimeHoldNgReasonsQuery` 与 `runtimeHoldApiMethods`。
2. 删除整条无人消费的 SSE 闭包，包括 client/session、环境变量、认证清理耦合和测试；后续新运行中心按实际需求重新选择传输方式。
3. OpenAPI 必须从指定 `backend-root` 的同一代码树直接提取，不能把任意 HTTP URL 与另一个工作区的 commit 拼成冻结记录。
4. 快照哈希只证明来源；全部生成产物的完整性由“干净工作树重生成后零 diff”证明。
5. 权限记录直接替换为无时间戳、无机器路径、绑定同一后端 commit 的 SHA-256 模型。
6. 离线前端契约门禁必须进入 pre-commit、pre-push 和 CI；显式跨仓权限校验必须 fail-closed。
7. `CrudFormDialog.vue` 删除 WorkLine/Device 业务特判，通用 CRUD 基础层不得依赖业务 API。
8. 外部过程文档归档采用独占的一次性目录；目标已存在即停止，不覆盖、不合并。

### Contract and permission provenance flow

```text
backend-root (develop + clean)
          │
          ├── HEAD before ─────────────────────────────────────┐
          │                                                     │
          ├── uv run python: main.app.openapi() ──> temp JSON   │
          │                                                     │
          ├── permission scanner ────────────────> normalized set
          │                                                     │
          └── HEAD after == HEAD before ────────────────────────┘
                                │
                                ▼
              contracts/openapi.current.json
              .contract-sync-record.json
              .permission-sync-record.json
                                │
                                ▼
              deterministic generators + zero-diff gate
```

任何 branch、dirty state、子进程、OpenAPI 格式、HEAD 一致性、记录格式或生成差异失败都返回非零；不得写入“部分成功”证据。

### What already exists and must be reused

- `src/api/contract/` 与 `src/api/base/crud-request-adapter.ts` 已提供请求和 CRUD 基础能力；WorkLine/Device 页面继续作为薄配置消费者，不新增请求封装。
- `scripts/generate-api-types.ts` 已能生成/删除 metadata 与 API modules，并保留明确的 custom 区；本计划修正输入真源和过期 custom 内容，不重写生成器架构。
- `scripts/lib/permissions-codegen.ts` 已通过后端应用扫描权限；本计划复用该扫描入口，只替换不可移植的记录与哈希模型。
- Vitest、`contract:test`、类型检查和构建命令均已存在；补齐门禁调用和缺失分支，不引入第二套测试框架。

### NOT in scope

- 新运行中心、SSE/轮询选型、案件、Hold、reconciliation、沙箱和人工处置 UI：当前清理没有获批的新业务场景。
- `plane/scene`、`plane/snapshot`、`runtime_config_json`、`diagnostic_profile` 专用编辑器：只同步合同，不提前实现消费者。
- 后端模型、数据库和旧数据迁移：后端是独立仓库，且未发布系统不保留迁移兼容。
- knip/ts-prune 死代码门禁：`TODOS.md` 已有独立 P3 项，本计划只做精确的一次性闭包扫描。
- 性能缓存、并行生成和增量 OpenAPI：生成命令不是生产热路径，当前规模下没有性能问题证据。

## Execution Preconditions — Read-only Gate

这些检查不修改代码，也不提交。任一条件不满足都停止执行，不要自行改用其他分支或忽略脏文件。

- [ ] 从已经包含本计划的最新 `develop` 创建隔离 worktree：

```bash
cd /Users/kaizhou/codeDev/wes_frontend
rtk git status --short --branch
./scripts/git-worktree.sh add codex/frontend-legacy-runtime-cleanup
cd /Users/kaizhou/codeDev/wes_frontend-worktrees/codex-frontend-legacy-runtime-cleanup
rtk git status --short --branch
```

Expected: 新 worktree 位于规定根目录，分支为 `codex/frontend-legacy-runtime-cleanup`，工作区为空。

- [ ] 冻结后端执行输入，并把完整 SHA 记入任务执行记录：

```bash
cd /Users/kaizhou/codeDev/wes_frontend-worktrees/codex-frontend-legacy-runtime-cleanup
rtk git -C /Users/kaizhou/codeDev/wes_backend branch --show-current
rtk git -C /Users/kaizhou/codeDev/wes_backend status --short --branch
rtk git -C /Users/kaizhou/codeDev/wes_backend rev-parse HEAD
rtk git -C /Users/kaizhou/codeDev/wes_backend show -s --format='%H %cI %s' HEAD
```

Expected: 分支严格为 `develop`，无未提交文件。允许本地 `develop` 领先远端，但必须明确记录，不得把 `origin/develop` 偷换为当前真源。

- [ ] 用后端实际应用确认清理边界：

```bash
cd /Users/kaizhou/codeDev/wes_backend
rtk proxy uv run python -c 'from main import app; paths=app.openapi()["paths"]; required={"/api/v1/workline/work_lines/{id}/plane/scene","/api/v1/workline/work_lines/{id}/plane/snapshot","/api/v1/wms/events"}; retired_prefixes=("/api/v1/workline/runtime/","/api/v1/workline/plugins/"); assert required <= set(paths); assert not any(path.startswith(retired_prefixes) for path in paths); print("BACKEND_CLEANUP_BOUNDARY=passed")'
```

Expected: `BACKEND_CLEANUP_BOUNDARY=passed`。若旧 runtime/plugin 路径重新出现，先重新评审后端真源，不能继续套用本计划。

- [ ] 记录当前前端基线；当前陈旧的 `contract:verify` 通过不能作为合同已同步的证据：

```bash
cd /Users/kaizhou/codeDev/wes_frontend-worktrees/codex-frontend-legacy-runtime-cleanup
rtk git rev-parse HEAD
pnpm type:check
pnpm test
pnpm contract:verify
pnpm permission:verify -- --backend-root /Users/kaizhou/codeDev/wes_backend
```

Expected: 记录每条命令结果。已知旧 `contract:verify` 可能对 `contracts/openapi.workline-plugin-manifest-yaml-topology.json` 自证通过；权限校验应暴露当前漂移。不要为了得到绿色基线改写记录文件。

---

### Task 1: Remove the legacy runtime route and menu boundary

**Files:**

- Create: `tests/unit/router/runtime-removal.test.ts`
- Modify: `src/router/routes/index.ts`
- Modify: `src/router/menu-manifest.ts`
- Modify: `src/layouts/DefaultLayout.vue`
- Modify: `tests/unit/scripts/menu-manifest.test.ts`
- Delete: `src/router/routes/runtime.ts`
- Delete: `tests/unit/router/runtimeRoutes.test.ts`

**Interfaces:**

- `createRoutes(): RouteRecordRaw[]` 不再包含 `RuntimeRoot` 或 `/runtime`。
- `buildCurrentMenuManifest(): MenuManifestEntry[]` 不再包含 `runtime:*` 菜单。
- `DefaultLayout.vue` 不再解释 `route.meta.runtimeImmersive`。

- [ ] **Step 1: Write the failing route/menu boundary test**

```ts
import type { RouteRecordRaw } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { buildCurrentMenuManifest } from '@/router/menu-manifest'
import { createRoutes } from '@/router/routes'

function flatten(routes: readonly RouteRecordRaw[]): RouteRecordRaw[] {
  return routes.flatMap(route => [route, ...flatten(route.children ?? [])])
}

describe('legacy runtime removal', () => {
  it('does not publish legacy runtime routes or menu entries', () => {
    const routes = flatten(createRoutes())
    const menu = buildCurrentMenuManifest()

    expect(routes.some(route => route.name === 'RuntimeRoot')).toBe(false)
    expect(routes.some(route => route.path === 'runtime')).toBe(false)
    expect(menu.some(entry => entry.name.startsWith('runtime:'))).toBe(false)
    expect(menu.some(entry => entry.path.startsWith('/runtime'))).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to verify RED**

```bash
pnpm exec vitest run tests/unit/router/runtime-removal.test.ts tests/unit/scripts/menu-manifest.test.ts
```

Expected: FAIL because current routes and menu still contain the runtime tree.

- [ ] **Step 3: Remove the route tree and menu source**

Remove the `runtimeRoutes` imports/usages from `src/router/routes/index.ts` and `src/router/menu-manifest.ts`, then delete `src/router/routes/runtime.ts`. Do not add a redirect from `/runtime` and do not retain hidden compatibility children such as `RuntimeTraces`.

- [ ] **Step 4: Remove the runtime-only layout branch**

In `src/layouts/DefaultLayout.vue`, remove `useRoute`, `isImmersiveRoute`, `.is-immersive`, and all conditional rendering/style branches based on `runtimeImmersive`. Restore the normal sidebar/header/page padding as the sole layout path.

- [ ] **Step 5: Replace obsolete route assertions and verify GREEN**

Delete `tests/unit/router/runtimeRoutes.test.ts`. Update `tests/unit/scripts/menu-manifest.test.ts` expected entries so it tests the current menu without a runtime root.

```bash
pnpm exec vitest run tests/unit/router/runtime-removal.test.ts tests/unit/scripts/menu-manifest.test.ts
pnpm type:check
```

Expected: PASS; no route or menu points to the retired runtime tree.

- [ ] **Step 6: Commit**

```bash
rtk git add src/router/routes/index.ts src/router/menu-manifest.ts src/layouts/DefaultLayout.vue tests/unit/router/runtime-removal.test.ts tests/unit/scripts/menu-manifest.test.ts
rtk git add -u src/router/routes/runtime.ts tests/unit/router/runtimeRoutes.test.ts
rtk git commit -m "refactor(runtime): 移除旧运行中心入口"
```

---

### Task 2: Reduce WorkLine management to the current static master-data contract

**Files:**

- Create: `tests/unit/views/admin/worklines/WorkLineListPage.test.ts`
- Modify: `src/views/admin/worklines/WorkLineListPage.vue`
- Modify: `src/views/admin/worklines/config/fieldConfig.ts`
- Modify: `src/views/admin/worklines/config/pageConfig.ts`
- Modify: `src/router/routes/biz.ts`
- Delete: `src/views/admin/worklines/config/WorkLineConfigPage.vue`
- Delete: `tests/unit/views/admin/worklines/config/WorkLineConfigPage.test.ts`
- Delete: `tests/unit/views/admin/worklines/config/WorkLineConfigPage.position-capability-regression.test.ts`

**Interfaces:**

- `createWorkLinePageConfig()` 不再接收 plugin options 或运行域 action callbacks。
- 本任务保留旧、新合同共有的静态字段并删除旧字段；`runtime_config_json`、`diagnostic_profile` 只在 Task 5 生成的当前合同中体现，其专用编辑器不属于清理范围。
- `/biz/worklines/:id/config` 与 `WorkLineConfig` route 退出；激活、平面监控和配置状态在后续重写中按新端点实现。

- [ ] **Step 1: Write the failing WorkLine cleanup test**

```ts
import { describe, expect, it } from 'vitest'
import { bizRoutes } from '@/router/routes/biz'
import { WORKLINE_FIELDS } from '@/views/admin/worklines/config/fieldConfig'
import { createWorkLinePageConfig } from '@/views/admin/worklines/config/pageConfig'

describe('WorkLine static master-data page', () => {
  it('contains only current static fields and no legacy runtime actions', () => {
    const keys = WORKLINE_FIELDS.map(field => field.key)
    const config = createWorkLinePageConfig()

    expect(keys).not.toContain('plugin_key')
    expect(keys).not.toContain('contract_version')
    expect(config.extensions?.rowActions ?? []).toEqual([])
    expect(config.detail?.actions ?? []).toEqual([])
  })

  it('does not expose the retired WorkLine configuration route', () => {
    expect(bizRoutes.children?.some(route => route.name === 'WorkLineConfig')).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to verify RED**

```bash
pnpm exec vitest run tests/unit/views/admin/worklines/WorkLineListPage.test.ts
```

Expected: FAIL because plugin fields, runtime actions, and the configuration route still exist.

- [ ] **Step 3: Make the list page a plain CRUD consumer**

`WorkLineListPage.vue` should contain only the CRUD container and static config construction:

```vue
<template>
  <CrudPageContainer :config="config" />
</template>

<script setup lang="ts">
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import { createWorkLinePageConfig } from './config/pageConfig'

const config = createWorkLinePageConfig()
</script>
```

Remove router access, plugin options loading, debug-data cleanup, environment branches, permission checks, and old runtime query builders.

- [ ] **Step 4: Align fields and page config to static ownership**

Remove `plugin_key`, `contract_version`, plugin option transformation, and form-time `is_active`; keep only fields shared by the old and current contracts in this intermediate commit. Activation remains a separate future operation, not a writable boolean shortcut. Task 5 will regenerate current metadata; optional configuration editors remain outside this cleanup plan.

Update `pageConfig.ts` so the detail and row actions contain no `open-runtime`, `open-config`, or debug cleanup action. Do not add plane/snapshot buttons in this task.

- [ ] **Step 5: Remove the configuration workbench**

Delete the `WorkLineConfig` route, view, and both manifest/topology regression tests. Do not preserve a redirect or empty shell.

- [ ] **Step 6: Verify GREEN**

```bash
pnpm exec vitest run tests/unit/views/admin/worklines/WorkLineListPage.test.ts tests/unit/scripts/menu-manifest.test.ts
pnpm type:check
```

Expected: PASS; WorkLine management is static CRUD only.

- [ ] **Step 7: Commit**

```bash
rtk git add src/views/admin/worklines/WorkLineListPage.vue src/views/admin/worklines/config/fieldConfig.ts src/views/admin/worklines/config/pageConfig.ts src/router/routes/biz.ts tests/unit/views/admin/worklines/WorkLineListPage.test.ts
rtk git add -u src/views/admin/worklines/config/WorkLineConfigPage.vue tests/unit/views/admin/worklines/config/WorkLineConfigPage.test.ts tests/unit/views/admin/worklines/config/WorkLineConfigPage.position-capability-regression.test.ts
rtk git commit -m "refactor(workline): 移除旧插件配置闭包"
```

---

### Task 3: Reduce Device management to the current static master-data contract

**Files:**

- Create: `tests/unit/views/admin/devices/DeviceListPage.test.ts`
- Create: `tests/unit/architecture/foundation-boundaries.test.ts`
- Modify: `src/views/admin/devices/DeviceListPage.vue`
- Modify: `src/views/admin/devices/config/fieldConfig.ts`
- Modify: `src/views/admin/devices/config/pageConfig.ts`
- Modify: `src/components/common/CrudFormDialog.vue`

**Interfaces:**

- `createDevicePageConfig()` 不再接收运行域 callbacks。
- 本任务保留旧、新合同共有的静态字段：`device_code`、`device_name`、`work_line_id`、`description`、`is_active`、`sort_order`、`device_role`、`role_index`、`upstream_device_id`；`diagnostic_profile` 只在 Task 5 生成的当前合同中体现，其专用编辑器不属于清理范围。
- 不再展示 host/port/protocol/callback/auth token/vendor/capability，也不再把运行状态和维护动作塞入 Device CRUD。
- 通用 CRUD 基础目录不得通过字段名猜测业务类型，也不得导入 `@/api/modules/**`。

- [ ] **Step 1: Write the failing Device cleanup test**

```ts
import { describe, expect, it } from 'vitest'
import { DEVICE_FIELDS } from '@/views/admin/devices/config/fieldConfig'
import { createDevicePageConfig } from '@/views/admin/devices/config/pageConfig'

describe('Device static master-data page', () => {
  it('keeps static topology fields and removes runtime/integration fields', () => {
    const keys = DEVICE_FIELDS.map(field => field.key)
    const config = createDevicePageConfig()

    expect(keys).toEqual(
      expect.arrayContaining([
        'device_code',
        'device_name',
        'work_line_id',
        'device_role',
        'role_index',
        'upstream_device_id'
      ])
    )
    const retiredKeys = [
      'host',
      'port',
      'protocol',
      'callback_path',
      'auth_token',
      'capabilities_json',
      'vendor_type',
      'device_status',
      'maintenance_mode'
    ]
    for (const retiredKey of retiredKeys) {
      expect(keys).not.toContain(retiredKey)
    }
    expect(config.extensions?.rowActions ?? []).toEqual([])
    expect(config.detail?.actions ?? []).toEqual([])
  })
})
```

同时创建 `tests/unit/architecture/foundation-boundaries.test.ts`，递归读取 `src/components/common/`、`src/components/ui/` 与 `src/api/base/` 中的源码，报告任何 `@/api/modules/` 静态或动态导入。该测试只验证依赖方向，不用 Device/WorkLine 业务行为验收基础组件。

- [ ] **Step 2: Run the test to verify RED**

```bash
pnpm exec vitest run tests/unit/views/admin/devices/DeviceListPage.test.ts tests/unit/architecture/foundation-boundaries.test.ts
```

Expected: FAIL because the page still exposes old runtime/integration fields and actions, and `CrudFormDialog.vue` still imports the WorkLine business module.

- [ ] **Step 3: Replace the page shell with plain CRUD**

```vue
<template>
  <CrudPageContainer :config="config" />
</template>

<script setup lang="ts">
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import { createDevicePageConfig } from './config/pageConfig'

const config = createDevicePageConfig()
</script>
```

Remove router, permission, message, trace/runtime navigation, maintenance, resume, and clear-fault functions.

Also delete the WorkLine-specific branch from `CrudFormDialog.vue`: remove the `workLinesApiMethods` import, `isDeviceForm`, `isWorklineActive`, the asynchronous WorkLine lookup watch, and the conditional topology-field rewriting. The common form renders only the supplied `fieldConfig`; do not replace the deleted branch with an injected callback.

- [ ] **Step 4: Align page and fields to current Device schemas**

Remove old connection, vendor, capability and runtime-status sections while keeping only fields supported by both snapshots. Change the default sort away from removed `updated_at`; use `id ASC`. Task 5 will regenerate current metadata; a diagnostic-profile editor remains outside this cleanup plan.

- [ ] **Step 5: Verify GREEN**

```bash
pnpm exec vitest run tests/unit/views/admin/devices/DeviceListPage.test.ts tests/unit/architecture/foundation-boundaries.test.ts
pnpm type:check
```

Expected: PASS; Device CRUD no longer pretends to own ECS connectivity or runtime facts.

- [ ] **Step 6: Commit**

```bash
rtk git add src/views/admin/devices/DeviceListPage.vue src/views/admin/devices/config/fieldConfig.ts src/views/admin/devices/config/pageConfig.ts src/components/common/CrudFormDialog.vue tests/unit/views/admin/devices/DeviceListPage.test.ts tests/unit/architecture/foundation-boundaries.test.ts
rtk git commit -m "refactor(device): 收敛静态设备主数据页面"
```

---

### Task 4: Delete the retired runtime business closure

**Files:**

- Delete directory: `src/views/runtime/`
- Delete directory: `src/components/runtime/`
- Delete directory: `src/components/common/runtime/`
- Delete: `src/api/modules/runtime.ts`
- Modify: `src/api/modules/workline.ts`
- Delete: `src/api/services/sse-client.ts`
- Delete: `src/api/services/sse-session.ts`
- Modify: `src/api/services/token-refresh.ts`
- Delete: `src/composables/useRuntimeSceneManifest.ts`
- Delete: `src/composables/useRuntimeStickyContextVisibility.ts`
- Delete: `src/composables/useTopologyLayout.ts`
- Delete: `src/stores/runtime-hold.ts`
- Delete: `src/stores/runtime-sse.ts`
- Delete: `src/stores/workline-runtime.ts`
- Delete: `src/types/runtime.ts`
- Delete: `src/utils/runtime-diagnosis-verdict.ts`
- Delete: `src/utils/runtime-display-identity.ts`
- Delete: `src/utils/runtime-display.ts`
- Delete: `src/utils/runtime-event.ts`
- Delete: `src/utils/runtime-labels.ts`
- Delete: `src/utils/runtime-priority.ts`
- Delete: `src/utils/runtime-route.ts`
- Delete: `src/utils/runtime-safety.ts`
- Delete: `src/utils/runtime-scene.ts`
- Delete: `src/utils/runtime-topology.ts`
- Delete: `src/utils/runtime-trace-topology.ts`
- Delete: `src/utils/sandbox-outbox.ts`
- Delete: `scripts/runtime-agent-browser-smoke.sh`
- Modify: `package.json`
- Modify: `CLAUDE.md`
- Modify: `.env.development`
- Modify: `.env.production`
- Modify: `Dockerfile`
- Modify: `Jenkinsfile`
- Modify: `src/config/env.ts`
- Modify: `src/components/common/AppHeader.vue`
- Modify: `src/assets/styles/globals.css`
- Modify: `stylelint.config.js`
- Modify: `DESIGN.md`
- Modify: `src/types/components.d.ts`
- Modify: `scripts/contract-test.ts`
- Modify: `tests/unit/api/token-refresh.test.ts`
- Modify: `tests/unit/config/env.test.ts`
- Modify: `tests/unit/styles/style-token-invariants.test.ts`
- Modify: `tests/unit/scripts/contract-endpoint-noise.test.ts`
- Create: `tests/unit/scripts/quality-gates.test.ts`
- Delete: `tests/unit/api/sse-client.test.ts`
- Delete tests: `tests/unit/api/runtime.test.ts`
- Delete directory: `tests/unit/components/runtime/`
- Delete: `tests/unit/components/runtimeCaseQueue.test.ts`
- Delete: `tests/unit/composables/useRuntimeSceneManifest.test.ts`
- Delete: `tests/unit/composables/useRuntimeStickyContextVisibility.test.ts`
- Delete: `tests/unit/composables/useTopologyLayout.test.ts`
- Delete: `tests/unit/runtime/worklineSafetyDisplay.test.ts`
- Delete: `tests/unit/stores/runtime-hold.test.ts`
- Delete: `tests/unit/stores/workline-runtime.test.ts`
- Delete every `tests/unit/utils/runtime-*.test.ts`
- Delete: `tests/unit/utils/sandbox-outbox.test.ts`
- Delete directory: `tests/unit/views/runtime/`
- Delete: `tests/unit/scripts/runtime-agent-browser-smoke.test.ts`

**Interfaces:**

- 删除 `runtimeApiMethods`、Runtime DTO/store/utils 和运行域 UI，不提供替代 facade。
- 删除无人连接消费的 SSE client/session、环境配置和认证清理耦合；`/api/v1/sys/events/stream` 可继续存在于原始 OpenAPI/生成模块中，但本计划不为未来用途保留手写传输实现。
- 删除 `src/api/modules/workline.ts` custom 区中的 `RuntimeHoldNgReasonsQuery` 与 `runtimeHoldApiMethods`；生成器继续保留通用 custom 区机制，不为旧符号增加特例。
- 删除行为已由 Task 1–3 的入口和静态 CRUD tests 锁定；本任务不为已删除实现编写“仍然不存在”的永久测试。`VITE_SSE_URL` 属于生产构建的公开配置入口，单独使用仓库门禁锁定其退役，防止部署配置再次承诺无消费者的能力。

**Preserve exactly:**

- `src/api/client.ts`
- `src/api/contract/`
- 通用 CRUD、认证、权限和环境配置模块。

- [ ] **Step 1: Prove the SSE closure has no surviving connection consumer**

```bash
rtk rg -n "from ['\"]@/api/services/sse-client|from ['\"]\./sse-session|resetSSESession|VITE_SSE_URL" src tests scripts .env.development .env.production Dockerfile Jenkinsfile
```

Expected before deletion: matches are limited to the runtime store/views, `AppHeader.vue`, token refresh, SSE/config tests, contract assertions, the two environment files, `Dockerfile` and `Jenkinsfile`. There is no surviving non-runtime `connect()` caller. If another real consumer exists, stop and re-evaluate this deletion rather than silently breaking it.

Add `tests/unit/scripts/quality-gates.test.ts` with one repository-level assertion that `Dockerfile`, `Jenkinsfile`, `.env.development` and `.env.production` contain no `VITE_SSE_URL`, then run it and confirm RED against the two production build files before editing them.

- [ ] **Step 2: Delete the runtime views, components and domain state**

Remove the exact directories/files listed above. Do not move old logic into `common/`, do not keep wrappers, and do not rename old Runtime DTOs to Plane DTOs.

- [ ] **Step 3: Delete obsolete tests with their production code**

The old tests assert retired behavior and must not be rewritten to keep deleted code alive. Preserve only tests for surviving foundation/static CRUD behavior.

Delete `tests/unit/api/sse-client.test.ts` with the client. Update `tests/unit/api/token-refresh.test.ts` and `tests/unit/config/env.test.ts` by removing only SSE session/config assertions; keep their surviving auth and environment behavior tests.

- [ ] **Step 4: Remove runtime-only tooling and styling**

Remove `smoke:runtime:agent-browser` from `package.json` and `CLAUDE.md`, delete its script/test, and delete the `--runtime-*` token block plus runtime-only selectors from `src/assets/styles/globals.css`. Update `style-token-invariants.test.ts` by removing only assertions for deleted tokens. Update `stylelint.config.js`, `DESIGN.md`, `globals.css` and the surviving test comments so active guidance describes only the current `--color-*` / `--el-*` contract and does not cite the retired style-token spec. These comment/document edits do not require new test code.

Remove `VITE_SSE_URL` from both `.env` files, the `Dockerfile` build argument/environment injection and the Jenkins image build arguments; remove `env.sseUrl` from `src/config/env.ts`. Remove `resetSSESession` from `AppHeader.vue` logout and `resetSSESessionState` from token refresh. Do not leave no-op hooks or deployment parameters with no consumer.

Remove deleted component declarations from `src/types/components.d.ts`; if Vite regenerates this file during build, inspect the generated diff and keep only the removal.

- [ ] **Step 5: Remove runtime-specific assertions from the contract-noise test**

Delete the manifest fixture/smoke assertions and old manifest metadata lists from `tests/unit/scripts/contract-endpoint-noise.test.ts`. Remove all SSE-specific checks from `scripts/contract-test.ts`. Keep generic generated-source checks until Task 5 replaces them with the current contract baseline assertions.

- [ ] **Step 6: Run the one-time absence scan**

```bash
test ! -e src/views/runtime
test ! -e src/components/runtime
test ! -e src/components/common/runtime
test ! -e tests/unit/views/runtime
test ! -e tests/unit/components/runtime
rtk rg -n "@/api/modules/runtime|@/types/runtime|@/stores/(runtime-hold|runtime-sse|workline-runtime)|@/utils/runtime-(diagnosis-verdict|display|event|labels|priority|route|safety|scene|topology|trace-topology)|@/utils/sandbox-outbox|RuntimeRoot|RuntimeMonitor|RuntimeCases|RuntimeHolds|RuntimeSandbox|smoke:runtime:agent-browser|sse-client|sse-session|resetSSESession|VITE_SSE_URL|RuntimeHoldNgReasonsQuery|runtimeHoldApiMethods|--runtime-|2026-06-17-scoped-style-token-compliance" src scripts package.json CLAUDE.md DESIGN.md stylelint.config.js .env.development .env.production Dockerfile Jenkinsfile
```

Expected: all deleted-directory checks pass and `rg` exits 1 with no maintained-source matches. Do not scan tests that intentionally name retired symbols in negative assertions, and do not turn this temporary scan into a permanent runtime-name ban that would block a later rewrite.

- [ ] **Step 7: Verify surviving foundation and application compilation**

```bash
pnpm exec vitest run tests/unit/api/token-refresh.test.ts tests/unit/config/env.test.ts tests/unit/router/runtime-removal.test.ts tests/unit/views/admin/worklines/WorkLineListPage.test.ts tests/unit/views/admin/devices/DeviceListPage.test.ts tests/unit/architecture/foundation-boundaries.test.ts tests/unit/scripts/quality-gates.test.ts
pnpm type:check
```

Expected: PASS. A full generated-contract gate is deferred to Task 5 because current generated artifacts still reflect the old frozen snapshot.

- [ ] **Step 8: Commit**

```bash
rtk git add package.json CLAUDE.md DESIGN.md stylelint.config.js .env.development .env.production Dockerfile Jenkinsfile src/config/env.ts src/components/common/AppHeader.vue src/api/modules/workline.ts src/api/services/token-refresh.ts scripts/contract-test.ts src/assets/styles/globals.css src/types/components.d.ts tests/unit/api/token-refresh.test.ts tests/unit/config/env.test.ts tests/unit/styles/style-token-invariants.test.ts tests/unit/scripts/contract-endpoint-noise.test.ts tests/unit/scripts/quality-gates.test.ts
rtk git add -u -- src/views/runtime src/components/runtime src/components/common/runtime src/api/modules/runtime.ts src/api/services/sse-client.ts src/api/services/sse-session.ts src/composables/useRuntimeSceneManifest.ts src/composables/useRuntimeStickyContextVisibility.ts src/composables/useTopologyLayout.ts src/stores/runtime-hold.ts src/stores/runtime-sse.ts src/stores/workline-runtime.ts src/types/runtime.ts src/utils/runtime-diagnosis-verdict.ts src/utils/runtime-display-identity.ts src/utils/runtime-display.ts src/utils/runtime-event.ts src/utils/runtime-labels.ts src/utils/runtime-priority.ts src/utils/runtime-route.ts src/utils/runtime-safety.ts src/utils/runtime-scene.ts src/utils/runtime-topology.ts src/utils/runtime-trace-topology.ts src/utils/sandbox-outbox.ts scripts/runtime-agent-browser-smoke.sh
rtk git add -u -- tests/unit/api/runtime.test.ts tests/unit/api/sse-client.test.ts tests/unit/components/runtime tests/unit/components/runtimeCaseQueue.test.ts tests/unit/composables/useRuntimeSceneManifest.test.ts tests/unit/composables/useRuntimeStickyContextVisibility.test.ts tests/unit/composables/useTopologyLayout.test.ts tests/unit/runtime/worklineSafetyDisplay.test.ts tests/unit/stores/runtime-hold.test.ts tests/unit/stores/workline-runtime.test.ts tests/unit/utils tests/unit/views/runtime tests/unit/scripts/runtime-agent-browser-smoke.test.ts
rtk git commit -m "refactor(runtime): 删除旧运行域实现闭包"
```

Before committing, inspect `rtk git diff --cached --name-status`; every staged path must belong to the exact deletion list above.

---

### Task 5: Replace the stale contract self-check with a frozen current baseline

**Files:**

- Create: `scripts/lib/sha256.ts`
- Create: `scripts/lib/backend-checkout.ts`
- Create: `scripts/lib/openapi-sync.ts`
- Create: `scripts/freeze-backend-contract.ts`
- Create: `tests/unit/scripts/openapi-sync.test.ts`
- Create: `tests/unit/scripts/freeze-backend-contract.test.ts`
- Create: `tests/unit/scripts/permissions-codegen.test.ts`
- Modify: `tests/unit/scripts/quality-gates.test.ts`
- Modify: `scripts/generate-api-types.ts`
- Modify: `scripts/generate-zod-from-openapi.ts`
- Modify: `scripts/lib/permissions-codegen.ts`
- Modify: `scripts/generate-permissions.ts`
- Modify: `scripts/verify-permissions-sync.ts`
- Modify: `scripts/verify-contract-sync.ts`
- Modify: `scripts/contract-test.ts`
- Modify: `tests/unit/scripts/generate-api-types.test.ts`
- Modify: `tests/unit/scripts/contract-endpoint-noise.test.ts`
- Modify: `docs/CONTRACT_SYNC_WORKFLOW.md`
- Modify: `docs/CONTRACT_TESTING.md`
- Modify: `docs/CONTRACT_FRONTEND_DEVELOPMENT_MANUAL.md`
- Modify: `docs/CRUD_DEVELOPMENT_GUIDE.md`
- Modify: `docs/ZOD_VALIDATION.md`
- Modify: `README.md`
- Modify: `CLAUDE.md`
- Modify: `.husky/pre-commit`
- Modify: `.husky/pre-push`
- Modify: `.github/workflows/ci-cd.yml`
- Modify: `package.json`
- Replace: `contracts/openapi.workline-plugin-manifest-yaml-topology.json` → `contracts/openapi.current.json`
- Modify: `.contract-sync-record.json`
- Regenerate: `src/api/generated/openapi-types.ts`
- Regenerate directory: `src/api/generated/openapi-metadata/`
- Regenerate: `src/api/generated/openapi-metadata.ts`
- Regenerate: `src/api/generated/openapi-metadata-types.ts`
- Regenerate modules: `src/api/modules/*.ts`
- Regenerate: `src/types/generated/zod-schemas.ts`
- Regenerate: `src/api/generated/permissions/`
- Modify: `.permission-sync-record.json`

**Interfaces:**

```ts
export interface ContractSyncRecord {
  backendCommit: string
  openApiSha256: string
  snapshotPath: 'contracts/openapi.current.json'
}

export interface PermissionSyncRecord {
  backendCommit: string
  permissionsSha256: string
  permissionCount: number
}

export function serializeOpenApiDocument(document: unknown): string
export function computeSha256(value: string): string
export function assertBackendCheckout(backendRoot: string, expectedCommit?: string): string
export function isBrowserOwnedEndpoint(path: string): boolean
```

Both sync records have no timestamp, machine path or URL fallback. `backend-root` is runtime input only. `contract:verify` reads the committed canonical snapshot, hashes the whole document with SHA-256, checks generated entry markers, and fails closed when any input is absent or mismatched. `permission:verify` always scans the explicitly selected backend and fails closed; it has no success-skip mode.

- [ ] **Step 1: Write failing helper and endpoint-ownership tests**

Write focused tests for these boundaries:

- `openapi-sync.test.ts`: deterministic serialization, full-document SHA-256, malformed OpenAPI/record rejection and browser/system endpoint ownership.
- `freeze-backend-contract.test.ts`: missing root, wrong branch, dirty tree, Python extraction failure, invalid OpenAPI, HEAD change and success; failed cases write neither snapshot nor record and clean their temporary directory.
- `permissions-codegen.test.ts`: deterministic SHA-256, exact record validation, no absolute backend path/timestamp in generated content, legacy record rejection and backend commit mismatch.
- `quality-gates.test.ts`: preserve the Task 4 production SSE-configuration retirement gate; add checks that lint scripts are check-only, pre-commit does not swallow contract failure, pre-push does not skip missing dependencies, and CI runs test/contract gates.

- [ ] **Step 2: Run tests to verify RED**

```bash
pnpm exec vitest run tests/unit/scripts/openapi-sync.test.ts tests/unit/scripts/freeze-backend-contract.test.ts tests/unit/scripts/permissions-codegen.test.ts tests/unit/scripts/quality-gates.test.ts tests/unit/scripts/generate-api-types.test.ts tests/unit/scripts/contract-endpoint-noise.test.ts
```

Expected: FAIL because the deterministic helpers, bound extractor, portable permission record and authoritative gates do not exist.

- [ ] **Step 3: Implement the shared sync helper**

`scripts/lib/sha256.ts` contains the single Node `createHash('sha256')` implementation used by OpenAPI and permission sync. `scripts/lib/backend-checkout.ts` contains the shared develop/clean/HEAD checks used by freezing and permission generation. `scripts/lib/openapi-sync.ts` serializes as `JSON.stringify(document, null, 2) + '\n'` and exposes the single canonical path `contracts/openapi.current.json`. Do not preserve `simpleHash`, `lastSyncTime`, URL fallback or the old snapshot filename.

- [ ] **Step 4: Implement an explicit freeze command**

`scripts/freeze-backend-contract.ts` must:

1. Require only `--backend-root`; reject `--source` and all unknown arguments.
2. Check backend branch is `develop` and worktree is clean.
3. Read backend HEAD before extraction.
4. Create a private temporary directory, execute `uv run python -c` with `cwd=backendRoot`, import `main.app`, call `app.openapi()`, and write JSON to the supplied temporary file. Do not parse application logs from stdout.
5. Read and validate the temporary OpenAPI 3 document, then remove the exact temporary directory in `finally`.
6. Read backend HEAD again and abort if it changed.
7. Only after every check passes, write `contracts/openapi.current.json` and `.contract-sync-record.json` using Node filesystem APIs.
8. Never start a server, use an HTTP URL, mutate the backend or infer a remote commit.

Add the package script:

```json
"contract:freeze": "tsx scripts/freeze-backend-contract.ts"
```

- [ ] **Step 5: Replace the permission sync record directly**

`generate:permissions` must require `--backend-root` and scan only that explicitly selected backend after verifying its HEAD equals `.contract-sync-record.json.backendCommit`; repeat the HEAD check after scanning. Replace the record with `backendCommit`, `permissionsSha256` and `permissionCount`. Generated headers must describe the generator and permission group only, never an absolute path. Delete `lastSyncTime`, `backendRoot`, `permissionsHash`, `simpleHash` and all compatibility parsing.

`permission:verify` requires `--backend-root`, accepts optional `--silent`, and removes `--require-backend`. Missing backend, scanner failure, malformed/legacy record, commit mismatch or hash mismatch always exit non-zero.

- [ ] **Step 6: Make generators and verifier consume only the canonical snapshot**

Remove `OPENAPI_SPEC_PATH`, `OPENAPI_SPEC_URL`, `BACKEND_OPENAPI_URL`, legacy base-URL resolution, backend-not-running success, and schema-only hashes from the type/Zod generation and verification path.

Both generators must embed the same marker in their generated entry files. Validate it with this exact pattern:

```ts
const OPENAPI_MARKER_PATTERN = /^\/\*\* @openapi-sha256 [a-f0-9]{64} \*\/$/m
```

`contract:verify` must compare the full snapshot hash with `.contract-sync-record.json` and both generated markers. Missing files, malformed records, or mismatches exit non-zero.

- [ ] **Step 7: Filter system-owned endpoints before module planning**

Implement `isBrowserOwnedEndpoint()` so `/api/v1/wms/**` and the exact inbound endpoints `/api/v1/callback/event`, `/api/v1/callback/external`, and `/api/v1/callback/result` remain in the raw OpenAPI type mirror but do not produce browser API methods/modules. Do not hide callback log/admin read endpoints.

- [ ] **Step 8: Freeze the unchanged backend HEAD**

Run from the frontend worktree; no server or second terminal is involved:

```bash
pnpm contract:freeze -- --backend-root /Users/kaizhou/codeDev/wes_backend
```

Expected: the recorded `backendCommit` exactly matches the execution precondition SHA and the OpenAPI was extracted from that checkout. If it differs, stop and restart the impact review; do not merely accept the new snapshot.

- [ ] **Step 9: Regenerate all contract and permission artifacts**

```bash
pnpm generate:types
pnpm generate:zod
pnpm generate:permissions -- --backend-root /Users/kaizhou/codeDev/wes_backend
```

Expected: obsolete runtime/plugin schemas and methods disappear mechanically; current WorkLine/Device/plane/operations schemas appear; permission SHA/count/commit update. Generated permission files and records contain no developer-machine path or timestamp. Do not hand-edit generated output to restore an old consumer.

- [ ] **Step 10: Rewrite contract tests around current invariants**

Update `scripts/contract-test.ts` and the two Vitest files to assert:

- WorkLine schemas exclude `plugin_key`/`contract_version` and include `runtime_config_json`/`diagnostic_profile`; 本清理仅验证合同，不新增这两个配置编辑器。
- Device schemas exclude old connectivity/runtime fields and include static topology/diagnostic fields.
- `plane/scene` and `plane/snapshot` exist.
- retired `/api/v1/workline/runtime/**` and `/api/v1/workline/plugins/**` paths are absent.
- `/api/v1/wms/events` and the three exact inbound callback endpoints exist in raw OpenAPI but have no generated browser API module/method.
- generated artifacts contain the current SHA marker and no old snapshot filename.
- `RuntimeHoldNgReasonsQuery`、`runtimeHoldApiMethods`、SSE client/session symbols and legacy permission-record fields are absent from maintained source.

- [ ] **Step 11: Make lint and repository gates authoritative**

- Remove `--fix` from ESLint/Stylelint check scripts and `--write` from the Prettier check script; `pnpm lint` must never modify the worktree.
- `.husky/pre-commit` runs offline `contract:verify --silent` without `|| true`, then `lint-staged`; it does not require a backend checkout.
- `.husky/pre-push` is POSIX `sh`, fails when `node_modules` is missing, and runs `pnpm test`, `pnpm contract:test` and `pnpm contract:verify`.
- CI runs `pnpm test`, `pnpm contract:test` and `pnpm contract:verify` in addition to check-only lint/type steps. Do not add live `permission:verify` to frontend-only CI because the backend repository is not checked out there.

- [ ] **Step 12: Verify GREEN**

```bash
pnpm exec vitest run tests/unit/scripts/openapi-sync.test.ts tests/unit/scripts/freeze-backend-contract.test.ts tests/unit/scripts/permissions-codegen.test.ts tests/unit/scripts/quality-gates.test.ts tests/unit/scripts/generate-api-types.test.ts tests/unit/scripts/contract-endpoint-noise.test.ts
pnpm contract:test
pnpm contract:verify
pnpm permission:verify -- --backend-root /Users/kaizhou/codeDev/wes_backend
pnpm type:check
```

Expected: all PASS. `contract:verify` must also fail in a deliberate local mutation check, then pass after reverting only that temporary mutation:

```bash
rtk git diff -- contracts/openapi.current.json
```

Use `apply_patch` to change one harmless snapshot description, run `pnpm contract:verify` and observe non-zero, then use `apply_patch` to restore that exact line. Do not use `git checkout` or broad reset.

- [ ] **Step 13: Update current contract documentation without adding tests**

Rewrite `docs/CONTRACT_SYNC_WORKFLOW.md` and `docs/CONTRACT_TESTING.md` around direct checkout extraction, the canonical committed snapshot, full-document SHA-256, portable permission records, offline fail-closed contract verification, explicit cross-repository permission verification, the zero-diff regeneration gate and system-to-system endpoint exclusion. Synchronize the executable quick-start and troubleshooting commands in `README.md`, `CLAUDE.md`, `docs/CONTRACT_FRONTEND_DEVELOPMENT_MANUAL.md`, `docs/CRUD_DEVELOPMENT_GUIDE.md` and `docs/ZOD_VALIDATION.md`: backend changes must run `contract:freeze -- --backend-root ...` before generators; type/Zod generators read only the canonical snapshot; permission generate/verify always receive an explicit backend root. Remove all instructions for `OPENAPI_SPEC_PATH`, `OPENAPI_SPEC_URL`, `BACKEND_OPENAPI_URL`, `backendUrl`, schema-only hashes, machine paths, timestamps, direct live-backend Zod generation and backend-unavailable success.

```bash
contract_docs=(README.md CLAUDE.md docs/CONTRACT_FRONTEND_DEVELOPMENT_MANUAL.md docs/CONTRACT_SYNC_WORKFLOW.md docs/CONTRACT_TESTING.md docs/CRUD_DEVELOPMENT_GUIDE.md docs/ZOD_VALIDATION.md)
rtk rg -n "OPENAPI_SPEC|BACKEND_OPENAPI|openapi.workline-plugin-manifest-yaml-topology|backendUrl|lastSyncTime|simpleHash|--require-backend|generate-zod-from-openapi|确保后端正在运行|重启后端" "${contract_docs[@]}"
rtk rg -n -- "--source" docs/CONTRACT_SYNC_WORKFLOW.md docs/CONTRACT_TESTING.md
rtk rg --pcre2 -n 'pnpm (?:generate:permissions|permission:verify)(?!\s+--\s+--backend-root)' "${contract_docs[@]}"
```

Expected: no matches. This is a document-level check; do not add tests for prose.

- [ ] **Step 14: Commit**

```bash
rtk git add scripts/lib/sha256.ts scripts/lib/backend-checkout.ts scripts/lib/openapi-sync.ts scripts/lib/permissions-codegen.ts scripts/freeze-backend-contract.ts scripts/generate-api-types.ts scripts/generate-zod-from-openapi.ts scripts/generate-permissions.ts scripts/verify-contract-sync.ts scripts/verify-permissions-sync.ts scripts/contract-test.ts tests/unit/scripts/openapi-sync.test.ts tests/unit/scripts/freeze-backend-contract.test.ts tests/unit/scripts/permissions-codegen.test.ts tests/unit/scripts/quality-gates.test.ts tests/unit/scripts/generate-api-types.test.ts tests/unit/scripts/contract-endpoint-noise.test.ts README.md CLAUDE.md docs/CONTRACT_FRONTEND_DEVELOPMENT_MANUAL.md docs/CONTRACT_SYNC_WORKFLOW.md docs/CONTRACT_TESTING.md docs/CRUD_DEVELOPMENT_GUIDE.md docs/ZOD_VALIDATION.md .husky/pre-commit .husky/pre-push .github/workflows/ci-cd.yml package.json contracts/openapi.current.json .contract-sync-record.json .permission-sync-record.json src/api/generated src/api/modules src/types/generated/zod-schemas.ts
rtk git add -u contracts/openapi.workline-plugin-manifest-yaml-topology.json
rtk git commit -m "refactor(contract): 冻结当前后端契约真源"
```

- [ ] **Step 15: Prove every generated artifact is reproducible**

Run after the Task 5 commit from the clean worktree:

```bash
pnpm generate:types
pnpm generate:zod
pnpm generate:permissions -- --backend-root /Users/kaizhou/codeDev/wes_backend
rtk git diff --exit-code -- .contract-sync-record.json .permission-sync-record.json src/api/generated src/api/modules src/types/generated/zod-schemas.ts
```

Expected: zero diff, including no added stale module, missing metadata file, permission path churn or record timestamp churn. Any diff means the committed generated baseline is incomplete; fix it in Task 5 before continuing.

---

### Task 6: Move obsolete process documents outside the project

**Files:**

**Archive root:** `/Users/kaizhou/codeDev/wes_frontend-archive/process-docs/2026-08-17-legacy-runtime-cleanup/`

- Modify: `TODOS.md` — remove the two completed Runtime history entries; keep the active knip/ts-prune TODO.

**Files to move outside the repository:**

- Entire directory: `docs/superpowers/archive/`
- `docs/superpowers/plans/2026-05-06-workline-emergency-stop-frontend.md`
- `docs/superpowers/plans/2026-06-15-workline-monitor-dashboard-v3-alignment.md`
- `docs/superpowers/plans/2026-06-16-workline-monitor-ui-fixes.md`
- `docs/superpowers/specs/2026-06-08-runtime-monitor-resource-layout-design.md`
- `docs/superpowers/specs/2026-06-17-scoped-style-token-compliance.md`（最终复审确认其仍依赖已退役 Runtime 基线；使用独立一次性归档根 `2026-08-18-scoped-style-token-compliance-retired/`）

**Files to keep in the repository:**

- `docs/superpowers/plans/2026-08-17-frontend-legacy-runtime-cleanup.md`
- `docs/superpowers/specs/2026-04-14-log-center-backend-requirements.md`
- Entire `docs/hardware/` directory if present.

**Interfaces:**

- 项目内文档搜索只返回当前真源，不返回过期过程设计。
- 外部 `ARCHIVE-MANIFEST.md` 负责说明归档来源和原因；项目内不新增指向外部归档的运行时依赖或文档真源链接。
- `TODOS.md` 只保存仍有效的待办，不充当已删除运行域的历史档案。

This task is documentation-only. Do not add or modify test code.

- [ ] **Step 1: Inspect the exact move set and hardware protection boundary**

```bash
rtk find docs/superpowers/archive -type f | sort
rtk ls docs/superpowers/plans/2026-05-06-workline-emergency-stop-frontend.md docs/superpowers/plans/2026-06-15-workline-monitor-dashboard-v3-alignment.md docs/superpowers/plans/2026-06-16-workline-monitor-ui-fixes.md docs/superpowers/specs/2026-06-08-runtime-monitor-resource-layout-design.md docs/superpowers/specs/2026-06-17-scoped-style-token-compliance.md
test ! -e /Users/kaizhou/codeDev/wes_frontend-archive/process-docs/2026-08-17-legacy-runtime-cleanup
test ! -e /Users/kaizhou/codeDev/wes_frontend-archive/process-docs/2026-08-18-scoped-style-token-compliance-retired
if test -d docs/hardware; then rtk git diff --name-only -- docs/hardware; fi
```

Expected: move set matches this task exactly, the entire fixed archive root is absent, and hardware diff is empty. If the root already exists, stop; do not merge, overwrite or choose a new root silently. The post-review style-token correction uses its separately named one-file archive root because the original archive was already sealed.

- [ ] **Step 2: Create the external archive structure and manifest**

Create these directories:

```bash
mkdir -p /Users/kaizhou/codeDev/wes_frontend-archive/process-docs
mkdir /Users/kaizhou/codeDev/wes_frontend-archive/process-docs/2026-08-17-legacy-runtime-cleanup
mkdir -p /Users/kaizhou/codeDev/wes_frontend-archive/process-docs/2026-08-17-legacy-runtime-cleanup/docs/superpowers/plans
mkdir -p /Users/kaizhou/codeDev/wes_frontend-archive/process-docs/2026-08-17-legacy-runtime-cleanup/docs/superpowers/specs
mkdir /Users/kaizhou/codeDev/wes_frontend-archive/process-docs/2026-08-18-scoped-style-token-compliance-retired
mkdir -p /Users/kaizhou/codeDev/wes_frontend-archive/process-docs/2026-08-18-scoped-style-token-compliance-retired/docs/superpowers/specs
```

- [ ] **Step 3: Move the documents**

```bash
mv docs/superpowers/archive /Users/kaizhou/codeDev/wes_frontend-archive/process-docs/2026-08-17-legacy-runtime-cleanup/docs/superpowers/archive
mv docs/superpowers/plans/2026-05-06-workline-emergency-stop-frontend.md /Users/kaizhou/codeDev/wes_frontend-archive/process-docs/2026-08-17-legacy-runtime-cleanup/docs/superpowers/plans/
mv docs/superpowers/plans/2026-06-15-workline-monitor-dashboard-v3-alignment.md /Users/kaizhou/codeDev/wes_frontend-archive/process-docs/2026-08-17-legacy-runtime-cleanup/docs/superpowers/plans/
mv docs/superpowers/plans/2026-06-16-workline-monitor-ui-fixes.md /Users/kaizhou/codeDev/wes_frontend-archive/process-docs/2026-08-17-legacy-runtime-cleanup/docs/superpowers/plans/
mv docs/superpowers/specs/2026-06-08-runtime-monitor-resource-layout-design.md /Users/kaizhou/codeDev/wes_frontend-archive/process-docs/2026-08-17-legacy-runtime-cleanup/docs/superpowers/specs/
mv docs/superpowers/specs/2026-06-17-scoped-style-token-compliance.md /Users/kaizhou/codeDev/wes_frontend-archive/process-docs/2026-08-18-scoped-style-token-compliance-retired/docs/superpowers/specs/
```

Use `apply_patch` to remove the two obsolete Runtime entries from the `TODOS.md` Completed section. Do not alter the active knip/ts-prune TODO and do not add a speculative new-runtime TODO.

- [ ] **Step 4: Perform document-level verification**

After every move succeeds, use `apply_patch` to create one `ARCHIVE-MANIFEST.md` in each archive root. Each manifest contains the source repository, archive date, reason, frozen frontend commit, and its exact archived file list. The style-token manifest must also record source SHA-256 `1b2c6fd15a9684853523ea7a956357b9455bcfbc0d1e1c767c1e336661fb755a`. These manifests are external evidence, not project truth sources.

```bash
test ! -e docs/superpowers/archive
test -f /Users/kaizhou/codeDev/wes_frontend-archive/process-docs/2026-08-17-legacy-runtime-cleanup/ARCHIVE-MANIFEST.md
test -f /Users/kaizhou/codeDev/wes_frontend-archive/process-docs/2026-08-18-scoped-style-token-compliance-retired/ARCHIVE-MANIFEST.md
test -f /Users/kaizhou/codeDev/wes_frontend-archive/process-docs/2026-08-18-scoped-style-token-compliance-retired/docs/superpowers/specs/2026-06-17-scoped-style-token-compliance.md
test "$(shasum -a 256 /Users/kaizhou/codeDev/wes_frontend-archive/process-docs/2026-08-18-scoped-style-token-compliance-retired/docs/superpowers/specs/2026-06-17-scoped-style-token-compliance.md | awk '{print $1}')" = "1b2c6fd15a9684853523ea7a956357b9455bcfbc0d1e1c767c1e336661fb755a"
test -f docs/superpowers/plans/2026-08-17-frontend-legacy-runtime-cleanup.md
test -f docs/superpowers/specs/2026-04-14-log-center-backend-requirements.md
test ! -e docs/superpowers/specs/2026-06-17-scoped-style-token-compliance.md
if test -d docs/hardware; then test -z "$(rtk git diff --name-only -- docs/hardware)"; fi
rtk rg -n "2026-05-06-workline-emergency-stop-frontend|2026-06-15-workline-monitor-dashboard-v3-alignment|2026-06-16-workline-monitor-ui-fixes|2026-06-08-runtime-monitor-resource-layout-design|2026-06-17-scoped-style-token-compliance|RuntimeSceneFocusPanel|Runtime scene 资源证据" docs TODOS.md --glob '!docs/hardware/**' --glob '!docs/superpowers/plans/2026-08-17-frontend-legacy-runtime-cleanup.md'
```

Expected: all existence checks pass; final `rg` returns no references. If current docs still link to an archived process document, update the current doc to describe the current rule directly rather than linking back into history.

- [ ] **Step 5: Commit repository-side removals only**

```bash
rtk git add -u docs/superpowers TODOS.md
rtk git commit -m "docs(cleanup): 外移过期运行域过程文档"
```

Do not stage the external archive directory; it is intentionally outside the repository.

---

### Task 7: Run the full cleanup acceptance gate

**Files:** No planned file changes. If verification exposes a defect, return to the owning task and make the smallest TDD fix; do not create an empty acceptance commit.

**Interfaces:** 清理分支最终只暴露当前静态管理能力和基础设施；所有新运行域能力留给独立重写计划。

- [ ] **Step 1: Confirm backend did not move during execution**

```bash
frontend_cleanup_recorded_backend_commit=$(node -p "require('./.contract-sync-record.json').backendCommit")
test "$(rtk git -C /Users/kaizhou/codeDev/wes_backend rev-parse HEAD)" = "$frontend_cleanup_recorded_backend_commit"
test -z "$(rtk git -C /Users/kaizhou/codeDev/wes_backend status --porcelain)"
```

Expected: both checks pass. If not, the generated baseline is no longer proven current; restart Task 5 after reviewing new impact.

- [ ] **Step 2: Run focused absence and ownership scans**

```bash
test ! -e src/views/runtime
test ! -e src/components/runtime
test ! -e src/api/services/sse-client.ts
test ! -e src/api/services/sse-session.ts
rtk rg -n "RuntimeRoot|RuntimeMonitor|RuntimeCases|RuntimeHolds|RuntimeSandbox|runtime:system:menu|@/api/modules/runtime|@/types/runtime|@/stores/(runtime-hold|runtime-sse|workline-runtime)|sse-client|sse-session|resetSSESession|VITE_SSE_URL|RuntimeHoldNgReasonsQuery|runtimeHoldApiMethods" src package.json CLAUDE.md .env.development .env.production Dockerfile Jenkinsfile
rtk rg -n '\b(plugin_key|contract_version|host|port|protocol|callback_path|auth_token|capabilities_json|vendor_type|device_status|maintenance_mode)\b' src/views/admin/worklines src/views/admin/devices
rtk rg -n "/api/v1/wms/events" src/api/modules
rtk rg -n "openapi.workline-plugin-manifest-yaml-topology|OPENAPI_SPEC|BACKEND_OPENAPI|--source|--require-backend" contracts docs --glob '!docs/hardware/**' --glob '!docs/superpowers/plans/2026-08-17-frontend-legacy-runtime-cleanup.md'
```

Expected: existence checks pass and all four `rg` commands return no matches. Negative tests intentionally name retired symbols, so they are verified by the test runner rather than included in raw source-name scans. Raw `contracts/openapi.current.json` and `src/api/generated/openapi-types.ts` may contain `/api/v1/wms/events` and the three exact inbound callback endpoints; browser modules may not.

- [ ] **Step 3: Run all quality gates**

```bash
pnpm test
pnpm contract:test
pnpm contract:verify
pnpm permission:verify -- --backend-root /Users/kaizhou/codeDev/wes_backend
pnpm type:check
pnpm lint
pnpm build
```

Expected: all PASS and `pnpm lint` leaves the worktree unchanged. Do not use deleted runtime smoke as proof of the surviving foundation or future business UI.

- [ ] **Step 4: Re-run deterministic generators from the accepted commit**

```bash
pnpm generate:types
pnpm generate:zod
pnpm generate:permissions -- --backend-root /Users/kaizhou/codeDev/wes_backend
rtk git diff --exit-code -- .contract-sync-record.json .permission-sync-record.json src/api/generated src/api/modules src/types/generated/zod-schemas.ts
```

Expected: zero diff. This proves all generated outputs, not just the two entry markers, correspond to the frozen backend commit.

- [ ] **Step 5: Review source quality and placeholders**

```bash
rtk git diff develop...HEAD --check
rtk git diff develop...HEAD --name-status
rtk git diff develop...HEAD --stat
rtk rg -n "TODO|FIXME|HACK|XXX|待补充|临时兼容|兼容层|Not implemented" scripts/lib/sha256.ts scripts/lib/backend-checkout.ts scripts/lib/openapi-sync.ts scripts/lib/permissions-codegen.ts scripts/freeze-backend-contract.ts tests/unit/scripts/openapi-sync.test.ts tests/unit/scripts/freeze-backend-contract.test.ts tests/unit/scripts/permissions-codegen.test.ts src/views/admin/worklines src/views/admin/devices
```

Expected: diff check passes; placeholder scan has no matches. Review every changed line against this plan and remove duplicate helpers, speculative abstractions, compatibility code, and comments that describe retired behavior.

- [ ] **Step 6: Confirm final repository and archive state**

```bash
rtk git status --short --branch
test -z "$(rtk git status --porcelain)"
test -f /Users/kaizhou/codeDev/wes_frontend-archive/process-docs/2026-08-17-legacy-runtime-cleanup/ARCHIVE-MANIFEST.md
if test -d docs/hardware; then test -z "$(rtk git diff develop...HEAD --name-only -- docs/hardware)"; fi
```

Expected: the branch worktree is clean, external archive manifest exists, and hardware documents are untouched.

## Exit and Follow-up Boundary

清理验收通过后，本计划结束。下一份“运行中心重写计划”必须重新读取冻结的当前 OpenAPI，并以以下边界起步：

1. `plane/scene` 只负责静态平面场景；`plane/snapshot` 只负责动态事实快照。
2. WorkLine/Device 静态主数据、运行事实、人工操作、WMS 系统接口分属不同能力，不再聚合进一个万能 `runtimeApiMethods`。
3. 先定义最短可用监控场景，再决定是否需要 SSE、案件、reconciliation 或沙箱页面；不能因为后端有端点就默认全部做 UI。
4. `/api/v1/wms/**` 与三个精确入站 callback 端点永远不是浏览器业务入口。
5. 新重写不得复活本计划删除的 DTO、组件、路由名称或兼容跳转。

## Test Coverage Map

项目测试框架为 Vitest；本清理没有需要浏览器 E2E 或 LLM eval 的新用户流程。业务薄页面与基础能力分开验证：页面测试只检查业务配置，基础测试只检查通用 CRUD/生成工具/依赖方向。

```text
CODE PATHS                                             USER / OPERATOR FLOWS
[+] Runtime entry removal                              [+] Open retired /runtime URL
  ├── [★★★ PLANNED] route + menu + no redirect          └── [★★★ PLANNED] no old page/menu is published
  └── [★★★ PLANNED] immersive layout branch removed

[+] WorkLine static CRUD                               [+] Maintain WorkLine master data
  ├── [★★★ PLANNED] no plugin/runtime fields/actions    ├── [★★★ EXISTING] generic CRUD load/submit/error
  └── [★★★ PLANNED] no configuration-workbench route    └── [★★★ PLANNED] only current static config shown

[+] Device static CRUD                                 [+] Maintain Device identity/topology
  ├── [★★★ PLANNED] no connectivity/runtime fields      ├── [★★★ EXISTING] generic CRUD load/submit/error
  ├── [★★★ PLANNED] no runtime actions                  └── [★★★ PLANNED] current static fields preserved
  └── [★★★ PLANNED] foundation import boundary

[+] Retired runtime/SSE closure                        [+] Logout/token refresh after SSE removal
  ├── [★★★ PLANNED] exact directories/files absent     ├── [★★★ PLANNED] auth tests remain green
  ├── [★★★ PLANNED] token/env surviving tests updated  └── [★★★ PLANNED] no stale SSE config/import
  └── [★★★ PLANNED] WorkLine custom legacy block gone

[+] OpenAPI freeze                                     [+] Engineer freezes backend contract
  ├── [★★★ PLANNED] missing/wrong/dirty backend fails   ├── [★★★ PLANNED] exact checkout succeeds
  ├── [★★★ PLANNED] Python/JSON failure writes nothing  └── [★★★ PLANNED] wrong process/URL cannot be used
  └── [★★★ PLANNED] HEAD race + temp cleanup

[+] Permission freeze                                  [+] Engineer regenerates permission constants
  ├── [★★★ PLANNED] SHA-256 + exact record schema       ├── [★★★ PLANNED] same backend commit required
  ├── [★★★ PLANNED] no path/timestamp/legacy record     └── [★★★ PLANNED] backend failure is visible/non-zero
  └── [★★★ PLANNED] HEAD/hash/count mismatch fails

[+] Generated artifacts                                [+] CI / pre-push acceptance
  ├── [★★★ PLANNED] full snapshot/marker verification  ├── [★★★ PLANNED] tests + contract gates cannot skip
  ├── [★★★ PLANNED] regenerate then zero diff           └── [★★★ PLANNED] lint checks without rewriting
  └── [★★★ PLANNED] inbound endpoints not browser APIs

[DOC] Process-document archive                         [DOC] No test code by policy
  └── existence + exact target + links + hardware protection checks

COVERAGE AFTER PLAN UPDATE: 26/26 changed paths planned (100%)
QUALITY: ★★★ 26 | ★★ 0 | ★ 0 | E2E gaps 0 | Eval gaps 0
```

## Failure Modes

| Flow             | Realistic failure                                    | Test/check                                               | Handling and visibility                                |
| ---------------- | ---------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| Contract freeze  | Port belongs to another worktree                     | HTTP source removed; freeze tests exact `cwd` extraction | Impossible by interface; child failure is non-zero     |
| Contract freeze  | Backend changes during extraction                    | HEAD-before/after test                                   | No snapshot/record write; explicit error               |
| Contract freeze  | App import logs or invalid JSON                      | Temp-file extractor tests                                | stdout ignored; invalid file rejected and temp removed |
| Permission sync  | Same permissions generated from a different checkout | commit-match and HEAD-race tests                         | Non-zero; record not updated                           |
| Permission sync  | Developer/CI path changes                            | no-path record/content test + zero diff                  | Artifact remains byte-reproducible                     |
| Generated output | Entry marker updated but module/metadata omitted     | post-commit regeneration zero-diff gate                  | Non-zero diff names exact stale file                   |
| Runtime deletion | Surviving import/config references removed file      | focused tests, absence scan, typecheck, build            | Fails before commit; no silent runtime fallback        |
| Quality gates    | Local hook skips or CI rewrites files                | `quality-gates.test.ts` + clean final status             | Gate returns non-zero; CI is authoritative             |
| Document archive | Fixed archive root already exists                    | preflight `test ! -e`                                    | Stops before any move; no overwrite/merge              |

No failure mode remains both silent and uncovered after these additions.

## Worktree Parallelization Strategy

| Lane | Tasks                    | Modules                                                  | Depends on                                         |
| ---- | ------------------------ | -------------------------------------------------------- | -------------------------------------------------- |
| A    | Task 1                   | router, layout, menu tests                               | Preconditions                                      |
| B    | Task 2                   | WorkLine view/config                                     | Preconditions                                      |
| C    | Task 3                   | Device view/config, common CRUD boundary                 | Preconditions                                      |
| D    | Task 6                   | process documents, `TODOS.md`, external archive          | Preconditions and exclusive archive-root check     |
| E    | Task 4 → Task 5 → Task 7 | runtime closure → generated contracts/gates → acceptance | A + B + C merged; D merged before final acceptance |

Tasks 1–3 may run in separate worktrees because they do not share primary modules. Task 6 may run independently but owns the one-shot external archive directory. Merge A/B/C/D, then run E sequentially in one worktree. Tasks 4 and 5 both touch `package.json`, generated modules and contract tests, so parallelizing them would create avoidable conflicts and invalid intermediate evidence.

## Implementation Tasks

Synthesized from this engineering review. These tasks are already folded into Tasks 1–7 above; this flat list is for execution tracking and `/autoplan` aggregation.

- [ ] **T1 (P1, human: ~2h / Agent: ~25min)** — Runtime closure — delete orphan SSE, legacy WorkLine custom methods and all retired consumers
  - Surfaced by: Architecture D4/D5 and code-path audit.
  - Files: `src/api/services/`, `src/api/modules/workline.ts`, runtime source/tests, env/auth consumers.
  - Verify: Task 4 focused tests, absence scan and `pnpm type:check`.
- [ ] **T2 (P1, human: ~1h / Agent: ~15min)** — CRUD boundary — remove WorkLine/Device behavior from the common form
  - Surfaced by: Architecture D10, `CrudFormDialog.vue` importing `workLinesApiMethods`.
  - Files: `src/components/common/CrudFormDialog.vue`, `tests/unit/architecture/foundation-boundaries.test.ts`.
  - Verify: boundary test plus Device page test.
- [ ] **T3 (P1, human: ~3h / Agent: ~40min)** — Contract provenance — bind OpenAPI extraction to the exact backend checkout
  - Surfaced by: Architecture D6; independent URL could be served by another worktree.
  - Files: `scripts/lib/{sha256,backend-checkout,openapi-sync}.ts`, freeze command and tests.
  - Verify: freeze failure matrix and frozen record commit.
- [ ] **T4 (P1, human: ~2h / Agent: ~30min)** — Permission provenance — replace machine-specific record with commit-bound SHA-256
  - Surfaced by: Architecture D8; current record and generated headers already contain different absolute paths.
  - Files: permission codegen/generator/verifier, record, generated permission directory and tests.
  - Verify: permission tests and fail-closed live backend verification.
- [ ] **T5 (P1, human: ~1h / Agent: ~15min)** — Generated completeness — prove every derived file by clean regeneration
  - Surfaced by: Architecture D7; two entry markers do not cover metadata/modules/permissions.
  - Files: generated directories, sync workflow docs and acceptance commands.
  - Verify: all three generators followed by scoped `git diff --exit-code`.
- [ ] **T6 (P1, human: ~2h / Agent: ~25min)** — Quality gates — make hooks, CI and lint check-only and fail-closed
  - Surfaced by: Architecture D9 and code-quality review; `|| true`, success-skip and write-mode lint made false green possible.
  - Files: `.husky/`, `.github/workflows/ci-cd.yml`, `package.json`, permission verifier and gate test.
  - Verify: `quality-gates.test.ts`, full tests, contract gates and clean worktree after lint.
- [ ] **T7 (P2, human: ~1h / Agent: ~15min)** — Document truth — perform collision-safe external archive and remove stale completed TODOs
  - Surfaced by: Architecture D11 and documentation search.
  - Files: `docs/superpowers/`, `TODOS.md`, external `ARCHIVE-MANIFEST.md`.
  - Verify: exact existence/reference/hardware checks; no test code.
- [ ] **T8 (P1, human: ~1h / Agent: ~10min)** — Acceptance correctness — replace self-matching scans and quoted globs with executable checks
  - Surfaced by: Test review; negative tests and the plan itself contain retired symbol names.
  - Files: this implementation plan and Task 7 command set.
  - Verify: execute every documented scan from the clean implementation worktree.

## GSTACK REVIEW REPORT

| Review        | Trigger               | Why                             | Runs | Status | Findings                                                                                    |
| ------------- | --------------------- | ------------------------------- | ---- | ------ | ------------------------------------------------------------------------------------------- |
| CEO Review    | `/plan-ceo-review`    | Scope & strategy                | 0    | —      | Cleanup does not expand product scope; no CEO review required                               |
| Codex Review  | `/codex review`       | Independent 2nd opinion         | 0    | —      | Outside-voice attempt left the requested scope and was terminated; no findings incorporated |
| Eng Review    | `/plan-eng-review`    | Architecture & tests (required) | 1    | CLEAR  | 15 issues found, 15 folded into the plan, 0 critical gaps                                   |
| Design Review | `/plan-design-review` | UI/UX gaps                      | 0    | —      | Retires UI and simplifies existing CRUD; no new visual design introduced                    |
| DX Review     | `/plan-devex-review`  | Developer experience gaps       | 0    | —      | Internal cleanup; no external developer product surface changed                             |

**VERDICT:** ENG CLEARED — ready to implement; run `/ship` only after implementation and acceptance pass.

NO UNRESOLVED DECISIONS
