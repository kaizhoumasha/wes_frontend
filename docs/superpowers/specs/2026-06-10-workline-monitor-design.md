# P9 WES 工作线运行监控中心重构设计规约 (Design Spec)

> **文档状态**: 待评审
> **最后修改时间**: 2026-06-10
> **作者**: Antigravity
> **关联模块**: `src/views/runtime/worklines/WorklineMonitorPage.vue`, `src/stores/workline-runtime.ts`

---

## 1. 背景与目标 (Background & Goals)

休斯顿 P9 智能仓储执行系统 (WES) 作为调度中台，需要实时监控异构设备的运行情况。现有监控中心基于一个单体大聚合 HTTP 接口进行全量轮询/刷新，在高吞吐、高并发的工业线体上存在显著的延迟和数据库开销。此外，原有的 UI 界面缺乏明确的维保视角聚焦，无法快速诊断和直控。

本重构方案将从**第一性原理**出发，对“工作线监控”进行全面重做：

1.  **目标用户聚焦**: 面向**现场维保与设备工程师**，第一设计原则为“极高的大字警报可见度”与“极其精准的物理空间定位”。
2.  **视觉美学重设**: 采用 **赛博工业暗黑控制台 (Cyberpunk-SCADA)** 设计语言。使用深色底色搭配高饱和度发光状态灯，显著提升低光照车间的视觉容错率与关键故障的警示对比度。
3.  **契约与性能解耦**:
    - 将原本的一揽子大聚合接口拆分为 **只读静态拓扑** 与 **高频增量状态**。
    - 引入 **粒度化 SSE 状态直推 (Event-Driven State Push)**。设备/会话状态变更时由后端直接向前端推送细粒度 Payload，前端局部合并更新，省去额外的 REST 回拉网络开销。
    - 明确业务对象数字投影：使用 `workline_sessions` 追踪物料料箱流动，使用 `rack_tasks` 和 `active_bin_racks` 追踪货架货格占用及对账状态。
4.  **通信边界校正**: 明确 WES 系统不与现场硬件 PLC 直接通讯，所有指令下发与设备事件收集均通过与 **ECS（设备控制系统上位机）** 的 HTTP 接口进行。

---

## 2. 系统架构与数据流设计 (Architecture & Data Flow)

### 2.1 数据流架构

整个状态同步系统基于“静态定义 + 动态快照 + 增量事件”的三维模式：

```
[ 页面初始化 ]
    │
    ├─► 1. REST 请求静态拓扑 (/topology) ──► 构建 SVG 网格坐标与连线关系 (只读)
    └─► 2. REST 请求当前状态快照 (/states) ──► 初始化 devicesMap, sessionsMap, activeIncidents

[ 实时运行期 (SSE) ]
    │
    ├─► 收到 "device:changed" 事件 ────► 更新 devicesMap ────► 驱动拓扑节点变色 (Idle/Sending/Executing/Danger)
    ├─► 收到 "session:stepped" 事件 ──► 更新 sessionsMap ──► 驱动物料料箱流光位置
    └─► 收到 "safety:estop" 事件 ────► 更新 activeIncidents ──► 触发全局急停锁止

[ 直控操作下发 (REST) ]
    │
    └─► WES 呼叫 ECS 上位机接口 (Post Command) ──► ECS ACK 确认 ──► 异步动作 ──► ECS Callback 结果
```

### 2.2 状态对账机制 (Reconciliation Mechanism)

在立体货架（ASRS/Shuttle Rack）场景下，为防止“账实不符”，系统提供以下对账锁机制：

- **物理探测占用**: 提升机或货架物理传感器探测到某格位有箱子占位（`occupied`）。
- **业务逻辑校验**: 校验 WES 系统是否有对应的 `workline_sessions` 在途任务或 `rack_tasks` 入库搬运任务。
- **对账异常判定**: 若物理有箱但账面无记录，触发库位对账警报 `reconciling`，系统在拓扑中高亮闪烁，并对该库位进行指令级**读写冻结**，要求工程师在右侧行动舱中人工确认或强行核销。

---

## 3. 接口契约重构 (API Contracts)

根据 WES 与第三方设备（ECS）接入标准，重新规划接口：

### 3.1 REST APIs

#### 1. 获取静态拓扑关系

- **HTTP Method**: `GET`
- **Path**: `/api/v1/workline/runtime/worklines/{workline_id}/topology`
- **Response Payload**:
  ```typescript
  interface WorklineTopologyResponse {
    workline_id: number
    plugin_key: string // 关联的业务处理插件，如 "smt-shuttle-rack"
    contract_version: string
    lanes: Array<{
      id: string // 泳道唯一标识
      label: string // 泳道名称（如：入口区、存取区）
      order: number
    }>
    nodes: Array<{
      id: string // 节点逻辑 ID，如 "ST-02"
      device_id: number // 设备唯一自增主键
      device_code: string // 设备外部编码
      device_name: string
      device_role: string // 角色类型，如 "shuttle_lift", "conveyor_belt"
    }>
    flows: Array<{
      from_node_id: string
      to_node_id: string
    }>
  }
  ```

#### 2. 获取动态状态快照

- **HTTP Method**: `GET`
- **Path**: `/api/v1/workline/runtime/worklines/{workline_id}/states`
- **Response Payload**:
  ```typescript
  interface WorklineStatesResponse {
    workline_id: number
    active_safety_incident_id?: number | null // 未解除的急停事件ID

    // 物料流转在制品投影 (Conveyor Flow)
    workline_sessions: Array<{
      session_id: number
      session_code: string
      barcode: string
      container_code?: string
      current_device_id: number
      status: 'RUNNING' | 'WAITING' | 'NG'
    }>

    // 货架格口物理占用状态 (立体货架投影)
    active_bin_racks?: Array<{
      rack_id: number
      rack_code: string
      bins: Array<{
        rack_slot_code: string
        bin_code: string
        cells: Array<{
          bin_cell_code: string
          status: 'empty' | 'occupied' | 'reconciling' // 库位状态
          pkg_code?: string // 占用料箱的 LPN 码
        }>
      }>
    }>

    // 货架动作控制任务
    rack_tasks?: Array<{
      task_id: number
      task_type: 'STORE' | 'RETRIEVE' | 'MOVE'
      source_location: string
      target_location: string
      status: 'EXECUTING' | 'ACKED' | 'COMPLETED' | 'FAILED'
    }>
  }
  ```

---

### 3.2 SSE Granular Push Schemas

当发生业务流转时，SSE 将推送统一格式的 JSON Payload 以更新前端内存状态：

```typescript
interface SSEMessageEnvelope {
  domain: 'runtime'
  entity: 'device' | 'workline_session' | 'rack_task' | 'rack_cell' | 'safety'
  action: string
  keys: {
    workline_id: number
    [key: string]: any // 具体实体的 ID 键
  }
  payload: Record<string, any>
}
```

#### 典型事件示例：

#### ① 呼叫 ECS 上位机指令状态变动 (`entity: "device"`)

- **事件 A：发送作业指令（等待 ECS 同步应答 ACK）**
  - `action`: `command_sent`
  - `payload`:
    ```json
    {
      "active_command": {
        "id": 12345,
        "command_code": "CMD-20260610-1002",
        "sent_at": "2026-06-10T15:40:00Z",
        "ack_state": "sent"
      }
    }
    ```
- **事件 B：ECS 确认接收指令 (ACKed)**
  - `action`: `command_acked`
  - `payload`:
    ```json
    {
      "ack_state": "acked",
      "ack_received_at": "2026-06-10T15:40:01Z"
    }
    ```

#### ② 物理动作执行回调结果 (`entity: "device"`)

- **事件 C：ECS 回报执行成功 (`result: "SUCCESS"`)**
  - `action`: `command_completed`
  - `payload`:
    ```json
    {
      "last_callback": {
        "completed_at": "2026-06-10T15:40:05Z",
        "result": "success"
      }
    }
    ```
- **事件 D：ECS 回报物理异常 (`result: "FAILED"`)**
  - `action`: `command_failed`
  - `payload`:
    ```json
    {
      "device_status": "DANGER",
      "last_callback": {
        "completed_at": "2026-06-10T15:40:04Z",
        "result": "failed",
        "error_code": "ERR_CONVEYOR_JAM_102",
        "error_message": "光电检测器阻断超时"
      }
    }
    ```

---

## 4. UI/UX 组件设计与交互蓝图 (UI Component & Interaction Blueprint)

监控面板整体采用三栏联动的高密度数据流动式 SCADA 布局。

### 4.1 左栏：线体快速树状目录 (Workline Directory)

- **实时健康评分**: 每个线体名称旁标注其健康评分、活动在制品会话（Sessions）数量、未解除警报设备数量。
- **SSE 心跳感知 Badges**: 动态脉冲点指示 SSE 长连接状态（闪烁绿-已连接，呼吸红-通信错误，灰-离线冻结）。
- **快搜筛选**: 支持根据物理网区（East/West Zone）与线体代码的拼音首字母进行实时模糊过滤。

### 4.2 中栏：2D 拓扑大屏与流光画布 (Topology Canvas)

- **SVG 拓扑布局绘制**: 自适应解析 `lanes` 形成纵向逻辑功能隔离区（泳道），根据 `flows` 连线节点。
- **流光指示**: 处于正常工作流状态的节点连线，通过 CSS 动画呈现**电光蓝动态流光**；故障断开的链路呈现**红色闪烁虚线**。
- **设备卡片微缩组件**:
  - `Flow` 节点：胶囊外壳设计，显示节点编码及当前在制品 Container LPN。
  - `Rack` 节点：三维格栅图标。若该设备处于 `warning` 状态，图标呈现黄色预警警示，点击展开库格矩阵。

### 4.3 右栏：直控行动舱 (Action Drawer)

行动舱作为维保操作的中枢，使用双 Tab 结构隔离工控底层操作与上层业务数据：

#### Tab A：[诊断与控制 (Diagnostics & Control)]

1.  **故障报警舱**: 突出错误码（如 `ERR_CONVEYOR_JAM_102`）与 ECS 传回的底层详细传感器物理阻断描述。
2.  **WES ──► ECS 通信链路卡**:
    - 展示发出时间、ECS 应答时间、当前耗时。
    - 直观体现 ACK 回应是否超时。
3.  **直控按钮模块**:
    - _一键恢复急停_: 呼叫 WES 后端 `/api/v1/workline/operations/safety/worklines/{id}/clear-estop`，下发 `CLEAR_ESTOP` 至 ECS 上位机。
    - _库位人工核销对账_: 用户通过人工确认货格属实后，下发对账核销，修改本地 active_bin_racks 并释放库位锁定任务。
    - _切换维护旁路_: 旁路当前故障节点，通知 ECS 上位机将流向指向备用分流节点。

#### Tab B：[业务关联投影 (Business Context)]

- **在制品 Twin (Tote Card)**: 动态抓取当前会话中料箱（Tote）的实物条码、承载的 SKU、物料属性明细以及批次，建立物理实物关联。
- **格栅货位图 (Rack Matrix)**: 将 ASRS 立库格子占用可视化，对于对账冲突的格位以高亮琥珀黄显示，方便工程师现场目视化对比。

### 4.4 底部栏：控制台日志 (Console Terminal)

- **高密度滚动流**: 输出 ECS 回调接口 (`Event_Push` / `Report Result`) 的底层日志。
- **反向联动定位**: 点击任意日志行，拓扑画布自动平移定位并聚焦对应设备，滑出行动舱。

---

## 5. 验证与对账方案 (Verification Plan)

### 5.1 自动化契约对账

- 运行 `pnpm contract:verify` 以校验重构后的拆分 REST API 与 OpenAPI 契约一致性。
- 在前端编写针对 SSE Payload 实体字段校验的 Zod 规则测试用例，防止后端接口发生未知字段漂移。

### 5.2 沙箱模拟测试 (Sandbox Mock Checks)

- 使用 Mock 服务模拟 ECS 发送大量的 `MATERIAL_ARRIVED` 事件和 `ESTOP_PRESSED` 信号，验证监控大屏在高频状态直推下，DOM 局部渲染不发生卡顿和掉帧。
- 在沙箱联调界面下触发一次“对账异常”模拟（故意发送账面为空但占用探测为 occupied 的事件），验证库格网格是否准确亮黄闪烁、相关库位控制指令是否正确阻断，以及行动舱人工核对指令下发后，状态是否同步转绿恢复。
