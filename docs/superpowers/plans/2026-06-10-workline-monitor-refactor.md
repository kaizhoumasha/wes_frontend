# 工作线运行监控中心端到端重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` or `superpowers:subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将工作线运行监控中心从旧 `detail` 合同破坏性收敛到工作线级监控投影（Monitor Projection）。后端、OpenAPI 生成类型、前端 API adapter、Pinia store、Scene Builder、页面、测试和 smoke 必须一次性对齐，不保留旧详情合同兼容。

**Architecture:** 现有 `GET /api/v1/workline/runtime/worklines/{workline_id}` 继续作为主屏唯一动态入口，但其 `ResponseSchemaModel[...]` 的 `data` payload 改为 `RuntimeWorklineMonitorProjectionResponse`。静态拓扑只来自插件 Manifest；SSE 统一为 `domain: "workline_runtime"`，只作为刷新失效通知；前端只消费 OpenAPI 生成类型，不手写投影 shape。

**Tech Stack:** FastAPI / SQLModel / Pydantic / pytest（`../wes_backend`），Vue 3 / Pinia / Element Plus / TypeScript / Alova / Vitest（`../wes_frontend`）。

**Source of truth:** `docs/superpowers/specs/2026-06-10-workline-monitor-design.md`。若本计划与 SPEC 冲突，以 SPEC 为准。

---

## Systematic Debugging 结论

本计划重写前的根因不是单点遗漏，而是三层错位：

- **范围错位**：旧计划只写前端任务，但目标是端到端破坏性合同收敛。
- **契约真源错位**：旧计划要求在 `src/types/runtime.ts` 手写临时投影接口，违反 OpenAPI generated types 唯一真源。
- **实现层级错位**：旧计划粘贴大段函数/组件实现，容易覆盖现有 request sequence、coalesced refresh、资源证据、货架布局和焦点面板能力。
- **验收边界错位**：本轮评审发现后端 runtime SSE 只被写成实现任务，缺少能证明旧事件域不再驱动主屏的 backend 侧测试和静态守卫。
- **守卫语义错位**：`rg` 检查原本更像诊断命令，没有明确“零匹配即通过、任何正向命中即失败”的门禁语义。

修复策略：计划只描述职责、接口边界、迁移顺序、验收和风险；不粘贴完整类/函数/组件实现，不使用 `any` 逃避合同，不让前端在后端合同落地前伪造类型。

---

## 当前事实与硬约束

- `../wes_backend/src/app/workline/v1/runtime.py` 当前 `/worklines/{workline_id}` 仍返回 `ResponseSchemaModel[RuntimeWorklineDetailResponse]`。
- `RuntimeQueryService.get_workline_detail` 当前仍构造旧 `RuntimeWorklineDetailResponse`，并复用 `RuntimeTraceListItem`。
- `../wes_backend/src/app/device/services/device_service.py` 当前仍可发出 `domain: "workline_trace"` 的 runtime 相关 SSE payload。
- `../wes_frontend/src/stores/workline-runtime.ts` 当前仍有 `detail/loadDetail/refreshDetail`、请求序列保护和 coalesced refresh。
- `../wes_frontend/src/utils/runtime-scene.ts` 当前承载资源证据、货架布局、未定位证据、截断提示等已有能力；实施时必须迁移输入合同，不得重写成简化 lane/node/flow 模型。
- `../wes_frontend/src/constants/runtime-safety.ts` 当前允许旧 runtime 事件域；实施时必须切换到 `workline_runtime`。
- 本系统未发布，允许破坏性优化；不保留旧主屏 detail 合同、旧 SSE 域或旧 scene model 兼容别名。

---

## 实施任务

### Task 0. 影响分析与基线确认

- [ ] 在 `../wes_backend` 修改任何函数、类、方法前，按项目规则对将变更的 backend symbol 执行 GitNexus impact analysis；若 HIGH/CRITICAL，先向用户汇报。
- [ ] 确认后端 base 为 `develop`，前端 base 为 `develop`；两个仓库都处于可识别的工作区状态。
- [ ] 在前端记录当前正向引用清单，作为后续静态守卫的基线：`RuntimeWorklineDetailResponse`、`worklineDetail(`、`loadDetail`、`refreshDetail`、`runtime-scene-model`。
- [ ] 不运行会改写 repo-tracked 文件的生成/格式化命令，直到进入对应任务。

验收：能明确列出后端 route/service/model/API test 影响面，以及前端 store/page/scene/tests 影响面。

### Task 1. 后端监控投影合同

- [ ] 在 `../wes_backend` 新增监控投影 DTO 族，使用 `RuntimeWorklineMonitorProjectionResponse` 作为 `GET /runtime/worklines/{workline_id}` 的业务 payload。
- [ ] 投影 DTO 不复用 `RuntimeTraceListItem`、`RuntimeDeviceSummary`、`RuntimeWorklineDeviceItem`、`RuntimeWorklineDetailResponse` 作为外部响应 DTO。
- [ ] 投影保留统一 envelope：`ResponseSchemaModel[RuntimeWorklineMonitorProjectionResponse]`；权限 `biz:workline:list` 和 `DEFAULT_NOT_FOUND` 失败语义不变。
- [ ] 在 `RuntimeQueryService` 内将旧详情聚合改造成 `get_workline_monitor_projection` 语义；复用已有 summary、boundary、blocked outbox、open command、runtime hold 查询能力。
- [ ] `active_sessions`、`recent_failed_traces`、`recent_completed_traces`、`resource_evidence` 均使用 capped section：`items`、真实 `total_count`、`truncated`。
- [ ] 新增 `action_candidates.pending_reconciliation`，作为行动舱对账核销的唯一主屏候选；该字段不得受 capped session/trace sections 截断影响，不复用 `TraceSessionItem`，不携带 raw payload。
- [ ] `generated_at` 使用 aware UTC ISO；不得对 naive datetime 调用 `.timestamp()`。
- [ ] 后端 runtime SSE 发射器统一输出 `domain: "workline_runtime"`、snake_case keys，并停止向前端 runtime 主屏依赖旧事件域。
- [ ] 建立 backend 侧 runtime SSE/event emitter 验收边界，覆盖 `defer_sse_event` 及 runtime 主屏刷新来源，证明旧 `workline_trace`、`workline_safety`、`device` 等旧域不会再作为主屏刷新合同输出。

验收：

- `uv run pytest tests/api/test_workline_runtime_api.py` 覆盖新投影 schema、not found、权限、raw `event_payload` 不泄漏、真实 `total_count/truncated`、pending reconciliation candidate 不被 capped sections 截断。
- `uv run pytest tests/api/test_workline_runtime_sse.py` 覆盖 runtime SSE canonical envelope、`domain: "workline_runtime"`、snake_case keys、旧主屏事件域不输出，以及安全、hold、reconciliation、device、session、outbox、command 等 entity/action 能被后端稳定表达；断线/高风险/普通刷新分类由前端 `runtime-event` 测试覆盖。
- OpenAPI schema 中 `RuntimeWorklineMonitorProjectionResponse` 不引用旧 detail/trace/device DTO。

### Task 2. OpenAPI 类型同步

- [ ] 启动或指定后端 OpenAPI 服务，确保前端 typegen 读取的是 Task 1 后的新合同。
- [ ] 在 `../wes_frontend` 运行 `pnpm generate:types` 和 `pnpm generate:zod`。
- [ ] `src/types/runtime.ts` 对监控投影只 re-export / alias `components["schemas"]["RuntimeWorklineMonitorProjectionResponse"]` 及其子类型；不得手写投影接口，不新增临时 fallback shape。Trace/Debug 既有手写类型不因本任务整体迁移，除非它们仍消费 `/runtime/worklines/{id}`。
- [ ] 如果生成结果仍包含 `/runtime/worklines/{id}` -> `RuntimeWorklineDetailResponse`，停止前端实施，回到 Task 1 修后端合同。
- [ ] 更新 fixed smoke fixture 和测试 fixture，使其使用 projection shape，不再伪造旧 detail shape。

验收：

- `pnpm contract:verify -- --require-backend` 通过。
- `rg "RuntimeWorklineMonitorProjectionResponse" src/api/generated src/types` 能定位到生成类型和受控 alias。
- `src/types/runtime.ts` 中不存在手写 `interface RuntimeWorklineMonitorProjectionResponse`。

### Task 3. 前端 API、Store 与事件语义收敛

- [ ] 将 `runtimeApiMethods.worklineDetail(worklineId)` 破坏性改名为 `worklineProjection(worklineId)`，并使用 OpenAPI 生成的 projection 类型。
- [ ] 将 `src/stores/workline-runtime.ts` 的主屏状态从 `detail` 改为 `projection` 或 `monitorProjection`，动作为 `loadProjection` / `refreshProjection` / `clearProjection`。
- [ ] 保留并迁移现有请求序列保护、coalesced refresh、loading/error 处理和派生查询能力；不得用极简 store 覆盖现有并发保护。
- [ ] 将 runtime event target / classifier 中的 `detail` 语义迁移为 `projection` 语义。
- [ ] `ALLOWED_RUNTIME_EVENT_DOMAINS` 只接受 canonical `workline_runtime`；普通事件合并刷新，高风险、断线重连、陈旧恢复立即刷新。
- [ ] 行动舱操作成功后刷新 projection 和必要列表摘要；失败时保留旧 projection，不乐观改写资源证据或货格状态。

验收：

- Store 单测覆盖乱序响应只保留最后一次 projection、合并刷新、刷新失败保留旧 projection、clear projection。
- `pnpm test -- runtime-event` 覆盖 canonical domain、旧域拒绝、scope key 匹配和刷新分类。

### Task 4. Scene Builder 单轨化

- [ ] 删除 `src/components/runtime/monitor/runtime-scene-model.ts`，不保留兼容 wrapper。
- [ ] 将 `src/utils/runtime-scene.ts` 的输入迁移为 `RuntimeWorklineMonitorProjectionResponse + WorkLinePluginManifestSummary`。
- [ ] 保留现有 scene model 能力：设备流、position groups、rack layouts、resource stacks、unlocated evidence、focus panel、截断提示和 Manifest 失败语义降级。
- [ ] Scene Builder 只读取 projection 的 `device_nodes`、capped session/trace sections、`boundary` 和 `resource_evidence`；不得读取旧 `detail.devices`、旧平铺 `resource_evidence_items`。
- [ ] Manifest 不可用时输出语义分组和诊断提示，不伪造完整物理拓扑。

验收：

- `pnpm test -- runtime-scene` 覆盖 Manifest 正常、Manifest 失败、资源证据、截断、未定位证据、空状态和旧字段拒绝。
- 删除旧 `runtimeSceneModel.test.ts` 或迁移有价值断言到 `tests/unit/utils/runtime-scene.test.ts`。

### Task 5. 页面与所有路由消费者迁移

- [ ] `WorklineMonitorPage.vue` 使用三栏主路径：左栏目录、中栏运行场景、右栏行动舱；不得退化为双栏或堆叠 dashboard cards。
- [ ] `WorklineLiveOverview`、`DecisionStrip`、`WorklineRuntimeHoldSummaryPanel`、`SessionBoard` 等主屏组件改为 projection/capped sections 输入。
- [ ] 将 `WorklineReconciliationPanel` 接入 `projection.action_candidates.pending_reconciliation`；候选为空时显示无可核销对象原因，候选存在时调用 `runtimeApiMethods.resolveRuntimeReconciliation`，成功后刷新 projection。
- [ ] `TraceExplorerPage.vue`、`SandboxWorkbenchPage.vue`、route sync tests 等所有 `GET /runtime/worklines/{id}` 消费者必须迁移：需要主屏上下文时使用 projection，需要 Trace/Session 详情时使用专用下钻 API。
- [ ] 主屏不从 `/runtime/devices`、`/traces/query`、`/sessions/{id}/path` 多源拼装事实；这些接口只服务设备页、Trace Explorer 或下钻视图。
- [ ] 行动舱只保留解除急停、对账核销、手动刷新；不展示维护旁路按钮、隐藏入口或 TODO。

验收：

- `WorklineMonitorPage` 单测覆盖投影加载、默认选中、手动刷新、刷新失败保留旧投影、clear-estop 成功/失败、reconciliation candidate 为空、resolve 成功/失败/权限不足路径。
- sandbox、trace、route sync 相关测试不再 mock `worklineDetail` 或 `loadDetail` 作为该路由主屏入口。

### Task 6. UI 状态、响应式与可访问性

- [ ] 桌面端实现目录 -> 场景 -> 行动三栏结构；任一时刻只允许一个最高风险状态成为主视觉。
- [ ] 覆盖工作线目录、监控投影、Manifest/场景、行动舱、日志与证据的 loading、empty、error、success、partial/stale 状态。
- [ ] 资源证据和 capped section 显示 `items.length / total_count` 与截断提示；不得让用户误以为 capped 列表是完整列表。
- [ ] `< 768px` 使用“线体 / 场景 / 行动”分段切换；`< 480px` 只保留线体状态、最高风险对象、可执行动作和刷新/断线状态。
- [ ] 页面语义区使用 `main`、`aside`、`section` 和可读 label；目录项、场景节点、行动按钮均支持键盘焦点。
- [ ] 危险、警告、成功状态不得只靠颜色表达；必须有文本、图标或状态徽标；关键刷新失败、SSE 断线、动作成功/失败可被读屏感知。
- [ ] 尊重 `prefers-reduced-motion`，危险提醒只能短促提示，不能无限循环制造噪音。

验收：

- 页面测试或 smoke 覆盖 loading/empty/error/stale、截断提示、移动视口、键盘焦点和非纯颜色状态信号。
- `pnpm smoke:runtime:agent-browser` 覆盖桌面与移动视口，并检查 scene selectors、行动舱、证据列表、断线提示和 overflow/overlap。

### Task 7. 静态守卫、契约验证与最终回归

- [ ] 所有静态守卫按“零匹配即通过”执行；`rg` 无匹配返回 1 是预期成功，任何正向命中都必须先解释并收敛范围，不能作为 warning 放过。
- [ ] 前端静态守卫分两类执行，避免 generic `loadDetail/refreshDetail` 误报：
  - `! rg "RuntimeWorklineDetailResponse|runtime-scene-model|worklineDetail\\(" src/views/runtime src/stores src/utils src/components/runtime tests/unit`
  - `! rg "loadDetail|refreshDetail" src/stores/workline-runtime.ts src/views/runtime/worklines tests/unit/stores tests/unit/views/runtime`
- [ ] 后端 runtime SSE 静态守卫限定在主屏事件发射路径，必须零匹配旧主屏事件域：
  - `! rg '"domain": "(workline_trace|workline|device|outbox|command|workline_safety|safety)"' ../wes_backend/src/app/device/services ../wes_backend/src/app/callback/services ../wes_backend/src/app/workline/services ../wes_backend/src/celery_app/tasks/workline.py`
- [ ] 如果需要把守卫固化到 `package.json` 或后端脚本，脚本必须保留“零匹配即通过”的退出语义，并复用上述拆分范围；不得用单条过宽命令误伤设备详情、Trace 下钻或合法非主屏函数。
- [ ] 后端提交前运行 GitNexus detect changes，确认变更范围符合预期。
- [ ] 前端最终验证按顺序执行：`pnpm generate:types`、`pnpm generate:zod`、`pnpm contract:verify -- --require-backend`、`pnpm type:check`、`pnpm test -- runtime-event`、`pnpm test -- runtime-scene`、`pnpm test -- WorklineMonitorPage`、`pnpm smoke:runtime:agent-browser`。
- [ ] 如果任一验证失败，按 systematic debugging 回到根因调查，不叠加猜测式修复。

验收：后端、前端、contract、unit、smoke 全部通过；静态守卫无正向引用。

---

## 执行顺序

```text
Backend impact analysis
  -> Backend projection DTO / service / route / tests
  -> Backend canonical runtime SSE
  -> Frontend OpenAPI typegen / Zod / contract verify
  -> Frontend API adapter + Store + runtime event naming
  -> Scene Builder single-track migration
  -> WorklineMonitorPage + all route consumers
  -> UI states / responsive / accessibility
  -> Static guards / unit tests / smoke
```

该任务组不建议拆成长期并行分支。后端合同先落地后，前端 Store、Scene、Page 可以短并行推进，但合并前必须以同一份 OpenAPI 类型和同一组 contract tests 对齐。

---

## 验收标准

- `/runtime/worklines/{id}` 的 OpenAPI 响应 payload 是 `RuntimeWorklineMonitorProjectionResponse`，不是 `RuntimeWorklineDetailResponse`。
- 主屏投影不含 raw `event_payload`、设备详情 callback/command 明细或 Manifest 可提供的静态拓扑。
- `total_count/items/truncated` 对 active sessions、recent failed/completed traces、resource evidence 语义一致。
- `action_candidates.pending_reconciliation` 是行动舱对账核销入口，不依赖 capped session/trace sections 是否包含 owner session。
- 前端所有该路由消费者使用 projection 生成类型，不手写投影 shape，不保留 `detail/loadDetail/refreshDetail` 主屏别名。
- Runtime SSE 只接受 `workline_runtime`，旧域不再驱动主屏刷新。
- `src/utils/runtime-scene.ts` 是唯一 scene builder，旧 `runtime-scene-model.ts` 删除。
- UI 保持三栏监控路径，移动端使用分段视图，危险/警告/成功不只靠颜色表达。
- fixed smoke fixture 使用 projection shape。

---

## 风险与处理

| 风险                             | 影响                                             | 处理                                                                                                                        |
| -------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| 后端合同未先落地                 | 前端 typegen 仍生成旧 detail，后续任务全部漂移   | 停止前端任务，先完成 Task 1，再重新生成类型                                                                                 |
| 手写 projection 类型绕过 OpenAPI | 合同漂移，contract verify 失效                   | 禁止手写监控投影接口；`src/types/runtime.ts` 对 projection 只 alias generated types，Trace/Debug 既有类型按实际消费范围处理 |
| 对账候选被 capped 列表截断       | 行动舱没有核销入口，现场无法闭环                 | `action_candidates.pending_reconciliation` 独立于 capped sections，并用后端/API/页面测试覆盖                                |
| Store 简化导致并发回退           | 高频刷新下旧响应覆盖新状态                       | 保留 request sequence 和 coalesced refresh，并用单测覆盖                                                                    |
| Scene Builder 重写过度           | 丢失资源证据、rack layout、focus panel、截断提示 | 只迁移输入合同，保留现有 scene model 输出能力                                                                               |
| 静态守卫过宽                     | 误伤设备详情本地 `loadDetail` 等合法函数         | 拆分 DTO/路由守卫与主屏命名守卫，限定扫描范围                                                                               |
| 移动端压缩完整拓扑               | 现场巡检不可读                                   | 移动端使用分段视图或语义列表，不强行展示完整 SCADA                                                                          |
| 旧 SSE 域残留                    | 页面不刷新或重复刷新                             | 后端 canonical envelope + 前端 allowed domain / classifier 同步测试                                                         |

---

## 不在本计划

- 不新增 `/topology`、`/states`、`/monitor-snapshot` 平行接口。
- 不做 runtime event replay；仅保留为 P3 后续。
- 不做 ECS/WMS 物理占用真值模型；货格只表达资源证据和运行投影。
- 不新增维护旁路按钮、隐藏入口或 TODO。
- 不建立新的设计系统、主题色、字体体系或 3D/VR 监控场景。

---

## GSTACK REVIEW REPORT

| Review        | Trigger                 | Why                              | Runs | Status | Findings                                                                                                     |
| ------------- | ----------------------- | -------------------------------- | ---- | ------ | ------------------------------------------------------------------------------------------------------------ |
| Readiness Fix | `$systematic-debugging` | 修复实施前评审发现的文档门禁缺口 | 1    | CLEAR  | 已补齐行动舱 pending reconciliation 候选、`src/types/runtime.ts` 迁移范围、backend/frontend SSE 测试职责拆分 |

- **UNRESOLVED:** 0.
- **VERDICT:** 文档门禁已更新；可进入 Task 0，但实施前仍需按计划确认前后端工作区状态和后端 GitNexus impact analysis。
