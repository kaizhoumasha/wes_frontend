# 单层货架运行边界前端承接实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 `/runtime/monitor` 准确承接单层货架 active snapshot、Station lease、WMS rack operation 与分拣机角色边界，避免前端误表达库存真相或设备直连调度。

**Architecture:** 前端以运行态 detail、后端 snake_case 结构化字段、manifest/display 元数据和 generated types 为输入，在 scene adapter 中归一化为 camelCase `RuntimeSceneModel`。展示组件只消费 scene model，不解析 raw JSON，不硬编码插件 key，不新增库存或调度事实源。

**Tech Stack:** Vue 3, TypeScript, Pinia/alova API layer, Element Plus, Vitest, OpenAPI typegen

---

## 当前依赖

- 后端计划：`wes_backend/docs/superpowers/plans/2026-06-06-wes-single-layer-rack-orchestration-boundary-plan.md`
- 前端基础设计：`docs/superpowers/specs/2026-06-05-runtime-workline-scene-monitor-design.md`
- 前端增量设计：`docs/superpowers/archive/specs/2026-06-06-single-layer-rack-boundary-frontend-design.md`

本计划依赖后端提供结构化运行字段。2026-06-08 工程评审核对后，`../wes_backend` 已在 runtime detail / OpenAPI 路径落地五个 snake_case 边界字段和单插件 manifest route；当前前端 generated types 尚未同步，因此实施必须先执行合同同步，再写 adapter/UI。若同步后字段仍缺失，视为合同失败，前端只显示通用 evidence 降级，不从 raw JSON 推断业务含义。

后端字段合同必须使用以下 exact snake_case 字段；generated types 按后端 OpenAPI 消费 snake_case，前端 scene adapter 再转换为 camelCase `RuntimeSceneModel` 字段，不得以等价字段替代：

| 后端字段                        | 前端 scene 字段              | 状态集合                                                                                                     |
| ------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `workline_readiness`            | `worklineReadiness`          | `READY` / `NOT_READY` / `UNKNOWN`                                                                            |
| `station_lease`                 | `stationLease`               | `IDLE` / `ACTIVE_RACK_BOUND` / `ACTIVE_DISPATCH_LEASE` / `ACTIVE_SESSION_BOUND` / `UNKNOWN`                  |
| `single_layer_rack_snapshot`    | `singleLayerRackSnapshot`    | `ACTIVE` / `MISSING` / `INVALID` / `NON_SINGLE_LAYER_EVIDENCE` / `UNKNOWN`                                   |
| `rack_operation_wait`           | `rackOperationWait`          | `WAITING_WMS` / `WMS_CALLBACK_RECEIVED` / `TIMEOUT` / `FAILED` / `NONE` / `UNKNOWN`                          |
| `resource_evidence_kind`        | `resourceEvidenceKind`       | `WES_ACTIVE_SNAPSHOT` / `WMS_CALLBACK_EVIDENCE` / `TRACE_RESOURCE_EVIDENCE` / `GENERIC_EVIDENCE` / `UNKNOWN` |
| `resource_evidence_items`       | `resourceEvidenceItems`      | `RuntimeResourceEvidenceItem[]`，见下方结构化资源证据合同。                                                  |
| `resource_evidence_total_count` | `resourceEvidenceTotalCount` | 实际证据条数。                                                                                               |
| `resource_evidence_truncated`   | `resourceEvidenceTruncated`  | 是否因上限截断。                                                                                             |

字段缺失时属于后端合同待办，前端只显示通用 evidence fallback 和语义未加载提示。

结构化资源证据合同在本 PR 直接落地，不再作为 P3 后续项。后端新增 `RuntimeResourceEvidenceItem[]`，前端仅消费 generated types：

```ts
interface RuntimeResourceEvidenceItem {
  resource_kind: 'RACK' | 'BIN' | 'PKG' | 'SLOT' | 'CELL' | 'MAGAZINE' | 'PART_SN' | 'UNKNOWN'
  resource_code: string
  display_label: string
  evidence_kind:
    | 'WES_ACTIVE_SNAPSHOT'
    | 'WMS_CALLBACK_EVIDENCE'
    | 'TRACE_RESOURCE_EVIDENCE'
    | 'GENERIC_EVIDENCE'
    | 'UNKNOWN'
  station_code?: string | null
  position_code?: string | null
  rack_code?: string | null
  bin_code?: string | null
  slot_code?: string | null
  pkg_code?: string | null
  part_sn?: string | null
  source_session_id?: number | null
  source_trace_id?: string | null
  occurred_at?: string | null
}
```

后端按稳定 key 去重、排序，默认最多返回 50 条，并同时返回 `resource_evidence_total_count` 与 `resource_evidence_truncated`。内部可按 QueryOptions 风格组织 limit/offset/sort，但 v1 不公开 monitor 首屏 query 参数；若后续 evidence 面板独立出来，再公开分页查询。

## 实施任务

### Task 0. 合同与口径核对

- [x] 对照后端 OpenAPI / generated types，确认是否已有 WorkLine READY、Station lease、active rack snapshot、rack operation wait、resource evidence 相关 snake_case 字段。
- [x] 核对 generated types 是否包含 `workline_readiness`、`station_lease`、`single_layer_rack_snapshot`、`rack_operation_wait`、`resource_evidence_kind` 及上表状态集合；核对 scene adapter 输出 `worklineReadiness`、`stationLease`、`singleLayerRackSnapshot`、`rackOperationWait`、`resourceEvidenceKind`。
- [x] 确认字段已存在，无需记录后端合同待办；前端不得在组件中解析 `context_json`、`payload_json` 或 `event_payload` 兜底推断。
- [x] 确认既有现场态势图 SPEC 已采用 `TARGET_ARM` 执行 NG 放置，NG station 作为证据或站点展示。

状态同步 2026-06-08：已核对后端，五个边界字段和 `/plugins/{plugin_key:path}/manifest` 已在 `../wes_backend` 落地；前端 generated/types/source/tests 已同步，`resource_evidence_items`、camelCase scene adapter 输出字段、`RuntimeSceneMap` 与 `buildRuntimeSceneModel` 已补齐。既有 SPEC 已采用 `TARGET_ARM` + NG station evidence 口径。

验证：

```bash
pnpm type:check
! rg -n "NG arm/station|独立 NG arm" src
(
  raw_json_candidates="$(mktemp)"
  trap 'rm -f "${raw_json_candidates}"' EXIT INT TERM
  rg --files src/components/runtime/monitor src/views/runtime/worklines src/composables \
    | rg '(^src/components/runtime/monitor/|^src/views/runtime/worklines/|^src/composables/useRuntime.*\.(ts|tsx|vue)$|^src/.*/runtime-scene.*\.(ts|tsx|vue)$)' \
    > "${raw_json_candidates}" || true
  if [ -s "${raw_json_candidates}" ]; then
    xargs rg -n "context_json|payload_json|event_payload" < "${raw_json_candidates}" || true
  fi
)
```

旧 NG 角色口径搜索只作为实现文案门禁，扫描范围限定 `src`；无输出表示通过，若命中则验证失败并必须人工审查。文档中的禁止性说明和验收标准允许保留这些旧短语作为 guard 口径，不纳入该命令。

raw JSON 搜索只作为 monitor scene adapter / monitor components 的门禁；候选文件为空时必须直接跳过搜索，不得让 `rg` 退化为从当前目录递归扫描。无输出表示未发现候选命中，有输出则必须人工审查是否在 monitor 业务语义中解析 raw JSON。sandbox、trace、topology 等证据视图允许展示 raw evidence，但不得用 raw JSON 推断 monitor 业务语义。该验证块必须保持子 shell 包裹，避免清理 trap 覆盖调用方已有 `EXIT` / `INT` / `TERM` trap。新增 runtime scene adapter 文件后，必须确保其路径能被上述候选集命中；若代码结构变化，先更新候选路径或显式 allowlist，再运行搜索。

### Task 1. 合同同步与 manifest 输入

- [x] 从后端 OpenAPI 重新生成前端 `openapi-types`、API modules、Zod schema，确认 runtime detail 包含五个边界字段、`resource_evidence_items`、`resource_evidence_total_count`、`resource_evidence_truncated`。
- [x] 接入 `GET /api/v1/workline/plugins/{plugin_key}/manifest` generated method；不得手写 generated 区域。
- [x] 新增 `useRuntimeSceneManifest` 或等价 composable，按 `plugin_key` 缓存 manifest，支持 in-flight dedupe、失败 fallback 和快速切线 stale response guard。
- [x] composable 只负责数据获取/缓存/错误态，不在展示组件内解析 manifest 或 hardcode 插件 key。

状态同步 2026-06-08：`src/api/generated/openapi-types.ts`、`src/types/generated/zod-schemas.ts`、`src/api/modules/runtime.ts` 已同步 runtime detail 边界字段与 manifest API；`useRuntimeSceneManifest` 已实现 cache、in-flight dedupe、失败 fallback 与 stale response guard。

验证：

```bash
pnpm generate:types
pnpm generate:zod
pnpm contract:verify
pnpm test -- runtime
```

### Task 2. Scene adapter 增加边界归一化

- [x] 在 runtime scene adapter 中增加 WorkLine READY / START 语义归一化，`START` 只输出“待机 / 可接收”含义。
- [x] 增加 Station lease 归一化：空闲、active rack bound、active dispatch lease、open session bound、unknown。
- [x] 增加 single-layer active snapshot 归一化：active snapshot、缺失、无效、非单层 evidence。
- [x] 增加 rack operation wait 归一化：等待 WMS、WMS 已回调、超时、失败。
- [x] 将 `resource_evidence_items` 转换为 scene model 的逐项资源证据；每项仅消费 generated structured fields，不读 `context_json`、`payload_json`、`event_payload`。
- [x] 截断时在 scene model 保留 `resourceEvidenceTotalCount` / `resourceEvidenceTruncated`，UI 可提示“仅展示前 50 条证据”。

状态同步 2026-06-08：`src/utils/runtime-scene.ts` 已实现 runtime scene adapter、WorkLine READY 文案、Station lease、single-layer snapshot、rack operation wait、逐项资源证据、截断提示与 raw JSON 非业务兜底。

验证：

```bash
pnpm type:check
pnpm test -- runtime
```

### Task 3. Monitor UI 展示边界语义

- [x] 在 `/runtime/monitor` 的 `RuntimeSceneMap` / node / overlay 中展示 Station lease 和 rack operation wait 状态。
- [x] active snapshot 文案使用“执行快照”“当前执行货架”等措辞，不出现“库存可用”“库存授权”“位置真实占用”。
- [x] WMS 搬运状态文案使用“等待 WMS 搬运到位”“WMS 回调证据”，不出现 WES 直连 RCS/AGV/CTU 的暗示。
- [x] 分拣机角色只展示 `SOURCE_ARM`、`TARGET_ARM`、scan/workstation/station 等实际角色；不展示 `NG_ARM`。
- [x] 字段缺失时显示通用 evidence fallback 和明确的语义未加载提示。
- [x] 逐项资源证据显示 Rack/Bin/PKG/Slot/Cell 等结构化条目；截断时显示 total/truncated 提示，不静默隐藏。

状态同步 2026-06-08：`/runtime/monitor` 已通过 `WorklineLiveOverview` 接入 monitor-only `RuntimeSceneMap`；shared `WorklineRouteMap` 仍保留给 sandbox/trace。Scene map 已展示 Station lease、rack operation wait、active snapshot、WMS evidence、fallback 与 total/truncated 提示，并将 legacy `NG_ARM` 归一到 `TARGET_ARM`。

验证：

```bash
pnpm type:check
pnpm lint
! rg -n "库存可用|库存授权|真实占用|WES 直连 RCS|WES 直连 AGV|WES 直连 CTU|NG arm/station|独立 NG arm" src
```

禁止文案搜索只扫描 `src` 中实际 UI/adapter 实现，避免把设计文档中的禁止性约束误判为失败；无输出表示通过，若命中则验证失败并必须人工确认是否为用户可见文案或业务语义推断。

### Task 4. 测试与视觉 QA

- [x] 增加 manifest composable 测试，覆盖成功、失败、same-key dedupe、快速切线 stale response。
- [x] 增加 adapter 测试，覆盖 READY、Station busy、active snapshot、waiting WMS、WMS callback evidence、NG placement、resource evidence items、截断提示。
- [ ] 增加 `/runtime/monitor` route-sync 或组件测试，确认变更只影响监控页，不替换 sandbox、trace topology 的共享 `WorklineRouteMap`。
- [x] 后端 OpenAPI 同步后运行契约检查，确认 generated snake_case types 与 adapter 输入一致，包括 `resource_evidence_items`。
- [ ] 用浏览器检查桌面 `1440x900` 和移动 `390x844` 视口，确认 lease、rack operation、resource evidence 文案可见、不溢出、不遮挡。
- [x] 改造 `scripts/runtime-agent-browser-smoke.sh` 或新增等价 smoke 命令，使其登录后打开 `/runtime/monitor`，分别设置 desktop `1440x900` 和 mobile `390x844` viewport，并保存截图或 route-level visual assertions。
- [x] monitor smoke 必须使用后端 sandbox/debug-data 种子覆盖 Station busy、等待 WMS、WMS callback evidence、generic evidence fallback、resource evidence item 截断；每个状态都要有稳定可断言文案或 selector。
- [x] monitor smoke 必须断言 lease/rack operation/resource evidence 文案存在且无 overflow/overlap；overflow/overlap 使用 bounding-box 断言或可重复截图阈值，不只依赖人工目视截图。

状态同步 2026-06-08：`tests/unit/composables/useRuntimeSceneManifest.test.ts`、`tests/unit/utils/runtime-scene.test.ts`、`tests/unit/components/runtime/runtimeSceneMap.test.ts`、`tests/unit/components/runtime/worklineLiveOverview.test.ts` 与 runtime API 测试已覆盖 manifest、adapter、scene component 与 monitor 接入；`scripts/runtime-agent-browser-smoke.sh` 已扩展 monitor seed、desktop/mobile viewport、scene selectors 与 overflow/overlap 断言。仍需补显式 route isolation 测试，并在本地前后端/agent-browser 环境实际运行 live smoke。

验证：

```bash
pnpm type:check
pnpm lint
pnpm contract:verify
pnpm test -- runtime
pnpm smoke:runtime:agent-browser
```

`pnpm smoke:runtime:agent-browser` 已扩展覆盖 `/runtime/monitor`、desktop/mobile viewport、固定 seed、scene selectors 与 overflow/overlap bounding-box 断言；仍需在本地前后端/agent-browser 环境实际运行后再作为通过证据。浏览器 QA 必须固定 desktop `1440x900` 与 mobile `390x844` 两个 viewport，使用固定 mock / seed / story 数据触发 Station busy、等待 WMS、WMS callback evidence、generic evidence fallback，并保留 lease/rack operation/resource evidence 的 selector 或文案断言及 overflow/overlap bounding-box 断言。若决定改用 Playwright，必须先把 Playwright 依赖、`playwright.config.*` 和 e2e spec 纳入计划后，才能使用 `pnpm exec playwright ...`。

## 验收标准

- `/runtime/monitor` 可区分 WorkLine READY、Station lease busy、等待 WMS、active snapshot。
- 前端不把 WES active snapshot 表达为 WMS 库存真相。
- 前端不表达 WES 直连 RCS/AGV/CTU 调度。
- UI 和文档中不把 NG 放置归属为独立 NG arm。
- 合同字段缺失时降级为通用 evidence，不解析 raw JSON 推断业务。
- 桌面 `1440x900` 和移动 `390x844` 视口下，lease、rack operation、resource evidence 文案可见且无 overflow/overlap。
- monitor smoke 使用固定数据夹具覆盖 Station busy、等待 WMS、WMS callback evidence、generic evidence fallback，且每个状态都有稳定 selector 或文案断言。

## 风险与处理

| 风险                                                               | 影响                                                                | 处理                                                                                                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 后端字段尚未生成到前端                                             | 前端无法展示精确 lease / rack operation 状态                        | 保持通用 evidence fallback，并把字段缺口写入合同待办。                                                                 |
| 前端沿用旧资源徽标逻辑                                             | 误把执行证据显示为库存事实                                          | adapter 统一 evidence kind，组件禁止 raw JSON 推断。                                                                   |
| monitor live smoke 尚未运行                                        | 脚本已覆盖目标监控页，但尚未在本地前后端/agent-browser 环境实际验收 | 运行 `pnpm smoke:runtime:agent-browser`，显式进入 monitor 并断言 scene DOM、双 viewport、目标状态和 overflow/overlap。 |
| Playwright 未配置                                                  | 验证命令无法在当前项目执行                                          | 默认使用改造后的 `pnpm smoke:runtime:agent-browser`；若采用 Playwright，先补依赖、配置和 spec。                        |
| raw JSON 搜索误伤 sandbox/trace、zsh glob 失败或候选为空时退化扫描 | 合法证据展示被误判，或验证命令自身不可执行                          | 使用 `rg --files                                                                                                       | rg ...` 生成候选并加空候选 guard，候选非空时才执行 raw JSON 搜索。 |
| 既有 SPEC 存在独立 NG arm 旧口径                                   | 后续实现可能误建独立 NG 放置角色                                    | 先更新文档口径，测试和搜索门禁覆盖旧短语。                                                                             |
| 监控页主图替换影响 sandbox/trace                                   | 扩大回归面                                                          | 继续使用 monitor-only `RuntimeSceneMap`，不替换共享 `WorklineRouteMap`。                                               |

## 不在本计划

- 不新增库存查询页、库存授权页或 Location 占用视图。
- 不做真实 3D / VR 场景。
- 不做独立 WMS/RCS/AGV/CTU 调度看板。
- 不新增前端插件业务画像注册表。
