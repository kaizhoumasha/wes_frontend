<!-- /autoplan restore point: /Users/kaizhou/.gstack/projects/kaizhoumasha-wes_frontend/workline-sandbox-runtime-flow-autoplan-restore-20260506-180452.md -->

# WorkLine 急停前端跟进实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让运行监控前端准确呈现 WorkLine 软件侧急停冻结、事故审计和 clear-estop 恢复动作。

**Architecture:** 前端不再把 `ESTOP_PRESSED` 当作 sandbox/plugin 普通业务事件入口，而是围绕 WorkLine safety projection 驱动页面状态。数据来源以运行态 summary/detail、safety incident API 和 SSE 刷新为单一事实来源；clear-estop 是独立权限动作，提交结构化恢复检查后刷新工作线详情。

**Tech Stack:** Vue 3, TypeScript, Pinia, alova contractMethods, Element Plus, Vitest, OpenAPI typegen

---

## 当前契约差异

- 后端计划目标路径是：
  - `GET /worklines/{workline_id}/safety/incidents/active`
  - `GET /workline-safety-incidents`
  - `GET /workline-safety-incidents/{incident_id}`
  - `POST /worklines/{workline_id}/clear-estop`
- 当前前端生成的 `src/api/modules/workline.ts` 尚无上述 endpoint。
- 当前后端代码里仍有临时路径 `/api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop`，权限仍是 `biz:workline:update`，不符合计划中的 `biz:workline:clear-estop`。
- 前端应等待后端 OpenAPI 合同落到计划目标后再生成类型；不要接入临时路径。

## 前端原则

- `runtime_status === "ESTOPPED"` 是最高优先级运行结论，高于失败、离线、等待等普通风险评分。
- 急停冻结只表示 WES 软件侧阻断；UI 文案不得暗示 PLC/设备物理急停已由 WES 控制。
- clear-estop 只恢复新流程接收能力；UI 不得提供“恢复旧 session/outbox/command”的暗示。
- 用户可见文案不直接使用 `clear-estop` 作为主动作，统一显示“解除软件冻结 / 恢复接收”。
- `ESTOP_PRESSED` 是平台保留安全事件，不再作为 sandbox/plugin 普通业务事件入口。
- WorkLine 处于急停冻结时，所有会推进流程的前端入口必须禁用或只读化；只允许查看证据、刷新、查看审计和执行有权限的“解除软件冻结 / 恢复接收”。
- 无权限用户仍能看到恢复要求、事故证据和所需权限，但不能看到可点击提交动作。

## 文件职责

### Modify

- `src/types/runtime.ts`：增加 WorkLine safety projection、incident summary/detail、clear-estop request/response 类型。
- `src/api/modules/runtime.ts`：封装 active incident、incident detail/list、clear-estop 方法，继续由 `worklineApiMethods` 或 `contractMethods` 适配。
- `src/stores/workline-runtime.ts`：维护 selected WorkLine 的 active incident、loading/submitting 状态，以及 clear-estop 后的刷新。
- `src/utils/runtime-display.ts`：保留普通显示 helper，但急停判定必须委托给统一 safety verdict builder。
- `src/utils/runtime-safety.ts`：统一输出 `getWorklineRuntimeVerdict(summary, activeIncident, evidenceState)` 和 `isWorklineSafetyLocked()`。
- `src/constants/runtime-safety.ts`：集中定义 `RESERVED_SAFETY_EVENT_TYPES`、恢复检查项 key、stale 阈值。
- `src/views/runtime/worklines/WorklineRuntimePage.vue`：移除旧 emergency-stop 私有 EventSource/触发按钮，改为 incident-first 安全状态渲染。
- `src/components/common/runtime/WorklineLiveOverview.vue` / `DecisionStrip.vue`：从统一 verdict 读取 tone、label、suggestion，急停时输出“先现场复核，再解除软件冻结 / 恢复接收”。
- `src/components/common/runtime/SandboxWorkbench.vue`、`SandboxEventComposer.vue`、`SandboxActionList.vue`、`SandboxPendingQueue.vue`、`SandboxResultComposer.vue`：接入 `safetyLocked`，急停冻结时所有推进入口禁用或只读。
- `src/composables/useRuntimeSSE.ts` 和 `src/utils/runtime-event.ts`：明确支持 safety domain 事件，不再只接受 `workline_trace`。
- `src/api/generated/permissions/user_api/biz/workline.ts`：通过 `pnpm generate:permissions` 生成 `clearEstop` 权限常量。
- 删除或下线旧的 `src/api/modules/workline-emergency-stop.ts`、`src/stores/worklineEmergencyStop.ts`、`EmergencyStopDialog.vue`、`EmergencyStopOverlay.vue` 引用；若保留文件，必须不再被运行态页面引用。

### Create

- `src/components/common/runtime/WorklineSafetyIncidentPanel.vue`：显示 active incident 摘要、drain 证据、远端未知命令提示和 clear-estop 入口。
- `src/components/common/runtime/WorklineClearEstopDialog.vue`：结构化恢复检查表单，提交 clear-estop。
- `src/components/common/runtime/WorklineSafetyAuditDrawer.vue`：最小事故历史/恢复尝试入口，展示 incident id、触发时间、恢复尝试、拒绝原因、操作者和时间线。
- `tests/unit/runtime/worklineSafetyDisplay.test.ts`：覆盖 `ESTOPPED` 风险标签和 tone。
- `tests/unit/views/runtime/worklineSafetyIncident.test.ts`：覆盖急停面板、权限、clear-estop 提交流程。
- `tests/unit/components/runtime/sandboxSafetyLock.test.ts`：覆盖急停冻结时 sandbox event、ACK、Result、retry、manual/replay 等推进入口不可用。

## 实施任务

### Task 0. 删除旧前端急停触发流

- [x] 从 `WorklineRuntimePage.vue` 移除旧“紧急停止”触发按钮、确认 dialog、footer 危险按钮和页面私有 emergency-stop EventSource。
- [x] 下线 `useWorklineEmergencyStopStore()` 在运行态页面和 sandbox workbench 中的使用。
- [x] 删除或迁移 `workline-emergency-stop` API module、旧 `EmergencyStopDialog.vue`、`EmergencyStopOverlay.vue`，避免前端继续呈现“发起/确认急停”的能力。
- [ ] 若产品仍需要“发起软件急停”，必须另开后端最终契约、权限和 UI 计划，不混入本次 clear-estop 跟进。

状态同步 2026-06-08：`src` / `tests` 未发现 `worklineEmergencyStop`、`workline-emergency-stop`、`EmergencyStop`、`useWorklineEmergencyStopStore` 的运行态实现引用，仅剩 menu manifest 测试中的历史组件字符串。

验证：

```bash
rtk rg -n "worklineEmergencyStop|workline-emergency-stop|emergency-stop|EmergencyStop" src
rtk pnpm type:check
```

### Task 1. 契约生成与类型收口

- [x] 等后端 OpenAPI 暴露最终 safety/incident/clear-estop endpoint。
- [ ] 用脚本或 `jq` 做契约硬门禁：最终 path 存在、临时 `/operations/safety/.../clear-estop` 不进入前端生成物、clear-estop 权限是 `biz:workline:clear-estop`。
- [x] 运行 `pnpm generate:types` 和 `pnpm generate:permissions`。
- [x] 在 `src/types/runtime.ts` 增加稳定业务类型别名，不在组件里直接散落 generated schema。
- [x] 确认 `BIZ_PERMISSIONS.workline.clearEstop` 存在，且值为 `biz:workline:clear-estop`。
- [ ] 契约门禁必须包含 safety SSE：`domain`、`entity`、`action`、`keys`、样例 payload、刷新策略和错误 envelope。
- [ ] 契约门禁必须包含 incident 状态枚举、clear-estop request/response、`ESTOP_RECOVERY_REJECTED` 的 `failed_checks` / `required_actions` 结构。
- [ ] 写明期望生成入口：优先由生成器产出 `worklineApiMethods.clearEstop` / incident 方法；不得在 `contractMethods` 中手写第二套临时路径。

状态同步 2026-06-08：generated OpenAPI / permissions 已包含 `clear-estop`、`RuntimeWorklineSummary.runtime_status`、`active_safety_incident_id`、`failed_checks`、`required_actions` 和 `biz:workline:clear-estop`。仍保留未完成项：没有发现专用契约门禁脚本；`runtimeApiMethods.clearEstop()` 仍手写 `/operations/safety/.../clear-estop`，未改用 generated `worklineApiMethods.safetyWorklinesClearEstop()`。

SSE 样例门禁：

```json
{
  "domain": "workline_safety",
  "entity": "workline",
  "action": "estop.activated",
  "keys": { "workline_id": 12, "incident_id": 3401 },
  "payload": { "runtime_status": "ESTOPPED", "stopped_at": "2026-05-06T09:31:00Z" }
}
```

```json
{
  "domain": "workline_safety",
  "entity": "incident",
  "action": "incident.cleared",
  "keys": { "workline_id": 12, "incident_id": 3401 },
  "payload": { "runtime_status": "RUNNING", "resumed_at": "2026-05-06T09:45:00Z" }
}
```

```json
{
  "domain": "workline_safety",
  "entity": "incident",
  "action": "estop.recovery_rejected",
  "keys": { "workline_id": 12, "incident_id": 3401 },
  "payload": {
    "failed_checks": ["drain_completed_or_reviewed"],
    "required_actions": ["确认远端未知命令已排空或人工复核"]
  }
}
```

错误 envelope 门禁：

```json
{
  "code": "ESTOP_RECOVERY_REJECTED",
  "message": "WorkLine safety evidence is not ready for recovery",
  "data": {
    "incident_id": 3401,
    "failed_checks": ["drain_completed_or_reviewed"],
    "required_actions": ["确认远端未知命令已排空或人工复核"]
  }
}
```

验证：

```bash
rtk pnpm contract:verify
rtk pnpm permission:verify -- --require-backend
rtk pnpm generate:types
rtk pnpm generate:permissions
rtk rg -n "clearEstop|biz:workline:clear-estop" src/api/generated src/api/modules
rtk rg -n "/operations/safety/.*/clear-estop|biz:workline:update" src/api/generated src/api/modules
rtk pnpm type:check
```

### Task 2. 运行态显示优先级

- [x] 在 `RuntimeWorklineSummary` 增加 `runtime_status`、`active_safety_incident_id`、`stopped_at`、`stopped_reason`、`resumed_at` 等字段。
- [x] 新增 `getWorklineRuntimeVerdict(summary, activeIncident, evidenceState)`，统一返回 `tone`、`label`、`priority`、`safetyLocked`、`canAttemptClear`、`blockedReason`、`evidenceFreshness`。
- [x] 明确状态机：`UNLOCKED -> LOCKED_LOADING_EVIDENCE -> LOCKED_READY -> CLEARING -> CLEAR_UNKNOWN/CLEAR_REJECTED/CLEARED`。
- [x] 判定优先级：active incident 存在或 `runtime_status === "ESTOPPED"` 任一成立即进入 `软件急停冻结`；incident 加载失败或证据过期时保持冻结并禁用恢复动作。
- [ ] evidence freshness 使用 store 内 `incidentLastLoadedAt = Date.now()`；不得复用 DOM `MessageEvent.timeStamp` 判断安全证据时效。
- [x] WorkLine 列表、详情顶部 safety panel、`DecisionStrip` 和所有禁用逻辑都只读统一 verdict；不得在组件内重新计算急停 tone/label。
- [ ] `WorklineHealthHero` 当前不是运行页必经组件；执行时要么在 `WorklineLiveOverview` 中挂载并使用 verdict，要么从本计划移除该组件改造项，避免改未使用组件。

状态同步 2026-06-08：`src/utils/runtime-safety.ts`、`src/utils/runtime-display.ts`、`DecisionStrip.vue`、`WorklineMonitorPage.vue` 和 `SandboxWorkbenchPage.vue` 已接入统一 verdict；相关 `worklineSafetyDisplay` 测试通过。仍未发现 `incidentLastLoadedAt` store 状态，`WorklineHealthHero` 也未挂载到运行页主路径。

验证：

```bash
rtk pnpm test tests/unit/runtime/worklineSafetyDisplay.test.ts
rtk pnpm test tests/unit/runtime/runtimeSafetyStateMachine.test.ts
rtk pnpm type:check
```

### Task 3. Active incident 查询与展示

- [ ] 在 `runtimeApiMethods` 增加 `activeSafetyIncident(worklineId)`。
- [ ] 在 `workline-runtime` store 中随 `loadDetail(worklineId)` 加载 active incident，并维护 `incidentLoading`、`incidentLoadError`、`incidentLastLoadedAt`、`safetyEvidenceStale`。
- [ ] 新增 `WorklineSafetyIncidentPanel.vue`，作为工作线详情的 incident-first 顶部状态，不是普通信息卡；展示 incident id、状态、停止时间、drain status、远端未知命令、最后刷新时间和操作区。
- [ ] 面板必须覆盖 loading、error、empty-but-estopped、summary/incident conflict、SSE reconnecting/stale 等状态；安全证据缺失或过期时禁用“解除软件冻结 / 恢复接收”。
- [ ] 新增最小 `WorklineSafetyAuditDrawer.vue`，从 incident list/detail 展示最近事故和恢复尝试；active 面板只负责当前状态，审计 drawer 负责追溯。
- [x] 新增 `isRuntimeDomainAllowed()` 和 `classifyRuntimeRefresh(event)`；SSE 收到 workline/device/outbox/command/safety 相关事件时刷新当前 detail 与 active incident。
- [ ] clear-estop 成功后若 SSE 未及时到达，使用一次短轮询 fallback；刷新目标至少包含 worklines、detail、active incident。

状态同步 2026-06-08：`WorklineSafetyIncidentPanel.vue` 已存在，但当前仅基于 summary/verdict 展示基础信息，未达到 active incident 查询、drain/remote unknown/最后刷新时间、audit drawer 和短轮询 fallback 的完整要求。`isRuntimeDomainAllowed()` / `classifyRuntimeRefresh()` 已存在并有 `runtime-event` 单测。

验证：

```bash
rtk pnpm test tests/unit/views/runtime/worklineSafetyIncident.test.ts
rtk pnpm test tests/unit/utils/runtime-event.test.ts
rtk pnpm type:check
```

### Task 4. Clear-estop 权限动作

- [ ] 新增 `WorklineClearEstopDialog.vue`。
- [ ] 用户可见 title 和主按钮统一为“解除软件冻结 / 恢复接收”；对话框常驻边界文案：“仅解除 WES 软件阻断，不代表 PLC/设备物理急停已复位”。
- [ ] 表单固定最小检查项：现场操作员已声明物理急停状态、`devices_inspected`、`remote_unknown_commands_acknowledged`、`drain_completed_or_reviewed`、`line_clear_confirmed`；所有检查项默认未勾选。
- [ ] 提交体包含 `clear_reason`、`checks`、`device_confirmations`、`operator_note`、`confirmed_at`；不提交 `cleared_by`。
- [ ] 只有 `BIZ_PERMISSIONS.workline.clearEstop` 通过、active incident 已加载、证据未过期且所有检查项完成时才允许提交；否则展示只读恢复要求和禁用原因。
- [ ] 处理重复提交：提交中禁用按钮，禁止重复 request；请求结果未知时显示“恢复结果未确认”，引导刷新。
- [ ] 成功后关闭对话框，刷新 worklines、detail、active incident，并提示“已恢复新流程接收，旧 session/outbox/command 不会恢复”。
- [ ] `ESTOP_RECOVERY_REJECTED` 时显示 `failed_checks` 和 `required_actions`。

状态同步 2026-06-08：当前只有 `ElMessageBox.confirm` 简化确认和 summary/verdict 驱动的 panel 操作，没有发现 `WorklineClearEstopDialog.vue`、结构化 checklist 表单、`device_confirmations`、`operator_note`、`confirmed_at`、`ESTOP_RECOVERY_REJECTED` UI 展示或 active incident 刷新闭环，本任务保持未完成。

验证：

```bash
rtk pnpm test tests/unit/views/runtime/worklineSafetyIncident.test.ts
rtk pnpm type:check
```

### Task 5. Sandbox 急停态全推进入口只读化

- [x] 从 `SandboxEventComposer` 快捷模板中过滤 `ESTOP_PRESSED`。
- [x] 如果用户手动输入 `ESTOP_PRESSED`，显示平台保留安全事件提示，阻止普通 sandbox submit。
- [x] 在 `SandboxWorkbench` 顶层接入 `safetyLocked`，向 event composer、action list、pending queue、result composer、manual session、replay inbox 传递禁用状态和统一原因。
- [x] 禁用所有会推进流程的动作：sandbox event、ACK、Result、trigger orchestration、retry、manual session、replay；只保留查看、刷新、打开 incident/audit。
- [ ] 文案指向 incident/runtime API，不提示插件 handler；后端 sandbox 模板/API 也应拒绝平台保留安全事件，前端只做第一层防护。

状态同步 2026-06-08：`SandboxEventComposer.vue`、`SandboxWorkbenchPage.vue`、`SandboxExternalCallbackComposer.vue`、`SandboxResultComposer.vue` 已接入 safety lock；`sandboxSafetyLock` 和 `runtime-event` 单测通过。后端拒绝平台保留安全事件未在前端计划内验证，最后一项保持未完成。

验证：

```bash
rtk pnpm test tests/unit/components/runtime/sandboxSafetyLock.test.ts
rtk pnpm test tests/unit/views/runtime/worklineSafetyIncident.test.ts
rtk pnpm lint
```

## 最终验证

```bash
rtk pnpm contract:verify
rtk pnpm permission:verify -- --require-backend
rtk pnpm test tests/unit/runtime/worklineSafetyDisplay.test.ts
rtk pnpm test tests/unit/runtime/runtimeSafetyStateMachine.test.ts
rtk pnpm test tests/unit/utils/runtime-event.test.ts
rtk pnpm test tests/unit/views/runtime/worklineSafetyIncident.test.ts
rtk pnpm test tests/unit/components/runtime/sandboxSafetyLock.test.ts
rtk pnpm lint
rtk pnpm type:check
```

浏览器联调：使用 `admin` / `admin123` 登录，验证 ESTOPPED 面板、无权限态、SSE stale、恢复被拒绝、恢复成功后的短轮询 fallback。若误对临时后端运行了生成，回滚 `src/api/generated`、`src/api/modules`、`.permission-sync-record`、`.contract-sync-record` 的生成 diff 后，用正确 OpenAPI 重新生成。

## 验收标准

- 急停工作线在列表、详情 hero、决策条中都显示为最高优先级 danger。
- active incident 可查看，列表 API 只使用摘要，详情 API 只在需要时加载。
- “解除软件冻结 / 恢复接收”需要独立权限、结构化 checklist、现场声明、最后刷新时间和防重复提交。
- 成功后只刷新新流程接收状态，不展示旧工作恢复能力。
- 急停冻结时 sandbox 所有流程推进入口只读化，不只是过滤 `ESTOP_PRESSED`。
- incident 加载失败、SSE stale、summary/incident 冲突、无权限、恢复被拒绝、结果未知都有明确 UI 状态和禁用策略。
- 旧的前端“发起/确认急停”流不再被运行态页面引用。
- `pnpm lint`、相关 Vitest、契约校验通过。

---

## GSTACK AUTOPLAN REVIEW

### Phase 1: CEO Review

**Plan summary:** 该计划要把前端从“急停是普通 sandbox/plugin 事件”迁到“急停是 WorkLine 软件安全冻结状态”。方向正确，但当前计划仍偏 UI/API 接入清单，缺少安全态下所有可推进流程入口的冻结策略、SSE 契约门禁、事故历史审计入口和 clear-estop 语义防误解。

#### Premise Challenge

| Premise                                                                  | Verdict    | Reason                                                                                             |
| ------------------------------------------------------------------------ | ---------- | -------------------------------------------------------------------------------------------------- |
| 前端不接临时 `/operations/safety/.../clear-estop` 路径，等待最终 OpenAPI | Confirmed  | 临时路径仍用 `biz:workline:update`，会把安全恢复动作降级成普通更新权限。                           |
| `runtime_status === "ESTOPPED"` 是最高优先级运行结论                     | Confirmed  | 急停冻结是 WorkLine 级安全状态，必须压过失败、离线、等待等普通风险。                               |
| 只过滤 `ESTOP_PRESSED` 模板就能完成 sandbox 迁移                         | Rejected   | 这只能防止普通点击，不能阻止 ACK、Result、manual/replay 等其他 UI 入口继续制造安全误导。           |
| active incident 展示足以覆盖事故审计                                     | Rejected   | 计划目标写了“事故审计”，但现有任务主要是当前 active 面板，缺少历史/恢复尝试/拒绝原因追溯入口。     |
| safety SSE 可以按现有 runtime SSE 机制自然接入                           | Risky      | 现有 `useRuntimeSSE` 过滤非 `workline_trace` domain；计划未定义 safety domain/entity/action/keys。 |
| clear-estop 文案只要说明“不复活旧工作”即可                               | Incomplete | 还必须防止操作员把它理解成物理急停释放或设备安全确认。                                             |

#### What Already Exists

| Sub-problem               | Existing leverage                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 工作线列表风险排序与标签  | `src/utils/runtime-display.ts` 的 `getWorklineRiskScore/Tone/Label`。                                        |
| 工作线详情刷新与 SSE 联动 | `src/views/runtime/worklines/WorklineRuntimePage.vue` 的 `lastEvent` watch 和 `isRelevantRuntimeEvent()`。   |
| 运行态 store              | `src/stores/workline-runtime.ts` 已集中维护 `worklines/detail/loading`。                                     |
| sandbox 事件输入          | `src/components/common/runtime/SandboxEventComposer.vue` 已有模板加载、手动选择和 submit 流程。              |
| 权限检查                  | `usePermission()` + `BIZ_PERMISSIONS` 已支持按钮级权限控制。                                                 |
| 运行态视觉组件            | `DecisionStrip.vue`、`RuntimeStatusBadge.vue`、`WorklineHealthHero.vue` 可复用，但当前 tone/label 逻辑分散。 |

#### Dream State Delta

```text
CURRENT
  ESTOP 不在前端类型中
  普通风险模型只看失败/离线/等待
  sandbox 仍可发送普通事件、ACK、Result
  SSE 只接受 workline_trace

THIS PLAN
  ESTOPPED 进入运行态显示
  active incident 面板 + clear-estop dialog
  ESTOP_PRESSED 不再作为普通 sandbox event
  权限从 update 收敛到 clear-estop

12-MONTH IDEAL
  Safety incident 是一等对象
  工作线详情、事故历史、恢复动作共享同一 safety verdict builder
  急停态下所有推进流程入口只读化
  SSE/轮询/刷新失败都有明确安全降级
  审计可回放每次恢复尝试和拒绝原因
```

#### CEO Dual Voices

| Dimension                    | Claude subagent                          | Codex                                    | Consensus          |
| ---------------------------- | ---------------------------------------- | ---------------------------------------- | ------------------ |
| Premises valid?              | 部分成立，sandbox 冻结和 SSE 前提不足    | 部分成立，contract/SSE 前提不足          | CONFIRMED concern  |
| Right problem to solve?      | 是，但核心是防止软件/物理/旧工作语义混淆 | 是，但计划过于实现清单化                 | CONFIRMED          |
| Scope calibration correct?   | 需要扩大到所有流程推进入口               | 需要增加审计历史和 degraded states       | CONFIRMED gap      |
| Alternatives explored?       | 需要 incident-first 复用策略             | 建议 incident-first UI                   | CONFIRMED gap      |
| Product/safety risk covered? | 安全认知不足                             | clear-estop 易被误读成物理安全 clearance | CONFIRMED critical |
| 6-month trajectory sound?    | 若只做 active 面板会留下旁路和审计债     | 若事故历史不一等化会返工                 | CONFIRMED concern  |

#### Error & Rescue Registry

| Error path                                         | User impact                                | Rescue                                                      |
| -------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| `ESTOPPED` summary 存在但 active incident 加载失败 | 页面可能只显示普通阻塞，操作员缺少事故证据 | 显示“安全证据未加载”，禁止 clear-estop，提供刷新。          |
| active incident 存在但 summary 未显示 `ESTOPPED`   | 状态冲突导致列表/详情认知不一致            | 任一可信来源显示 active incident 即进入冻结态。             |
| safety SSE 被 domain 过滤                          | 急停后 UI 不刷新，操作员看到旧状态         | 明确 safety SSE 契约并扩展 `useRuntimeSSE`。                |
| clear-estop 被误解成物理复位                       | 操作员可能错误认为设备已安全               | UI 改称“解除软件冻结/恢复接收”，持久显示 WES 边界。         |
| sandbox 急停态仍能发送 ACK/Result/Event            | UI 显示冻结但仍允许流程推进                | 急停态下所有推进入口只读化，只允许查看、刷新、clear-estop。 |

#### Failure Modes Registry

| Failure mode                                              | Severity | Plan change required                                              |
| --------------------------------------------------------- | -------: | ----------------------------------------------------------------- |
| 安全态旁路：sandbox/manual/replay/result 入口仍可推进流程 | Critical | 增加 WorkLine ESTOPPED 下全入口只读/禁用任务和测试。              |
| clear-estop 文案误导物理安全                              | Critical | 增加强制文案、二次确认、最后刷新时间和不可默认勾选 checklist。    |
| safety SSE 契约缺失                                       |     High | Task 1 增加 domain/entity/action/keys/sample payload 合同门禁。   |
| incident 审计只做 active 面板                             |     High | 增加 recent/history 入口或 drawer，至少可追溯恢复尝试和拒绝。     |
| tone/label 多处重复导致状态分裂                           |     High | 增加单一 `getWorklineRuntimeVerdict(summary, incident)` builder。 |
| `runtime_status` 与 incident 冲突无规则                   |     High | 定义安全态判定优先级和加载失败降级。                              |

#### NOT In Scope

- 不实现后端 safety 状态机、clear-estop 权限或 incident 数据脱敏。
- 不控制 PLC 或设备物理急停。
- 不实现完整运营安全大屏；本计划只要求当前运行态可见、可恢复、可追溯。
- 不接后端临时 clear-estop 路径。

#### CEO Auto-Decisions

| #     | Decision                                       | Classification | Principle            | Rationale                                        | Rejected                             |
| ----- | ---------------------------------------------- | -------------- | -------------------- | ------------------------------------------------ | ------------------------------------ |
| CEO-1 | 等待最终 OpenAPI，不接临时路径                 | Mechanical     | Explicit over clever | 安全权限边界必须由最终契约驱动。                 | 接 `/operations/safety/...` 临时路径 |
| CEO-2 | 扩大 sandbox 迁移为急停态全推进入口只读化      | Mechanical     | Choose completeness  | 只过滤 ESTOP_PRESSED 仍留 UI 旁路。              | 只拦截 ESTOP_PRESSED                 |
| CEO-3 | 增加 safety SSE 合同门禁                       | Mechanical     | Bias toward action   | 现有 SSE domain filter 会直接影响刷新可靠性。    | 实现时再发现                         |
| CEO-4 | 增加 incident history/recent audit 入口        | Taste          | Boil lakes           | 在当前 blast radius 内，能避免审计能力后续返工。 | 只做 active incident 面板            |
| CEO-5 | clear-estop UI 命名改为“解除软件冻结/恢复接收” | Mechanical     | Explicit over clever | 降低物理安全误读风险。                           | 沿用 clear-estop 作为用户可见主文案  |

#### CEO Completion Summary

| Section                   | Result                                                                              |
| ------------------------- | ----------------------------------------------------------------------------------- |
| Mode selected             | SELECTIVE EXPANSION                                                                 |
| Step 0                    | 核心方向成立；需要扩大安全态冻结范围和契约门禁。                                    |
| Section 1 (Arch)          | 3 issues: verdict builder、SSE contract、incident-first reuse。                     |
| Section 2 (Errors)        | 5 error paths mapped, 4 gaps.                                                       |
| Section 3 (Security)      | 2 high/critical: permission boundary, physical-safety wording.                      |
| Section 4 (Data/UX)       | 4 edge cases: status/incident mismatch, load failure, stale SSE, rejected recovery. |
| Section 5 (Quality)       | 1 DRY issue: tone/label duplicated across components.                               |
| Section 6 (Tests)         | 5 gaps: permissions, SSE, stale, rejected, duplicate submit.                        |
| Section 7 (Perf)          | No material performance issue; incident detail should load on demand.               |
| Section 8 (Observability) | Audit/history workflow incomplete.                                                  |
| Section 9 (Deploy)        | Contract sequencing risk: do not implement against temporary backend path.          |
| Section 10 (Future)       | Reversibility 3/5 unless incident-first UI and single verdict builder are added.    |
| Section 11 (Design)       | UI scope detected; Phase 2 required.                                                |

### Premises To Confirm

`/autoplan` requires human confirmation before the next phase because these premises define the problem boundary:

1. 前端继续坚持不接临时 clear-estop 路径，只等最终 OpenAPI 和 `biz:workline:clear-estop`。
2. 急停态下不仅过滤 `ESTOP_PRESSED`，还要禁用/只读化所有会推进流程的前端入口：sandbox event、ACK、Result、manual session、replay。
3. clear-estop 的用户可见主文案改成“解除软件冻结/恢复接收”，避免被理解成物理急停释放。
4. 增加 safety SSE 契约作为前置验收：domain、entity、action、keys、样例 payload、刷新策略。
5. 增加最小事故历史/审计入口，不只做 active incident 面板。

**Human confirmation:** 2026-05-06 用户已回复“确认”，上述前提进入后续设计、工程和 DX 审查。

### Phase 2: Design Review

**Design score:** 6/10 before revision, 8/10 if the task list above is applied. 当前计划方向正确，但原版把急停当作“详情顶部再加一个面板”，不足以表达安全级工作线冻结；设计上应改成 incident-first 的页面状态。

#### Design Findings

| Severity | Finding                                                                                          | Plan response                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Critical | 旧前端“发起/确认急停”流仍在运行页和 sandbox 中出现，容易让操作员误以为前端能发起或解除物理急停。 | 新增 Task 0，移除旧 `worklineEmergencyStop` store/API/dialog/overlay 的运行态引用。              |
| Critical | 原 Task 5 只过滤 `ESTOP_PRESSED`，但 ACK、Result、retry、manual/replay 仍可能推进流程。          | Task 5 改为“急停态全推进入口只读化”，由 `SandboxWorkbench` 顶层传递 `safetyLocked`。             |
| Critical | `clear-estop` 文案和检查项容易被理解成物理安全放行。                                             | Task 4 强制用户文案“解除软件冻结 / 恢复接收”，常驻边界说明，并要求默认未勾选 checklist。         |
| High     | 急停信息层级不应是普通卡片，应在详情首屏作为最高优先级状态。                                     | `WorklineSafetyIncidentPanel` 定义为 incident-first 顶部状态，普通 metrics 下沉为证据。          |
| High     | 缺少 degraded states：incident 加载失败、SSE stale、summary/incident 冲突、恢复结果未知。        | Task 2/3/4 增加 evidence state、stale 禁用、结果未知刷新策略。                                   |
| High     | 事故审计目标未形成用户旅程。                                                                     | 新增 `WorklineSafetyAuditDrawer.vue`，提供最近事故和恢复尝试入口。                               |
| High     | `WorklineHealthHero` 可能不是运行页实际渲染路径，改它不一定生效。                                | Task 2 要求执行时确认挂载路径；未挂载则改 `WorklineLiveOverview`/`DecisionStrip`，不改闲置组件。 |
| Medium   | 无权限体验不能只是隐藏按钮，否则用户不知道恢复路径。                                             | 无权限时保留只读动作区，显示所需权限和恢复要求。                                                 |
| Medium   | 安全状态不能只靠颜色、tooltip 或装饰图形。                                                       | 增加可访问性验收：文字 + 图标 + 语义色条、`aria-live`、焦点管理、44px 触控目标。                 |

#### Required UX State Matrix

| State                                                  | UI behavior                                                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `runtime_status === ESTOPPED` + active incident loaded | 顶部显示“软件急停冻结”，展示 incident id、停止时间、drain 证据、最后刷新时间；所有推进入口只读。 |
| active incident 存在但 summary 未 ESTOPPED             | 仍进入冻结态，面板提示“状态源不一致，已按安全优先处理”。                                         |
| summary ESTOPPED 但 incident 加载失败                  | 显示“安全证据未加载”，禁止恢复提交，提供刷新。                                                   |
| SSE 断开或证据过期                                     | 显示 stale/reconnecting，禁止恢复提交，允许手动刷新。                                            |
| 无 `biz:workline:clear-estop`                          | 显示恢复要求和所需权限，不显示可点击提交动作。                                                   |
| clear 请求提交中                                       | 禁用关闭外提交动作，防重复 request，保留取消/关闭策略按 Element Plus dialog 默认行为处理。       |
| `ESTOP_RECOVERY_REJECTED`                              | 在 dialog 内显示 failed checks、required actions 和最新证据刷新入口。                            |
| clear 请求成功但 active incident 仍存在                | 显示“恢复结果未确认”，触发 detail/incident 刷新和短轮询 fallback。                               |

#### Copy & Visual Decisions

- 状态文案：`软件急停冻结`。
- 主动作：`解除软件冻结 / 恢复接收`。
- 成功提示：`已恢复新流程接收，旧 session/outbox/command 不会恢复`。
- 边界说明：`仅解除 WES 软件阻断，不代表 PLC/设备物理急停已复位`。
- 急停状态使用 red/danger 语义色作为状态主色；amber 仅用于允许提交后的恢复动作。
- 面板采用语义色条和结构化证据，不使用 emoji、毛玻璃或装饰性动效作为主要信号。
- 移动端顺序必须是：安全状态、证据、恢复动作、普通运行细节；CTA 至少 44px 高且文本不溢出。

### Phase 3: Engineering Review

**Engineering verdict:** DONE_WITH_CONCERNS. 计划现在可执行，但必须把 safety lock 当成跨运行页的状态机和边界拦截，不允许只在组件按钮上做局部禁用。

#### Architecture Findings

| Severity | Finding                                                                                                 | Required change                                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Critical | 急停锁定如果只在 `SandboxEventComposer` 过滤事件，`SandboxWorkbench` 仍能触发编排、ACK、Result、Retry。 | `safetyLocked` 从 `workline-runtime` store/verdict 传到 `WorklineRuntimePage -> SandboxWorkbench -> ActionList/Event/Result`，且所有 handler 层先检查并 return。    |
| Critical | incident 加载失败、证据过期、summary/incident 冲突时不能回落为普通运行态。                              | 明确 `UNLOCKED -> LOCKED_LOADING_EVIDENCE -> LOCKED_READY -> CLEARING -> CLEAR_UNKNOWN/CLEAR_REJECTED/CLEARED` 状态机；任何安全证据异常都保持 `safetyLocked=true`。 |
| High     | 当前 SSE 过滤非 `workline_trace` domain，safety domain 会被丢弃。                                       | 增加 `isRuntimeDomainAllowed()` 和 `classifyRuntimeRefresh(event)`，集中定义 workline/device/outbox/command/safety 的刷新目标。                                     |
| High     | DOM `MessageEvent.timeStamp` 不能作为安全证据 freshness。                                               | 使用 store 写入的 `incidentLastLoadedAt = Date.now()` 判断 active incident 证据时效。                                                                               |
| High     | OpenAPI/权限合同未落地是硬阻塞。                                                                        | 不手写临时方法；等最终 path、schema、权限、SSE payload、错误 envelope 进 OpenAPI 后生成。                                                                           |
| Medium   | risk/tone/label 逻辑分散在 `runtime-display`、`DecisionStrip`、`WorklineHealthHero`。                   | `getWorklineRuntimeVerdict()` 成为唯一事实来源，旧 helper 只保留普通指标能力。                                                                                      |
| Medium   | Task 5 验证必须覆盖真实 sandbox 锁定。                                                                  | 增加并运行 `sandboxSafetyLock.test.ts`，覆盖 button disabled 和 handler return。                                                                                    |

#### Data Flow

```text
OpenAPI generated client
  -> runtimeApiMethods.activeSafetyIncident/list/detail/clearEstop
  -> workline-runtime store
       detail
       activeSafetyIncident
       incidentLoading / incidentLoadError / incidentLastLoadedAt
       clearEstopSubmitting / clearEstopLastError
  -> getWorklineRuntimeVerdict(summary, incident, evidenceState)
       tone / label / priority
       safetyLocked
       canAttemptClear
       blockedReason
  -> WorklineRuntimePage
       WorklineSafetyIncidentPanel
       WorklineClearEstopDialog
       WorklineSafetyAuditDrawer
       DecisionStrip
       SandboxWorkbench safety lock
```

#### Refresh Rules

| Event class                                        | Refresh target                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| `workline_safety/workline/estop.activated`         | `refreshWorklines + refreshDetail + refreshActiveIncident`         |
| `workline_safety/incident/incident.cleared`        | `refreshWorklines + refreshDetail + refreshActiveIncident`         |
| `workline_safety/incident/estop.recovery_rejected` | `refreshActiveIncident` and keep dialog open with rejected reason  |
| `device/outbox/command` for selected workline      | `refreshDetail + sandbox pending/completed`                        |
| clear-estop HTTP success without matching SSE      | short polling fallback for `refreshDetail + refreshActiveIncident` |

#### Engineering Auto-Decisions

| #     | Decision                                                     | Reason                                                                                   |
| ----- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| ENG-1 | `safetyLocked` 必须在 handler 层兜底，不只依赖 disabled UI。 | 防止快捷键、组件状态漂移或未覆盖入口继续推进流程。                                       |
| ENG-2 | incident 加载失败和 stale 都按锁定处理。                     | 安全证据不完整时，前端不能假设可恢复。                                                   |
| ENG-3 | 先写 `runtime-safety` 单测，再改 store/UI。                  | 状态机是本次最容易漂移的核心逻辑。                                                       |
| ENG-4 | 删除旧 emergency-stop 运行态引用是必须步骤。                 | 本地代码仍存在 `worklineEmergencyStop` store/API/dialog/overlay 引用，不能留下双轨语义。 |

### Phase 4: DX Review

**DX verdict:** DONE_WITH_CONCERNS. 计划不能只写“等后端契约”，需要开发者可复制执行的契约门禁、SSE 样例、错误 envelope 和误生成恢复路径。

#### DX Findings

| Severity | Finding                                                       | Required change                                                                                                        |
| -------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Critical | 契约等待流程缺少硬门禁，容易误接临时 clear-estop 或错误权限。 | Task 1 增加 path/permission/schema 断言；最终 path 和 `biz:workline:clear-estop` 未出现前禁止实现 API 接入。           |
| High     | SSE payload 没有样例，开发者会猜 domain/action/keys。         | Task 1 写入 `estop.activated`、`incident.cleared`、`estop.recovery_rejected` 三个样例。                                |
| High     | 权限生成失败时缺少诊断路径。                                  | 增加 `permission:verify -- --require-backend`；缺少 `clearEstop` 时优先检查后端 route 是否仍挂 `biz:workline:update`。 |
| High     | 验证路径缺少 contract/permission verify 和真实联调。          | 增加最终验证段，覆盖 contract、permission、Vitest、lint、typecheck、浏览器联调。                                       |
| High     | `ESTOP_RECOVERY_REJECTED` 只有名字，没有错误 envelope。       | Task 1 写入 code/message/data.failed_checks/data.required_actions 的最终错误格式。                                     |
| Medium   | 误对临时后端跑生成后没有恢复方案。                            | 最终验证段写明回滚 generated/module/sync-record diff，再用正确 OpenAPI 重跑。                                          |
| Medium   | 生成位置和方法名不明确。                                      | Task 1 要求优先使用生成方法，不在 `contractMethods` 里手写第二套路径。                                                 |

#### Developer Checkpoints

1. Contract gate passed: final endpoint、incident schema、clear-estop schema、permission、SSE samples、error envelope all present.
2. Core state tests passed: verdict priority、state machine、stale/error/conflict all covered.
3. Store/API integrated: active incident loading/error/freshness/submitting states visible.
4. SSE verified: safety domain is accepted and classified refreshes active incident.
5. UI verified: incident-first panel, read-only audit, clear dialog, no-permission state, rejected/unknown result states.
6. Sandbox lock verified: event、process、ACK、Result、retry、manual/replay all blocked in UI and handler.
7. Legacy flow removed: `worklineEmergencyStop|workline-emergency-stop|EmergencyStop|emergency-stop` no longer appears in runtime page dependency path.

### Final Autoplan Decision

**Decision:** APPROVED_WITH_REQUIRED_REVISIONS.

本计划可以进入实施，但执行顺序必须按修订后的 Task 0-5：先清旧急停触发流和契约门禁，再落统一 safety verdict/state machine，之后接 store/SSE/UI，最后锁 sandbox 全推进入口并补审计。不得为了赶前端进度接后端临时 clear-estop 路径，也不得把“解除软件冻结 / 恢复接收”文案降级回物理急停语义。
