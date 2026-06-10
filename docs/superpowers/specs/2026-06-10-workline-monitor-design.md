# P9 WES 工作线运行监控中心重构设计规约

> **文档状态**: 已按事实调查与 Eng Review 收敛，待实施
> **最后修改时间**: 2026-06-10
> **作者**: Antigravity / Codex
> **关联模块**: `src/views/runtime/worklines/WorklineMonitorPage.vue`, `src/stores/workline-runtime.ts`, `src/utils/runtime-scene.ts`

---

## 1. 背景与目标

P9 WES 工作线运行监控中心面向现场维保、设备工程师和运行值守人员。页面的第一职责不是做炫技可视化，而是在设备异常、急停、会话阻塞、货格证据冲突时，让人能在最短时间内定位对象、判断影响范围，并执行闭环动作。

当前系统尚未发布，本次重构不需要兼容旧前端状态模型、旧 SSE 事件域或旧场景模型文件。原则是用最少的新概念收敛到一个清晰事实源，避免未发布阶段继续累积双轨实现。

本轮计划锁定为端到端破坏性收敛：后端响应合同、OpenAPI 生成类型、前端 Store、场景构建、页面调用和测试一起切到监控投影语义。不得只改后端合同后在前端保留 `detail` 兼容别名，也不得只改前端文案后继续消费旧详情 DTO。

### 1.1 设计原则

| 原则  | 本 SPEC 的落地方式                                                                                       |
| ----- | -------------------------------------------------------------------------------------------------------- |
| DRY   | 静态拓扑只来自插件 Manifest，动态状态只来自工作线级监控投影，前端不再维护第二套派生事实源。              |
| KISS  | SSE 只做失效通知，收到事件后按刷新预算拉取监控投影；不在前端做细粒度状态合并。                           |
| SOLID | API 负责契约，Store 负责监控投影缓存，Scene Builder 负责视图投影，组件负责呈现和交互。                   |
| YAGNI | 不新增 `/topology`、`/states`、`/monitor-snapshot`、前端多源拼装、维护旁路、拼音搜索和物理占用真值模型。 |

### 1.2 成功标准

- 页面以工作线级监控投影为动态事实源。当前 `GET /api/v1/workline/runtime/worklines/{workline_id}` 过于大而全，本 SPEC 要求直接破坏性收窄该节点为轻量 `RuntimeWorklineMonitorProjectionResponse`；不新增平行节点，不保留旧详情合同兼容。
- 静态拓扑以插件 Manifest 为事实源：`GET /api/v1/workline/plugins/{plugin_key}/manifest`。
- SSE 事件统一为 `domain: "workline_runtime"`，只触发监控投影刷新调度，不承载权威状态。
- 货架与格口呈现为资源证据和运行投影，不宣称物理库位真实占用。
- 行动舱只保留已闭环能力：解除急停、对账核销、手动刷新；取消维护旁路。
- 删除旧场景模型双轨实现，统一使用 `src/utils/runtime-scene.ts`。

---

## 2. 范围与非目标

### 2.1 本次范围

- 重构工作线运行监控页的信息架构、状态流、事件契约和视觉密度策略。
- 破坏性收窄 `GET /api/v1/workline/runtime/worklines/{workline_id}` 的主屏响应合同。
- 同步 OpenAPI 类型、前端 API adapter、Store、Scene Builder、页面和测试命名。
- 收敛前端状态管理：线体状态、设备、会话、资源证据均来自工作线级监控投影。
- 明确 Manifest 与监控投影如何共同生成 2D 监控场景。
- 明确 SSE 刷新策略、断线降级、陈旧状态提示和测试验收。
- 明确行动舱可执行动作和执行后的刷新规则。

### 2.2 非目标

- 不新增 `GET /api/v1/workline/runtime/worklines/{id}/topology`。
- 不新增 `GET /api/v1/workline/runtime/worklines/{id}/states`。
- 不新增 `GET /api/v1/workline/runtime/worklines/{id}/monitor-snapshot`。
- 不把现有 `/runtime/devices`、`/traces/query`、`/sessions/{id}/path` 等节点拼成主屏事实源。
- 不保留 `RuntimeWorklineDetailResponse`、`detail`、`loadDetail`、`refreshDetail` 作为该路由或监控主屏的兼容别名。
- 不在前端合并 `device:changed`、`session:stepped` 等细粒度状态 Payload。
- 不兼容旧事件域：`workline_trace`、`workline`、`device`、`outbox`、`command`、`workline_safety`、`safety`。
- 不做拼音首字母搜索。
- 不做维护旁路按钮、占位 TODO 或隐藏入口。
- 不把 `active_bin_racks` 展示为物理库存真值。
- 不在前端直接修改本地 `active_bin_racks` 或货格状态。

---

## 3. 第一性原理模型

监控中心需要回答四个问题：

1. **这条线现在是否可运行？** 来自监控投影中的 readiness、急停、hold、阻塞命令和设备状态。

2. **异常发生在哪里？** Manifest 提供设备、泳道、角色和拓扑关系；监控投影提供设备、会话、命令和证据。

3. **异常影响什么？** 监控投影中的 active sessions、blocked outbox、open commands、resource evidence 决定影响面。

4. **人现在能做什么？** 行动舱只展示后端已支持且可闭环的操作：解除急停、对账核销、刷新监控投影。

因此，本设计的核心不是“前端实时拼状态”，而是“后端给出面向监控主屏的最小一致投影，前端稳定呈现该投影，并在事件到达时尽快拿到新投影”。

---

## 4. 架构与数据流

### 4.1 API 粒度决策

`GET /api/v1/workline/runtime/worklines/{workline_id}` 现有详情节点把 summary、devices、active sessions、failed/completed traces、station lease、resource evidence 等聚在一起；代码中 active sessions 上限为 200、resource evidence 上限为 50。它适合作为历史详情雏形，但不适合作为高频监控主屏的长期刷新合同。

事实依据：

- 后端当前路由 `src/app/workline/v1/runtime.py` 的 `/worklines/{workline_id}` 响应模型是 `RuntimeWorklineDetailResponse`。
- `RuntimeWorklineDetailResponse` 当前复用 `RuntimeTraceListItem` 填充 `active_sessions`、`recent_failed_traces`、`recent_completed_traces`。
- `RuntimeTraceListItem` 包含 raw `event_payload`，这对 Trace/Debug 页面有价值，但不应进入监控主屏高频投影。
- 前端当前 `src/stores/workline-runtime.ts` 使用 `detail/loadDetail/refreshDetail` 语义，`WorklineMonitorPage.vue` 和 `runtime-scene.ts` 仍以旧详情 DTO 构建主屏。
- 因此，本 SPEC 不能只要求“轻量化响应”，还必须要求旧详情 DTO、旧 store 命名和旧 scene model 一起退出监控主屏。

第一性原理判断：

- 监控主屏需要的是“同一工作线、同一时间窗口的最小运行投影”，不是 trace/detail 的完整案件数据。
- 直接改用 `/runtime/devices`、`/traces/query`、`/sessions/{id}/path` 会让前端重新承担跨表一致性、排序、截断和证据归一化，违反 KISS 与 DRY。
- 当前系统未发布，可以破坏性收窄合同。主屏合同固定为现有 `GET /runtime/worklines/{id}`，统一响应 envelope 仍遵循项目 `ResponseSchemaModel[...]`，仅 `data` payload 改为轻量 `RuntimeWorklineMonitorProjectionResponse`；不新增 `/monitor-snapshot` 平行入口。
- `/runtime/devices` 只服务设备列表页和设备 Inspector；`/traces/query` 只服务案件列表和 Trace Explorer；`/sessions/{id}/path`、`/traces/{trace_id}/path` 只服务下钻路径视图。
- 后端不需要新建平行 Service；应在现有 `RuntimeQueryService` 内复用已存在的 summary、boundary、blocked outbox、open command、runtime hold 查询能力，输出专用监控投影 DTO。

推荐目标合同：

```text
RuntimeWorklineMonitorProjectionResponse
  summary
  boundary
    workline_readiness
    station_lease
    single_layer_rack_snapshot
    rack_operation_wait
  device_nodes[]              # RuntimeMonitorDeviceNode，不复用设备详情 DTO
  active_sessions             # capped section，items 为 RuntimeMonitorSessionItem
    items[]
    total_count
    truncated
  recent_failed_traces        # capped section，items 为 RuntimeMonitorTraceItem
    items[]
    total_count
    truncated
  recent_completed_traces     # capped section，items 为 RuntimeMonitorTraceItem
    items[]
    total_count
    truncated
  resource_evidence
    kind
    items[]                   # capped
    total_count
    truncated
  action_candidates
    pending_reconciliation     # nullable，RuntimeMonitorReconciliationCandidate
  generated_at
```

所有 capped section 的 `total_count` 均表示后端按相同过滤条件统计出的真实总数，不得把内部查询上限后的加载数量当作总数；`items.length` 表示本次返回数量，`truncated = total_count > items.length`。默认展示上限固定为 active sessions 20、recent failed traces 10、recent completed traces 10、resource evidence 50。前端只能把 capped section 当作主屏摘要，不得把它解释为完整 trace/session 列表。

行动舱候选项不得依赖 capped section 是否刚好包含某条记录。对账核销需要的 pending runtime reconciliation owner 必须由 `action_candidates.pending_reconciliation` 明确提供，或由后端保证该 owner 不会被 cap 截断；本 SPEC 选择前者，避免前端为了找可核销会话回退到 `/traces/query` 拼主屏事实。

该合同是主屏唯一动态数据形状。Trace/Debug 页面仍可保留 `RuntimeTraceListItem.event_payload`，但主屏投影不得通过字段裁剪、前端 omit 或类型 alias 间接复用旧 trace/detail DTO。

数据流边界：

```text
Manifest --------------------+
                             v
                    Runtime Scene Builder ---> UI
                             ^
Workline Monitor Projection -+

Drilldown APIs:
  /runtime/devices
  /traces/query
  /runtime/sessions/{id}/path
  /runtime/traces/{id}/path
```

### 4.2 数据源分工

| 数据               | 来源                                                                                                             | 前端职责                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 工作线列表         | `GET /api/v1/workline/runtime/worklines`                                                                         | 左侧目录、默认选中、健康摘要。                                                         |
| 工作线监控投影     | `GET /api/v1/workline/runtime/worklines/{workline_id}`                                                           | 主屏动态事实源，驱动状态、会话、设备、证据和行动舱；响应为破坏性收窄后的监控投影合同。 |
| 静态拓扑           | `GET /api/v1/workline/plugins/{plugin_key}/manifest`                                                             | 构建布局、泳道、设备角色、拓扑连接。                                                   |
| 设备运行列表       | `GET /api/v1/workline/runtime/devices?worklineId={workline_id}`                                                  | 设备页和设备 Inspector，不作为主屏事实源。                                             |
| Trace 查询         | `POST /api/v1/workline/traces/query`                                                                             | 案件列表和 Trace Explorer，不作为主屏事实源。                                          |
| Trace/Session 路径 | `GET /api/v1/workline/runtime/sessions/{session_id}/path`、`GET /api/v1/workline/runtime/traces/{trace_id}/path` | 下钻路径视图，不参与主屏状态拼装。                                                     |
| SSE 事件           | 系统事件流                                                                                                       | 作为监控投影失效通知，触发刷新调度。                                                   |

### 4.3 页面初始化流程

```text
进入监控页
  -> 拉取工作线列表
  -> 根据路由或列表选择 workline_id
  -> 拉取工作线监控投影
  -> 从 projection.summary.plugin_key 拉取插件 Manifest
  -> 使用 RuntimeWorklineMonitorProjectionResponse + WorkLinePluginManifestSummary 构建场景模型
```

Manifest 加载失败时，页面允许降级为监控投影驱动的语义分组视图，但必须显示 Manifest 不可用的诊断信息。降级视图不能伪造完整物理拓扑。

### 4.4 运行期刷新流程

```text
收到 SSE: domain = workline_runtime
  -> 校验 keys.workline_id / keys.device_id / keys.session_id 是否与当前页面相关
  -> 按事件类型进入刷新调度器
  -> 刷新当前工作线监控投影
  -> 必要时刷新工作线列表摘要
  -> 重新构建场景模型
```

刷新调度器规则：

- 安全、急停、hold、对账、重连、陈旧恢复事件立即刷新。
- 设备、会话、命令、outbox 等普通事件合并刷新，避免高频事件触发抖动。
- 同一刷新任务运行中再次触发时，只保留一次后续刷新。
- SSE 断线时显示连接异常和数据陈旧提示；重连成功后立即刷新监控投影。
- 事件 Payload 只可用于日志、调试和刷新分类，不可直接写入权威状态。

---

## 5. API 与事件契约

### 5.1 REST 契约

本次 SPEC 不新增 `/topology`、`/states`、`/monitor-snapshot` 这类前端拼装或平行接口。未发布阶段不保留旧 `RuntimeWorklineDetailResponse` 兼容，直接破坏性收窄 `GET /api/v1/workline/runtime/worklines/{workline_id}` 的业务 payload 为 `RuntimeWorklineMonitorProjectionResponse`。

项目统一响应 envelope 不属于旧详情兼容，必须保留。后端路由的 OpenAPI 响应模型应从 `ResponseSchemaModel[RuntimeWorklineDetailResponse]` 改为 `ResponseSchemaModel[RuntimeWorklineMonitorProjectionResponse]`；权限仍为 `biz:workline:list`；找不到工作线时仍返回项目统一失败 envelope 和 `DEFAULT_NOT_FOUND` 语义。

| 用途               | 方法与路径                                                                                                       | 说明                                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 工作线摘要列表     | `GET /api/v1/workline/runtime/worklines`                                                                         | 左侧目录与概览摘要。                                                                                                       |
| 工作线监控投影     | `GET /api/v1/workline/runtime/worklines/{workline_id}`                                                           | 主屏唯一动态事实源。`data` payload 为 `RuntimeWorklineMonitorProjectionResponse`，不得返回 trace/detail 页才需要的大对象。 |
| 设备运行列表       | `GET /api/v1/workline/runtime/devices?worklineId={workline_id}`                                                  | 设备页和设备 Inspector 使用；主屏不从此接口拼装设备节点。                                                                  |
| Trace 列表查询     | `POST /api/v1/workline/traces/query`                                                                             | Trace Explorer 使用；主屏不从此接口拼装 active/recent trace 区块。                                                         |
| Trace/Session 路径 | `GET /api/v1/workline/runtime/sessions/{session_id}/path`、`GET /api/v1/workline/runtime/traces/{trace_id}/path` | 下钻时按需调用。                                                                                                           |
| 插件 Manifest      | `GET /api/v1/workline/plugins/{plugin_key}/manifest`                                                             | 静态拓扑、设备角色、能力声明。                                                                                             |
| 解除急停           | `POST /api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop`                                    | 成功后必须刷新监控投影。                                                                                                   |
| 对账核销           | `POST /api/v1/workline/operations/reconciliations/sessions/{session_id}/resolve`                                 | 成功后必须刷新监控投影。                                                                                                   |

`RuntimeWorklineMonitorProjectionResponse` 至少承担以下动态语义：

- `summary`：工作线身份、插件、区域和运行摘要。
- `boundary`：唯一承载 `workline_readiness`、`station_lease`、`single_layer_rack_snapshot`、`rack_operation_wait` 等工作线级边界判断；不保留这些字段的旧顶层平铺兼容。
- `device_nodes`：主屏展示所需的设备身份、角色/顺序、运行状态、open/blocked command 摘要、runtime hold / current session 摘要和异常摘要；使用 `RuntimeMonitorDeviceNode`，不得复用设备详情页 DTO。
- `active_sessions.items/total_count/truncated`：主屏在制品和会话位置摘要；items 使用 `RuntimeMonitorSessionItem`，不得携带 raw `event_payload`；`total_count` 是按相同过滤条件统计的真实总数。
- `recent_failed_traces.items/total_count/truncated` / `recent_completed_traces.items/total_count/truncated`：主屏摘要列表；items 使用 `RuntimeMonitorTraceItem`，详细证据走 Trace 下钻接口。
- `resource_evidence.kind/items/total_count/truncated`：资源证据类型、明细、总量与截断提示。
- `action_candidates.pending_reconciliation`：行动舱对账核销的唯一主屏候选；字段类型为 `RuntimeMonitorReconciliationCandidate | null`，包含 `session_id`、`session_code`、`trace_id`、`request_id`、`reason`、`source_kind`、`device_id`、`command_id`、`wait_token`、`occurred_at`、`deadline_at`、`late_evidence_received` 等呈现与提交所需字段；不得复用 `TraceSessionItem` 或携带 raw payload。
- `generated_at`：后端生成投影的时间，用于前端显示数据新鲜度；格式为 aware UTC ISO，遵守项目 timezone 规则。

实施命名约束：

- 后端路由函数、Service 方法和测试应使用 `monitor_projection` / `projection` 语义，例如 `get_workline_monitor_projection`。不保留 `get_workline_detail` 作为主屏入口别名。
- 前端 API adapter 使用 `worklineProjection(worklineId)`，不保留 `worklineDetail(worklineId)` 作为该路由入口。
- 前端类型以 OpenAPI 生成类型为唯一真源。`src/types/runtime.ts` 可以 re-export / alias `components["schemas"]["RuntimeWorklineMonitorProjectionResponse"]` 及监控投影子类型，禁止为主屏投影手写同构接口；Trace/Debug 既有手写类型只有在直接消费 `/runtime/worklines/{id}` 时才纳入本次迁移。
- 前端生成类型中可以继续存在 Trace/Debug 页面需要的 `RuntimeTraceListItem`，但所有 `GET /runtime/worklines/{id}` 消费者不得继续引用旧 `RuntimeWorklineDetailResponse`。

禁止事项：

- 不把 `RuntimeTraceListItem.event_payload` 这类 raw payload 带入主屏投影。
- 不把 `RuntimeTraceListItem`、`RuntimeDeviceSummary`、`RuntimeWorklineDeviceItem` 作为主屏投影的外部响应 DTO。
- 不把设备详情页的 callback/command 明细、`blocked_detail_json` 或 raw payload 带入主屏投影。
- 不返回可由 Manifest 静态提供的拓扑、泳道、能力说明。
- 不让前端从多个接口异步合并出同一个主屏事实。

### 5.2 SSE Envelope

事件域统一为 `workline_runtime`。未发布系统不保留旧事件域兼容。

```typescript
interface RuntimeSSEEnvelope {
  domain: 'workline_runtime'
  entity: 'device' | 'session' | 'safety' | 'hold' | 'outbox' | 'command' | 'reconciliation'
  action: string
  keys: {
    workline_id: number
    device_id?: number
    session_id?: number
  }
  payload?: Record<string, unknown>
}
```

约束：

- `keys.workline_id` 是工作线相关事件的主路由键。
- `keys.device_id` 与 `keys.session_id` 使用下划线命名，不再接受 `work_line_id`。
- `payload` 不作为前端状态合并依据。
- 如果后端无法提供可靠 replay，本期只保证“事件触发刷新”，不承诺断线期间事件补偿。

### 5.3 未来契约项

以下能力不进入本期实现，只作为后续待办：

- **P3：持久化 runtime event replay**。用于断线恢复后的事件补偿和审计，不影响本期监控投影优先策略。
- **未来：ECS/WMS 物理占用真值模型**。当后端具备可信 physical occupancy contract 后，再升级货格语义。

---

## 6. 前端状态与模块边界

### 6.1 Store

`src/stores/workline-runtime.ts` 保持监控投影优先：

- 保存工作线列表。
- 保存当前工作线监控投影。
- 提供刷新列表与刷新监控投影的动作。
- 派生热点设备、会话数量等只读计算值。

不新增长期存在的 `devicesMap`、`sessionsMap`、`activeIncidents` 状态容器。需要查找时由当前监控投影临时派生。

实施时应把旧 `detail` 语义命名一并删除：状态字段使用 `projection` 或 `monitorProjection`，动作使用 `loadProjection` / `refreshProjection`。不保留 `detail`、`loadDetail`、`refreshDetail` 兼容别名。

页面调用约束：

- `WorklineMonitorPage.vue` 只从 Store 读取 `projection`，并把 `projection.summary`、`projection.device_nodes`、capped session/trace sections 传给子组件。
- 行动舱操作成功后刷新 `projection` 和必要的工作线摘要列表；失败时保留旧 `projection`，不得乐观改写本地资源证据。
- 设备 Inspector、Trace Explorer、Session/Trace path 仍按用户下钻触发专用 API，不把结果回灌到主屏 projection。

### 6.2 SSE Store 与组合式逻辑

SSE 相关逻辑只负责：

- 连接状态。
- 最近事件。
- 断线、重连和错误提示。
- 将合法 `workline_runtime` 事件交给页面刷新调度器。

旧事件域过滤逻辑应被删除，测试只覆盖 canonical domain。

### 6.3 Scene Builder

场景模型唯一入口为 `src/utils/runtime-scene.ts`。

职责：

- 读取 Manifest 中的拓扑、设备角色和能力声明。
- 读取监控投影中的设备、会话、命令和证据。
- 输出组件可直接渲染的场景投影。
- Manifest 缺失时输出语义降级模型。

旧文件 `src/components/runtime/monitor/runtime-scene-model.ts` 属于历史双轨实现，应删除；有价值的断言迁移到 `tests/unit/utils/runtime-scene.test.ts`。

`buildRuntimeSceneModel` 的输入应改为 `RuntimeWorklineMonitorProjectionResponse + WorkLinePluginManifestSummary`。它只读取投影中的 `device_nodes`、capped session/trace sections 和 `resource_evidence`，不得读取旧 `detail.devices`、`detail.active_sessions`、`resource_evidence_items` 平铺字段。

---

## 7. UI/UX 设计

Design Review 判定：本计划是面向现场值守的 APP UI，不是营销页或装饰型 dashboard。设计目标是“3 秒内判断是否需要介入，30 秒内定位对象，2 分钟内完成可闭环动作”。当前设计系统可支撑该方向，但实施前必须把信息层级、交互状态、响应式和可访问性写入验收口径，避免实现阶段退化为堆叠卡片。

### 7.0 既有设计资产与明确不做

必须复用的既有资产：

- `DESIGN.md` 的 P9 MCS 工业仓储风格：深色默认、工业琥珀信号色、交通灯语义色、Inter + JetBrains Mono、8-12px 圆角、3px 语义色条、4px spacing grid。
- 已有 Runtime 组件词汇：`WorklineHealthHero`、`WorklineLiveOverview`、`RuntimeSceneMap`、`RuntimeSceneFocusPanel`、`RuntimeSceneEvidencePanel`、`WorklineReconciliationPanel`、`WorklineSafetyIncidentPanel`。
- 已有运行态语义：Runtime Hold、blocked outbox、open command、active session、resource evidence 和 Trace 下钻，而不是新造另一套现场术语。

本次明确不做：

- 不建立新的设计系统、主题色或字体体系。
- 不做营销式 hero、三列 feature grid、装饰性渐变、毛玻璃、漂浮图形或持续背景动画。
- 不把页面拆成多个互不关联的 dashboard card mosaic；三栏布局必须服务“目录 -> 场景 -> 行动”的操作路径。
- 不把移动端设计成完整 SCADA 操作台；移动端只承担巡检和紧急判断，复杂处置仍以桌面端为主。

### 7.1 视觉方向

采用 P9 工业 SCADA 密度层，不采用赛博朋克装饰风格。

要求：

- 复用项目现有 `DESIGN.md` 中的颜色、间距、边框、字号和状态 token。
- 布局强调可扫描、低噪音、高信息密度。
- 急停、hold、阻塞、对账冲突等高风险状态拥有最高视觉权重。
- 默认静态呈现，减少持续动画；仅关键危险状态允许短促提醒。
- 尊重 reduced motion；大图或高负载场景自动降低动画和阴影成本。

### 7.1.1 首屏信息层级

首屏扫描顺序固定为：

1. **是否需要立即介入**：readiness、急停、安全锁止、Runtime Hold 和阻塞命令。
2. **介入对象在哪里**：选中工作线、异常设备、异常会话、资源证据锚点。
3. **现在能做什么**：解除急停、对账核销、刷新投影和下钻 Trace/设备。

桌面端结构：

```text
+----------------------------------------------------------------------------+
| Header: 工作线监控 / SSE 状态 / 数据更新时间 / 手动刷新                    |
+----------------+--------------------------------------+--------------------+
| 左栏目录       | 中栏运行场景                         | 右栏行动舱         |
| 280-320px      | 自适应主工作区                       | 360-400px          |
| 搜索/筛选      | readiness + topology + evidence      | 可闭环动作/错误恢复 |
| 线体列表       | 焦点对象与证据定位                   | Trace/设备下钻     |
+----------------+--------------------------------------+--------------------+
| 底部：近期事件、资源证据列表、截断提示                                     |
+----------------------------------------------------------------------------+
```

约束：

- 任一时刻只允许一个最高权重危险信号占据主视觉；其它告警进入次级列表，避免红黄状态同时争抢注意力。
- 中栏场景不是装饰图。每个高亮节点必须能解释“为什么高亮”和“点击后看什么”。
- 右栏行动舱只展示当前选中线体/对象能执行的动作；不可执行动作不占主按钮位置。
- 底部日志和证据列表不得抢占首屏主路径，默认作为验证和追溯区。

### 7.2 左栏：工作线目录

- 展示线体名称、编码、区域、健康摘要、会话数和告警数。
- 展示 SSE 连接状态和数据陈旧状态。
- 搜索仅覆盖线体名称、线体编码、区域名称；不做拼音首字母搜索。
- 列表刷新来自监控投影或事件触发后的摘要刷新，不由前端局部拼装。

### 7.3 中栏：运行场景

- Manifest 可用时按拓扑渲染泳道、设备节点和流向。
- Manifest 不可用时按设备角色与监控投影字段生成语义分组。
- 设备节点展示运行状态、命令状态、阻塞原因和关联会话数量。
- 会话与物料流显示为运行投影，不宣称物理轨迹精确坐标。
- 资源证据以“证据类型、证据数量、冲突提示、截断提示”的方式呈现。

货架与格口语义：

- `active_bin_racks` 只能表示运行投影中的资源证据视图。
- UI 文案使用“资源证据”“运行投影”“证据冲突”等表达。
- 不使用“空闲/占用/对账中”作为物理格口真值。
- 操作完成前不乐观改写本地货格状态。

### 7.4 右栏：行动舱

行动舱只保留本期可闭环动作。

| 动作     | 触发条件                   | 成功后行为                           | 失败后行为                       |
| -------- | -------------------------- | ------------------------------------ | -------------------------------- |
| 解除急停 | 当前线体存在急停或安全锁止 | 调用后端接口，刷新监控投影和列表摘要 | 保持原投影，展示错误和可重试入口 |
| 对账核销 | 选中可核销会话或证据项     | 调用后端接口，刷新监控投影           | 保持原投影，展示错误和可重试入口 |
| 手动刷新 | 任意时刻                   | 重新拉取监控投影                     | 展示失败状态，不清空已有投影     |

取消维护旁路能力。本期不展示按钮、不保留隐藏入口、不写 TODO。

对账核销面板从 `projection.action_candidates.pending_reconciliation` 获取 owner session，不从 capped `active_sessions.items`、`recent_failed_traces.items` 或 Trace 查询结果反推。若该字段为 `null`，行动舱显示无可核销对象的原因，不展示提交按钮。

### 7.5 底部日志与证据列表

- 日志行点击可以定位设备或会话，但定位依据来自当前监控投影。
- 大量日志、证据、格口和设备列表必须设置 DOM 上限。
- 超出阈值时使用分页、折叠或虚拟滚动。
- 截断时必须展示总量与当前展示数量，避免误判为数据缺失。

### 7.6 交互状态覆盖

| 功能区          | Loading                                     | Empty                                                        | Error                                      | Success                             | Partial / Stale                           |
| --------------- | ------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------ | ----------------------------------- | ----------------------------------------- |
| 工作线目录      | 保留布局骨架和搜索框，列表用低对比 skeleton | 显示“暂无工作线”，保留刷新入口和环境提示                     | 保留上次列表或空态，展示重试按钮           | 选中线体拥有明确左侧色条和焦点态    | SSE 断线时显示陈旧徽标，不清空列表        |
| 监控投影        | 选中线体后中栏显示场景骨架和更新时间占位    | 无 active session/证据时显示“当前无运行证据”，不显示空白画布 | 保留上一份投影，顶部显示错误和重试         | readiness、设备、会话、证据同步更新 | `generated_at` 超预算时显示“数据可能陈旧” |
| Manifest / 场景 | Manifest 未返回前显示语义分组骨架           | 无拓扑时切换为设备角色分组                                   | Manifest 失败时展示降级原因和受影响能力    | 拓扑、设备和证据锚点可定位          | 拓扑缺设备时显示“未定位设备/证据”分组     |
| 行动舱          | 动作按钮进入 loading，避免重复提交          | 无可执行动作时显示原因和下钻建议                             | 失败后保留原投影，显示错误、重试和权限提示 | 成功后刷新投影并短暂标记完成        | 投影陈旧时危险动作需要刷新后再执行        |
| 日志与证据      | 列表区域局部 skeleton，不遮挡主场景         | 显示“暂无近期事件/证据”，说明只代表当前投影窗口              | 查询失败时不影响主场景                     | 展示当前数量、总量和截断提示        | 截断时优先显示高风险证据并提示总量        |

### 7.7 用户旅程与情绪弧

| 阶段              | 用户行为                | 用户感受               | 计划必须提供                                                 |
| ----------------- | ----------------------- | ---------------------- | ------------------------------------------------------------ |
| 5 秒内进入页面    | 扫描线体是否可运行      | 需要确定有没有事故     | Header + 左栏 + 中栏顶部同时给出最高风险状态，不要求阅读日志 |
| 30 秒内定位       | 点击异常线体或场景节点  | 需要知道人该去哪里看   | 场景节点、焦点面板和证据列表共享同一选中对象                 |
| 2 分钟内处置      | 执行解除急停或对账核销  | 担心误操作和状态不一致 | 行动舱展示触发条件、执行中状态、失败恢复和刷新结果           |
| 异常网络/后端失败 | 看到刷新失败或 SSE 断线 | 担心数据过期           | 页面保留旧投影、标记更新时间、解释陈旧风险                   |
| 长期重复使用      | 多次巡检不同线体        | 需要稳定肌肉记忆       | 左中右布局、按钮位置、语义色和下钻入口保持稳定               |

### 7.8 响应式与可访问性

响应式策略：

- `>= 1280px`：完整三栏，左栏 280-320px，中栏自适应，右栏 360-400px；底部日志/证据横跨主工作区。
- `768-1279px`：目录收敛为可折叠侧栏；中栏优先显示场景；行动舱置于场景下方或右侧抽屉，危险动作仍保持可见。
- `< 768px`：使用“线体 / 场景 / 行动”分段切换；默认进入最高风险对象所在分段；场景允许语义列表替代复杂拓扑。
- `< 480px`：隐藏非关键统计和装饰背景，只保留线体状态、最高风险对象、可执行动作和刷新/断线状态。

可访问性要求：

- 页面使用 `main`、`aside`、`section` 语义区，并为左栏目录、中栏场景、右栏行动舱提供可读 label。
- 所有场景节点、目录项和行动按钮支持键盘焦点；焦点环沿用 `DESIGN.md` 的琥珀 2px outline。
- 不仅靠颜色表达危险、警告、成功；必须同时提供文本、图标或状态徽标。
- 所有可点击目标最小 44px；紧凑按钮视觉可小，但点击区域不得低于 40x40px。
- 尊重 `prefers-reduced-motion`，危险提示可以短促闪烁，但不能无限循环制造噪音。
- 错误提示和动作结果需要能被屏幕阅读器感知；关键刷新失败、SSE 断线、动作成功/失败使用适当 live region。

---

## 8. 性能与可靠性要求

### 8.1 刷新预算

- 普通 SSE 事件合并刷新，避免一事件一请求。
- 高风险事件立即刷新，不等待普通节流窗口。
- 同一工作线监控投影请求不并发叠加。
- Manifest 请求按 `plugin_key` 缓存，同一版本不重复拉取。
- 普通事件刷新只拉取监控投影；设备详情、Trace 路径和 Trace 查询只在用户进入对应下钻视图时按需请求。

### 8.2 渲染预算

- 场景构建使用纯函数或稳定计算入口，避免组件内重复遍历大对象。
- 证据、日志、格口矩阵和设备流列表设置可见数量上限。
- 动画只服务于风险识别，不作为常态背景效果。

### 8.3 失效与降级

- 监控投影刷新失败时保留上一份投影，并标记更新时间和错误。
- SSE 断线时标记数据可能陈旧。
- Manifest 失败时降级到语义分组视图。
- 后端返回 `resource_evidence.truncated = true` 时，UI 必须展示截断提示。

---

## 9. 验收与测试计划

### 9.1 文档验收

- SPEC 不再描述新增 `/topology` 或 `/states` 接口。
- SPEC 不再描述新增 `/monitor-snapshot` 平行接口。
- SPEC 明确主屏不使用大而全 `RuntimeWorklineDetailResponse` 作为刷新合同。
- SPEC 明确 `/runtime/devices`、`/traces/query`、Trace/Session path 只用于下钻或专用页面，不作为主屏多源拼装依据。
- SPEC 不再要求前端细粒度合并 SSE Payload。
- SPEC 明确 `workline_runtime` 是唯一 runtime SSE domain。
- SPEC 明确 `active_bin_racks` 是资源证据投影，不是物理库存真值。
- SPEC 明确维护旁路取消。

### 9.2 后续实施验收

实施阶段应覆盖以下检查：

- Backend：事件发射器输出 canonical envelope，包含 `domain: "workline_runtime"` 与标准 keys。
- Backend：新增 `tests/api/test_workline_runtime_sse.py`，覆盖 runtime SSE canonical envelope、`domain: "workline_runtime"`、snake_case keys、旧主屏事件域不输出，以及安全、hold、reconciliation、device、session、outbox、command 等 entity/action 能被后端稳定表达；断线、高风险、普通刷新分类归属前端 `runtime-event` 测试。
- Backend：`GET /api/v1/workline/runtime/worklines/{workline_id}` 的 `data` payload 返回轻量 `RuntimeWorklineMonitorProjectionResponse`，统一 `ResponseSchemaModel[...]` envelope、`biz:workline:list` 权限和 `DEFAULT_NOT_FOUND` 失败语义保持不变。
- Backend：主屏投影不返回 raw `event_payload`、设备详情 callback/command 明细或 Manifest 可提供的静态拓扑。
- Backend：OpenAPI schema 中的监控投影不得引用 `RuntimeTraceListItem`、`RuntimeDeviceSummary`、`RuntimeWorklineDeviceItem`、`RuntimeWorklineDetailResponse`。
- Backend：`active_sessions`、`recent_failed_traces`、`recent_completed_traces`、`resource_evidence` 的 `total_count/items/truncated` 语义一致，`total_count` 为按相同过滤条件统计的真实总数，不受展示 cap 或内部加载上限影响。
- Backend：`action_candidates.pending_reconciliation` 覆盖 pending runtime reconciliation owner；即使 capped session/trace sections 截断，该 owner 仍可驱动行动舱核销。
- Backend：`generated_at` 使用 aware UTC ISO，不对 naive datetime 调用 `.timestamp()`。
- Backend：Trace/Debug 相关接口仍可使用 `RuntimeTraceListItem.event_payload`，但该字段只能存在于 Trace/Debug 合同中。
- Frontend：runtime event 工具只接受 `workline_runtime`。
- Frontend：所有 `GET /runtime/worklines/{id}` 调用链使用 `RuntimeWorklineMonitorProjectionResponse` 生成类型；不得导入或别名兼容 `RuntimeWorklineDetailResponse`。
- Frontend：`src/types/runtime.ts` 对监控投影只 re-export / alias OpenAPI 生成类型，不手写监控投影 shape；Trace/Debug 既有手写类型不因本任务被整体迁移，除非它们仍消费 `/runtime/worklines/{id}`。
- Frontend：监控 store 使用 `projection/loadProjection/refreshProjection` 语义命名，不保留 `detail/loadDetail/refreshDetail`。
- Frontend：SSE 普通事件触发合并刷新，安全/hold/重连/陈旧事件触发立即刷新。
- Frontend：行动舱 clear-estop 和 reconciliation resolve 成功/失败/权限场景均刷新或保留监控投影符合预期。
- Frontend：`WorklineReconciliationPanel` 接入 `projection.action_candidates.pending_reconciliation`；候选为空、resolve 成功、resolve 失败和权限不足均有页面测试。
- Frontend：新增 `tests/unit/views/runtime/WorklineMonitorPage.test.ts`，覆盖投影加载、手动刷新、刷新失败保留旧投影、行动舱成功/失败路径。
- Frontend：旧 scene model 删除后，`runtime-scene` 测试覆盖 Manifest、语义降级、资源证据、截断和异常字段。
- Frontend：页面实现必须遵循 Design Review 收敛后的 APP UI 约束：三栏操作路径、单一最高风险主视觉、状态矩阵、响应式分段策略和 a11y 语义区。
- Static guard：所有守卫按“零匹配即通过”执行；`rg` 无匹配返回 1 是预期成功，任何正向命中都必须先解释并收敛范围，不能作为 warning 放过。
- Static guard：该路由消费者迁移完成后，前端守卫分两类执行，避免 `loadDetail/refreshDetail` 这类通用命名误报：
  - `! rg "RuntimeWorklineDetailResponse|runtime-scene-model|worklineDetail\\(" src/views/runtime src/stores src/utils src/components/runtime tests/unit`
  - `! rg "loadDetail|refreshDetail" src/stores/workline-runtime.ts src/views/runtime/worklines tests/unit/stores tests/unit/views/runtime`
- Static guard：后端 runtime SSE 守卫限定在主屏事件发射路径，必须零匹配旧主屏事件域：
  - `! rg '"domain": "(workline_trace|workline|device|outbox|command|workline_safety|safety)"' ../wes_backend/src/app/device/services ../wes_backend/src/app/callback/services ../wes_backend/src/app/workline/services ../wes_backend/src/celery_app/tasks/workline.py`
- Smoke：扩展 `pnpm smoke:runtime:agent-browser`，覆盖工作线目录、场景、行动舱、证据列表和断线提示；fixed fixture 也必须使用 projection shape，不得继续伪造旧 detail shape。

### 9.3 失败模式与测试映射

| 失败模式                           | 必须覆盖的测试                                                      | 用户可见行为                               |
| ---------------------------------- | ------------------------------------------------------------------- | ------------------------------------------ |
| 主屏投影泄漏 raw `event_payload`   | Backend schema / JSON 负向断言                                      | 不显示 raw payload，详细证据只能下钻 Trace |
| capped 列表被误读为完整列表        | Backend `total_count/truncated` 测试 + UI 截断提示测试              | 显示总量和截断提示                         |
| 旧 SSE 域残留                      | Backend SSE 测试 + 后端旧域静态守卫 + 前端 `runtime-event` 分类测试 | 主屏只接受 `workline_runtime` 刷新信号     |
| pending reconciliation 被 cap 截断 | Backend projection 测试 + `WorklineMonitorPage` 行动舱测试          | 对账核销入口仍可见，或明确显示无候选原因   |
| SSE 高频事件导致并发刷新乱序       | Store request sequence 单测                                         | 只保留最后一次投影结果                     |
| Manifest 加载失败                  | `runtime-scene` 语义降级测试                                        | 主屏显示诊断信息，不伪造物理拓扑           |
| clear-estop / reconciliation 失败  | 页面或组件失败路径测试                                              | 保留旧投影并显示可重试错误                 |
| 下钻 API 被误用于主屏拼装          | API adapter / page 单测或静态导入检查                               | 主屏只刷新 projection                      |
| UI 退化为堆叠卡片                  | 页面结构测试 + smoke 截图检查                                       | 仍保持目录 -> 场景 -> 行动的主路径         |
| 颜色成为唯一状态信号               | a11y / DOM 断言                                                     | 危险、警告、成功均有文本或图标辅助         |
| 移动端复杂拓扑不可读               | smoke 移动视口检查                                                  | 使用分段视图或语义列表，不强行压缩完整拓扑 |

建议验证命令在对应仓库根目录运行。前端类型生成和 `contract:verify -- --require-backend` 执行前，必须先启动后端 OpenAPI 服务，或显式配置脚本使用的 OpenAPI URL。

```bash
# wes_backend
uv run pytest tests/api/test_workline_runtime_api.py
uv run pytest tests/api/test_workline_runtime_sse.py

# wes_frontend
pnpm generate:types
pnpm generate:zod
pnpm contract:verify -- --require-backend
pnpm type:check
pnpm test -- runtime-event
pnpm test -- runtime-scene
pnpm test -- WorklineMonitorPage
pnpm smoke:runtime:agent-browser
```

---

## 10. 实施任务拆解

| 任务                             | 优先级 | 范围                                                                                                                                                                     | 验收                                                                                                                           |
| -------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| T1 后端监控投影合同              | P1     | 将 `/runtime/worklines/{workline_id}` 响应从 `RuntimeWorklineDetailResponse` 收窄为 `RuntimeWorklineMonitorProjectionResponse`，并调整 route/service/model/API/SSE tests | 后端测试证明主屏投影不引用旧 detail/trace/device DTO，不含 raw `event_payload`；SSE 测试证明旧事件域不再作为主屏刷新合同输出   |
| T2 前端 projection 命名收敛      | P1     | 将 API adapter、Store、页面、子组件调用从 `detail/loadDetail` 改为 `projection/loadProjection`                                                                           | 第 9.2 节静态守卫无正向引用                                                                                                    |
| T3 Scene Builder 单轨化          | P1     | 删除旧 `runtime-scene-model.ts`，只保留 `src/utils/runtime-scene.ts` 作为场景模型入口                                                                                    | `runtime-scene` 单测覆盖 Manifest、降级、资源证据、截断、空状态                                                                |
| T4 合同与烟测门禁                | P1     | 更新 OpenAPI 生成类型、Zod schema、contract verify、runtime smoke fixture                                                                                                | `pnpm generate:types`、`pnpm generate:zod`、`pnpm contract:verify -- --require-backend`、`pnpm type:check`、runtime smoke 通过 |
| T5 UI 状态、响应式与可访问性收敛 | P1     | 按第 7 章实现信息层级、交互状态矩阵、桌面/平板/移动布局和键盘/读屏语义                                                                                                   | `WorklineMonitorPage` 单测和 runtime smoke 覆盖 loading/empty/error/stale、截断提示、移动视口、键盘焦点和非纯颜色状态信号      |

实施顺序：

```text
Backend projection DTO/API
  -> OpenAPI 类型同步
  -> Frontend API adapter + Store rename
  -> WorklineMonitorPage + Scene Builder
  -> UI states / responsive / accessibility pass
  -> Unit / contract / smoke tests
```

该任务组不建议拆成长期并行分支。后端合同先落地后，前端 Store/Page/Scene 可短并行推进，但合并前必须以同一份 OpenAPI 类型和同一组 contract tests 对齐。

---

## 11. 后续待办

| 优先级 | 项目                 | 说明                                                     |
| ------ | -------------------- | -------------------------------------------------------- |
| P3     | Runtime event replay | 建立可持久化 replay 的事件流，用于断线恢复、审计和追责。 |
| Future | 物理占用真值模型     | 等 ECS/WMS 提供可信物理占用契约后，再升级货格真值语义。  |

---

## GSTACK REVIEW REPORT

| Review        | Trigger               | Why                       | Runs | Status                | Findings                                                                                                                 |
| ------------- | --------------------- | ------------------------- | ---- | --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| CEO Review    | `/plan-ceo-review`    | Scope & strategy          | 0    | Not run for this SPEC | -                                                                                                                        |
| Codex Review  | `/codex review`       | Independent 2nd opinion   | 0    | Not run               | -                                                                                                                        |
| Eng Review    | `/plan-eng-review`    | Architecture & tests      | 7    | CLEAR                 | 最终审计补齐 backend SSE 专项测试、旧事件域零匹配守卫、行动舱手动刷新范围和 SPEC/Plan 真源一致性；0 critical gaps        |
| Design Review | `/plan-design-review` | UI/UX gaps                | 1    | CLEAR (text-only)     | gstack designer 不可用；已补齐 APP UI 分类、既有设计资产、不做事项、首屏层级、交互状态矩阵、用户旅程、响应式和 a11y 验收 |
| DX Review     | `/plan-devex-review`  | Developer experience gaps | 0    | Not run               | -                                                                                                                        |

- **UNRESOLVED:** 0.
- **VERDICT:** ENG + DESIGN CLEARED，SPEC 已围绕单一破坏性合同、端到端投影收敛路径和监控页 UI/UX 验收更新；当前仅作为文档优化结果，不代表已进入代码实施。
