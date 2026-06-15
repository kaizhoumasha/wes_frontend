# TODOS

## To-Do

### CI 引入死代码静态分析（knip 或 ts-prune）

**What**: 在 `pnpm lint` 闸门中加一个 `knip` 步骤，自动检测未使用的 export / 未注册组件 / 未引用文件，CI 强制 0 warnings。

**Why**: 2026-06 死代码清理证明仓库会自然累积死代码（5 个零引用 composables、5 个零引用组件、1 个测试孤儿）。靠人肉 grep 复盘不可持续。

**Pros**: 未来死代码不会再累积成需要专项 PR 清理的程度；新增组件 / composable 后若未挂上即被 CI 拦截。

**Cons**: knip 需要配置忽略名单（OpenAPI 自动生成模块、DEV-only 路由等）；初次接入预计 30-60min 调优误报。

**Context**: 本仓库为 Vue 3 + Vite + unplugin-vue-components 项目，knip 对该栈支持良好（参考其 docs 中的 vue plugin 配置）；ts-prune 是更轻的备选但对 Vue SFC 支持差。

**Depends on**: 死代码清理 PR (`chore/dead-code-cleanup-2026-06`) 合入 develop。

**Priority**: P3

---

## Completed

### RuntimeSceneFocusPanel 与共享拓扑收敛

**Completed:** v0.4.6.0 (2026-06-09)

**What**: `/runtime/monitor` 已补充 `RuntimeSceneFocusPanel`，sandbox 与 trace 的完整设备拓扑已收敛到共享 `RuntimeSceneDeviceFlow`。

**Why**: 三个运行态入口现在使用同一套设备信号表达，操作员在处置、回放和沙箱验证之间不会看到不一致的 Runtime Hold、停靠 outbox、未完成命令和 trace path 状态。

**Context**: `docs/superpowers/specs/2026-06-08-runtime-monitor-resource-layout-design.md` 将该收敛项纳入本次资源布局工作，并明确删除旧 `WorklineRouteMap` 兼容 wrapper。

**Scope**:

- 点击现场位置和资源 stack 后展示统一焦点上下文
- monitor、sandbox、trace topology 共享 `RuntimeSceneDeviceFlow`
- 删除旧 `WorklineRouteMap` 与对应单测

**Priority**: P3

---

### Runtime scene 资源证据前端展示契约接入

**Completed:** v0.4.5.0 (2026-06-08)

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
