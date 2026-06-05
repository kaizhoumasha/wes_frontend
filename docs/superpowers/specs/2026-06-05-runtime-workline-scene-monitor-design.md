# 工作线现场态势监控设计

> 日期：2026-06-05  
> 范围：前端 `工作线监控` / `/runtime/monitor`  
> 目标：将工作线监控从设备卡片拓扑升级为 manifest 驱动的现场数字孪生态势图，先覆盖 2D 现场态势，后续承接运行回放与处置舱。

## 1. 背景

当前 `工作线监控` 使用左侧工作线目录 + 右侧 `WorklineLiveOverview`。右侧包含 `DecisionStrip`、`WorklineRouteMap` 和 `SessionBoard`，能展示设备拓扑、活跃会话、失败/完成链路、Runtime Hold、停靠 outbox、未完成命令等运行信号。

用户希望按“虚拟现实”的逻辑优化，但目标不是 3D 炫技，而是让操作员像站在现场一样判断：

- 哪条线现在有问题。
- 哪个设备、工段或资源位置正在等待。
- 哪些 Session / Command / Hold 受影响。
- 后续 SMT 分拣线、退料线、机构件拆包线等不同工作线如何共用同一套监控体验。

后端 `SRS.md` 明确 WES 是执行协调中台，不是 WMS 库存事实源。前端现场图应表达 WES 看到的执行世界与证据投影，不表达 WMS 拥有的库存世界。

## 2. 第一性原则

工作线监控的主对象不是 Trace ID，也不是指标卡，而是现场执行对象：

1. `Zone / WorkLine`：现场问题首先发生在区域和工作线上。
2. `Device Role Segment`：不同插件通过设备角色定义线体能力。
3. `Device Instance`：真实执行单元，承载状态、命令、等待和异常。
4. `Session / Command / Hold / Outbox`：运行中的证据叠层。
5. `Resource Projection`：Rack、Bin、PKG、Slot、Part SN、Magazine 等只作为执行证据显示，不作为库存真相。

界面必须回答：

- 这条工作线现在是否可运行。
- 当前哪些设备或角色段在执行、等待、异常或被 Hold。
- 某个 Session 的当前位置、等待对象和影响范围。
- 后续回放和处置动作可以挂到同一个现场模型上。

## 3. 已确认决策

| 编号 | 决策                                | 说明                                                          |
| ---- | ----------------------------------- | ------------------------------------------------------------- |
| D1   | 采用三者融合但先做现场态势图        | 后续支持运行回放和处置舱，第一阶段只落现场态势。              |
| D2   | 首屏右侧升级为现场态势图            | 左侧工作线目录保留，右侧从拓扑卡片列表升级为现场模型。        |
| D3   | 不在前端维护 `runtimeSceneProfiles` | 业务语义必须来自后端 WorkLine 的 `plugin_key` 对应 manifest。 |
| D4   | 前端组件只消费统一 scene model      | 展示组件不得直接判断具体插件 key。                            |
| D5   | 资源只作为执行证据投影              | 遵守 SRS：库存授权和库存真相仍属于 WMS/RCS。                  |

## 4. 信息架构

`/runtime/monitor` 保持左侧工作线目录，右侧重构为现场态势工作台：

1. **运行裁决条**
   - 保留并强化 `DecisionStrip`。
   - 展示健康、冻结、等待、Runtime Hold、急停、WMS/外部依赖异常等线体级结论。

2. **现场态势图**
   - 替代当前 `WorklineRouteMap` 作为主叙事。
   - 以设备角色段、设备实例、流向、等待关系和异常叠层组织信息。
   - 首版为 2D / 准空间视图，不做真实 3D 坐标。

3. **焦点面板（后续阶段）**
   - v1 不实现焦点面板，只保留节点选择态和现有详情入口。
   - 点击设备、Session、Hold、停靠 outbox 后显示上下文的能力，待现场态势图稳定后再收敛。

4. **SessionBoard 辅助列表**
   - 第一阶段保留。
   - 从主叙事降级为现场图下方或侧边的列表辅助。

## 5. 现场模型

前端内部建立 `RuntimeSceneModel`，由 adapter 纯函数生成。

```ts
interface RuntimeSceneModel {
  workline: RuntimeSceneWorkline
  verdict: RuntimeSceneVerdict
  lanes: RuntimeSceneLane[]
  nodes: RuntimeSceneNode[]
  flows: RuntimeSceneFlow[]
  overlays: RuntimeSceneOverlay[]
  gaps: RuntimeSceneGap[]
}
```

模型含义：

- `Scene`：当前工作线、插件、运行模式、运行裁决、刷新状态。
- `Lane / Segment`：逻辑工段或设备角色段，来自 manifest role、event source、command target 和实际设备。
- `Node`：设备实例，展示设备状态、维护、当前命令、未完成命令、Runtime Hold、停靠 outbox、心跳和错误码。
- `Flow`：现场流向。优先用 `upstream_device_id` 推导；缺失时按 manifest display/topology order、`required_device_roles` 声明顺序、`role_index` 和设备顺序依次 fallback。
- `Evidence Overlay`：活跃 Session、当前等待、Trace 路径、阻塞点、外部回调等待等运行证据。
- `Resource Projection`：资源证据挂在 node 或 session 上，明确标识为执行投影。

## 6. Manifest 驱动适配

前端不维护插件画像注册表。适配来源必须是后端 manifest。

现有可复用事实：

- WorkLine 已有 `plugin_key`、`contract_version`、`run_mode`、`line_type`。
- `/api/v1/workline/plugins/options` 已返回 `WorkLinePluginOption`。
- `WorkLinePluginOption` 当前包含：
  - `required_device_roles`
  - `supported_events`
  - `supported_commands`
- 后端 manifest 当前包含：
  - `required_device_roles`
  - `event_source_roles`
  - `command_target_roles`
  - `supported_events`
  - `supported_commands`
- 前端工作线配置页已经使用这些 manifest 字段做角色覆盖检查。

监控页应通过当前工作线 `plugin_key` 获取 manifest 摘要，并从 manifest + runtime detail 组装 scene model。

如果 manifest 需要更好的现场显示语义，应由后端 manifest 增加 display/topology 元数据，而不是前端硬编码：

- `role_display_name`
- `role_group`
- `topology_order`
- `scene_lane`
- `resource_evidence_keys`
- `primary_flow_direction`

在 display 元数据缺失时，前端只做通用 fallback：

- 按 `upstream_device_id` 推导流向。
- 按 `role_index` 排序。
- 原样显示 `device_role`。
- 未匹配 manifest 的设备归入“未归类设备”。
- manifest 要求但缺失的角色显示为配置缺口。

## 7. 数据流与 API

当前可复用数据流：

```text
route.worklineId
  -> runtimeApiMethods.worklineDetail(worklineId)
  -> detail.summary.plugin_key
  -> plugin manifest summary
  -> buildRuntimeSceneModel(detail, manifest, optional tracePath)
  -> RuntimeSceneMap
```

现有接口：

- `runtimeApiMethods.worklines()`：工作线目录与运行摘要。
- `runtimeApiMethods.worklineDetail(worklineId)`：summary、devices、active sessions、failed/completed traces。
- `runtimeApiMethods.tracePath(...)`：Session/Trace 设备路径、当前阻塞设备、evidence。
- `/api/v1/workline/plugins/options`：插件 manifest 摘要。

v1 后端依赖：

1. 提供 `GET /api/v1/workline/plugins/{plugin_key}/manifest`，或等价的单插件 manifest summary endpoint。
2. manifest summary 至少返回 `plugin_key`、`contract_version`、`required_device_roles`、`event_source_roles`、`command_target_roles`、`supported_events`、`supported_commands`。
3. display/topology 元数据可选；缺失时前端只能做通用 fallback。
4. 暂不新增专门 Rack/Bin/Material 查询。资源层 v1 只消费稳定结构化运行字段，不从 raw JSON 推断资源证据。

失败处理：

- manifest 加载失败：仍显示默认设备图，并提示“插件语义未加载，按设备角色原样展示”。
- 设备缺少 role：归入“未归类设备”。
- manifest 要求 role 但现场没有设备：显示缺口段。
- SSE 更新：刷新 detail；manifest 按 `plugin_key` 缓存，不重复拉取。

## 8. 前端组件边界

新增或重构组件：

- `useRuntimeSceneManifest`
  - 按 `plugin_key` 拉取和缓存 manifest 摘要。
  - 只负责数据获取、缓存和失败状态。

- `buildRuntimeSceneModel`
  - 纯函数 adapter。
  - 输入 `RuntimeWorklineDetailResponse`、manifest summary、optional trace path。
  - 输出统一 scene model。
  - 集中处理排序、缺失角色、未归类设备、阻塞叠层、活跃 Session 叠层。

- `RuntimeSceneMap`
  - 纯展示组件。
  - 只消费 scene model，不知道具体插件 key，不直接调 API。

- `RuntimeSceneNode`
  - 展示单个设备节点。
  - 包含状态、等待、命令、Hold、停靠 outbox、证据徽标。

- `WorklineLiveOverview`
  - 在 `/runtime/monitor` 内从 `DecisionStrip + WorklineRouteMap + SessionBoard` 过渡到 `DecisionStrip + RuntimeSceneMap + SessionBoard`。
  - 第一阶段保留 `SessionBoard`。
  - 不替换 sandbox、trace 等页面继续使用的共享 `WorklineRouteMap`。

约束：

- 展示组件不得包含 `plugin_key === 'rough_sorter'` 或 `plugin_key === 'SMT_SORTING_INBOUND'` 这类业务判断。
- 若需要业务语义，必须来自 manifest。

## 9. 适配示例

以下示例用于说明 manifest 驱动后的显示方式，不代表前端注册表。

- 粗分机 / 装箱线：输入臂、输送/扫描、输出臂、货架补给；资源证据包括 PKG、measurement、active rack、bin cell、rack supply dispatch。
- SMT 分拣入库：source arm、scan platform、target arm、NG arm/station、workstation；资源证据包括 working bin、target slot、NG reason、sorting completion。
- 退料线：PDA 分类、LCR、X-Ray、贴标、退料货架；资源证据包括 original/new PKG、actual count、return rack side/slot、WMS adjust evidence。
- 机构件拆包线：A/B pallet pair、unwrap zone、unpack line、magazine buffer；资源证据包括 pallet pair、box barcode、Part SN、magazine full、SFC push。

## 10. 验收标准

1. 粗分机工作线仍能显示完整设备路径，不回退成空态。
2. SMT 分拣入库工作线可按 manifest required roles 显示 6 类设备角色；缺失角色能显式显示配置缺口。
3. manifest 加载失败时仍能按实际设备原始 role 显示。
4. Runtime Hold、blocked outbox、open command、current command、active session 能在对应节点出现。
5. 前端无插件 key 业务硬编码。
6. 桌面宽屏、普通桌面、移动窄屏不出现文字溢出或节点重叠。
7. `pnpm type:check` 通过；若改动 CSS 和 Vue 结构，提交前运行 `pnpm lint`。

## 11. 风险与处理

| 风险                                 | 影响                                  | 处理                                                                      |
| ------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------- |
| manifest display 元数据不足          | 首版角色标签偏工程化                  | 前端做通用 fallback；业务显示语义由后端 manifest 增补。                   |
| 前端误把资源投影视为库存真相         | 违反 SRS 边界，误导操作员             | 文案和数据层明确“执行证据 / WMS 回调证据”，不展示库存授权结论。           |
| 不同插件拓扑不是线性                 | 单纯横向图无法表达分支或成对协同      | scene model 支持 lanes/gaps/flows；首版可显示准空间分组，后续再增强布局。 |
| 现有接口没有单插件 manifest endpoint | 缺少事件/命令角色映射会迫使前端猜语义 | v1 先补 manifest summary endpoint，再接入前端现场模型。                   |

## 12. 不在本阶段

- 不做真实 3D / VR 场景。
- 不做完整 Session 回放时间机器。
- 不做完整处置舱。
- 不新增 Rack/Bin/Material 独立库存查询。
- 不从 `context_json`、`payload_json`、`event_payload` 推断资源徽标。
- 不做 `RuntimeSceneFocusPanel`。
- 不替换 sandbox、trace 等页面的共享 `WorklineRouteMap`。
- 不在前端维护插件业务画像注册表。

## 工程评审结论

日期：2026-06-05  
技能：`/plan-eng-review`  
结果：范围收窄后可实施；v1 只做 manifest contract、scene adapter、monitor-only scene map 和完整测试。

### Step 0 Scope Challenge

复杂度检查触发：原方案会同时触碰后端 manifest schema/API、前端生成类型、API adapter、manifest composable、scene builder、scene map、node、focus panel、`WorklineLiveOverview` 和测试，超过 8 个文件且超过 2 个服务/组件。

已确认范围收窄：

- v1 包含：单插件 manifest summary endpoint、前端 API/composable、纯 scene adapter、`/runtime/monitor` 专用 `RuntimeSceneMap`、完整单元/契约/路由同步测试。
- v1 不包含：`RuntimeSceneFocusPanel`、真实 3D、回放时间机器、处置舱、跨页面替换共享 `WorklineRouteMap`、raw JSON 资源徽标。

### What Already Exists

- `WorklineMonitorPage` 已有工作线目录、route query 同步、SSE 后刷新 detail 的基础流程；应复用，不重建监控页壳。
- `WorklineLiveOverview` 已承载 `DecisionStrip`、`WorklineRouteMap`、`SessionBoard`；v1 只替换 monitor 内主图，不改 SessionBoard。
- `WorklineRouteMap` 已被 monitor、sandbox、trace topology 共用；v1 不做全局替换，避免扩大 sandbox/trace 回归面。
- 后端 manifest 已有 `event_source_roles`、`command_target_roles`；但当前插件 options DTO 未导出这些字段，需要新增 dedicated summary endpoint。
- 既有 Vitest 覆盖 runtime API、route sync、workline route map、runtime store；新测试应沿用这些测试层级。

### Review Findings

1. `[P1] (confidence: 9/10) ../wes_backend/src/app/workline/models/workline.py:246 — WorkLinePluginOption 当前未导出 event_source_roles / command_target_roles，但 scene model 需要这些角色映射；v1 必须补 dedicated plugin manifest summary endpoint。`
2. `[P1] (confidence: 9/10) src/components/runtime/monitor/WorklineRouteMap.vue — 该组件被 monitor、sandbox、trace topology 复用；v1 若全局替换会扩大回归面，应新增 monitor-only RuntimeSceneMap。`
3. `[P1] (confidence: 8/10) src/types/runtime.ts — 资源证据目前主要在通用 JSON 字段内，v1 从 raw JSON 挖 Rack/Bin/PKG/Slot 会变成插件专用推断；scene badge 只使用结构化运行字段。`
4. `[P1] (confidence: 9/10) tests/unit/views/runtime/runtimeRouteSync.test.ts — runtime refactor 不能只跑 type-check；既有学习显示 URL 已有 worklineId 时 detail load 和 tests import 很容易回归。`
5. `[P1] (confidence: 8/10) src/views/runtime/worklines/WorklineMonitorPage.vue — SSE/detail refresh 可能频繁触发；manifest fetch 必须按 plugin_key 缓存、in-flight dedupe，并忽略快速切线产生的 stale response。`

### Test Coverage Diagram

```text
CODE PATHS                                               USER FLOWS
[+] Backend manifest summary endpoint                    [+] /runtime/monitor direct load
  ├── [GAP] plugin_key found -> manifest summary           ├── [GAP] route has worklineId -> detail loads
  ├── [GAP] plugin_key missing/unknown -> clear error      ├── [GAP] selectedDeviceId remains synced
  └── [GAP] role maps include event/command roles          └── [GAP] manifest failure still renders devices

[+] Frontend API + useRuntimeSceneManifest               [+] Operator changes workline quickly
  ├── [GAP] success caches by plugin_key                   ├── [GAP] previous manifest response ignored
  ├── [GAP] concurrent same key deduped                    └── [GAP] current workline scene remains correct
  ├── [GAP] request failure exposes fallback state
  └── [GAP] stale response guard

[+] buildRuntimeSceneModel                               [+] Inspect live operation state
  ├── [GAP] manifest roles -> lanes/nodes                  ├── [GAP] hold badge on affected device
  ├── [GAP] missing manifest -> raw role map               ├── [GAP] blocked outbox badge on device
  ├── [GAP] missing required role -> config gap            ├── [GAP] active session/current device overlay
  ├── [GAP] uncategorized device retained                  └── [GAP] raw JSON resource keys not displayed
  └── [GAP] structured badges only

[+] RuntimeSceneMap / RuntimeSceneNode                   [+] Visual QA [->E2E/manual]
  ├── [GAP] default role/device rendering                  ├── [GAP] desktop wide no overlap
  ├── [GAP] config gap rendering                           ├── [GAP] desktop normal no overflow
  ├── [GAP] semantic-load warning rendering                └── [GAP] mobile narrow remains scannable
  └── [GAP] selected/current node state

COVERAGE: 0/27 new paths currently covered by the plan text before review.
Required coverage after implementation: backend contract + frontend API + pure adapter + component + route-sync Vitest + browser visual QA.
Legend: [GAP] must become test coverage in implementation; [->E2E/manual] requires browser/visual verification.
```

### Failure Modes

| Codepath            | Production failure                                    | Required handling                                                | Test required                              | Critical gap            |
| ------------------- | ----------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------ | ----------------------- |
| Manifest endpoint   | plugin key not found or manifest malformed            | explicit 404/validation error; frontend fallback to raw role map | backend contract + frontend API error test | no, if fallback visible |
| Manifest composable | SSE/detail refresh repeats manifest fetch             | cache + in-flight dedupe by `plugin_key`                         | composable/API test                        | no                      |
| Manifest composable | user switches workline before prior manifest resolves | stale-response guard ignores old result                          | route/component test                       | no                      |
| Scene adapter       | manifest requires role with no bound device           | emit config gap, not empty scene                                 | pure adapter test                          | no                      |
| Scene adapter       | device has no role or unknown role                    | retain under uncategorized group                                 | pure adapter test                          | no                      |
| Scene adapter       | raw JSON contains resource-looking keys               | do not display as v1 resource badge                              | structured-only adapter test               | no                      |
| Scene map UI        | many nodes or long role names overflow                | responsive stable dimensions, truncation/tooltips                | component + browser visual QA              | no                      |
| Route sync          | direct URL with `worklineId` does not load detail     | mounted route sync must fetch detail                             | route-sync regression test                 | no                      |

### NOT In Scope

- Real 3D / VR scene: current goal是现场态势，不是三维渲染。
- Session replay timeline: 需要历史事件模型，v1 只显示当前态。
- RuntimeSceneFocusPanel: 点击详情后续做，避免本次同时改变主图和处置入口。
- Shared WorklineRouteMap replacement: sandbox/trace 仍依赖现有组件，v1 限定 monitor。
- Rack/Bin/Material 独立库存查询：违反 SRS 边界，WES 不拥有库存事实。
- Raw JSON resource badge inference: 容易变成插件专用逻辑，等待后端结构化证据契约。

### TODO Candidates Accepted

1. **结构化运行资源证据契约**
   - What: 后端为 Rack/Bin/PKG/Slot/Magazine 等执行证据提供稳定结构化字段或 manifest evidence contract。
   - Why: 让现场图能显示资源证据，但不从 raw JSON 推断库存事实。
   - Priority: P3；Depends on backend contract design。

2. **RuntimeSceneFocusPanel / 共享拓扑收敛**
   - What: 待 monitor scene 稳定后，补点击焦点面板，并评估是否把 sandbox/trace 拓扑也收敛到 scene model。
   - Why: 避免多个页面长期保留不同拓扑语义和交互模型。
   - Priority: P3；Depends on v1 scene map adoption。

### Worktree Parallelization Strategy

| Step                      | Modules touched                                                 | Depends on                |
| ------------------------- | --------------------------------------------------------------- | ------------------------- |
| Backend manifest endpoint | backend workline app, runtime manifest                          | —                         |
| Frontend API/composable   | `src/api`, `src/composables`, `src/types`                       | Backend manifest contract |
| Scene adapter             | `src/components/runtime`, `src/types`                           | Frontend manifest type    |
| Monitor UI                | `src/components/runtime/monitor`, `src/views/runtime/worklines` | Scene adapter             |
| Tests/QA                  | `tests/unit`, backend tests, browser QA                         | All implementation lanes  |
| TODO capture              | `TODOS.md` / backend TODOs                                      | —                         |

Parallel lanes:

- Lane A: Backend manifest endpoint -> backend contract tests.
- Lane B: Frontend API/composable -> scene adapter -> monitor UI, sequential because types and scene model feed UI.
- Lane C: TODO capture can run independently after review.
- Lane D: Tests/QA lands after A+B merge; frontend tests can be developed alongside B once fixtures are stable.

Execution order: launch A and B only after agreeing the endpoint wire shape; C can run anytime; D completes after A+B.

### Implementation Tasks

- [ ] **T1 (P1, human: ~2h / CC: ~20min)** — backend — 新增插件 manifest summary endpoint，并覆盖角色映射契约测试
  - Surfaced by: Architecture Review — current options DTO lacks event/command role maps.
  - Files: `../wes_backend/src/app/workline`, `../wes_backend/src/workline_runtime`
  - Verify: backend contract/schema tests for required role fields.
- [ ] **T2 (P1, human: ~1h / CC: ~10min)** — frontend-api — 接入 manifest summary API，生成/复用类型并实现按 plugin_key 缓存的 composable
  - Surfaced by: Architecture + Performance Review — manifest must come from backend and avoid repeated/stale fetches.
  - Files: `src/api`, `src/composables`, `src/types`
  - Verify: frontend API/composable tests for success, failure, dedupe, stale guard.
- [ ] **T3 (P1, human: ~2h / CC: ~20min)** — scene-adapter — 实现纯函数 `buildRuntimeSceneModel`，禁止插件 key 硬编码和 raw JSON 挖掘
  - Surfaced by: Code Quality Review — v1 badges use structured runtime fields only.
  - Files: `src/components/runtime`, `src/types`
  - Verify: pure adapter tests for ordering, fallback, gaps, uncategorized devices, active session overlay.
- [ ] **T4 (P1, human: ~3h / CC: ~30min)** — monitor-ui — 新增 monitor-only `RuntimeSceneMap` 并集成到 `WorklineLiveOverview`
  - Surfaced by: Architecture Review — isolate v1 to `/runtime/monitor` and keep shared `WorklineRouteMap` unchanged.
  - Files: `src/components/runtime/monitor`, `src/views/runtime/worklines`
  - Verify: component tests plus browser visual QA on desktop/mobile.
- [ ] **T5 (P1, human: ~3h / CC: ~30min)** — tests — 补齐 API、scene builder、scene component、route sync 和后端 contract 测试
  - Surfaced by: Test Review — `type:check`/lint alone is insufficient.
  - Files: `tests/unit`, `../wes_backend/tests`
  - Verify: full Vitest runtime suite, backend contract tests, `pnpm type:check`, `pnpm lint` before ship.
- [ ] **T6 (P3, human: ~1h / CC: ~10min)** — follow-up — 在 TODO 中记录结构化运行资源证据契约，v1 不实现 raw JSON overlay
  - Surfaced by: TODO Review D7.
  - Files: `TODOS.md`, `../wes_backend/TODOS.md`
  - Verify: TODO includes What/Why/Context/Effort/Priority/Depends on.
- [ ] **T7 (P3, human: ~1h / CC: ~10min)** — follow-up — 在 TODO 中记录 `RuntimeSceneFocusPanel` 与共享拓扑收敛，v1 不实现
  - Surfaced by: TODO Review D8.
  - Files: `TODOS.md`
  - Verify: TODO explains v1 monitor-only decision and follow-up trigger.

### Completion Summary

- Step 0: Scope Challenge — scope reduced per recommendation.
- Architecture Review: 2 issues found.
- Code Quality Review: 1 issue found.
- Test Review: diagram produced, 27 gaps identified for new codepaths.
- Performance Review: 1 issue found.
- NOT in scope: written.
- What already exists: written.
- TODOS.md updates: 2 items proposed to user, 2 accepted for deferred capture.
- Failure modes: 0 critical gaps flagged after required handling/tests are included.
- Outside voice: skipped.
- Parallelization: 4 lanes, 2 initially parallel / 2 sequential after dependencies.
- Lake Score: 5/5 recommendations chose complete option.

## GSTACK REVIEW REPORT

| Review        | Trigger               | Why                             | Runs | Status | Findings                                               |
| ------------- | --------------------- | ------------------------------- | ---- | ------ | ------------------------------------------------------ |
| CEO Review    | `/plan-ceo-review`    | Scope & strategy                | 0    | —      | —                                                      |
| Codex Review  | `/codex review`       | Independent 2nd opinion         | 0    | —      | —                                                      |
| Eng Review    | `/plan-eng-review`    | Architecture & tests (required) | 1    | CLEAR  | scope reduced; 32 issues/gaps, 0 critical gaps         |
| Design Review | `/plan-design-review` | UI/UX gaps                      | 0    | —      | UI implementation should run design review before ship |
| DX Review     | `/plan-devex-review`  | Developer experience gaps       | 0    | —      | —                                                      |

- **UNRESOLVED:** 0
- **VERDICT:** ENG CLEARED — ready to implement the reduced v1 plan.
