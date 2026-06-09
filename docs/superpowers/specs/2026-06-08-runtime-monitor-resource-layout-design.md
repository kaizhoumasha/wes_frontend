# Runtime Monitor Resource Layout Design

> 日期：2026-06-08
> 范围：前端运行态资源布局、`/runtime/monitor` 焦点详情、共享设备拓扑收敛
> 状态：工程评审后修订
> 约束：当前功能未发布，不保留旧平铺 UI，不做向后兼容分支。

## 背景

当前 `/runtime/monitor` 已接入 `RuntimeSceneMap`，能展示 WorkLine readiness、Station lease、single-layer rack snapshot、rack operation wait 和结构化 `resource_evidence_items`。

问题不是“资源没有显示”，而是 RACK、BIN、SLOT、CELL、PKG、PART_SN 等资源证据仍以全局平铺方式呈现。操作员看到的是 evidence card 列表，而不是现场关系：

- 哪个资源挂在哪个 `station / position` 上。
- 哪个资源正在让 `Station lease / Rack operation / Session` 卡住。
- 哪些 evidence 只是审计来源，不应该抢首屏。

后端边界不变：WES 展示执行证据投影，不表达 WMS 库存真相，不新增库存查询，不从 raw JSON 推断资源事实。

## 第一性原则

监控页的首屏任务是现场判断，不是审计列表。

用户打开运行态页面时，最先需要回答：

1. 这条线现在能不能接收事件。
2. 哪个 station 或 position 正在等待。
3. 资源在现场结构里的位置是什么。
4. 当前设备流向和阻塞设备在哪里。
5. 需要追责或复核时，证据来源是什么。

因此信息层级为：

```text
WorkLine state
  -> Device flow
  -> Station / Position
     -> attention state
        -> Resource stack
           -> Evidence audit items
```

平铺 evidence 的问题是把最后一层 `Evidence audit items` 提到了首屏主叙事。

## 已确认方向

采用 **现场剖面 + 焦点详情 + 证据面板**。

首屏显示 `station / position -> resource stack`，点击 position 或 resource stack 后进入焦点详情；证据详情由响应式 `RuntimeSceneEvidencePanel` 展示。桌面可以由父层使用 drawer 容器，移动端内联展示。

同时按工程评审结论做共享拓扑收敛：抽出共享 `RuntimeSceneDeviceFlow`，放在 `src/components/runtime/shared/RuntimeSceneDeviceFlow.vue`，替换旧 `WorklineRouteMap`，给 monitor、sandbox、trace 的完整设备拓扑共同使用。

不采用：

- 保留旧平铺模式：未发布版本不需要兼容，保留会增加分支和测试成本。
- 让 sandbox/trace 直接渲染完整 `RuntimeSceneMap`：会把资源/证据 UI 带到只需要设备拓扑的页面。
- 从 raw JSON 推断资源：违反 WES 只展示执行证据投影的边界。
- 保留旧 `runtime-scene-model.ts`：当前生产路径已经使用 `src/utils/runtime-scene.ts`，旧模型只会制造两个同名 scene model 的误用风险。

## 信息架构

`RuntimeSceneMap` 主视图从上到下：

1. **线体状态带**
   - workline name / code
   - readiness / runtime status
   - `resourceEvidenceTruncated` 提示
   - unlocated evidence 计数

2. **共享设备流**
   - 使用 `RuntimeSceneDeviceFlow`。
   - 保留 `SOURCE_ARM -> TARGET_ARM` 这类横向执行路径。
   - `blockingDeviceId` 命中时高亮对应设备。
   - 保留 selected、trace path、runtime hold、parked outbox、open command 等既有信号。

3. **Station / Position 剖面**
   - 每个物理 `stationCode + positionCode` 对应一个现场段。
   - 例如 `TARGET_ARM / SINGLE_LAYER_A`。
   - 直接展示 Station lease、rack snapshot、rack operation wait。
   - 多个 manifest boundary 指向同一个物理位置时，不重复展示同一批资源证据。

4. **资源堆栈层**
   - 资源不再全局平铺。
   - 资源挂到对应 `positionCode` 下。
   - 示例：`Position SINGLE_LAYER_A -> Rack RACK-001 -> Bin BIN-001 -> Slot/Cell/PKG`。

5. **焦点详情层**
   - 默认选中第一个 waiting/blocked position。
   - 点击 position 或 resource stack 后展示焦点详情。
   - 焦点详情展示 boundary 状态、选中资源堆栈、审计证据和 trace/session/source/time。

6. **全局审计层**
   - 没有 `positionCode` 的 evidence 进入全局折叠审计区。
   - 不合成虚假 position。
   - 不只藏在已选 drawer 底部。

## Scene Model

`resourceEvidence` 一维数组保留为 adapter 的事实输入和审计数据源；首屏展示使用归组后的模型。

```ts
interface RuntimeSceneModel {
  worklineId: number
  worklineName: string
  worklineCode: string
  readiness: RuntimeWorklineReadiness
  readinessLabel: string
  runtimeStatusLabel: string
  boundaries: RuntimeSceneBoundary[]
  deviceNodes: RuntimeSceneDeviceNode[]
  resourceEvidence: RuntimeSceneResourceEvidence[]
  positionGroups: RuntimeScenePositionGroup[]
  unlocatedAuditItems: RuntimeSceneResourceEvidence[]
  resourceEvidenceTotalCount: number
  resourceEvidenceTruncated: boolean
  semanticFallback: boolean
  semanticFallbackMessage: string | null
}

type RuntimeSceneAttentionState = 'blocked' | 'waiting' | 'normal' | 'unknown'

interface RuntimeScenePositionGroup {
  key: string
  stationCode: string
  stationRole: string
  positionCode: string
  boundary: RuntimeSceneBoundary
  attentionState: RuntimeSceneAttentionState
  resourceStacks: RuntimeSceneResourceStack[]
  auditItems: RuntimeSceneResourceEvidence[]
}

interface RuntimeSceneResourceStack {
  key: string
  anchor: RuntimeSceneResourceStackAnchor
  rackCode?: string | null
  binCode?: string | null
  children: RuntimeSceneResourceStackChild[]
  evidenceCount: number
  evidenceKinds: RuntimeResourceEvidenceKind[]
  auditItems: RuntimeSceneResourceEvidence[]
}

interface RuntimeSceneResourceStackAnchor {
  kind: RuntimeResourceKind
  code: string
  displayLabel: string
}

interface RuntimeSceneResourceStackChild {
  key: string
  kind: RuntimeResourceKind
  code: string
  displayLabel: string
  evidenceKind: RuntimeResourceEvidenceKind
}
```

归组规则：

- `buildRuntimeSceneModel` 是唯一归组入口。
- 先按 `stationCode + positionCode` 归成物理 position group，不按 boundary 数量复制资源。
- 同一物理 position 命中多个 manifest boundary 时，保留第一个 boundary 作为主展示边界，资源证据只出现一次。
- 没有 `positionCode` 的 evidence 放进 `unlocatedAuditItems`。
- 同一 position 内优先用 `rackCode` 建 stack。
- 没有 `rackCode` 时用 `binCode` 建 stack。
- 再没有时用 `resourceKind + resourceCode` 建 stack。
- stack `anchor.kind` 直接使用 `RuntimeResourceKind`，避免 SLOT/CELL/PART_SN fallback 被降级为 UNKNOWN。
- `SLOT / CELL / PKG / PART_SN` 等非主锚点资源作为 `children` 显示。
- 不新增合同里不存在的 `cellCode` 字段；CELL 使用 `resourceKind === 'CELL'` 与 `resourceCode` 表达。
- position 顺序遵循 manifest boundary 顺序；fallback position 遵循 evidence 首次出现顺序。
- stack 和 child 顺序遵循 evidence 首次出现顺序，并用 key 稳定兜底。
- `rackOperationWait === 'WAITING_WMS'` 时 `attentionState` 为 `waiting`。
- `rackOperationWait === 'TIMEOUT' | 'FAILED'` 时 `attentionState` 为 `blocked`。
- `rackOperationWait === 'NONE' | 'WMS_CALLBACK_RECEIVED'` 时 `attentionState` 为 `normal`。
- 语义缺失时 `attentionState` 为 `unknown`。
- `blockingDeviceId` 只作为设备层高亮输入，不参与 resource stack 归组；当前合同没有稳定的 device -> position 映射，不从设备阻塞反推资源位置。

数据流：

```text
RuntimeWorklineDetailResponse.resource_evidence_items
  -> toSceneResourceEvidence()
  -> buildRuntimeSceneModel()
     -> groupResourceEvidenceByPosition()
     -> derivePositionAttentionState()
     -> RuntimeSceneModel.positionGroups
  -> RuntimeSceneMap
     -> RuntimeSceneDeviceFlow
     -> RuntimeScenePositionGroup
        -> RuntimeSceneResourceStack
     -> RuntimeSceneFocusPanel
        -> RuntimeSceneEvidencePanel
```

## 组件边界

保持 DRY/KISS，不做兼容 wrapper。

- `buildRuntimeSceneModel`
  - 唯一归组入口。
  - 负责 enum normalization、boundary fallback、resource stack grouping、attention state 推导。
  - Vue 组件不得重复写归组逻辑。

- `RuntimeSceneDeviceFlow.vue`
  - 共享设备流组件。
  - 文件路径固定为 `src/components/runtime/shared/RuntimeSceneDeviceFlow.vue`，不得放在 monitor 私有目录后再被 sandbox/trace import。
  - 输入 `RuntimeSceneDeviceNode[]`，支持 selected、trace path、blocking device、session counts。
  - 发出 `select`、`sendEvent`、`showContextMenu`。
  - 替换并删除旧 `WorklineRouteMap.vue`。

- `RuntimeSceneMap.vue`
  - monitor 主布局编排。
  - 管理选中的 position/resource stack。
  - 消费 scene model，不读取 API，不判断插件 key。

- `RuntimeScenePositionGroup.vue`
  - 展示一个 station/position 剖面段。
  - 展示 boundary 状态和资源堆栈列表。

- `RuntimeSceneResourceStack.vue`
  - 展示 Rack/Bin/Slot/Cell/PKG/Part SN 堆栈。
  - 只接受已经归组好的 stack。

- `RuntimeSceneFocusPanel.vue`
  - 展示当前选中 position/resource stack 的详情。
  - 组合 `RuntimeSceneEvidencePanel`。
  - 不做库存推断，不做处置动作。

- `RuntimeSceneEvidencePanel.vue`
  - 展示审计细节。
  - 只展示 evidence 字段，不推断库存结论。
  - 桌面/移动形态由父层决定。

删除旧的全局 evidence grid，不保留 legacy flat mode。同步删除旧 `src/components/runtime/monitor/runtime-scene-model.ts`、`tests/unit/components/runtime/runtimeSceneModel.test.ts` 以及只服务该旧模型的 `RuntimeSceneLane/Node/Flow/Overlay/Gap/Verdict` 类型。

## 交互

- 默认选中第一个 `attentionState === 'blocked' | 'waiting'` 的 position。
- 没有等待/阻塞态时，选中第一个有资源证据的 position。
- 点击 position group 更新焦点到该 position。
- 点击 resource stack 更新焦点到该 stack。
- 焦点详情展示：
  - station / position
  - Station lease / rack snapshot / rack operation wait
  - resource anchor
  - children
  - evidence kind
  - sourceTraceId
  - sourceSessionId
  - occurredAt
- `resourceEvidenceTruncated` 时，在 header 和 focus/evidence panel 顶部显示“仅展示前 N 条证据 / 共 M 条”。
- 缺少 manifest 或语义字段时，仍显示 fallback position group，标记“语义未加载 / 通用 evidence”。
- sandbox 使用 `RuntimeSceneDeviceFlow` 保留选择设备、双击发事件、右键菜单。
- trace 的 `TraceTopologySummary` 主诊断叙事不重写；只把“完整设备拓扑”从 `WorklineRouteMap` 切到 `RuntimeSceneDeviceFlow`。

移动端：

```text
Line state
  -> Device flow
  -> Position group
     -> Resource stack
        -> Inline focus/evidence panel
  -> Global unlocated audit
```

不做横向滚动主内容；必要时让设备流自身在受控区域内横向滚动，不让页面整体溢出。

## 视觉方向

遵循 `DESIGN.md` 的工业控制中心风格：

- 深色主背景。
- 琥珀色只作为信号色。
- 资源编码、trace、session 使用等宽字体。
- blocked / waiting / normal 使用交通灯语义色。
- 避免大面积白底卡片，避免像普通后台表单。
- 卡片圆角保持克制，最多 8px。
- 文本使用 `overflow-wrap: anywhere` 处理长编码，不截断关键资源码。

## 错误与空态

- `positionGroups.length === 0` 且无 evidence：显示“暂无结构化资源证据”。
- manifest 缺失：显示 fallback position group，不隐藏 resources。
- contract 字段缺失：显示“运行态边界字段未加载，当前仅展示通用 evidence”。
- unlocated evidence 存在：显示全局折叠审计区，不放首屏主叙事。
- evidence 超长编码：换行显示，不遮挡相邻内容。

## 测试策略

当前项目以 Vitest 和 `agent-browser` smoke 为主。

需要覆盖：

```text
Adapter tests
  -> stationCode + positionCode physical grouping
  -> duplicate manifest boundary does not duplicate resources
  -> unlocated global audit
  -> rack-first stack key
  -> bin fallback stack key
  -> resourceKind/resourceCode fallback stack key
  -> anchor object preserves SLOT/CELL/PART_SN fallback
  -> children list for SLOT/CELL/PKG/PART_SN
  -> WAITING_WMS/TIMEOUT/FAILED attentionState
  -> truncated count retention
  -> stable manifest/evidence order

Component tests
  -> RuntimeSceneMap renders positionGroups instead of flat evidence grid
  -> default selected waiting/blocked position
  -> default focus prefers blocked/waiting over earlier normal position
  -> default focus falls back to first position with resource stacks
  -> click position group updates focus panel
  -> click position resets selected stack to that position's first stack
  -> click resource stack updates focus panel
  -> RuntimeSceneEvidencePanel renders audit fields
  -> fallback manifest state still renders one position group
  -> unlocated audit is visible as global folded section
  -> mobile-safe text selectors remain visible

Shared topology tests
  -> RuntimeSceneDeviceFlow shows open command/runtime hold/parked outbox separately
  -> RuntimeSceneDeviceFlow preserves selected, traced, dimmed, blocking classes
  -> RuntimeSceneDeviceFlow emits select/sendEvent/showContextMenu
  -> sandbox uses RuntimeSceneDeviceFlow before event workspace
  -> trace full topology uses RuntimeSceneDeviceFlow without rewriting TraceTopologySummary hero

Smoke test
  -> fixed fixture mode: /runtime/monitor desktop 1440x900 and mobile 390x844
  -> fixed fixture includes Rack, Bin, Slot, Cell, PKG, Part SN, unlocated evidence
  -> seeded backend mode: /runtime/sandbox/:worklineId desktop and mobile
  -> seeded backend mode: /runtime/cases?traceId=runtime-monitor-smoke-wms-callback desktop and mobile
  -> assert no page-level overflow / incoherent overlap for device flow, position group, stack, focus panel
```

验证命令：

```bash
pnpm test -- runtime-scene runtimeSceneMap runtimeSceneDeviceFlow runtimeSceneFocusPanel worklineLiveOverview traceTopologySummary sandboxWorkbenchCleanup
pnpm type:check
pnpm lint
RUNTIME_SMOKE_USE_FIXED_MONITOR_FIXTURE=1 pnpm smoke:runtime:agent-browser
pnpm smoke:runtime:agent-browser
```

## 不在范围

- 不新增后端接口。
- 不新增 WMS 库存查询。
- 不从 `context_json / payload_json / event_payload` 推断资源。
- 不做真实 3D。
- 不做运行回放时间轴。
- 不把 trace 主诊断叙事改造成资源剖面。
- 不新增全局 store。
- 不新增插件画像或前端插件注册表。
- 不保留旧 `WorklineRouteMap` 兼容 wrapper。
- 不保留旧 `runtime-scene-model.ts` 或旧 scene model 类型。
- 不保留旧平铺 evidence UI。

## 设计原则落点

- **DRY**：资源归组规则只存在于 adapter；设备流组件只保留一份。
- **KISS**：scene model 输出渲染所需字段，组件不做业务推断。
- **SOLID**：adapter 负责转换，设备流负责拓扑，position/resource/focus/evidence 各自负责展示。
- **YAGNI**：不为库存页、回放页、真实 3D 或插件注册表预留复杂框架。
- **Explicit over clever**：归组优先级和 attention state 推导写成明确函数，不靠模板内隐式条件拼接。

## 工程评审结论

已采纳 `$plan-eng-review` 结论：

1. 等待/阻塞展示统一使用 `attentionState`，避免把 `WAITING_WMS` 误读为硬阻塞。
2. 未定位 evidence 改为全局审计区，不合成虚假 position。
3. stack 使用 `children` 列表表达子资源，避免分散数组字段和不存在的合同字段。
4. 证据详情组件改为 `RuntimeSceneEvidencePanel`，不固定 drawer 语义。
5. position/stack/child 顺序固定为 manifest/evidence 输入顺序，保证 UI 和测试稳定。
6. 固定 smoke fixture 必须覆盖 Rack/Bin/Slot/Cell/PKG/未定位证据。
7. 归组与 attention state 推导只在 `buildRuntimeSceneModel` 内完成。
8. `RuntimeSceneFocusPanel` 纳入本次 monitor 交互。
9. 共享拓扑收敛纳入本次，抽出 `RuntimeSceneDeviceFlow` 并删除旧 `WorklineRouteMap`。
10. browser 验收覆盖 monitor、sandbox、trace 三页。
11. `RuntimeSceneDeviceFlow` 放在 `src/components/runtime/shared/`，共享组件不挂在 monitor 私有目录。
12. position group 使用 `stationCode + positionCode` 物理键；重复 boundary 不重复渲染资源证据。
13. 删除旧 `runtime-scene-model.ts`、旧测试和旧类型，避免未发布系统留下双模型。
14. 默认焦点选择优先级必须有测试：blocked/waiting -> 有资源 position -> 第一个 position。
15. smoke 必须双模式运行：固定 fixture 验 monitor 资源布局，seeded backend 验 sandbox/trace 拓扑收敛。
