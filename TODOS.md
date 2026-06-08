# TODOS

## P3 - Runtime scene 资源证据前端展示契约接入

**What**: 后端提供结构化运行资源证据契约后，在 `RuntimeSceneModel` 与 `RuntimeSceneMap` 中接入 Rack、Bin、PKG、Slot、Part SN、Magazine 等资源证据徽标。

**Why**: v1 为遵守 WES/WMS 边界，明确禁止从 `context_json`、`payload_json`、`event_payload` 推断资源徽标。前端需要等待稳定 contract 后再展示资源证据，否则容易把插件专用 JSON 误当成库存真相。

**Context**: `docs/superpowers/specs/2026-06-05-runtime-workline-scene-monitor-design.md` 工程评审已接受 T6。当前 v1 只展示结构化运行字段，例如 Runtime Hold、blocked outbox、open/current command 和 active session；后端对应 TODO 已记录结构化运行资源证据契约。

**Scope**:

- 为 `RuntimeSceneModel` 增加资源证据 overlay/badge 字段
- 在 `RuntimeSceneMap` 中展示执行证据，并用文案区分 WES 执行投影与 WMS 库存事实
- 补 adapter/component tests，确认仍不读取 raw JSON 字段

**Dependencies**: 后端 Runtime scene 结构化运行资源证据契约稳定，并生成或手动补齐前端类型。

**Effort**: M (human: ~1 day / CC: ~1 hour)

**Priority**: P3

---

## P3 - RuntimeSceneFocusPanel 与共享拓扑收敛

**What**: 在 `/runtime/monitor` 现场态势图稳定后，补充 `RuntimeSceneFocusPanel`，并评估 sandbox、trace topology 是否收敛到同一套 scene model。

**Why**: v1 为降低回归面只替换 monitor 主图，sandbox 和 trace 继续使用 `WorklineRouteMap`。后续如果三个页面长期保留不同拓扑语义，操作员在处置、回放和沙箱验证之间会看到不一致的设备状态表达。

**Context**: `docs/superpowers/specs/2026-06-05-runtime-workline-scene-monitor-design.md` 工程评审已接受该后续项。当前 v1 只实现 monitor-only `RuntimeSceneMap`，不做点击焦点面板，不替换共享 `WorklineRouteMap`。

**Scope**:

- 点击设备、Session、Runtime Hold、停靠 outbox 后展示统一焦点上下文
- 对比 `RuntimeSceneMap` 与 `WorklineRouteMap` 在 monitor、sandbox、trace topology 的职责边界
- 只在 scene model 稳定后再决定是否替换 sandbox/trace，避免一次 PR 扩大回归面

**Dependencies**: `/runtime/monitor` 现场态势图在生产/沙箱数据上稳定，scene model 字段能覆盖处置和回放入口。

**Effort**: M (human: ~1 day / CC: ~1 hour)

**Priority**: P3
