# Workline Monitor Dashboard-v3 Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `WorklineMonitorPage` 的视觉结构、拓扑数据、设备诊断 Tab 和行动舱收敛到 `.superpowers/brainstorm/15533-1781075677/content/dashboard-v3.html`，同时补齐后端 monitor projection 与 SSE 刷新契约。

**Architecture:** 后端 monitor projection 继续作为 UI 唯一事实源；SSE 只发送轻量变更通知，前端按现有 coalesced refresh 模式重新拉 projection。拓扑契约严格镜像后端 `manifest.topology.flow_edges` 的 `DEVICE_ROLE` / `RACK_POSITION` 语义，不再引入前端 `DEVICE` 别名。右栏全量采用 dashboard-v3 的诊断/业务 Tab，但只暴露已有真实动作，避免交付假按钮。

**Tech Stack:** Vue 3.5 Composition API、TypeScript、Element Plus、Tailwind CSS v4、Vitest、alova、OpenAPI typegen、FastAPI、Pydantic、SQLAlchemy、pytest、Redis-backed SSE。

---

## Review Decisions

- **Scope:** 全量推进 dashboard-v3 对齐，但把后端契约、SSE 刷新和多层测试纳入同一计划。
- **ACK 数据:** `RuntimeMonitorDeviceNode` 新增嵌套 `current_command` 快照；不使用平铺 `current_command_*` 字段。
- **Realtime:** 新增 command ACK/update SSE 事件只作为刷新信号，前端不直接合并 SSE payload 状态。
- **Topology:** 前端模型使用 `DEVICE_ROLE` / `RACK_POSITION`，按 manifest 原语义解析，不使用 `DEVICE` alias。
- **Topology node model:** scene/layout 使用显式 `TopologyNode` union；device node 与 rack-position node 不互相伪装，rack position key 使用 position code。
- **Topology rendering:** `TopologyDeviceNode` 保持设备专用；新增 rack-position 节点组件，由共享 topology flow 按 node kind 分发渲染。
- **Actions:** 迁移真实动作：清急停、刷新、解除对账、已有设备维护进入/退出。旁路和释放库位锁不做可点击入口，除非后续有明确后端合同。
- **Right panel data:** tote/material/rack occupancy 等业务摘要由 `runtime-scene.ts` adapter 输出 view model；新组件只渲染，不重复推断 raw evidence。
- **Vue reactivity:** `useTopologyLayout` 使用 Vue `MaybeRefOrGetter` + `toValue()` 支持 value/ref/computed/getter，不手写 `Ref | ComputedRef` 联合。
- **Realtime implementation:** command SSE 使用单一 helper 生成 canonical payload；sandbox 对 command event 的 pending/completed refresh 也使用 coalesced task。
- **Existing runtime-event behavior:** `entity: "command"` 分类在当前代码已存在；计划只需补 command 回归测试，不重复实现分类器。
- **Test hardening:** command SSE 路径矩阵、topology failure/interaction 分支、旧 action 面板迁移回归、current_command 批量加载断言和 runtime smoke 都是本计划门禁。
- **Plan shape:** 本文档是决策规格，不粘贴大段实现代码，不写硬编码行号，不包含逐任务 commit 命令。
- **Performance:** 后端按 `device.current_command_id` 批量加载 command snapshot，禁止逐设备查询。

## File Structure

### Backend: `../wes_backend`

- `src/app/workline/models/runtime.py`
  - 新增 `RuntimeMonitorCommandSnapshot` Pydantic model。
  - `RuntimeMonitorDeviceNode` 增加 `current_command: RuntimeMonitorCommandSnapshot | None = None`。
- `src/app/workline/services/runtime_query_service.py`
  - 在 `get_workline_monitor_projection()` 中批量加载当前 command。
  - `_build_monitor_device_node()` 接收 command snapshot 并输出到 node。
- `src/app/sys/services/event_stream_service.py`
  - 增加 `COMMAND_STATUS_CHANGED_EVENT = "command.status.changed"`。
  - 增加 `defer_command_status_changed_event(...)` helper，统一输出 command SSE payload。
- ACK / command 状态写入路径
  - 在真实 ECS ACK、sandbox ACK、sandbox result 或其他会改变 command status/ACK 时间的路径里 defer command SSE 事件。
  - 优先复用已有 `defer_sse_event()` / `publish_deferred_sse_events()` 流程。
- Tests
  - `../wes_backend/tests/api/test_workline_runtime_api.py`
  - `../wes_backend/tests/api/test_workline_runtime_sse.py`
  - `../wes_backend/tests/workline_runtime/test_runtime_query_service.py`
  - ACK 写入路径对应的现有 gateway/operation tests。

### Frontend: `wes_frontend`

- `src/utils/runtime-scene.ts`
  - 解析 `manifest.topology.flow_edges` 为 scene topology model。
  - node kind 使用 `DEVICE_ROLE` / `RACK_POSITION`。
  - 输出右栏 tote/material/rack occupancy view model，避免组件重复解析 evidence。
- `src/utils/runtime-topology.ts`
  - layout engine 支持显式节点与显式边。
  - manifest edges 存在时优先使用显式边；无 manifest 或加载失败时保留当前 derived fallback。
- `src/composables/useTopologyLayout.ts`
  - `explicitNodes`、`explicitEdges`、rack position nodes、关键 layout options 支持 `MaybeRefOrGetter`。
- `src/components/runtime/shared/RuntimeSceneDeviceFlow.vue`
  - 接收显式拓扑节点/边并渲染 device 与 rack position。
- `src/components/runtime/shared/TopologyDeviceNode.vue`
  - 保持 device node 专用渲染。
- `src/components/runtime/shared/TopologyRackPositionNode.vue`
  - 新增 rack-position node 专用渲染。
- `src/components/runtime/monitor/RuntimeSceneMap.vue`
  - 将 scene model 的 topology nodes/edges 传给共享拓扑组件。
- `src/utils/runtime-event.ts`
  - 将 `entity: "command"` 归类为 projection + sandbox refresh。
- `src/views/runtime/worklines/WorklineMonitorPage.vue`
  - 右栏切换为 dashboard-v3 诊断/业务 Tab。
  - 保留真实操作闭环，删除旧独立 panel 前先完成表单/动作迁移。
- New focused components
  - `MonitorAlertCard.vue`
  - `MonitorCommandChain.vue`
  - `MonitorToteTwinCard.vue`
  - `MonitorRackOccupancyMatrix.vue`
  - `MonitorDeviceActionGroup.vue`
  - `WorklineReconciliationForm.vue`

## Implementation Tasks

### Task 1: Backend Current Command Snapshot Contract

**Intent:** 让 dashboard-v3 的 ECS ACK 链有真实数据来源。

- [ ] 在 `../wes_backend/src/app/workline/models/runtime.py` 新增 `RuntimeMonitorCommandSnapshot`，字段固定为 `id`、`command_code`、`status`、`sent_at`、`ack_received_at`、`ack_code`、`ack_message`。
- [ ] 在 `RuntimeMonitorDeviceNode` 中新增 `current_command`，保留现有 `current_command_id` 以兼容旧 UI。
- [ ] 在 `runtime_query_service.get_workline_monitor_projection()` 中收集全部非空 `device.current_command_id`。
- [ ] 复用或扩展 `_load_command_map_by_ids()` 一次性加载 commands，构建 `command_id -> RuntimeMonitorCommandSnapshot` map。
- [ ] `_build_monitor_device_node()` 通过参数接收对应 snapshot；找不到 command row 时 `current_command = None`，不抛错。
- [ ] 补后端测试：有 current command 时 projection 输出 code/status/sent/ack；无 command 或 command row 缺失时为 null。

### Task 2: Backend Command SSE Invalidation

**Intent:** ACK-only 变化也能推动前端实时刷新 projection。

- [ ] 在 `event_stream_service.py` 增加 `COMMAND_STATUS_CHANGED_EVENT`。
- [ ] 新增 `defer_command_status_changed_event(db, *, command, action, workline_id, device_id, session_id=None)`，所有 command SSE 经由该 helper。
- [ ] 统一 command event payload：
  - `domain: "workline_runtime"`
  - `entity: "command"`
  - `action: "acked"` 或 `"updated"`
  - `keys.workline_id`
  - `keys.device_id`
  - `keys.command_id`
  - `keys.command_code`
  - optional `keys.session_id`
- [ ] 在真实 ECS ACK 写入路径 defer `command.status.changed`。
- [ ] 在 sandbox ACK 和 sandbox result 写入路径 defer 同一事件。
- [ ] 在 ACK exhausted / dispatch failed 等会把 command 置为失败的路径 defer 同一事件。
- [ ] 确认所有路径继续在事务提交后调用 `publish_deferred_sse_events()`。
- [ ] 补 SSE helper 与路径矩阵测试，覆盖 canonical payload、keys、真实 ECS ACK、sandbox ACK、sandbox result、ACK exhausted/failed。

### Task 3: Frontend Contract Sync

**Intent:** 前端类型从后端 OpenAPI 生成，不手写 generated contract。

- [ ] 后端 schema 完成后，从前端仓库运行 `pnpm generate:types`。
- [ ] 运行 `pnpm generate:zod`，同步 `RuntimeMonitorDeviceNode` 与新增 command snapshot schema。
- [ ] 运行 `pnpm contract:test`，确认生成类型、metadata、zod contract 一致。
- [ ] 只提交 generated 文件中由 OpenAPI 变化带来的 diff；不要手改 `src/api/generated/openapi-types.ts`。

### Task 4: Scene Model Uses Manifest Topology

**Intent:** `runtime-scene.ts` 消费后端真实 `topology.flow_edges`。

- [ ] 在 `runtime-scene.ts` 增加 scene topology types，node kind 只允许 `DEVICE_ROLE` 和 `RACK_POSITION`。
- [ ] 将 `manifest.topology.flow_edges` 映射为 scene model 的拓扑节点与拓扑边。
- [ ] 保留 `manifest` 缺失或加载失败时的空 edges fallback。
- [ ] 未知 `DEVICE_ROLE` / `RACK_POSITION` ref 不抛错，不产生 dangling edge，并留下可测试的 fallback/diagnostic 表达。
- [ ] 增加测试：`DEVICE_ROLE -> RACK_POSITION`、`RACK_POSITION -> RACK_POSITION`、manifest 缺失、未知 ref 四种路径。
- [ ] 移除旧计划中的 `DEVICE` 示例和 `deviceCode` 反查假设。

### Task 5: Topology Layout Supports Explicit Nodes And Edges

**Intent:** dashboard-v3 中 rack position 也能成为拓扑上的一等节点。

- [ ] 扩展 `runtime-topology.ts`，支持显式 layout nodes：device nodes 与 rack position nodes。
- [ ] 显式边存在时优先按 manifest 边渲染；无显式边时继续用现有 `deriveEdges()`。
- [ ] Layout node id 改为 string key；device key 与 rack position key 都稳定，不再假设所有 node id 都是 number。
- [ ] `DEVICE_ROLE` 映射规则固定：按 `device.deviceRole === ref` 找设备，按 `roleIndex`、`id` 稳定排序。
- [ ] 多设备同一 role 时，operation edge 连接到该 role 的全部匹配设备，除非后续 manifest 增加更细粒度选择字段。
- [ ] `RACK_POSITION` 节点以 position code 为稳定 key，并参与边路径计算。
- [ ] 补 layout tests：显式边覆盖 derived edge、role fan-out、rack-position-to-rack-position material flow、unknown ref、fallback derived layout。

### Task 6: Reactive `useTopologyLayout`

**Intent:** manifest 晚于 projection 返回时，拓扑边变化能触发布局重算。

- [ ] `UseTopologyLayoutOptions` 的 `explicitNodes`、`explicitEdges`、rack position nodes、`compact` / `linear` 支持 `MaybeRefOrGetter`。
- [ ] composable 内部在 `computed()` 内使用 `toValue()` 读取 options，避免晚到 manifest/config 不触发布局重算。
- [ ] `RuntimeSceneDeviceFlow.vue` 使用 computed/ref 传入 scene topology 数据。
- [ ] 增加测试：先 mount 无 explicit edges，再更新 props 为 manifest edges，断言 edge path 数量和目标节点更新；同时覆盖 `compact` / `linear` option 的响应式变化。

### Task 7: Shared Topology Rendering

**Intent:** 中央画布能显示设备、货位、显式连线和现有危险态动画。

- [ ] `RuntimeSceneDeviceFlow.vue` 新增 props：显式 topology nodes、显式 topology edges。
- [ ] `TopologyDeviceNode.vue` 保持设备专用，继续承载状态 badge、command、Runtime Hold、parked outbox、trace actions。
- [ ] 新增 `TopologyRackPositionNode.vue`，只渲染 rack position visual treatment，不发 device-only action。
- [ ] `RuntimeSceneMap.vue` 从 `RuntimeSceneModel` 传入显式 topology 数据。
- [ ] 保留现有 `topology-node-danger-blink` 和连线流动动画。
- [ ] 增加组件测试，覆盖选中设备、危险态、rack position 节点、显式边，以及点击 rack position 不触发 select/sendEvent/showContextMenu 的 device payload。

### Task 8: Dashboard-v3 Right Panel Components

**Intent:** 把原型右栏拆成小组件，但不改变事实源。

- [ ] `MonitorAlertCard.vue`：红/黄虚框报警卡，输入为 tone/title/message/source metadata。
- [ ] `MonitorCommandChain.vue`：读取 `selectedDevice.current_command`，展示 command code、ACK 状态、WES 下发时间、ECS ACK 时间；null 时显示 idle 状态。
- [ ] `runtime-scene.ts` 先产出 right-panel view model；`MonitorToteTwinCard.vue` 只消费 adapter 输出的 tote/material 摘要，不读 raw JSON。
- [ ] `MonitorRackOccupancyMatrix.vue` 只消费 adapter 输出的 rack occupancy matrix，复用 existing rack layout data。
- [ ] `MonitorDeviceActionGroup.vue`：只渲染真实动作入口，按权限和状态禁用。
- [ ] 每个组件补 focused component tests。

### Task 9: Preserve Real Operator Actions

**Intent:** 删除旧 panel 前先完成真实操作迁移。

- [ ] 把 `WorklineSafetyIncidentPanel` 的刷新和清急停能力迁移到设备 control tab/action group。
- [ ] 把 `WorklineReconciliationPanel` 的 form 部分抽成 `WorklineReconciliationForm.vue`，保留 resolution、checks、operator note、result payload 和 resolve emit。
- [ ] 右栏底部仍在 pending reconciliation 时显示 `WorklineReconciliationForm`。
- [ ] 设备维护进入/退出复用 `src/api/modules/devices.ts` 的 `runtimeEnterMaintenance` / `runtimeExitMaintenance`，使用 `BIZ_PERMISSIONS.device.update`。
- [ ] 旁路和释放库位锁不显示为可点击按钮；如需要展示原型意图，使用只读 disabled item 并写明“无后端合同”。
- [ ] 删除 `WorklineSafetyIncidentPanel.vue` / `WorklineReconciliationPanel.vue` 只在上述迁移测试通过后执行。

### Task 10: WorklineMonitorPage Assembly

**Intent:** 页面整体收敛到 dashboard-v3，不拆散现有路由/store/SSE 流程。

- [ ] `WorklineMonitorPage.vue` control tab 使用 `MonitorAlertCard + MonitorCommandChain + MonitorDeviceActionGroup`。
- [ ] business tab 使用 `MonitorToteTwinCard + MonitorRackOccupancyMatrix`。
- [ ] 中央画布增加 dashboard-v3 点阵网格背景，但保持当前 amber 主题。
- [ ] `sseStore.lastEvent` watcher 继续使用 `classifyRuntimeRefresh()` 和 `createCoalescedAsyncTask()`。
- [ ] 确认当前 `runtime-event.ts` 已将 `entity: "command"` 分类为 `projection: true`、`sandbox: true`、`worklines: false`，只补回归测试。
- [ ] `SandboxWorkbenchPage.vue` 对 command-triggered pending/completed refresh 使用 `createCoalescedAsyncTask()` 或等价 coalesced wrapper，避免 ACK/result burst 放大请求。
- [ ] 保留 route query、selected workline/device、mobile pane 切换等现有行为。

### Task 11: Multi-Layer Tests And QA

**Intent:** 后端契约、前端显示、实时刷新和视觉布局都进入门禁。

- [ ] 后端运行：
  - `cd ../wes_backend && uv run pytest tests/api/test_workline_runtime_api.py tests/api/test_workline_runtime_sse.py tests/workline_runtime/test_runtime_query_service.py`
  - 按 ACK 改动实际路径追加 `test_device_command_gateway.py` 或 `test_workline_operation_service.py` 目标用例。
  - current command snapshot 多设备测试必须断言 command map 批量加载只发生一次。
  - command SSE 必须覆盖 helper、真实 ECS ACK、sandbox ACK、sandbox result、ACK exhausted/failed 路径。
- [ ] 前端运行：
  - `pnpm exec vitest run tests/unit/utils/runtime-scene.test.ts tests/unit/utils/runtime-event.test.ts`
  - `pnpm exec vitest run tests/unit/components/runtime`
  - `pnpm exec vitest run tests/unit/views/runtime/runtimeRouteSync.test.ts`
  - 新增/更新 `runtimeRouteSync` 或页面级测试，证明旧 safety/reconciliation panel 删除后，清急停和解除对账仍从新 UI 触发。
  - 新增 device action tests，覆盖 maintenance enter/exit API、权限禁用态、fake bypass/unlock 不可点击。
- [ ] 合同和质量门禁：
  - `pnpm generate:types`
  - `pnpm generate:zod`
  - `pnpm contract:test`
  - `pnpm type:check`
  - `pnpm lint`
- [ ] Browser QA：
  - 启动前端 dev server。
  - 打开 `/runtime/worklines`。
  - 桌面和移动 viewport 验证 ST-02 danger flow、RACK-01 reconciliation flow、显式拓扑边、右栏 tabs、动作禁用态、无文字重叠。
  - 必跑 `pnpm smoke:runtime:agent-browser`；建议加 `RUNTIME_SMOKE_USE_FIXED_MONITOR_FIXTURE=1 RUNTIME_SMOKE_CAPTURE_SCREENSHOTS=1` 产出稳定截图证据。
  - 如在 worktree 中运行 runtime smoke，设置 `RUNTIME_SMOKE_BACKEND_DIR=/Users/kaizhou/SynologyDrive/works/wes_backend`。

## Acceptance Criteria

- `RuntimeMonitorDeviceNode.current_command` 在 OpenAPI、前端 generated types 和 Zod schema 中可见。
- 当前指令 ACK 时间变化会发 `command.status.changed`，前端收到后刷新 projection。
- dashboard-v3 的 CommandChain 只展示 projection 中的 `current_command`，不从 SSE payload 或 trace list 拼状态。
- `command.status.changed` 的 payload 只由后端 command SSE helper 生成；真实 ACK、sandbox ACK/result、ACK exhausted/failed 路径均有测试。
- manifest topology 按 `DEVICE_ROLE` / `RACK_POSITION` 渲染；旧 `DEVICE` alias 不存在。
- 拓扑渲染使用显式 union node：device 节点和 rack-position 节点类型、事件和组件边界清晰。
- 无 manifest 或 manifest 加载失败时，拓扑仍使用当前 fallback 布局。
- 清急停、解除对账、设备维护入口可用且受权限控制。
- 旁路和释放库位锁不会作为假按钮交付。
- 旧独立 safety/reconciliation panel 删除后，所有真实能力仍可从新 UI 完成。
- command-triggered sandbox refresh 不产生重复 pending/completed 请求风暴。
- Runtime smoke 在固定 fixture 下通过并产出截图证据。
- 桌面和移动 QA 不出现主要文本重叠、按钮溢出或画布空白。

## NOT in scope

- 新增旁路设备 API。
- 新增释放库位锁 API。
- 将 SSE 改造成完整状态推送或 projection patch 流。
- 修改插件 manifest 后端语义；本计划只消费已存在的 `flow_edges`。
- 改变全局主题为 dashboard 原型的蓝色系；本次保持当前 amber 主题。
- 引入新的 E2E 框架；本次复用现有 Vitest、后端 pytest、runtime smoke 和 Browser QA。

## What already exists

- `createCoalescedAsyncTask()`：继续用于 projection/workline refresh 去重。
- `runtime-sse` store 与 `runtime-event.ts`：继续作为实时刷新入口；`entity: "command"` 分类已存在，只需补回归测试。
- `WorklineSafetyIncidentPanel` / `WorklineReconciliationPanel`：迁移前作为真实动作逻辑来源。
- `runtimeEnterMaintenance` / `runtimeExitMaintenance`：已有设备维护 API 和生成类型。
- `RuntimeRackInspector`、`RuntimeRackLayoutPanel`、`RuntimeBinCellGrid`：中央画布 rack/resource 渲染优先复用。
- 后端 `_load_command_map_by_ids()`：当前 command snapshot 的批量加载基础。
- 后端 `device_service._defer_device_status_event()`：command SSE helper 的实现风格参考。
- `pnpm smoke:runtime:agent-browser`：已有 runtime 浏览器 smoke，应作为本次 UI 迁移门禁复用。

## Failure modes

- `current_command_id` 指向已删除 command row：projection 输出 `current_command = null`；后端测试覆盖，CommandChain 显示 idle。
- command ACK/result 只改 command row、不改 device/workline row：`command.status.changed` 触发 projection/sandbox refresh；路径矩阵测试覆盖。
- manifest edge 引用未知 `DEVICE_ROLE` 或 `RACK_POSITION`：忽略 dangling edge 并保留 fallback/diagnostic；runtime-scene/layout tests 覆盖。
- 用户点击 rack-position node：不触发 device select/sendEvent/showContextMenu payload；组件测试覆盖。
- 旧 safety/reconciliation panel 删除后动作丢失：页面级 regression tests 覆盖清急停和解除对账。
- command event burst：sandbox pending/completed refresh 被 coalesced；unit test 覆盖。

## Worktree parallelization strategy

| Step                           | Modules touched                                                                                   | Depends on                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------- |
| Backend command contract + SSE | `../wes_backend/src/app/workline`, `../wes_backend/src/app/sys`, backend tests                    | —                               |
| Frontend topology model/layout | `src/utils`, `src/composables`, `src/components/runtime/shared`, frontend unit tests              | Backend manifest semantics only |
| Right panel + action migration | `src/utils`, `src/components/runtime/monitor`, `src/views/runtime/worklines`, frontend unit tests | Contract sync, topology model   |
| Contract sync + QA             | `src/api/generated`, `src/api/generated/openapi-metadata`, scripts/tests                          | Backend contract                |

- Lane A: backend command contract + SSE helper + backend tests.
- Lane B: frontend topology model/layout/rendering + component tests.
- Lane C: right panel/action migration after A+B merge, because it consumes generated `current_command` and topology view model.
- Final lane: contract sync, full lint/test/build, runtime smoke, Browser QA.
- Conflict flag: Lane B and C both touch `src/utils/runtime-scene.ts`; keep C after B or coordinate a narrow adapter interface before splitting.

## Eng Review Implementation Tasks

- [ ] **T1 (P1, human: ~2h / CC: ~20min)** — topology — introduce explicit topology node union.
  - Surfaced by: Architecture Review Issue 1.
  - Files: `src/utils/runtime-scene.ts`, `src/utils/runtime-topology.ts`, shared topology components.
  - Verify: topology unit tests for device/rack node keys and explicit edges.
- [ ] **T2 (P1, human: ~2h / CC: ~20min)** — backend realtime — add command SSE helper and call it from all command mutation paths.
  - Surfaced by: Architecture Review Issue 2.
  - Files: `../wes_backend/src/app/sys/services/event_stream_service.py`, ACK/result services.
  - Verify: backend SSE path matrix tests.
- [ ] **T3 (P2, human: ~2h / CC: ~20min)** — adapter — move right-panel business derivation into `runtime-scene.ts`.
  - Surfaced by: Architecture Review Issue 3.
  - Files: `src/utils/runtime-scene.ts`, right-panel components.
  - Verify: focused component tests assert components render adapter output only.
- [ ] **T4 (P2, human: ~1h / CC: ~10min)** — composable — use `MaybeRefOrGetter` + `toValue()` for topology layout options.
  - Surfaced by: Code Quality Review Issue 4.
  - Files: `src/composables/useTopologyLayout.ts`.
  - Verify: reactive option tests for explicit nodes/edges, compact, and linear.
- [ ] **T5 (P3, human: ~20min / CC: ~5min)** — realtime tests — convert stale `runtime-event.ts` task to command classification regression test.
  - Surfaced by: Code Quality Review Issue 5.
  - Files: `tests/unit/utils/runtime-event.test.ts`.
  - Verify: command event classification assertion.
- [ ] **T6 (P2, human: ~1.5h / CC: ~15min)** — topology components — split device and rack-position node rendering.
  - Surfaced by: Code Quality Review Issue 6.
  - Files: `src/components/runtime/shared`.
  - Verify: component tests for device-only and rack-position-only interactions.
- [ ] **T7 (P1, human: ~2h / CC: ~20min)** — tests — add command SSE helper and mutation path matrix.
  - Surfaced by: Test Review Issue 7.
  - Files: backend SSE/gateway/operation tests.
  - Verify: `uv run pytest` targets listed in Task 11.
- [ ] **T8 (P1, human: ~2h / CC: ~20min)** — tests — add topology failure and interaction branches.
  - Surfaced by: Test Review Issue 8.
  - Files: `tests/unit/utils/runtime-scene.test.ts`, `tests/unit/components/runtime/runtimeSceneDeviceFlow.test.ts`.
  - Verify: unknown ref, rack click, late manifest, fallback tests.
- [ ] **T9 (P1, human: ~2h / CC: ~20min)** — regression tests — preserve migrated operator actions.
  - Surfaced by: Test Review critical regression requirement.
  - Files: `tests/unit/views/runtime/runtimeRouteSync.test.ts`, monitor action component tests.
  - Verify: clear-estop, resolve-reconciliation, maintenance enter/exit, fake actions disabled.
- [ ] **T10 (P2, human: ~30min / CC: ~10min)** — QA — make runtime smoke a required gate.
  - Surfaced by: Test Review Issue 9.
  - Files: plan/QA commands; smoke script only if selectors need adjustment.
  - Verify: fixed fixture smoke with screenshots.
- [ ] **T11 (P2, human: ~1h / CC: ~10min)** — performance — coalesce sandbox command-triggered pending/completed refresh.
  - Surfaced by: Performance Review Issue 10.
  - Files: `src/views/runtime/sandbox/SandboxWorkbenchPage.vue`, sandbox tests.
  - Verify: burst command events produce coalesced loads.
- [ ] **T12 (P2, human: ~1h / CC: ~10min)** — performance tests — assert current command snapshot batch loading.
  - Surfaced by: Performance Review Issue 11.
  - Files: `../wes_backend/tests/workline_runtime/test_runtime_query_service.py`.
  - Verify: multi-device fixture loads command map once.

## Review Log

- 2026-06-16 `/plan-eng-review`：发现并决策 11 个工程问题。
- 关键修正：后端契约不再视为“已就绪”；ACK 链路纳入同一计划。
- 关键修正：拓扑 kind 从旧计划的 `DEVICE` 改为后端真实 `DEVICE_ROLE` / `RACK_POSITION`。
- 关键修正：删除所有 stub 操作入口，真实动作迁移完成后再删除旧 panel。
- 关键修正：拓扑节点使用 union model，device/rack-position 组件拆分。
- 关键修正：command SSE 使用单一 helper，并用路径矩阵测试锁住真实 ACK/sandbox ACK/result/ACK exhausted。
- 关键修正：右栏业务摘要由 adapter 输出 view model，避免组件重复推断 evidence。
- 关键修正：runtime smoke 变成本次 UI 迁移必跑门禁。
- Test plan artifact: `~/.gstack/projects/kaizhoumasha-wes_frontend/kaizhou-develop-eng-review-test-plan-20260616-000208.md`
- Test plan artifact: `~/.gstack/projects/kaizhoumasha-wes_frontend/kaizhou-develop-eng-review-test-plan-20260616-013713.md`
- 2026-06-16 `/plan-eng-review` 二审：重新核对 scope、架构、代码质量、测试覆盖、性能与计划报告形态；0 个新增问题，0 个 critical gap。
- 二审确认：上轮 11 个发现已全部折入本计划；本轮不新增实施任务。
- Test plan artifact: `~/.gstack/projects/kaizhoumasha-wes_frontend/kaizhou-develop-eng-review-test-plan-20260616-072713.md`
- Autoplan artifact: `~/.gstack/projects/kaizhoumasha-wes_frontend/tasks-eng-review-20260616-072713.jsonl`（空文件，表示本轮无新增任务）

## GSTACK REVIEW REPORT

| Review        | Trigger               | Why                             | Runs | Status       | Findings                                                       |
| ------------- | --------------------- | ------------------------------- | ---- | ------------ | -------------------------------------------------------------- |
| CEO Review    | `/plan-ceo-review`    | Scope & strategy                | 1    | STALE        | 4 proposals, 4 accepted, 3 deferred                            |
| Codex Review  | `/codex review`       | Independent 2nd opinion         | 1    | ISSUES_FOUND | Prior outside voice found issues on 2026-06-15                 |
| Eng Review    | `/plan-eng-review`    | Architecture & tests (required) | 9    | CLEAR        | 0 new issues, 0 critical gaps; prior 11 findings remain folded |
| Design Review | `/plan-design-review` | UI/UX gaps                      | 2    | STALE        | score: 7/10 -> 9/10, 6 decisions; 16 commits since review      |
| DX Review     | `/plan-devex-review`  | Developer experience gaps       | 0    | —            | —                                                              |

- **CODEX:** Outside voice was not rerun in the second pass because Claude CLI auth is still missing; prior codex-plan-review from 2026-06-15 remains informational.
- **VERDICT:** ENG CLEARED — ready to implement; CEO and design reviews are stale by commit drift but optional for this implementation pass.
  NO UNRESOLVED DECISIONS
