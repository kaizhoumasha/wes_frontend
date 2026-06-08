# TODOS

## P3 - RuntimeSceneFocusPanel 与共享拓扑收敛

**What**: 待 monitor-only `RuntimeSceneMap` 稳定后，补点击焦点面板，并评估 sandbox / trace topology 是否收敛到同一 scene model。

**Why**: 本次单层货架边界 v1 只替换 `/runtime/monitor` 的主图，避免影响 sandbox 和 trace 页面继续复用的 `WorklineRouteMap`。长期保留多套拓扑语义会增加维护成本。

**Context**: `WorklineRouteMap` 当前被 `/runtime/monitor`、sandbox workbench 和 trace topology 共同使用。本次计划要求新增 monitor-only `RuntimeSceneMap`，不替换共享组件。等 monitor scene model 的数据流、视觉布局和 smoke 稳定后，再决定是否扩展到其他页面。

**Scope**:

- 设计并实现 `RuntimeSceneFocusPanel`
- 评估 sandbox / trace 是否应复用 `RuntimeSceneModel`
- 保留 `WorklineRouteMap` 的兼容策略或制定迁移计划
- 补路由、组件和视觉 smoke 回归

**Dependencies**: 单层货架 `RuntimeSceneMap` v1 落地并通过 desktop/mobile smoke。

**Effort**: M (human: ~1-2 days / CC: ~2-3 hours)

**Priority**: P3
