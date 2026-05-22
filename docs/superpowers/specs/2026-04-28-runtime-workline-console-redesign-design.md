# 工作线运行工作台重构设计

> 日期：2026-04-28  
> 范围：`工作线运行态`、`Trace 处置台`、`Sandbox 调试台`  
> 目标：以工作线为主入口，把实时设备态势、Session/Trace 路径观察、Sandbox 主动调试合并为一套运行工作台体验。

## 1. 背景

当前运行监控中心已经有三类页面：

- `工作线运行态`：展示工作线列表、线体摘要、设备拓扑、活跃 Session、失败 Trace、设备详情。
- `Trace 处置台`：支持按 Trace ID、Request ID、Session ID、Command Code、Dispatch Key 查询案件，并展示 Timeline、阻塞点、证据分组。
- `Sandbox 调试台`：展示 SIMULATION 模式下待处理 Outbox，并提供 manual session operation 和 replay inbox 表单。

用户明确不满意现状：

- 按 Trace 查询后，不能清晰看到这个 Trace 经历了哪些设备。
- 不能看清每台设备在这个 Trace 中做了什么工作。
- 不能直接判断当前卡在哪台设备，以及原因是什么。
- Sandbox 只能处理 pending outbox，不能主动发送 event 驱动整个 plugin。
- 项目仍在开发中，没有历史发布，可以做破坏性重构。

因此这次设计不以“三个页面小修小补”为目标，而是重新定义运行工作台的信息架构。

## 2. 已验证事实

以下事实来自当前前端页面、前端代码和后端契约。

### 2.1 当前页面事实

通过本地浏览器登录 `admin/admin123` 查看：

- `/runtime/traces` 首屏主要是锚点查询：
  - Trace ID / Request ID / Session ID / Command Code / Dispatch Key
  - 输入框
  - 查询案件按钮
  - 空态下没有工作线、设备拓扑、活跃任务上下文
- `/runtime/worklines` 已经有工作线列表和设备拓扑：
  - 左侧工作线列表
  - 线体摘要
  - `WorklineTopologyStrip`
  - 设备节点状态
  - 活跃 Session 和失败 Trace 区域
- `/runtime/sandbox` 当前是 outbox 管理页面：
  - 待处理 Outbox 表格
  - Payload 查看
  - 人工推进 Session
  - Replay Inbox
  - 没有工作线/设备优先的主动调试入口

### 2.2 前端代码事实

- 路由文件：`src/router/routes/runtime.ts`
  - `RuntimeDashboard` -> `src/views/runtime/overview/RuntimeOverviewPage.vue`
  - `RuntimeTraceExplorer` -> `src/views/runtime/traces/TraceExplorerPage.vue`
  - `RuntimeWorklines` -> `src/views/runtime/worklines/WorklineRuntimePage.vue`
  - `RuntimeSandbox` -> `src/views/runtime/sandbox/RuntimeSandboxPage.vue`
- 运行态 API 封装：`src/api/modules/runtime.ts`
  - `overview()`
  - `worklines()`
  - `worklineDetail(worklineId)`
  - `devices(worklineId)`
  - `deviceDetail(deviceId, worklineId)`
  - `queryTraces(payload)`
  - `traceBy*`
  - `sandboxPending(limit)`
  - `replayInbox(...)`
  - `manualSessionOperation(...)`
- 现有可复用组件（均位于 `src/components/common/runtime/`）：
  - `WorklineTopologyStrip.vue` — 横向流水线拓扑（线性节点+连线）
  - `DeviceDetailPanel.vue` — 设备详情面板（最近行为/异常模式/关联 Trace）
  - `WorklineHealthHero.vue` — 工作线健康摘要卡
  - `DeviceHealthHero.vue` — 设备健康摘要卡
  - `TraceTimeline.vue` — Timeline 主叙事时间线
  - `TraceBlockingPointCard.vue` — 阻塞点诊断卡
  - `TraceCaseHero.vue` — Trace 案件顶部摘要
  - `TraceRelatedSidebar.vue` — 关联案件侧边栏
  - `TraceNextActions.vue` — 下一步建议动作
  - `RuntimeStatusBadge.vue` — 通用状态徽章
  - `RuntimeSignalStrip.vue` — 统计卡片条
  - `RuntimeSystemVerdict.vue` — 系统级裁决摘要
  - `RuntimePriorityQueue.vue` — 优先处置队列
  - `RuntimeHealthBreakdown.vue` — 健康分布统计
  - `RuntimeEmptyState.vue` — 空状态占位
  - `RuntimeFrozenNotice.vue` — SSE 冻结提示
  - `RuntimeLastUpdated.vue` — 最后刷新时间
  - `RuntimeStickyContextBar.vue` — 吸顶上下文条

#### 现有代码架构模式

通过代码审查确认的架构约束，重构时必须遵循：

- **布局模式**：全部使用 CSS Grid + Flexbox，不使用 `el-row/el-col`。大页面 Grid 分栏，面板内部 Flex column。当前 WorklineRuntimePage 用 `grid-template-columns: 340px minmax(0, 1fr)` 双栏。
- **状态管理**：没有使用 Pinia/Vuex store（项目只有 `stores/timezone.ts`），全部使用本地 `ref`/`computed` + `createCoalescedAsyncTask` 防抖刷新。
- **数据流**：URL query 参数驱动选中状态（`worklineId`, `deviceId`），`watch` 触发 API 加载，ref → computed → template 单向流。
- **实时更新**：统一通过 `useRuntimePageChrome()` composable 获取 SSE 连接和事件，`watch(lastEvent)` 触发刷新。SSE 事件域 `workline_trace`，通过 `isRelevantRuntimeEvent(event, scope)` 过滤。
- **API 调用**：`runtimeApiMethods` 封装了 `worklineApiMethods`，链式调用 `.send()` 返回 Promise。
- **设计语言**：深色工作台主题。琥珀色（amber/orange，`rgb(245, 158, 11, ...)`）作为选中/主操作/路径高亮。slate 色阶文字。圆角 14px。等宽字体用于 Session/Trace/Command/Device Code。
- **路由工具**：`utils/runtime-route.ts` 提供 `buildRuntimeWorklineQuery()` 和 `buildRuntimeTraceQuery()`，重构时需扩展支持 `mode` 参数。
- **优先级工具**：`utils/runtime-priority.ts` 提供 `classifyToTiers()`, `computeVerdictSummary()`, `getWorklineRiskScore()`, `getDeviceRiskScore()` 等，重构时复用。
- **显示工具**：`utils/runtime-display.ts` 提供 `resolveRuntimeTone()`, `formatRuntimeElapsed()` 等，重构时复用。

### 2.3 后端契约事实

- `WorkLine` 已有运行模式：
  - `AUTO`
  - `MANUAL`
  - `SIMULATION`
- 后端 `RuntimeWorklineSummary` 当前没有返回 `run_mode`。
- `RuntimeWorklineDetailResponse` 当前返回：
  - `summary`
  - `devices`
  - `active_sessions`
  - `recent_failed_traces`
- `TraceDetailResponse` 当前返回：
  - `trace`
  - `summary`
  - `session`
  - `sessions`
  - `callback_logs`
  - `inboxes`
  - `commands`
  - `outboxes`
  - `dispatch_attempts`
  - `timelines`
  - `diagnostics`
- Sandbox pending 当前从 Outbox 查询 SIMULATION Session 下的 device/external dispatch。
- `/api/v1/callback/event` 已存在最小事件包络：
  - `device_code`
  - `event_type`
  - `timestamp`
  - `data`
  - `trace_id`
  - `event_id`
  - `causation_id`
- SMT plugin 已有事件模型：
  - `SCAN_COMPLETED`
  - `ESTOP_PRESSED`
  - 以及命令结果处理流程，如 `MEASUREMENT_REEL`、`MOVE_FORWARD`、`PICK_AND_PUT`

#### 后端运行时核心结构

通过代码审查确认的运行时模型关系，影响前端数据展示方式：

```
WorkLine (1) ────< (N) Device
                    Device.work_line_id -> WorkLine.id
                    Device.device_role: SCANNER/ROBOT_ARM/XRAY/CONVEYOR
                    Device.role_index: 同角色序号
                    Device.upstream_device_id -> Device.id (线性拓扑)

WorkLine (1) ────< (N) WorklineSession
                    Session.workline_id -> WorkLine.id
                    Session.run_mode: AUTO/MANUAL/SIMULATION（继承自 WorkLine）
                    Session.plugin_key: 绑定插件
                    Session.trace_id: 统一 trace

WorklineSession (1) ────< (N) WorklineTimeline  (seq_no 单调递增)
WorklineSession (1) ────< (N) WorklineInbox
WorklineSession (1) ────< (N) WorklineOutbox
WorklineSession (1) ────< (N) DeviceCommand
WorklineOutbox  (1) ────< (N) WorklineDispatchAttempt
```

Session 状态机：

```
NEW -> RUNNING -> WAITING_DEVICE_RESULT / WAITING_EXTERNAL / MANUAL_HOLD -> COMPLETED
         |          |
       FAILED    CANCELLED
```

Command 状态机：

```
PENDING -> SENT -> ACK_RECEIVED -> COMPLETED
   |         |          |
CANCELLED  TIMEOUT    FAILED
```

### 2.4 咨询确认的设计决策

以下决策在设计咨询环节由用户确认，作为后续实施的约束。

| 编号 | 决策                                                    | 理由                                                                     | 影响范围                                                               |
| ---- | ------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| D1   | Sandbox 内嵌到设备详情面板                              | Sandbox 操作必须贴着设备和 Session 上下文，独立页面丢失工作线上下文      | 删除 `/runtime/sandbox` 独立页面，Sandbox 成为 `mode=sandbox` 下的面板 |
| D2   | Overview 合并到工作线列表页 Header                      | 总览数据本质上是工作线列表的聚合，减少导航层级                           | 删除 `/runtime/dashboard` 独立页面，总览作为可折叠 Header              |
| D3   | 设备详情按 5 类 Tab 组织（当前/正在处理/历史/异常/I/O） | 对应 Session 生命周期 + I/O 证据，比笼统的"正在进行中/历史/异常"更精确   | 替代现有 `DeviceDetailPanel`                                           |
| D4   | 保留 3 个路由但重新定义职责                             | `/runtime/traces` 和 `/runtime/sandbox` 保留为深链入口，兼容已有调试流程 | 不删除路由，改为薄适配层                                               |
| D5   | 拓扑视图用水平流水线方向                                | Device 模型使用 `upstream_device_id` 单链关系，天然适合水平方向          | `WorklineRouteMap` 替代 `WorklineTopologyStrip`                        |

## 3. 第一性原则

运行工作台的核心用户不是“日志查询员”，而是正在判断线体为什么不动、设备为什么等待、plugin 为什么没推进的人。

因此主对象不应该是 `Trace ID`，而应该是：

1. 工作线：现场问题首先发生在线上。
2. Session：一次业务处理的运行上下文，包含当前状态、等待点、设备路径、失败原因。
3. 设备：物理执行单元，负责 event、command、result、callback 的输入输出。
4. Trace ID：用于检索和关联证据的锚点，不作为默认主对象。

最终界面必须回答四个问题：

- 这条工作线现在是否健康？
- 当前有哪些设备正在做事或等待？
- 某个 Session 经过了哪些设备，每台设备做了什么？
- 如果是 Sandbox 模式，我如何主动驱动下一步并立即看到结果？

### 3.1 Event vs Command 角色区分

工作线的执行流程遵循**单向事务链**模型：

```
Submit Event → [Accept Command → Submit Command Callback (循环)] → Event Compeletment
```

**主动方（Event）**：

- 由设备或外部系统主动发起
- 驱动工作线进入新状态
- 创建 Session/Trace 上下文
- 一个 Event 可能触发多轮 Command 循环

**被动方（Command + Callback）**：

- Command：plugin 对 Event 的响应，发往设备执行
- Callback：设备对 Command 的执行结果反馈
- 循环：一次 Event 可能产生多轮 Command → Callback（如扫描→取货→放货）
- 最终 Event 完成（所有 Command 处理完毕）

**UI 呈现原则**：

| 维度             | Event（主动）      | Command/Callback（被动）      |
| ---------------- | ------------------ | ----------------------------- |
| **视觉符号**     | 闪电⚡ / 输入箭头→ | 齿轮⚙ / 输出箭头←             |
| **颜色语义**     | 琥珀色（触发点）   | 中性色（执行动作）            |
| **时间线位置**   | 起点、终点标记     | 中间循环段                    |
| **证据分组**     | "入口证据"区域     | "执行证据"区域                |
| **Sandbox 操作** | 可主动发送         | 只能被动响应（生成 Callback） |

**设备步骤详情排列顺序**（按事务链）：

1. **Event received** — 触发起点（标注 Event Type）
2. **Command issued** — Plugin 响应（标注 Command Code）
3. **Outbox dispatched** — 下发设备
4. **Callback received** — 设备反馈（标注 Result/Error）
5. **[重复 2-4]** — 多轮循环时合并展示
6. **Event completed** — 终点标记（成功/失败）

### 3.2 双层事务链展示

Session 的事务链可能跨越多台设备（如 Scanner → Robot → XRay → Conveyor）。采用**双层展示**策略：

**第一层：Session 级完整时间线**

```
Timeline（全局视图）
│
├─ ⚡ DEV01: Event SCAN_COMPLETED received
│   └─ ⚙ Command循环 #1-3 (MOVE_TO / PICK / PUT)
│
├─ ⚡ DEV02: Event ARRIVAL_DETECTED received
│   └─ ⚙ Command循环 #1 (TRANSFER)
│
├─ ⚡ DEV03: Event XRAY_READY received
│   └─ ⚙ Command循环 #1-2 (MEASUREMENT / VERIFY)
│   └─ ⚠ Callback 等待: timeout 60s ← 当前阻塞点
│
└─ ✓ Session COMPLETED（或 ✗ FAILED）
```

Timeline 功能：

- 展示完整 Session 从 Event 触发到完成的全流程
- 标注每台设备的参与区间（设备名 + 事务链段）
- 突出显示当前阻塞设备（⚠ danger 标记）
- 点击某设备段 → 展开第二层 ActionList

**第二层：设备级详细事务链**

```
ActionList（选中设备 DEV03）
│
│  ⚡ EVENT: XRAY_READY（触发起点）
│  │  amber边框，点击可查看 Event payload
│
│  ⚙ COMMAND 循环 #1
│  ├─ Command issued: MEASUREMENT_REEL
│  ├─ Outbox dispatched → Device
│  └─ Callback received: SUCCESS
│
│  ⚙ COMMAND 循环 #2
│  ├─ Command issued: VERIFY
│  ├─ Outbox dispatched → Device
│  └─ ⚠ Callback 等待: timeout 60s ← 阻塞点
│
│  [待完成] Event Completed
```

ActionList 功能：

- 展示选中设备的完整事务链细节
- 每轮 Command → Callback 展开显示 payload/result
- 阻塞点高亮 + 诊断信息
- 与 Timeline 互补：Timeline 看全局流转，ActionList 眄单设备细节

**交互关系**：

- Timeline 默认显示完整 Session 流程
- 点击 Timeline 中的设备段 → ActionList 切换到该设备
- ActionList 中的阻塞点与 Timeline 同步高亮
- 路径拓扑（RouteMap）同时高亮选中设备节点

### 3.3 阻塞点诊断规范

阻塞点诊断聚焦于**单设备阻塞**，回答三个问题：

1. 哪台设备阻塞？
2. 为什么阻塞？
3. 如何解除阻塞？

#### 阻塞类型分类

| 阻塞类型        | 原因                       | 诊断提示                                | danger 级别 |
| --------------- | -------------------------- | --------------------------------------- | ----------- |
| Device Offline  | 设备离线，Command 无法送达 | "设备 DEV03 离线，无法接收 Command"     | 高          |
| Timeout         | 设备接收但超时未响应       | "Command 等待超过 60s，deadline 已过期" | 中          |
| Execution Error | 设备执行失败，返回 Error   | "Callback 返回 FAILED: XRAY_ERROR_001"  | 高          |
| Manual Hold     | Session 进入人工干预状态   | "Session 等待人工确认/干预"             | 低          |
| External Wait   | 等待外部系统/API 响应      | "等待 WMS API 响应，已发起 3 次重试"    | 中          |

#### 阻塞点诊断卡结构

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠ 阻塞点诊断                                                │
├─────────────────────────────────────────────────────────────┤
│ 【顶部】阻塞设备 + 等待类型                                  │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ ⚠ DEV03 (XRAY) — TIMEOUT                              │  │
│ │ danger 背景，设备名 + 阻塞类型                          │  │
│ │ 阻塞时长: 65s / deadline: 60s                          │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ 【中部】阻塞 Command 详情                                    │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Command: VERIFY                                        │  │
│ │ Outbox ID: OB-2026-0428-001                            │  │
│ │ 发送时间: 2026-04-28 14:30:00                           │  │
│ │ Payload:                                               │  │
│ │   { "action": "verify", "target": "BIN-A01" }         │  │
│ │ [展开详情] [复制 Payload]                               │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ 【底部】建议操作                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ SIMULATION 工作线:                                     │  │
│ │   [⚙ 模拟 Callback SUCCESS]  [⚙ 模拟 Callback FAILED] │  │
│ │                                                         │  │
│ │ 非 SIMULATION 工作线:                                  │  │
│ │   - 检查设备 DEV03 连接状态                            │  │
│ │   - 联系设备运维团队                                   │  │
│ │   - 如需人工干预，联系 Session 负责人                  │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### 诊断卡交互行为

| 场景                  | 诊断卡行为                                             |
| --------------------- | ------------------------------------------------------ |
| 多台设备阻塞          | 显示"首个阻塞设备"诊断，下方列出其他阻塞设备（可切换） |
| Timeout → Device 恢复 | 诊断卡自动消失，Timeline 更新为 Callback received      |
| Execution Error       | 诊断卡显示错误码 + 错误详情，建议查看 Raw JSON         |
| Manual Hold           | 诊断卡降低 urgency（黄色背景），显示人工干预说明       |
| External Wait         | 诊断卡显示外部系统名称 + 重试次数                      |

#### 与其他组件联动

- **Timeline**：阻塞点位置同步显示 ⚠ danger 标记
- **ActionList**：阻塞 Command 循环高亮，pending 状态用红色边框
- **RouteMap**：阻塞设备节点 danger 状态，脉冲动画提示
- **SandboxWorkbench**（SIMULATION）：诊断卡底部提供"模拟 Callback"快捷入口

#### 阻塞点调试的正确方式

**误区**：在阻塞点上发送新 Event 来"重试"或"推进"

- Event 是事务的**初始发起方**，发送新 Event = 创建新事务链
- 这会混淆因果关系，破坏原有 Trace 的完整性

**正确做法**：模拟阻塞 Command 的 Callback

- Command 是 Plugin 下发的指令，已经到达阻塞点
- Device 端只需要**响应对应的 Callback**
- 这是设备调试的本质：验证设备对已收到指令的响应能力

典型阻塞点调试流程：

```
Session-X 在 DEV03 阻塞（Timeout，等待 VERIFY Command 的 Callback）
↓
用户查看阻塞点诊断卡
↓
确认阻塞 Command: VERIFY, Payload 正确
↓
[⚙ 模拟 Callback SUCCESS] 或 [⚙ 模拟 Callback FAILED]
↓
Session-X 推进到下一状态
```

## 4. 产品目标

### 4.1 总体目标

- 把 `工作线运行态` 升级为主入口：`工作线运行工作台`。
- 进入工作线后默认展示实时工作线态势，不自动跳到某条 Trace。
- 选择 Session 后进入 Trace 聚焦模式，把 Session/Trace 路径投射到设备拓扑上。
- 选择设备后展示该设备当前工作、历史工作、异常模式、I/O 证据。
- 如果工作线是 `SIMULATION`，在同一工作台里展示 Sandbox 调试能力。
- `Trace 处置台` 和 `Sandbox 调试台` 保留为深链入口，但不再是孤立主流程。

### 4.2 非目标

本阶段不做以下内容：

- 不做完整可观测平台。
- 不做跨系统分布式 Trace 可视化。
- 不做任意 plugin 的无码编排器。
- 不做生产模式下真实设备命令发送。
- 不做复杂画布编辑器。
- 不做历史发布兼容，因为项目仍处开发期。

## 5. 新信息架构

### 5.1 路由策略

保留现有路由，但重新定义职责：

- `/runtime/worklines`
  - 主入口。
  - 展示工作线目录和实时工作线态势。
  - 支持 query：
    - `worklineId`
    - `deviceId`
    - `sessionId`
    - `traceId`
    - `mode=live|trace|sandbox`
- `/runtime/traces`
  - 深链入口。
  - 如果只有 Trace ID，先解析为 Session/Workline，再跳转或嵌入工作台聚焦模式。
  - 不再作为默认“空白查询页”。
- `/runtime/sandbox`
  - 深链入口。
  - 如果有 `worklineId`，直接打开对应工作线并进入 sandbox mode。
  - 如果没有 `worklineId`，显示 SIMULATION 工作线选择器。

### 5.2 页面层级

```text
运行监控中心
└── 工作线运行工作台
    ├── 工作线目录
    ├── 实时工作线态势
    │   ├── 线体健康摘要
    │   ├── 设备拓扑
    │   ├── 当前任务队列
    │   ├── 等待/阻塞点
    │   └── 失败热点
    ├── Trace 聚焦
    │   ├── Session 案件头
    │   ├── Trace 路径拓扑
    │   ├── 设备步骤详情
    │   ├── Timeline
    │   └── 证据分组
    └── Sandbox 调试
        ├── Event 发起
        ├── Pending Command/Outbox
        ├── Result/Callback 模拟
        └── 执行结果回放
```

## 6. 核心体验设计

### 6.1 工作线目录

工作线目录用于回答“应该先进哪条线”。

每条工作线卡片展示：

- 工作线名称和编码。
- `run_mode`：AUTO / MANUAL / SIMULATION。
- 插件和契约版本。
- 设备数。
- 活跃 Session 数。
- 等待 Session 数。
- 失败 Session 数。
- 异常设备数。
- 离线设备数。
- 最后活动时间。
- 主责团队和支持联系人。

默认排序：

1. 有失败 Session 的工作线。
2. 有离线/错误设备的工作线。
3. 有等待堆积的工作线。
4. 有活跃 Session 的工作线。
5. 最近活动时间。

### 6.2 实时工作线态势

选择工作线后，默认进入实时态势，不自动选择最高风险 Trace。

实时态势区域包含：

- 顶部线体健康摘要：
  - 运行模式
  - 插件
  - 设备健康
  - Session 健康
  - 当前结论
- 中部设备拓扑：
  - 设备顺序和 upstream/downstream 关系
  - 在线/离线/错误/维护状态
  - 当前命令
  - 当前等待事件
  - 活跃任务数量
  - 最近失败原因
- 右侧任务队列：
  - 进行中
  - 等待中
  - 异常
  - 最近完成
- 下方热点分析：
  - 高频失败 Step
  - 高频失败设备
  - 高频等待事件
  - 最近重复错误码

### 6.3 Trace 聚焦模式

Trace 聚焦模式以 Session 为主对象。

进入方式：

- 用户从工作线态势中选择一个活跃/等待/失败 Session。
- 用户从深链传入 `traceId`。
- 用户从深链传入 `sessionId`。
- 用户从 Sandbox 执行结果跳入新创建的 Session/Trace。

Trace 聚焦模式展示：

- 案件头：
  - Session Code
  - Trace ID
  - Workline
  - 当前 Step
  - 当前状态
  - 等待类型
  - deadline
  - failure domain/code/message
- 路径拓扑：
  - 只高亮该 Session/Trace 经过的设备。
  - 未经过设备保持低对比度。
  - 当前卡住设备使用 warning/danger 状态。
  - 每台设备节点展示该 Trace 中的动作摘要。
- 设备步骤详情：
  - Event received
  - Command issued
  - Outbox dispatched
  - Result/callback received
  - State transition
  - Failure/timeout
- **阻塞点诊断**（§3.3 详细规范）
- Timeline：
  - 保留现有 `TraceTimeline`，但从”主叙事”降级为”证据时间线”。
- 证据分组：
  - 入口证据：callback_logs + inboxes
  - 执行证据：commands + outboxes + dispatch_attempts
  - 状态机证据：timelines + diagnostics
  - Raw JSON：兜底

### 6.4 设备详情

选中设备后，设备详情抽屉按第一性原则分类：

- 当前：
  - 当前命令
  - 当前 Session/Trace
  - 当前等待事件
  - 当前 deadline
- 正在处理：
  - 活跃 Session 列表
  - pending command/outbox
- 历史：
  - 最近完成命令
  - 最近成功回调
  - 最近 Session
- 异常：
  - 回调失败
  - 命令失败
  - 超时
  - 错误码
  - 重复失败模式
- I/O：
  - 最近 event
  - 最近 command
  - 最近 result/callback
  - 最近 inbox/outbox

### 6.5 Sandbox 调试模式

仅当工作线 `run_mode === SIMULATION` 时显示。

Sandbox 不再是全局 outbox 表格，而是工作线内的调试台。

#### Sandbox 的第一性定位

Sandbox 是**设备端调试工具**，遵循事务链本质：

```
Event（外部触发）→ Plugin 处理 → Command 下发 → Device 执行 → Callback 反馈
                  ↑                    ↑               ↑
                  Plugin 负责          Device 调试点    Sandbox 模拟
```

**Device 调试的核心问题**：

1. Device 有没有收到上游指令？（Command 是否到达）
2. 收到的指令是否正确？（Command payload 检查）
3. 如何根据收到的指令构建结果回调？（Callback Result 模拟）

**Sandbox 操作边界**：

- ✅ **发送 Event**：模拟外部触发，创建独立调试 Session
- ✅ **模拟 Callback**：响应 pending Command，验证设备执行结果
- ❌ **接入已有 Trace 发送 Event**：违反 Event 作为"事务初始发起方"的角色定位

#### Event 发送（独立调试入口）

Event 是事务的初始发起方，Sandbox Event 发送只支持**创建新 Session**。

字段说明（对应后端 `CallbackEventRequest` 协议）：

| 字段         | 必填性 | 说明                                     |
| ------------ | ------ | ---------------------------------------- |
| device_code  | 必填   | 设备编码，默认当前选中设备               |
| event_type   | 必填   | 事件类型，来自设备能力/plugin manifest   |
| timestamp    | 可选   | Unix 毫秒时间戳，不传则后端使用接收时间  |
| data         | 可选   | 事件负载数据，结构化表单 + JSON 编辑兜底 |
| trace_id     | 可选   | 统一 Trace ID，不传则后端自动生成        |
| event_id     | 可选   | 供应商事件 ID，不传则后端自动生成        |
| causation_id | 可选   | 因果事件 ID                              |

```
┌─────────────────────────────────────────────────────────────┐
│ ⚡ Event 发送（独立调试）                                     │
├─────────────────────────────────────────────────────────────┤
│ 说明: 创建独立调试 Session，验证设备对特定 Event 的响应       │
│                                                             │
│ 【必填】                                                    │
│ Device: [下拉，默认当前选中设备]                            │
│ Event Type: [下拉，来自设备能力/plugin manifest]            │
│                                                             │
│ 【可选】                                                    │
│ Template: [下拉，按 plugin 提供常用模板，预填充 Data]        │
│ Timestamp: [当前时间，可调整，不传则后端用接收时间]          │
│ Trace ID: [留空则后端自动生成]                              │
│ Event ID: [留空则后端自动生成]                              │
│ Causation ID: [可选]                                        │
│                                                             │
│ Data: [结构化表单 + JSON 编辑兜底]                          │
│                                                             │
│ [⚡ 发送 Event]  amber 主按钮                               │
│                                                             │
│ 发送后: Plugin 处理 → 下发 Command → Sandbox 等待模拟       │
└─────────────────────────────────────────────────────────────┘
```

- `SCAN_COMPLETED`
  - device_code: `ARM01`
  - event_type: `SCAN_COMPLETED`
  - data:
    - location
    - HHPN
    - MfrPN
    - Qty
    - DateCode
    - LotCode
    - PkgID
- `ESTOP_PRESSED`
  - device_code
  - event_type: `ESTOP_PRESSED`
  - data

#### Pending Command/Outbox

当 plugin 发出 command/outbox 后，Sandbox 调试区按设备展示待处理项。

用户选中 pending item 后，可以：

- 查看下发 payload。
- 复制 payload。
- 生成成功 result。
- 生成失败 result。
- 标记超时或异常。
- 提交后自动刷新工作线态势和 Trace 聚焦。

#### Result/Callback 模拟

用户可从 pending command 生成 result/callback。

表单结构：

- Command Code
- Device Code
- Result：SUCCESS / FAILED
- Finish Time
- Data 模板
- Error Detail 模板
- Trace ID / Event ID / Causation ID

提交后：

- 调用后端 sandbox operation API。
- 后端写入 callback/result 入口。
- 前端刷新 Session/Trace。
- 如果产生新等待点，拓扑节点即时切换到 waiting。

## 7. 数据模型与 API 需求

### 7.1 必须补齐的后端字段

`RuntimeWorklineSummary` 增加：

- `run_mode: string`

原因：

- 前端需要判断是否显示 Sandbox 调试台。
- 工作线目录需要直接展示 AUTO/MANUAL/SIMULATION。

`RuntimeWorklineDetailResponse` 建议增加：

- `pending_outboxes: SandboxPendingOutbox[]`
- `recent_completed_traces: RuntimeTraceListItem[]`
- `waiting_sessions: RuntimeTraceListItem[]`

如果后端第一阶段不补齐，可前端通过现有 `queryTraces` 和 `sandboxPending` 拼装，但最终应收敛到后端聚合，减少页面并发请求和状态不一致。

### 7.2 Trace 路径视图

新增后端聚合接口：

```text
GET /api/v1/workline/runtime/sessions/{session_id}/path
GET /api/v1/workline/runtime/traces/{trace_id}/path
```

返回一个前端可直接渲染到拓扑上的视图模型：

```ts
interface RuntimeTracePathResponse {
  workline: RuntimeWorklineSummary
  session: TraceSessionItem | null
  trace: TraceContextResponse
  devices: RuntimeTraceDevicePathNode[]
  current_blocking_device_id?: number | null
  blocking_reason?: RuntimeBlockingReason | null
  evidence: TraceDetailResponse
}

interface RuntimeTraceDevicePathNode {
  device_id: number
  device_code: string
  device_name: string
  device_role: string
  role_index: number
  status: string
  participated: boolean
  is_current: boolean
  actions: RuntimeTraceDeviceAction[]
}

interface RuntimeTraceDeviceAction {
  kind:
    | 'event'
    | 'command'
    | 'outbox'
    | 'result'
    | 'callback'
    | 'transition'
    | 'failure'
    | 'timeout'
  label: string
  status: string
  occurred_at?: string | null
  message?: string | null
  trace_id?: string | null
  command_code?: string | null
  evidence_id?: number | string | null
}

interface RuntimeBlockingReason {
  category:
    | 'waiting_event'
    | 'command_failed'
    | 'outbox_pending'
    | 'device_offline'
    | 'payload_invalid'
    | 'state_rejected'
    | 'timeout'
    | 'unknown'
  title: string
  message: string
  owner: 'device' | 'plugin' | 'operator' | 'external' | 'system'
  recoverability: string
}
```

### 7.3 Sandbox operation API

新增后端工作线 operation 接口：

```text
GET  /api/v1/workline/operations/sandbox/templates?workline_id=&device_id=
POST /api/v1/workline/operations/sandbox/events
POST /api/v1/workline/operations/sandbox/results
GET  /api/v1/workline/operations/sandbox/pending?workline_id=&device_id=&limit=
```

事件请求：

```ts
interface SandboxEventRequest {
  workline_id: number
  device_id: number
  device_code: string
  event_type: string
  timestamp?: number | null
  trace_id?: string | null
  event_id?: string | null
  causation_id?: string | null
  data: Record<string, unknown>
  operator_id: string
  reason: string
}
```

结果请求：

```ts
interface SandboxResultRequest {
  workline_id: number
  device_id: number
  command_code: string
  device_code: string
  result: 'SUCCESS' | 'FAILED'
  finish_time?: string | null
  trace_id?: string | null
  event_id?: string | null
  causation_id?: string | null
  data: Record<string, unknown>
  error_detail?: Record<string, unknown> | null
  operator_id: string
  reason: string
}
```

安全规则：

- 只允许 SIMULATION 工作线使用 sandbox event/result。
- 生产环境不允许开启 SIMULATION 的既有后端规则继续保留。
- Sandbox 不向设备 payload 注入 `sandbox` 字段。
- Sandbox 操作必须记录 operator 和 reason。
- Sandbox 操作后应返回可跳转的 Session/Trace 锚点。

## 8. 前端组件拆分

所有新组件位于 `src/components/common/runtime/`，遵循现有目录结构。

### 8.1 页面

- `src/views/runtime/worklines/WorklineRuntimePage.vue`
  - 升级为主页面容器。
  - 负责 route query（`worklineId`, `deviceId`, `sessionId`, `traceId`, `mode`）、工作线选择、模式切换、整体数据刷新。
  - 整合 `RuntimeOverviewPage.vue` 的总览数据加载逻辑为可折叠 Header。
  - 布局沿用现有 CSS Grid 双栏模式（340px 左栏 + 1fr 右栏）。
- `src/views/runtime/traces/TraceExplorerPage.vue`
  - 改为深链适配页。
  - 解析 query 后：能解析出 sessionId → 跳转 `/runtime/worklines?sessionId=X&mode=trace`；能解析出 worklineId → 跳转 `/runtime/worklines?worklineId=X`；否则保留现有查询功能。
- `src/views/runtime/sandbox/RuntimeSandboxPage.vue`
  - 改为深链适配页。
  - 有 `worklineId` query → 跳转 `/runtime/worklines?worklineId=X&mode=sandbox`。
  - 无 `worklineId` → 显示 SIMULATION 工作线选择器，选择后跳转。
- `src/views/runtime/overview/RuntimeOverviewPage.vue`
  - Phase 4 删除。数据加载逻辑迁移到 `WorklineRuntimePage` 可折叠 Header。

### 8.2 新组件

| 组件                     | 文件                         | 替代/关系                          | Phase | 说明                                                                                |
| ------------------------ | ---------------------------- | ---------------------------------- | ----- | ----------------------------------------------------------------------------------- |
| `RuntimeWorklineConsole` | `RuntimeWorklineConsole.vue` | 新增                               | 1     | 工作线详情主壳，组合实时态势、Trace 聚焦、Sandbox                                   |
| `WorklineLiveOverview`   | `WorklineLiveOverview.vue`   | 新增                               | 1     | 实时工作线态势，组合 HealthHero + RouteMap + TaskQueue                              |
| `WorklineRouteMap`       | `WorklineRouteMap.vue`       | 替代 `WorklineTopologyStrip`       | 1     | 设备拓扑 + Phase 2 增加 Trace 路径叠加。Props 预留 `tracePathNodes`                 |
| `WorklineTaskQueue`      | `WorklineTaskQueue.vue`      | 替代现有"运行队列"卡片             | 1     | 按 4 类分组：进行中/等待中/异常/最近完成                                            |
| `RuntimeDeviceInspector` | `RuntimeDeviceInspector.vue` | 替代 `DeviceDetailPanel`           | 1     | 5 Tab：当前/正在处理/历史/异常/I/O                                                  |
| `TraceFocusPanel`        | `TraceFocusPanel.vue`        | 新增                               | 2     | Session/Trace 聚焦详情。复用 TraceCaseHero + TraceTimeline + TraceBlockingPointCard |
| `TraceDeviceActionList`  | `TraceDeviceActionList.vue`  | 新增                               | 2     | 某个设备在当前 Trace 中的动作列表                                                   |
| `SandboxWorkbench`       | `SandboxWorkbench.vue`       | 替代 `RuntimeSandboxPage` 核心逻辑 | 3     | Sandbox 调试主面板，组合 EventComposer + PendingQueue + ResultComposer              |
| `SandboxEventComposer`   | `SandboxEventComposer.vue`   | 新增                               | 3     | 主动 event 发送表单                                                                 |
| `SandboxResultComposer`  | `SandboxResultComposer.vue`  | 新增                               | 3     | command result/callback 模拟表单                                                    |
| `SandboxPendingQueue`    | `SandboxPendingQueue.vue`    | 从 `RuntimeSandboxPage` 提取       | 3     | 按设备过滤的 pending outbox 列表                                                    |

### 8.3 可复用旧组件

以下组件直接复用，不做修改：

- `RuntimeStatusBadge.vue` — 状态徽章（颜色语义）
- `RuntimeLastUpdated.vue` — 最后刷新时间
- `RuntimeFrozenNotice.vue` — SSE 冻结提示
- `RuntimeEmptyState.vue` — 空状态占位
- `TraceTimeline.vue` — 证据时间线（从主叙事降级）
- `TraceBlockingPointCard.vue` — 阻塞点诊断卡
- `TraceCaseHero.vue` — Trace 案件摘要头
- `WorklineHealthHero.vue` — 工作线健康摘要
- `DeviceHealthHero.vue` — 设备健康摘要
- `RuntimeSystemVerdict.vue` — 系统裁决（用于 Header 折叠区域）
- `RuntimeSignalStrip.vue` — 统计卡片条（用于 Header 折叠区域）
- `RuntimeHealthBreakdown.vue` — 健康分布（用于 Header 折叠区域）
- `RuntimePriorityQueue.vue` — 优先处置队列（用于 Header 折叠区域）

以下组件建议重构替代：

- `WorklineTopologyStrip.vue`
  - 当前只能表达线性节点。
  - 新版需要支持 Trace path overlay、current blocking device、action badges。
  - Phase 2 增强后 `WorklineRouteMap` 完全替代，旧组件在 Phase 4 清理。
- `DeviceDetailPanel.vue`
  - 当前只有"最近行为"、"异常模式"、"关联 Trace"三个 section。
  - 新版按当前/正在处理/历史/异常/I/O 五类 Tab 组织。
  - `RuntimeDeviceInspector` 替代，旧组件在 Phase 4 清理。
- `RuntimeSandboxPage.vue`
  - 当前页面职责被 `SandboxWorkbench` 接管。
  - 页面改为薄深链适配层（见 8.1），核心逻辑迁移到组件。

### 8.4 数据流模式

重构后继续沿用现有数据流模式，不引入 Pinia store：

```
URL query (worklineId/deviceId/sessionId/traceId/mode)
    ↓ watch
API 加载 (runtimeApiMethods.*.send())
    ↓
ref (worklines, detail, deviceDetail, tracePath, ...)
    ↓ computed
派生数据 (orderedWorklines, sessionCountsByDevice, ...)
    ↓ template
组件 props
```

SSE 实时更新继续通过 `useRuntimePageChrome()` composable：

```
useRuntimePageChrome()
    ↓ 返回 { live, state, lastEvent, ... }
watch(lastEvent) + isRelevantRuntimeEvent(event, scope)
    ↓
createCoalescedAsyncTask 包装的刷新函数
```

`runtime-route.ts` 的 `buildRuntimeWorklineQuery()` 需扩展支持 `mode` 参数。

## 9. 状态与 URL 设计

- 当前只能表达线性节点。
- 新版需要支持 Trace path overlay、current blocking device、action badges。
- `DeviceDetailPanel.vue`
  - 当前分类不足。
  - 新版按当前、正在处理、历史、异常、I/O 分类。
- `RuntimeSandboxPage.vue`
  - 当前页面职责会被 `SandboxWorkbench` 接管。

## 9. 状态与 URL 设计

URL query 是工作台状态的公开契约。

```text
/runtime/worklines?worklineId=30
/runtime/worklines?worklineId=30&deviceId=101
/runtime/worklines?worklineId=30&sessionId=9001&mode=trace
/runtime/worklines?worklineId=30&traceId=abc&mode=trace
/runtime/worklines?worklineId=30&deviceId=101&mode=sandbox
```

规则：

- `worklineId` 是进入详情的主键。
- `mode` 缺省为 `live`。
- `sessionId` 或 `traceId` 存在时，自动进入 `trace` 模式。
- `mode=sandbox` 仅在 SIMULATION 工作线有效。
- 如果 `mode=sandbox` 但工作线不是 SIMULATION，显示只读提示并回退 live。

## 10. 空态与错误态

### 10.1 工作线空态

没有工作线时：

- 显示“暂无工作线数据”。
- 提示检查主数据、权限、API。

### 10.2 线体空闲态

工作线无活跃任务时：

- 拓扑仍然展示设备。
- 任务队列显示空闲说明。
- Sandbox 模式下仍可主动发送 event。

### 10.3 Trace 缺失

Trace ID 查询不到时：

- 显示锚点不存在。
- 保留当前工作线上下文。
- 提供返回 live 模式按钮。

### 10.4 Sandbox 不可用

非 SIMULATION 工作线：

- 不显示 event/result 可提交表单。
- 显示“当前工作线不是 SIMULATION，Sandbox 操作不可用”。

### 10.5 操作失败

Sandbox event/result 提交失败时：

- 保留表单内容。
- 显示后端错误。
- 如果返回 diagnostic context，提供跳转到 Trace/Callback log 的入口。

## 11. 视觉和交互原则

沿用现有 `DESIGN.md` 的工业仓储风格：

- 深色工作台。
- 琥珀色作为当前选中、主操作、路径高亮。
- 红/黄/绿严格表达状态语义。
- 等宽字体用于 Session、Trace、Command、Device Code。
- 卡片保持紧凑，不做营销式大 hero。

交互原则：

- 实时态势优先，Trace 聚焦次之。
- 拓扑始终可见，避免用户丢失工作线位置感。
- Raw JSON 永远放在最后，不作为主要理解路径。
- Sandbox 操作必须贴着设备和 pending command，不做全局孤立表单。

### 11.1 UI 布局详图

#### Live Mode 实时态势布局

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: RuntimeSystemVerdict + RuntimeSignalStrip（可折叠）     │
├────────────┬────────────────────────────────────────────────────┤
│            │  WorklineHealthHero                                │
│  工作线    │  ┌─────────────────────────────────────────────┐  │
│  目录列表  │  │ run_mode | 插件 | 设备健康 | Session健康    │  │
│  (340px)   │  └─────────────────────────────────────────────┘  │
│            │                                                      │
│  - AUTO    │  WorklineRouteMap（设备拓扑）                      │
│  - MANUAL  │  ┌─────────────────────────────────────────────┐  │
│  - SIMUL   │  │ [DEV01]──[DEV02]──[DEV03]──[DEV04]──[DEV05] │  │
│            │  │   ↑        ↑        ↑                       │  │
│            │  │  选中    离线    卡住                        │  │
│            │  │  3任务   0任务   1失败                       │  │
│            │  └─────────────────────────────────────────────┘  │
│            │                                                      │
│            │  WorklineTaskQueue                                   │
│            │  ┌─────────────────────────────────────────────┐  │
│            │  │ 进行中 (3) │ 等待中 (5) │ 异常 (1)          │  │
│            │  │ ───────────────────────────────────────── │  │
│            │  │ Session列表，点击切换到 trace mode          │  │
│            │  └─────────────────────────────────────────────┘  │
├────────────┴────────────────────────────────────────────────────┤
│  RuntimeDeviceInspector（选中设备时展开，底部抽屉）              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [当前] [历史] [异常] ── Phase 2 扩展 [正在处理] [I/O]       ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

#### Trace Mode 路径聚焦布局

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: RuntimeSystemVerdict + RuntimeSignalStrip（可折叠）     │
├────────────┬────────────────────────────────────────────────────┤
│            │  TraceCaseHero（案件头）                           │
│  工作线    │  ┌─────────────────────────────────────────────┐  │
│  目录列表  │  │ Session Code | Trace ID | 当前Step | 状态  │  │
│  (340px)   │  │ 等待类型 | deadline | 失败原因              │  │
│  【保持】  │  └─────────────────────────────────────────────┘  │
│            │                                                      │
│  高亮当前  │  WorklineRouteMap（路径投射）                      │
│  工作线    │  ┌─────────────────────────────────────────────┐  │
│            │  │ [DEV01]──[DEV02]──[DEV03]──[DEV04]──[DEV05] │  │
│            │  │   ✓        ✓        ✗        ○        ○     │  │
│            │  │  已完成   已完成  卡住     未参与   未参与   │  │
│            │  │  2动作    1动作   阻塞点                      │  │
│            │  └─────────────────────────────────────────────┘  │
│            │                                                      │
│            │  TraceDeviceActionList（按事务链排列）              │
│            │  ┌─────────────────────────────────────────────┐  │
│            │  │ DEV03 当前阻塞设备                          │  │
│            │  │                                             │  │
│            │  │ ⚡ EVENT: SCAN_COMPLETED（触发起点）        │  │
│            │  │ │  amber边框，标注 Event Type              │  │
│            │  │                                             │  │
│            │  │ ⚙ COMMAND 循环 #1                           │  │
│            │  │ ├─ Command issued: MOVE_TO                 │  │
│            │  │ ├─ Outbox dispatched                       │  │
│            │  │ └─ ⚠ Callback 等待: timeout 30s            │  │
│            │  │    （红色边框，阻塞点）                      │  │
│            │  │                                             │  │
│            │  │ ⚙ COMMAND 循环 #2（如有）                   │  │
│            │  │ ├─ ...                                     │  │
│            │  │                                             │  │
│            │  │ ✓ EVENT COMPLETED（终点，成功/失败标记）    │  │
│            │  └─────────────────────────────────────────────┘  │
│            │                                                      │
│            │  TraceTimeline + TraceBlockingPointCard            │
│            │  ┌─────────────────────────────────────────────┐  │
│            │  │ Timeline（证据时间线）                       │  │
│            │  │ 阻塞点诊断                                   │  │
│            │  └─────────────────────────────────────────────┘  │
├────────────┴────────────────────────────────────────────────────┤
│  RuntimeDeviceInspector（点击设备节点时展开）                    │
│  显示该设备在当前 Trace 中的动作（而非实时状态）                 │
└─────────────────────────────────────────────────────────────────┘

符号说明：
✓ = 已完成设备（高亮琥珀边框）
✗ = 当前阻塞设备（danger 状态，红色边框）
○ = 未参与设备（低对比度，slate-600）

事务链符号：
⚡ = Event（主动触发点，琥珀色标记）
⚙ = Command/Callback（被动响应，中性色）
⚠ = 阻塞等待（danger 状态）
│  = 事务链层级（Event → Command 循环）
```

#### Sandbox Mode 调试布局

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: RuntimeSystemVerdict + RuntimeSignalStrip（可折叠）     │
├────────────┬────────────────────────────────────────────────────┤
│            │  SandboxWorkbench                                   │
│  工作线    │  ┌────────────────────┬───────────────────────────┐│
│  目录列表  │  │ ⚡ EVENT 发送（主动） │ ⚙ CALLBACK 响应（被动） ││
│  (340px)   │  │ SandboxEventComposer │ SandboxPendingQueue    ││
│  【仅显示  │  │                     │                         ││
│  SIMULATION │ │ Device: [下拉]      │ 按设备过滤 pending     ││
│  工作线】  │  │ Event Type: [下拉]  │ outbox（等待响应）     ││
│            │  │ Template: [模板]    │                         ││
│            │  │ Timestamp: [时间]   │ 选中 → 触发             ││
│            │  │ Trace ID: [输入]    │ SandboxResultComposer ││
│            │  │ Data: [表单/JSON]   │                         ││
│            │  │                     │ Command Code            ││
│            │  │ [⚡ 发送 Event]      │ Result: SUCCESS/FAILED ││
│            │  │   amber 主按钮      │ Data template           ││
│            │  │                     │ [⚙ 提交 Callback]       ││
│            │  │                     │   中性次要按钮          ││
│            │  └────────────────────┴───────────────────────────┘│
├────────────┴────────────────────────────────────────────────────┤
│  RuntimeDeviceInspector（选中设备时展开）                        │
│  显示实时状态 + Sandbox 操作历史                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 布局切换行为

| 动作                     | 布局变化                                                            |
| ------------------------ | ------------------------------------------------------------------- |
| live → trace             | 左栏保持，右侧替换为 TraceFocusPanel，Inspector 改为显示 Trace 动作 |
| trace → live             | 右侧恢复 WorklineLiveOverview，Inspector 恢复实时状态               |
| 选中设备                 | Inspector 从底部展开（所有 mode），高度 200-400px 可调              |
| sandbox（非 SIMULATION） | composable 自动回退 live，UI 不显示 sandbox 入口                    |

### 11.2 响应式断点策略

遵循 `CLAUDE.md` 定义的三层断点：

| 断点    | 宽度范围    | 工作线目录                    | 拓扑     | Inspector  |
| ------- | ----------- | ----------------------------- | -------- | ---------- |
| Small   | < 480px     | 隐藏（汉堡菜单）              | 横向滚动 | 全屏抽屉   |
| Mobile  | 480-768px   | 折叠为 48px 宽 icon 列        | 横向滚动 | 底部抽屉   |
| Tablet  | 768-1024px  | 240px                         | 横向滚动 | 底部抽屉   |
| Desktop | 1024-1280px | 340px                         | 完整显示 | 底部可折叠 |
| Large   | > 1280px    | 340px + 右侧 Inspector 独立栏 | 完整显示 | 右侧固定栏 |

#### Mode 特定响应式行为

**Live Mode**:

- Mobile/Tablet: WorklineTaskQueue 折叠为 Tab 切换（进行中/等待中/异常）
- Desktop+: 任务队列完整显示

**Trace Mode**:

- Mobile: TraceDeviceActionList 简化，只显示当前阻塞设备详情
- Tablet: ActionList 和 Timeline Tab 切换
- Desktop+: ActionList + Timeline 并排

**Sandbox Mode**:

- Mobile: EventComposer 和 PendingQueue 全屏 Tab 切换
- Tablet+: 左右分栏

#### Inspector 响应式策略

| 断点          | Inspector 表现                    |
| ------------- | --------------------------------- |
| Small         | 全屏覆盖，返回按钮关闭            |
| Mobile/Tablet | 底部抽屉，上滑展开，下滑收起      |
| Desktop       | 底部可折叠区，高度 200-400px      |
| Large         | 右侧独立栏（400px），与主内容并列 |

### 11.3 可访问性 Checklist

#### 键盘导航

| 区域              | Tab 序列      | 快捷键                      |
| ----------------- | ------------- | --------------------------- |
| 工作线目录        | 顺序 Tab      | ↑↓ 选择，Enter 打开         |
| 拓扑节点          | Tab 跳转      | ←→ 横向导航，Enter 选中设备 |
| TaskQueue Session | Tab 序列      | ↑↓ 选择，Enter 进入 trace   |
| Inspector Tab     | Tab 到 Tab 头 | ←→ 切换 Tab                 |
| Sandbox 表单      | Tab 序列      | Ctrl+Enter 提交             |

**焦点环规范**:

- 所有交互元素: `outline: 2px solid #F59E0B`
- `outline-offset: 2px`
- 焦点可见时移除默认 box-shadow 聚焦效果（避免双重指示）

#### aria-live 区域

| 区域               | aria-live   | 更新时机       |
| ------------------ | ----------- | -------------- |
| RuntimeLastUpdated | `polite`    | SSE 刷新时     |
| 设备状态变化       | `polite`    | 离线/错误/恢复 |
| Session 状态变化   | `polite`    | 完成/失败      |
| 阻塞点告警         | `assertive` | 新阻塞出现     |

#### 屏幕阅读器标签

| 元素           | aria-label                                                               |
| -------------- | ------------------------------------------------------------------------ |
| 工作线卡片     | `工作线 {name}，{run_mode}，{活跃数} 活跃，{等待数} 等待，{失败数} 失败` |
| 设备节点       | `设备 {code}，{状态}，{任务数} 任务`                                     |
| Session 条目   | `Session {code}，Step {step}，{状态}`                                    |
| Trace 路径设备 | `设备 {code}，{参与状态}，{动作数} 动作`                                 |
| 阻塞设备       | `设备 {code}，阻塞点，{阻塞原因}`                                        |
| 状态徽章       | aria-hidden（颜色已表达语义，文字补充）                                  |

#### 颜色语义兜底

确保状态不仅依赖颜色：

- 状态徽章包含文字（RUNNING/WAITING/FAILED）
- 阻塞设备节点增加 ⚠ 图标
- 离线设备节点增加 ○ 空心图标
- 使用 `aria-describedby` 关联详细说明

#### 模式切换无障碍

- mode 切换时: `aria-live="polite"` 通知 "已切换到 {mode} 模式"
- URL query 变化不应导致焦点丢失
- trace mode 进入时，焦点移到 TraceCaseHero
- sandbox mode 进入时，焦点移到 SandboxEventComposer Device 选择器

## 12. 分阶段实施

### Phase 1：工作线主入口重构

目标：

- `WorklineRuntimePage` 成为主工作台。
- 工作线列表展示 `run_mode`。
- 默认进入实时态势。
- 拓扑节点展示设备状态、任务数、等待/失败摘要。
- 任务队列按进行中、等待、异常分组。
- 设备详情 3 Tab（当前/历史/异常，Phase 2 扩展"正在处理"和"I/O"）。
- Overview 总览数据合并到可折叠 Header。

依赖：

- 后端 `RuntimeWorklineSummary.run_mode`。

文件变更（前端 10 文件 + 后端 2 文件）：

| 操作 | 文件                                                                               | 说明                                   |
| ---- | ---------------------------------------------------------------------------------- | -------------------------------------- |
| 修改 | `backend/src/app/workline/models/runtime.py` — schema 增加 `run_mode`              |                                        |
| 修改 | `backend/src/app/workline/services/runtime_query_service.py` — 查询返回 `run_mode` |                                        |
| 修改 | `frontend/src/types/runtime.ts` — `RuntimeWorklineSummary` 增加 `run_mode`         |                                        |
| 新建 | `frontend/src/composables/useWorklineMode.ts` — URL mode 推导 + 守卫 + 模式切换    | 解决 D1/D3/E5                          |
| 修改 | `frontend/src/utils/runtime-route.ts` — `buildRuntimeWorklineQuery` 支持 `mode`    | 解决 D4                                |
| 修改 | `frontend/src/utils/runtime-priority.ts` — 导航目标更新                            | 解决 D6                                |
| 修改 | `frontend/src/components/common/runtime/WorklineHealthHero.vue` — 显示 `run_mode`  | 解决 D7                                |
| 重写 | `frontend/src/views/runtime/worklines/WorklineRuntimePage.vue` — 主页面容器        | 使用 useWorklineMode composable        |
| 新建 | `frontend/src/components/common/runtime/WorklineLiveOverview.vue`                  |                                        |
| 新建 | `frontend/src/components/common/runtime/WorklineRouteMap.vue`                      |                                        |
| 新建 | `frontend/src/components/common/runtime/WorklineTaskQueue.vue`                     |                                        |
| 新建 | `frontend/src/components/common/runtime/RuntimeDeviceInspector.vue`                | Phase 1 实现 3 tab，Phase 2 扩展 2 tab |

### Phase 2：Trace 路径观察

目标：

- Session 成为 Trace 聚焦主对象。
- 选择 Session 后把路径投射到拓扑。
- 设备节点显示该 Trace 上的 actions。
- 明确 current blocking device 和 blocking reason。
- `/runtime/traces` 改成深链入口。

依赖：

- 后端 Trace path 聚合接口，或前端临时从 `TraceDetailResponse` 拼装。

文件变更（前端 6 文件 + 后端 3 文件）：

| 操作 | 文件                                                                                            | 说明                                         |
| ---- | ----------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 修改 | `backend/src/app/workline/models/runtime.py` — 增加 trace path schema + 设备详情扩展            | 设备详情增加 pending_outboxes/recent_events  |
| 新建 | `backend/src/app/workline/services/trace_path_service.py`                                       |                                              |
| 修改 | `backend/src/app/workline/v1/runtime.py` — 新增 path 端点                                       |                                              |
| 修改 | `frontend/src/types/runtime.ts` — 增加 trace path 类型                                          |                                              |
| 修改 | `frontend/src/api/modules/workline.ts` + `runtime.ts` — 增加 path API                           |                                              |
| 修改 | `frontend/src/components/common/runtime/WorklineRouteMap.vue` — 路径投射                        |                                              |
| 新建 | `frontend/src/components/common/runtime/TraceFocusPanel.vue`                                    | 从 pathData.evidence 派生 TraceCaseHero 数据 |
| 新建 | `frontend/src/components/common/runtime/TraceDeviceActionList.vue`                              |                                              |
| 修改 | `frontend/src/components/common/runtime/RuntimeDeviceInspector.vue` — 扩展"正在处理"和"I/O" tab |                                              |
| 修改 | `frontend/src/views/runtime/traces/TraceExplorerPage.vue` — 深链适配                            |                                              |

### Phase 3：Sandbox 工作台

目标：

- 仅 SIMULATION 工作线显示 Sandbox。
- 选设备后主动发送 event。
- pending outbox 按设备过滤。
- 从 pending command 生成 result/callback。
- 操作后自动进入或刷新 Trace 聚焦。
- `/runtime/sandbox` 改成深链入口。

依赖：

- sandbox templates API。
- sandbox event/result API。
- pending 支持 `workline_id` / `device_id` 过滤。

文件变更（前端 6 文件 + 后端 3 文件）：

| 操作 | 文件                                                                          |
| ---- | ----------------------------------------------------------------------------- |
| 修改 | `backend/src/app/workline/v1/operation.py` — 新增 event/result/templates 端点 |
| 新建 | `backend/src/app/workline/models/operation.py` — sandbox schema               |
| 修改 | `backend/src/app/workline/services/operation_service.py` — sandbox 业务逻辑   |
| 修改 | `frontend/src/types/runtime.ts` — sandbox 类型                                |
| 修改 | `frontend/src/api/modules/workline.ts` + `runtime.ts` — sandbox API           |
| 新建 | `frontend/src/components/common/runtime/SandboxWorkbench.vue`                 |
| 新建 | `frontend/src/components/common/runtime/SandboxEventComposer.vue`             |
| 新建 | `frontend/src/components/common/runtime/SandboxResultComposer.vue`            |
| 新建 | `frontend/src/components/common/runtime/SandboxPendingQueue.vue`              |
| 修改 | `frontend/src/views/runtime/worklines/WorklineRuntimePage.vue` — sandbox mode |
| 修改 | `frontend/src/views/runtime/sandbox/RuntimeSandboxPage.vue` — 深链适配        |

### Phase 4：清理旧页面心智

目标：

- 菜单弱化 `Trace 处置台` 和 `Sandbox 调试台`。
- 保留深链能力。
- 删除旧页面中重复的孤立查询/表单实现。
- 更新单元测试、契约测试、运行 smoke。

文件变更：

| 操作 | 文件                                                               |
| ---- | ------------------------------------------------------------------ |
| 删除 | `frontend/src/views/runtime/overview/RuntimeOverviewPage.vue`      |
| 删除 | `frontend/src/components/common/runtime/WorklineTopologyStrip.vue` |
| 删除 | `frontend/src/components/common/runtime/DeviceDetailPanel.vue`     |
| 修改 | `frontend/src/router/routes/runtime.ts` — 菜单排序和标签调整       |
| 修改 | `frontend/tests/unit/views/runtime/runtimeRouteSync.test.ts`       |
| 修改 | `frontend/tests/unit/scripts/menu-manifest.test.ts`                |

## 13. 测试策略

### 13.1 前端单元测试

覆盖：

- route query 解析。
- `mode` 推导。
- workline risk 排序。
- trace path 节点归类。
- sandbox 可用性判断。
- event/result payload builder。

### 13.2 组件测试

覆盖：

- 无工作线空态。
- 工作线空闲态。
- SIMULATION 工作线显示 Sandbox。
- 非 SIMULATION 工作线隐藏 Sandbox 操作。
- 选择 Session 后拓扑高亮路径。
- 选择设备后设备详情分类正确。

### 13.3 后端测试

覆盖：

- `RuntimeWorklineSummary` 返回 `run_mode`。
- trace path 聚合能识别参与设备。
- trace path 聚合能识别 current blocking device。
- sandbox event 拒绝非 SIMULATION 工作线。
- sandbox event 写入 callback/event 流程并返回锚点。
- sandbox result 拒绝非 pending command 或错误 workline/device。

### 13.4 浏览器验证

使用 `admin/admin123` 登录本地：

- `http://localhost:5173/runtime/worklines`
- 选择工作线。
- 验证默认进入实时态势。
- 选择 Session 后进入 Trace 聚焦。
- 切换到 SIMULATION 工作线。
- 选中设备发送 `SCAN_COMPLETED`。
- 查看 Trace 路径是否更新。
- 从 pending command 生成 result。
- 查看下一等待点是否更新到拓扑。

## 14. 风险与取舍

### 14.1 最大风险：后端聚合不足

如果没有 trace path 聚合接口，前端可以先从 `TraceDetailResponse` 临时拼装路径，但这会让前端承担过多业务判断。

推荐：

- Phase 2 开始就补后端 path view model。
- 前端只负责渲染和交互。

### 14.2 最大产品取舍：信息密度

工作线态势、Trace、Sandbox 放在同一工作台容易过载。

控制方式：

- 默认只展示实时态势。
- Trace 聚焦只在用户选择 Session 后打开。
- Sandbox 只在 SIMULATION 工作线显示。
- Raw JSON 收到最后。

### 14.3 最大工程取舍：破坏性重构范围

因为项目尚未发布，可以接受破坏性重构。

但仍然应该分阶段落地，避免一次性重写三个页面导致无法验证：

1. 先把工作线主入口做对。
2. 再做 Trace path overlay。
3. 最后做 Sandbox 主动调试闭环。

## 15. 决策记录

| 日期       | 决策                                                         | 理由                                                      |
| ---------- | ------------------------------------------------------------ | --------------------------------------------------------- |
| 2026-04-28 | `工作线运行态` 拉进重构并升级为主入口                        | 现场排障从工作线开始，而不是从 Trace ID 开始              |
| 2026-04-28 | 进入工作线后默认显示实时工作线态势                           | 用户明确选择实时态势优先                                  |
| 2026-04-28 | Session 是 Trace 观察主对象，Trace ID 是检索锚点             | Session 更自然承载状态机、等待点、设备路径和失败原因      |
| 2026-04-28 | Sandbox 嵌入工作线工作台，只对 SIMULATION 工作线开放         | Sandbox 操作必须贴着设备、Session 和 plugin 上下文        |
| 2026-04-28 | 保留 `/runtime/traces` 和 `/runtime/sandbox` 作为深链入口    | 兼容调试入口，但不继续维护孤立主流程                      |
| 2026-04-28 | Sandbox 内嵌到设备详情面板而非独立页面（咨询确认）           | 独立页面丢失工作线/设备上下文，调试需要看到设备实时状态   |
| 2026-04-28 | Overview 合并到工作线列表页可折叠 Header（咨询确认）         | 总览数据本质是工作线列表聚合，减少导航层级                |
| 2026-04-28 | 设备详情按 5 类 Tab 组织（咨询确认）                         | 对应 Session 生命周期 + I/O 证据，比笼统分类更精确        |
| 2026-04-28 | 拓扑用水平流水线方向而非自由画布（咨询确认）                 | Device 使用 upstream_device_id 单链关系，天然适合水平方向 |
| 2026-04-28 | 不引入 Pinia store，沿用本地 ref/computed 数据流（咨询确认） | 运行态数据是页面级临时状态，不需要全局持久化              |
