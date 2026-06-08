# Runtime Monitor Resource Layout Design

> 日期：2026-06-08
> 范围：前端 `/runtime/monitor?worklineId=1` 的 `RuntimeSceneMap` 资源展示
> 状态：待工程评审
> 约束：当前功能未发布，不保留旧平铺 UI，不做向后兼容分支。

## 背景

当前 `/runtime/monitor` 已接入 `RuntimeSceneMap`，并能展示 WorkLine readiness、Station lease、single-layer rack snapshot、rack operation wait 和结构化 `resource_evidence_items`。

问题不是“资源没有显示”，而是 RACK、BIN、SLOT、CELL、PKG、PART_SN 等资源证据被全局平铺。操作员看到的是一组 evidence card，而不是现场关系：

- 哪个资源挂在哪个 `station / position` 上。
- 哪个资源正在让 `Station lease / Rack operation / Session` 卡住。
- 哪些 evidence 只是审计来源，不应该抢首屏。

后端边界仍然不变：WES 展示执行证据投影，不表达 WMS 库存真相，不新增库存查询，不从 raw JSON 推断资源事实。

## 第一性原则

监控页的首屏任务是现场判断，不是审计列表。

用户打开工作线监控时，最先需要回答：

1. 这条线现在能不能接收事件。
2. 哪个 station 或 position 正在等待。
3. 资源在现场结构里的位置是什么。
4. 需要追责或复核时，证据来源是什么。

因此信息层级应为：

```text
WorkLine state
  -> Station / Position
     -> blocking or waiting state
        -> Resource stack
           -> Evidence audit items
```

当前平铺结构的问题是把最后一层 `Evidence audit items` 提到了首屏主叙事。

## 已确认方向

采用 **现场剖面 + 证据抽屉**。

首屏显示 `station / position -> resource stack`，证据详情进入点击后的 drawer 或 inline panel。

不采用：

- 纯资源树：位置清楚，但阻塞原因容易被弱化。
- 纯阻塞聚焦：处置快，但正常态资源关系太弱。
- 保留平铺模式：未发布版本不需要兼容，保留会增加分支和测试成本。

## 信息架构

`RuntimeSceneMap` 右侧主视图从上到下：

1. **线体状态带**
   - workline name / code
   - readiness / runtime status
   - `resourceEvidenceTruncated` 提示

2. **Station / Position 剖面**
   - 每个 manifest boundary 对应一个现场段。
   - 例如 `TARGET_ARM / SINGLE_LAYER_A`。
   - 直接展示 Station lease、rack snapshot、rack operation wait。

3. **设备流向层**
   - 保留 `SOURCE_ARM -> TARGET_ARM` 这类横向执行路径。
   - `blockingDeviceId` 命中时高亮对应设备。

4. **资源堆栈层**
   - 资源不再全局平铺。
   - 资源挂到对应 `positionCode` 下。
   - 示例：`Position SINGLE_LAYER_A -> Rack RACK-001 -> Bin BIN-001 -> Slot/Cell/PKG`。

5. **证据审计层**
   - 默认收起。
   - 点击 position 或 resource stack 后展示。
   - 展示 trace/session/source/evidence kind/occurred_at 等审计字段。

## Scene Model

当前 `resourceEvidence` 一维数组应保留为 adapter 的事实输入和审计数据源，但首屏展示使用归组后的模型。

建议在 `RuntimeSceneModel` 上新增：

```ts
interface RuntimeSceneModel {
  positionGroups: RuntimeScenePositionGroup[]
  unlocatedAuditItems: RuntimeSceneResourceEvidence[]
}

interface RuntimeScenePositionGroup {
  key: string
  stationCode: string
  stationRole: string
  positionCode: string
  boundary: RuntimeSceneBoundary
  blockingState: 'blocked' | 'waiting' | 'normal' | 'unknown'
  resourceStacks: RuntimeSceneResourceStack[]
  auditItems: RuntimeSceneResourceEvidence[]
}

interface RuntimeSceneResourceStack {
  key: string
  primaryKind: 'RACK' | 'BIN' | 'PKG' | 'MAGAZINE' | 'UNKNOWN'
  rackCode?: string | null
  binCode?: string | null
  slotCodes: string[]
  cellCodes: string[]
  pkgCodes: string[]
  partSns: string[]
  evidenceCount: number
  evidenceKinds: RuntimeResourceEvidenceKind[]
  auditItems: RuntimeSceneResourceEvidence[]
}
```

归组规则：

- 先按 `positionCode` 归到 boundary。
- 没有 `positionCode` 的 evidence 放进 `unlocatedAuditItems`，不抢首屏。
- 同一 position 内，优先用 `rackCode` 建 stack。
- 没有 `rackCode` 时用 `binCode`。
- 再没有时用 `resourceKind + resourceCode`。
- `SLOT / CELL / PKG / PART_SN` 不再单独占首屏卡片，作为 stack 子项显示。
- `rackOperationWait` 为 `WAITING_WMS / TIMEOUT / FAILED` 时，position group 进入 waiting 或 blocked 状态。
- `blockingDeviceId` 仍作为 `RuntimeSceneMap` 的设备层高亮输入，不参与 resource stack 归组；当前合同没有稳定的 device -> position 映射，不从设备阻塞反推资源位置。

数据流：

```text
RuntimeWorklineDetailResponse.resource_evidence_items
  -> toSceneResourceEvidence()
  -> groupResourceEvidenceByPosition()
  -> derivePositionBlockingState(boundary fields)
  -> RuntimeSceneModel.positionGroups
  -> RuntimeSceneMap
     -> RuntimeScenePositionGroup
        -> RuntimeSceneResourceStack
           -> RuntimeSceneEvidenceDrawer
```

## 组件边界

保持 KISS，不做过度拆分。

- `buildRuntimeSceneModel`
  - 唯一归组入口。
  - 负责 enum normalization、boundary fallback、resource stack grouping。
  - Vue 组件不得重复写归组逻辑。

- `RuntimeSceneMap.vue`
  - 主布局编排。
  - 管理选中的 position/resource stack。
  - 消费 scene model，不读取 API，不判断插件 key。

- `RuntimeScenePositionGroup.vue`
  - 展示一个 station/position 剖面段。
  - 展示 boundary 状态、设备关联、资源堆栈列表。

- `RuntimeSceneResourceStack.vue`
  - 展示 Rack/Bin/Slot/Cell/PKG/Part SN 堆栈。
  - 只接受已经归组好的 stack。

- `RuntimeSceneEvidenceDrawer.vue`
  - 展示审计细节。
  - 只展示 evidence 字段，不推断库存结论。

删除旧的全局 evidence grid，不保留 legacy flat mode。

## 交互

- 默认选中第一个 `blocked / waiting` position。
- 没有等待态时，选中第一个有资源证据的 position。
- 点击 position group 或 resource stack 打开证据抽屉。
- 抽屉显示：
  - `resourceKind / resourceCode`
  - `evidenceKind`
  - `positionCode`
  - `rackCode / binCode / slotCode / pkgCode / partSn`
  - `sourceTraceId`
  - `sourceSessionId`
  - `occurredAt`
- `resourceEvidenceTruncated` 时，在 header 和 drawer 顶部都显示“仅展示前 N 条 / 共 M 条”。
- 缺少 manifest 或语义字段时，仍显示 fallback position group，标记“语义未加载 / 通用 evidence”。

移动端：

```text
Line state
  -> Position group
     -> Resource stack
        -> Inline evidence drawer
```

不做横向滚动主内容。

## 视觉方向

遵循 `DESIGN.md` 的工业控制中心风格：

- 深色主背景。
- 琥珀色只作为信号色。
- 资源编码、trace、session 使用等宽字体。
- blocked / waiting / normal 使用交通灯语义色。
- 避免大面积白底卡片，避免像普通后台表单。
- 卡片圆角保持克制，最多 8px。

## 错误与空态

- `positionGroups.length === 0` 且无 evidence：显示“暂无结构化资源证据”。
- manifest 缺失：显示 fallback position group，不隐藏 resources。
- contract 字段缺失：显示“运行态边界字段未加载，当前仅展示通用 evidence”。
- unlocated evidence 存在：抽屉底部显示“未定位证据”，不放首屏。
- evidence 超长编码：使用 `overflow-wrap: anywhere`，不截断关键信息。

## 测试策略

当前项目以 Vitest 和 `agent-browser` smoke 为主。

需要覆盖：

```text
Adapter tests
  -> positionCode grouping
  -> unlocated evidence
  -> rack-first stack key
  -> bin fallback stack key
  -> SLOT / CELL / PKG / PART_SN child rendering model
  -> WAITING_WMS / TIMEOUT / FAILED blocking state
  -> truncated count retention

Component tests
  -> RuntimeSceneMap renders positionGroups instead of flat evidence grid
  -> default selected waiting position
  -> click resource stack opens evidence drawer
  -> fallback manifest state still renders one position group
  -> mobile-safe text selectors remain visible

Smoke test
  -> /runtime/monitor desktop 1440x900
  -> /runtime/monitor mobile 390x844
  -> fixed fixture includes Rack, Bin, Slot, Cell, PKG, unlocated evidence
  -> assert no overflow / overlap for position group, stack, drawer
```

验证命令：

```bash
pnpm test -- runtime-scene runtimeSceneMap
pnpm type:check
pnpm lint
pnpm smoke:runtime:agent-browser
```

## 不在范围

- 不新增后端接口。
- 不新增 WMS 库存查询。
- 不从 `context_json / payload_json / event_payload` 推断资源。
- 不做真实 3D。
- 不做运行回放时间轴。
- 不做共享 `WorklineRouteMap` 替换。
- 不保留旧平铺 evidence UI。
- 不新增全局 store。
- 不新增插件画像或前端插件注册表。

## 设计原则落点

- **DRY**：资源归组规则只存在于 adapter。
- **KISS**：一个主模型，最多三个小展示组件。
- **SOLID**：adapter 负责转换，组件负责展示和选择事件。
- **YAGNI**：只覆盖 monitor 首屏和当前结构化 evidence，不为库存页、回放页或未来 3D 预留复杂框架。
- **Explicit over clever**：归组优先级写成明确函数，不靠隐式排序或模板内条件拼接。

## 工程评审关注点

`$plan-eng-review` 需要重点检查：

1. 归组模型是否过重，能否更小但仍清晰。
2. `blockingState` 是否应完全由 adapter 基于 boundary 字段推导，还是应该去掉该字段、让组件直接展示 `rackOperationWait`。
3. 小组件数量是否合适，是否有 DRY/KISS 冲突。
4. 测试是否覆盖所有 edge cases，特别是 unlocated/truncated/fallback。
5. smoke fixture 是否需要扩展到 Slot/Cell/PKG，避免视觉验收仍只覆盖 Rack/Bin。
