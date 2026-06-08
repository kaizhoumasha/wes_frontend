# Runtime Diagnosis Verdict 设计

> 日期：2026-06-04
> 范围：运行案件处置台、Trace 详情、阻塞点诊断、后端 trace query/blocking-point 契约
> 目标：用统一诊断结论降低用户心智负担，让用户先知道“是否要处置”，再知道“卡在哪里”，最后知道“下一步做什么”。

## 1. 背景

当前 `/runtime/cases?sessionId=1` 的页面会同时出现两种互相冲突的结论：

- 拓扑摘要识别 `COMPLETED`，展示“流程已完成 / 无异常 / 无需处置”。
- 阻塞点诊断卡仍展示“现场处置 / UNKNOWN / 系统出现未分类异常 / 联系技术支持”。

这不是数据库中真的存在未处理阻塞点。session 1 的开发库数据事实是：

- `wes_biz.workline_sessions.id = 1`
- `session_code = SEED-ROUGH-SORTER-ACTIVE-RACK-TEMPLATE`
- `trace_id = seed-rough-sorter-resource`
- `status = COMPLETED`
- `run_mode = SIMULATION`
- `callback_logs = 0`
- `workline_inbox = 0`
- `device_commands = 0`
- `system_outbox = 0`
- 当前 trace/session 没有持久化 `workline_diagnostics` 行

误导来自契约和前端展示语义没有对齐：

- 后端 `trace_query_service._build_blocking_point()` 在没有明确阻塞点时返回 `blocking_point="none"`，但仍用 `ErrorCode.UNKNOWN` 生成诊断卡。
- `ErrorCode.UNKNOWN` 的默认 operator action 是“发生未知系统错误...联系技术支持”。
- 前端 `TraceBlockingPointCard` 只要拿到 `blockingPoint` 对象就渲染“现场处置 / 阻塞点诊断卡”，没有先判断案件是否已经完成且无阻塞点。

## 2. 第一性原理

运行案件诊断页的价值不是暴露 callback、inbox、outbox、command、session 等技术结构，而是帮助用户完成三件事：

1. 判断当前是否需要人工介入。
2. 如果需要，定位阻塞点和责任归属。
3. 给出下一步动作和可复核证据。

因此页面的信息顺序必须从“业务结论”开始，而不是从“技术证据对象是否存在”开始。

`UNKNOWN` 也不能默认等同于“现场处置”。第一性原理下，unknown 有两种完全不同的含义：

- 无阻塞点且流程正常结束：这是 `completed_clear`，用户无需处置。
- 证据不足或状态无法判定：这是 `unknown`，用户需要补证据或技术排查。

这两者必须在后端契约层被区分，不能让前端通过 `blocking_point=none + error_code=UNKNOWN` 猜测。

## 3. 产品目标

本次优化选择“状态总线”方案：后端输出统一 `Diagnosis Verdict`，前端所有诊断组件先读取 verdict，再决定标题、颜色、动作和默认证据入口。

### 3.1 用户体验目标

- 用户首屏能在 3 秒内判断：流程完成、运行中、等待中、已阻塞、已失败、诊断不足。
- 完成态不出现“现场处置”“UNKNOWN”“联系技术支持”等误导词。
- 阻塞/失败态必须明确“卡在哪里、谁处理、下一步做什么”。
- 证据为 0 时不直接当异常，而是结合 verdict 解释其含义。
- Unknown 态表达为“诊断不足 / 证据缺失”，而不是“未知系统错误 / 现场处置”。

### 3.2 非目标

本次不做完整诊断工作台，不引入新路由，不重构所有 runtime 页面。

本次不要求一次性废弃旧字段。旧字段继续保留，用于兼容当前前端类型、已有调用方和生成契约。

本次不把所有证据查询统一成一个新搜索系统。现有 Timeline、证据分组、Raw JSON 继续存在。

## 4. Diagnosis Verdict 契约

后端新增统一诊断结论结构，优先放入 trace detail 响应，同时 blocking-point 响应复用同一结构。

契约类型：

```ts
interface DiagnosisVerdict {
  state: 'completed_clear' | 'running' | 'waiting' | 'blocked' | 'failed' | 'unknown'
  severity: 'success' | 'info' | 'warning' | 'danger'
  title: string
  summary: string
  requires_operator_action: boolean
  primary_action: string | null
  blocking_point:
    | 'none'
    | 'session'
    | 'inbox'
    | 'outbox'
    | 'command'
    | 'external_wms'
    | 'resource'
    | 'admission'
    | 'unknown'
  owner: string | null
  evidence_health: DiagnosisEvidenceHealth
}

interface DiagnosisEvidenceHealth {
  level: 'complete' | 'partial' | 'missing'
  summary: string
  missing: string[]
  items: DiagnosisEvidenceHealthItem[]
}

interface DiagnosisEvidenceHealthItem {
  key:
    | 'session'
    | 'timeline'
    | 'callback'
    | 'inbox'
    | 'command'
    | 'outbox'
    | 'diagnostics'
    | 'workline_admission'
    | 'resource_wait'
  label: string
  count: number
  state: 'present' | 'empty' | 'missing' | 'not_required'
  hint: string
}
```

字段语义：

- `state` 是页面所有诊断展示的最高优先级输入。
- `severity` 只表达 UI 严重程度，不替代业务状态。
- `requires_operator_action` 是是否显示“现场处置”语义的关键布尔值。
- `primary_action` 是面向用户的下一步动作；完成态可以是“无需现场处置”。
- `blocking_point='none'` 必须表示没有阻塞点，不得再绑定 UNKNOWN 处置动作。
- `blocking_point='admission'` 表示 START 准入、WorkLine 停靠等待 START 或 ECS 设备接纳检查导致的等待/阻塞。
- `evidence_health.items` 是前端证据健康 UI 的唯一数据源；前端不得再根据 count 自行推导“0 是否异常”。
- `evidence_health.missing` 保留为摘要字段，用于 unknown 态和技术排查入口；详细展示必须读 `items`。

## 5. Verdict 推导规则

后端推导应按业务状态优先级排序，而不是按诊断对象是否存在排序。

### 5.1 Completed Clear

条件：

- session 存在。
- `session.status = COMPLETED`。
- 没有 `failure_domain`。
- 没有 `failure_code`。
- 没有失败 timeline。
- 没有 failed/dead-letter inbox、failed command、failed outbox、manual hold。

结果：

```json
{
  "state": "completed_clear",
  "severity": "success",
  "title": "流程已完成",
  "summary": "当前案件已正常结束，未发现阻塞点。",
  "requires_operator_action": false,
  "primary_action": "无需现场处置",
  "blocking_point": "none"
}
```

对 `sessionId=1`，应命中此规则。

### 5.2 Blocked

条件：

- 存在明确阻塞点，但流程不一定已经失败。
- 例如 manual hold、runtime hold、reconciliation pending、外部 WMS 等待、资源等待、设备等待。

结果：

- `state='blocked'`
- `requires_operator_action=true`
- `blocking_point` 指向具体对象
- `owner` 指向设备、集成、工作流、物料、运维或平台
- `primary_action` 必须是具体动作，不允许只说“联系技术支持”

### 5.3 Failed

条件：

- session failed。
- 或 failed/dead-letter inbox。
- 或 failed command。
- 或 failed outbox。
- 或失败 timeline 明确指出不可继续。

结果：

- `state='failed'`
- `severity='danger'`
- `requires_operator_action=true`
- 展示失败域、失败码、影响范围和恢复/升级动作

### 5.4 Waiting

条件：

- active session 正在等待外部事件、设备回报或超时窗口。
- 有 `current_wait_type`、`waiting_since`、`deadline_at`、`awaiting_command_id` 等等待信号。
- WorkLine 处于 `STOPPED` 且存在 `WORKLINE_STOPPED_WAITING_START` outbox，正在等待 START 准入。
- START admission 正在检查或最近一次失败原因是 ECS status 超时、HTTP 错误、坏响应、设备非 AUTO/IDLE。
- `system_outbox.status = BLOCKED_RESOURCE` 且 `blocked_reason = DEVICE_STATUS_PRECHECK_WAIT`，表示 ECS 设备接纳条件暂不满足。

结果：

- `state='waiting'`
- `severity='warning'`
- `requires_operator_action=false`，除非等待已超时或进入人工对账
- `primary_action` 说明等待对象和观察方式
- `blocking_point='admission'` 或 `blocking_point='resource'`
- `owner` 指向设备、集成或工作线，取决于 admission/resource wait 证据来源

### 5.5 Running

条件：

- session 正在正常推进。
- 没有失败或阻塞证据。

结果：

- `state='running'`
- `severity='info'`
- `requires_operator_action=false`
- 展示当前位置和最近动作

### 5.6 Unknown

条件：

- 后端无法从 session、timeline、inbox、outbox、command、diagnostics 中得出可靠结论。
- 或关键证据缺失导致无法判断是否完成、等待、阻塞或失败。
- 不能把 `blocking_point='none' + ErrorCode.UNKNOWN` 单独作为现场处置依据。

结果：

- `state='unknown'`
- `severity='warning'` 或 `danger`，按影响范围决定
- `title='诊断不足'`
- `summary` 说明缺哪些证据
- `requires_operator_action` 默认为 false，除非后端明确确认需要人工介入
- `primary_action` 优先引导查看缺失证据和日志，而不是默认现场处置

## 6. 后端改造设计

### 6.1 新增构建器

在后端 trace query 领域新增 verdict 构建逻辑：

- `DiagnosisVerdictBuilder`

职责：

- 输入 `TraceQueryResult`。
- 读取 session、timelines、inboxes、commands、outboxes、dispatch attempts、persisted diagnostics、WorkLine START admission projection、resource wait detail。
- 输出 `DiagnosisVerdict`。

此构建器应成为 trace detail 和 blocking-point 的共同语义来源。

### 6.2 TraceQueryResult 证据聚合

`TraceQueryResult` 必须纳入 WorkLine admission projection，避免前端或 blocking-point endpoint 另做拼接。

新增聚合字段：

```py
workline_runtime_status: str | None
workline_start_admission_status: str | None
workline_start_admission_message: str | None
workline_start_admission_failed_device_code: str | None
workline_start_admission_checked_at: datetime | None
workline_last_start_request_id: str | None
workline_last_start_trace_id: str | None
```

聚合来源：

- 优先通过当前 session 的 `workline_id` 查询 WorkLine。
- 没有 session 时，可通过 outbox、command、timeline 的 `workline_id` 回填。
- admission 字段只参与 verdict，不替代 trace/session 的事实字段。
- outbox resource wait 继续使用现有 `blocked_reason`、`blocked_at`、`blocked_wait_seconds`、`blocked_check_count`、`blocked_detail_json`。

推导要求：

- `start_admission_status='FAILED'` 且仍处于 START 恢复链路时，verdict 为 `waiting` 或 `blocked`，`blocking_point='admission'`。
- `BLOCKED_RESOURCE + DEVICE_STATUS_PRECHECK_WAIT` 必须保留为 `waiting/resource`，不能被普通 failed outbox 规则吞掉。
- `WORKLINE_STOPPED_WAITING_START` 表示等待 START 准入，不是未知系统错误。

### 6.3 Trace Detail 响应

`TraceDetailResponse` 新增：

```py
diagnosis_verdict: DiagnosisVerdictResponse
```

`summary.diagnostics` 可以继续表示诊断上下文数量，但它不再承担状态结论职责。

### 6.4 Blocking Point 响应

`TraceBlockingPointResponse` 新增：

```py
diagnosis_verdict: DiagnosisVerdictResponse
```

同时修正 fallback：

- 当 verdict 是 `completed_clear` 时，blocking response 应表达“无阻塞点”，不再用 `ErrorCode.UNKNOWN` 生成人工处置卡。
- 当 verdict 是 `unknown` 时，diagnostic card 可以使用 UNKNOWN，但文案应明确“诊断不足”，并列缺失证据。
- 旧字段 `blocking_point`、`operator_action`、`diagnostic_card` 保留；它们的值应与 verdict 兼容。
- 当 verdict 是 `waiting/admission/resource` 时，旧字段不得输出“联系技术支持”兜底动作，除非 admission/resource evidence 明确需要人工升级。

### 6.5 兼容策略

前端先以 `diagnosis_verdict` 为准。

如果后端暂未返回 `diagnosis_verdict`，前端使用适配器从旧字段推导，但该适配器必须包含 `completed + none + UNKNOWN` 的纠偏规则。

这样可以分阶段上线：

1. 后端新增契约和测试。
2. 前端接入新字段。
3. 后续再清理旧推导逻辑。

## 7. 前端改造设计

### 7.1 状态总线

前端新增 verdict 适配层：

- `src/utils/runtime-diagnosis-verdict.ts`

职责：

- 读取 `detail.diagnosis_verdict`。
- 后端字段缺失时，从旧 detail/blockingPoint 推导兼容 verdict。
- 输出稳定 view model 给 UI 组件使用。
- 统一输出 topology、action card、evidence health、default tab 所需字段。

约束：

- `runtime-diagnosis-verdict.ts` 是前端唯一解释 `diagnosis_verdict` 和 legacy blocking fields 的位置。
- `TraceTopologySummary.vue`、`TraceBlockingPointCard.vue` 不得再直接判断 `blocking_point='none' + UNKNOWN`。
- 现有 `buildRuntimeTraceTopology()` 保留路径和节点建模职责，但结论、标题、动作、证据健康必须读 adapter 输出。

### 7.2 TraceTopologySummary

`TraceTopologySummary` 改为优先使用 verdict：

- `completed_clear`：流程已完成，无异常，无需处置。
- `running`：流程运行中，展示当前位置和最近动作。
- `waiting`：流程等待中，展示等待对象和 deadline。
- `blocked`：流程已阻塞，突出阻塞节点。
- `failed`：流程失败，突出失败域和失败码。
- `unknown`：诊断不足，展示缺失证据。

现有 `buildRuntimeTraceTopology()` 可以继续作为路径和节点模型来源，但 verdict 应成为结论来源。

### 7.3 TraceBlockingPointCard 重命名语义

现有 `TraceBlockingPointCard.vue` 文件名 v1 保留，但可见语义必须改为中性的诊断结论/动作卡。后续若单独做组件重命名，应作为独立 cleanup，不混入本次契约修复。

展示规则：

- `completed_clear`
  - 标题：诊断结论
  - 内容：无阻塞点
  - 动作：无需现场处置
  - 不显示“现场处置”“UNKNOWN”“联系技术支持”
- `blocked` / `failed`
  - 标题：现场处置 · 阻塞点诊断卡
  - 内容：阻塞点、owner、恢复方式、建议动作、技术信息
- `waiting`
  - 标题：等待对象
  - 内容：等待类型、等待开始时间、deadline、可观察证据
- `unknown`
  - 标题：诊断不足
  - 内容：缺失证据、建议排查方向

### 7.4 证据健康

证据计数从纯数字升级为解释型展示：

- Callback
- Inbox
- Command
- Outbox
- Timeline
- Diagnostics

每一项展示：

- count
- state: present / empty / missing / not_required
- hint

示例：

```text
Callback 0 · 当前完成态不依赖 callback 证据
Inbox 0 · 当前完成态无待处理 inbox
Command 0 · seed session 未产生设备指令
Session 1 · 主证据
```

### 7.5 默认证据 Tab

默认 tab 按 verdict 决定：

- `completed_clear` -> 会话证据
- `blocked` / `failed` -> 诊断或具体阻塞对象对应 tab
- `waiting` -> Timeline 或执行证据
- `unknown` -> 证据健康或 Raw JSON

### 7.6 Blocking Point 条件加载

`TraceExplorerPage.vue` 读取 trace detail 后先构建 verdict view model，再决定是否加载 blocking-point 详情。

规则：

- `completed_clear`：跳过 blocking-point 请求。
- `running` 且 `requires_operator_action=false`：跳过 blocking-point 请求。
- `waiting` / `blocked` / `failed` / `unknown`：加载 blocking-point 详情，用于补充证据和技术信息。
- 如果 blocking-point 请求失败，页面仍以 `detail.diagnosis_verdict` 渲染主结论，不回退到 UNKNOWN 现场处置。

## 8. 视觉设计原则

界面应保持工业运维控制台气质：低噪声、高扫描效率、密集但层级明确。

设计原则：

- 不使用营销式大卡或装饰性英雄区。
- 不用大面积红黄制造误报压力。
- 危险色只用于 `blocked` / `failed`。
- 完成态使用稳定的绿色或蓝绿色。
- Unknown 使用中性灰蓝或琥珀色，语义是“证据不足”，不是“系统崩溃”。
- 主动作应短、明确、可执行。
- 技术信息默认折叠，避免干扰现场用户。

## 9. 验证矩阵

### 9.1 sessionId=1

输入事实：

- status: `COMPLETED`
- trace_id: `seed-rough-sorter-resource`
- callback/inbox/command/outbox: 0
- no persisted diagnostics for this trace

期望：

- verdict: `completed_clear`
- severity: `success`
- requires_operator_action: `false`
- primary_action: `无需现场处置`
- blocking_point: `none`
- 页面不出现：
  - `UNKNOWN`
  - `系统出现未分类异常`
  - `联系技术支持`
  - `现场处置`

### 9.2 Failed Session

期望：

- verdict: `failed`
- 展示 failure domain/code/message
- 显示明确建议动作
- 默认进入诊断或会话证据

### 9.3 Failed Inbox / Dead Letter

期望：

- verdict: `failed`
- blocking_point: `inbox`
- 展示 inbox id/status/error_message
- 默认进入入口证据 tab

### 9.4 Failed Command

期望：

- verdict: `failed`
- blocking_point: `command`
- 展示 command_code/device/status/error_detail
- 默认进入执行证据 tab

### 9.5 Waiting

期望：

- verdict: `waiting`
- 展示等待对象、waiting_since、deadline_at
- 未超时不提示现场处置
- 超时或对账 pending 才给人工动作

### 9.6 START Admission Failure

输入事实：

- WorkLine 处于 START 恢复链路。
- `start_admission_status = FAILED`。
- `start_admission_message` 记录 ECS status 超时、HTTP 错误、坏响应或设备非 AUTO/IDLE。
- `start_admission_failed_device_code` 可为空；如果为空，说明失败发生在 WorkLine guard 或 ECS 整体探测阶段。

期望：

- verdict: `waiting` 或 `blocked`，按是否需要现场动作决定。
- blocking_point: `admission`
- 不展示 UNKNOWN。
- `primary_action` 指向 START 准入失败原因和下一步观察/恢复动作。
- evidence health 包含 `workline_admission` item。

### 9.7 ECS Resource Wait

输入事实：

- 存在 `system_outbox.status = BLOCKED_RESOURCE`。
- `blocked_reason = DEVICE_STATUS_PRECHECK_WAIT`。
- `blocked_detail_json` 含 `device_code`、`observed_mode`、`observed_status`、`error_kind`、`last_probe_result` 等接纳证据。

期望：

- verdict: `waiting`
- blocking_point: `resource`
- owner: `device` 或 `integration`
- 展示等待设备、等待时长、最近探测结果。
- 不把该 outbox 当作 failed outbox。
- evidence health 包含 `resource_wait` item。

### 9.8 WorkLine Stopped Waiting START

输入事实：

- 存在 `system_outbox.status = BLOCKED_RESOURCE`。
- `blocked_reason = WORKLINE_STOPPED_WAITING_START`。
- WorkLine 当前处于 STOPPED 或 START 恢复链路。

期望：

- verdict: `waiting`
- blocking_point: `admission`
- `requires_operator_action=false`，除非 safety incident、runtime hold 或 reconciliation 仍未解除。
- `primary_action` 说明等待 START 准入，不默认提示联系技术支持。

### 9.9 Unknown

期望：

- verdict: `unknown`
- 标题为“诊断不足”
- 展示 missing evidence
- 不默认使用“未知系统错误 / 联系技术支持”

## 10. 测试策略

### 10.1 后端

新增或扩展 trace query service 测试：

- completed session 无阻塞点 -> `completed_clear`
- failed outbox -> `failed` + `outbox`
- dead-letter inbox -> `failed` + `inbox`
- failed command -> `failed` + `command`
- failed session -> `failed` + `session`
- manual hold -> `blocked`
- waiting session -> `waiting`
- START admission failure -> `waiting/blocked` + `admission`
- `BLOCKED_RESOURCE + DEVICE_STATUS_PRECHECK_WAIT` -> `waiting` + `resource`
- `WORKLINE_STOPPED_WAITING_START` -> `waiting` + `admission`
- evidence insufficient -> `unknown`
- trace detail 与 blocking-point 响应返回同一个 `diagnosis_verdict`

测试应断言：

- `requires_operator_action`
- `primary_action`
- `blocking_point`
- `evidence_health.level`
- `evidence_health.items`
- 兼容字段不会输出误导性 UNKNOWN 现场处置
- completed/running verdict 不通过旧 blocking response 重新变成现场处置

### 10.2 前端

前端仓库已有 Vitest，必须新增或扩展单元测试，不能只依赖类型检查。

必须新增或扩展纯函数测试的目标函数：

- verdict adapter
- action card view model
- evidence health view model
- default tab resolver
- conditional blocking-point fetch resolver

关键断言：

- adapter 优先使用 `detail.diagnosis_verdict`。
- `completed_clear` 不显示现场处置语义。
- fallback 旧字段 `completed + none + UNKNOWN` 能被纠偏。
- `blocked/failed` 仍正常显示现场处置。
- `unknown` 显示诊断不足和缺失证据。
- `waiting/admission/resource` 显示等待对象、最近探测结果和非现场处置动作。
- evidence health 展示 per-source `count/state/hint`。
- `TraceTopologySummary` 和 `TraceBlockingPointCard.vue` 不再各自实现 legacy UNKNOWN 判断。
- `TraceExplorerPage.vue` 在 `completed_clear` 和非 actionable `running` 下不调用 blocking-point endpoint。

### 10.3 联调

使用 Docker 开发数据库和 `agent-browser`：

- 登录本地前端。
- 打开 `/runtime/cases?sessionId=1`。
- 验证完成态文案。
- 抽取页面文本，确认不包含误导词。
- 验证至少一个 failed/blocked 样例。
- 验证至少一个 START admission failure 或 ECS resource wait 样例。
- 截图留存到临时目录或 PR 附件。

## 11. 风险与取舍

### 11.1 风险：后端状态机扩散

如果 verdict 逻辑散落在多个 endpoint 中，会重新造成语义不一致。

缓解：

- verdict 只由一个构建器负责。
- trace detail 和 blocking-point 共用同一构建器。

### 11.2 风险：兼容字段继续误导

旧字段仍存在，如果前端某处继续直接读 `diagnostic_card`，可能绕过 verdict。

缓解：

- 前端新增统一 adapter。
- runtime trace 页面禁止直接用旧字段决定主结论。

### 11.3 风险：Unknown 被弱化

如果所有 unknown 都变成“证据不足”，可能掩盖真实系统错误。

缓解：

- `unknown` 仍可使用 warning/danger severity。
- 只有后端明确 `requires_operator_action=true` 时才显示现场处置。
- evidence_health 必须说明缺失证据和下一步排查。

### 11.4 风险：START Admission 证据遗漏

后端最新 START 准入和 ECS resource wait 已经记录了可用证据。如果 verdict builder 只读 session/inbox/outbox/command，START 恢复链路会退化成 generic waiting、failed outbox 或 unknown。

缓解：

- `TraceQueryResult` 聚合 WorkLine admission projection。
- `BLOCKED_RESOURCE` 和 admission 字段进入 verdict 单元测试矩阵。
- 前端不通过额外 WorkLine detail 请求补齐主结论，避免多源竞态。

### 11.5 风险：前端重复推导重新分叉

当前 `buildRuntimeTraceTopology()` 和 `TraceBlockingPointCard.vue` 已各自有 fallback UNKNOWN 判断。如果新增 adapter 但保留旧判断，状态总线会变成三套规则。

缓解：

- `src/utils/runtime-diagnosis-verdict.ts` 是唯一 frontend diagnosis adapter。
- topology 和 card 只读 adapter view model。
- 单元测试覆盖 completed fallback、unknown、blocked/failed、waiting/admission/resource。

## 12. 实施边界

本次实现包含：

- 后端新增 verdict schema、构建器、TraceQueryResult WorkLine admission projection、响应字段、测试。
- 前端新增 verdict 类型、`runtime-diagnosis-verdict.ts` adapter、topology/action card/evidence/default tab view model。
- Trace 页面接入 verdict。
- blocking-point 条件加载。
- sessionId=1、blocked/failed、START admission/resource wait 样例联调验证。

不建议本次包含：

- 全新诊断工作台。
- 重写 Timeline。
- 重写所有 runtime 页面。
- 移除旧响应字段。

## 13. 成功标准

本设计完成后，用户看到运行案件时应按以下顺序理解：

1. 这个案件现在是否正常。
2. 是否需要人工处置。
3. 如果需要，卡在哪个对象。
4. 谁负责处理。
5. 下一步做什么。
6. 支撑这个结论的证据是否完整。

对 `sessionId=1`，页面必须明确表达：

```text
流程已完成。无阻塞点。无需现场处置。
```

而不是：

```text
UNKNOWN。系统出现未分类异常。联系技术支持。
```

## GSTACK REVIEW REPORT

| Review        | Trigger               | Why                             | Runs | Status | Findings                            |
| ------------- | --------------------- | ------------------------------- | ---- | ------ | ----------------------------------- |
| CEO Review    | `/plan-ceo-review`    | Scope & strategy                | 1    | CLEAR  | 4 proposals, 4 accepted, 3 deferred |
| Codex Review  | `/codex review`       | Independent 2nd opinion         | 0    | -      | -                                   |
| Eng Review    | `/plan-eng-review`    | Architecture & tests (required) | 3    | CLEAR  | 7 issues, 0 critical gaps           |
| Design Review | `/plan-design-review` | UI/UX gaps                      | 1    | CLEAR  | score: 3/10 -> 8/10, 7 decisions    |
| DX Review     | `/plan-devex-review`  | Developer experience gaps       | 0    | -      | -                                   |

- **UNRESOLVED:** 0
- **VERDICT:** CEO + ENG + DESIGN CLEARED — ready to implement.
