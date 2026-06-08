# 单层货架运行边界前端承接设计

> 日期：2026-06-06
> 范围：前端 `工作线监控` / `/runtime/monitor`
> 关联后端：`wes_backend/docs/superpowers/specs/2026-06-06-wes-single-layer-rack-orchestration-boundary-spec.md`
> 承接文档：`docs/superpowers/specs/2026-06-05-runtime-workline-scene-monitor-design.md`

## 1. 背景

后端单层货架边界规划明确：WES 不是 WMS 库存事实源，不维护全局 Location 主账，不直连 RCS/AGV/CTU。WES 只在单层货架场景维护 active execution snapshot，并通过 Station lease 防止同一工位被重复调度。

现有前端现场态势图设计已经要求资源只作为执行证据投影展示。本设计补齐 2026-06-06 后端边界对前端体验的增量约束，避免 `/runtime/monitor` 把 WES 执行证据误展示成库存授权、物理占用或设备调度事实。

## 2. 已确认决策

| 编号 | 决策                            | 说明                                                                   |
| ---- | ------------------------------- | ---------------------------------------------------------------------- |
| D1   | 独立前端承接                    | 不把前端任务塞回后端 PLAN，前后端各自维护计划边界。                    |
| D2   | `/runtime/monitor` 是首个承接页 | 先修正运行监控语义，不新增库存页或调度页。                             |
| D3   | WES 证据不等于库存真相          | Rack、Bin、PKG、Slot 只能作为执行快照或证据投影。                      |
| D4   | WMS 搬运是外部依赖              | 前端展示为 WMS 搬运需求、等待到位、回调证据，不展示 RCS/AGV/CTU 直连。 |
| D5   | `START` 只表示 WorkLine READY   | UI 不得把 `START` 解读为作业已开始、货架已到位或分拣机可立即动作。     |
| D6   | 不存在 `NG_ARM`                 | NG 放置由 `TARGET_ARM` 执行；NG station 只能作为站点或证据展示。       |

## 3. 前端体验边界

`/runtime/monitor` 的现场态势图需要表达三层事实：

1. **运行准入事实**
   - WorkLine 是否 READY。
   - Station lease 是否空闲。
   - 是否存在 active outbox 或 open session 绑定。

2. **单层货架执行快照**
   - active rack / active bin / rack cell 只表达 WES 当前执行所需的 active snapshot。
   - 非单层资源只作为 trace/resource evidence 展示。
   - 前端不得显示“库存可用”“位置已占用”“WMS 已授权库存”等结论。

3. **WMS 外部搬运依赖**
   - 业务需要货架但现场未就绪时，展示为“等待 WMS 搬运到位”。
   - rack operation 的等待、超时、回调证据挂在 Station 或 Session 上。
   - UI 文案不得出现 WES 直接调度 RCS、AGV、CTU 或车辆坐标的暗示。

## 4. 数据与模型约束

前端继续沿用既有 `RuntimeSceneModel` 方向。后端 OpenAPI / generated types 默认提供 snake_case 结构化字段，scene adapter 负责转换为 camelCase scene model，并增加边界字段的统一归一化。状态集合必须与后端合同保持 exact enum，不得用概念性近义状态替代：

| 后端字段                     | 前端 scene 字段           | 状态集合                                                                                                     |
| ---------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `workline_readiness`         | `worklineReadiness`       | `READY` / `NOT_READY` / `UNKNOWN`                                                                            |
| `station_lease`              | `stationLease`            | `IDLE` / `ACTIVE_RACK_BOUND` / `ACTIVE_DISPATCH_LEASE` / `ACTIVE_SESSION_BOUND` / `UNKNOWN`                  |
| `single_layer_rack_snapshot` | `singleLayerRackSnapshot` | `ACTIVE` / `MISSING` / `INVALID` / `NON_SINGLE_LAYER_EVIDENCE` / `UNKNOWN`                                   |
| `rack_operation_wait`        | `rackOperationWait`       | `WAITING_WMS` / `WMS_CALLBACK_RECEIVED` / `TIMEOUT` / `FAILED` / `NONE` / `UNKNOWN`                          |
| `resource_evidence_kind`     | `resourceEvidenceKind`    | `WES_ACTIVE_SNAPSHOT` / `WMS_CALLBACK_EVIDENCE` / `TRACE_RESOURCE_EVIDENCE` / `GENERIC_EVIDENCE` / `UNKNOWN` |

字段来源必须是后端结构化字段、manifest/display 元数据或已生成类型。禁止从 `context_json`、`payload_json`、`event_payload`、raw resource badge 文本中推断 Rack/Bin/PKG 业务含义。
本阶段不要求后端 OpenAPI 提供 camelCase alias；若后续选择后端 alias 路径，必须由后端补齐 response/OpenAPI/generated type 回归测试，前端再调整 adapter 输入。

## 5. UI 表达规则

- WorkLine `START` / READY：显示“待机 / 可接收”，不显示“作业中”。
- Station lease busy：显示阻塞原因和绑定来源，例如 active dispatch、open session、等待 rack operation。
- 单层货架 active snapshot：使用“执行快照”“当前执行货架”等措辞，不使用“库存主账”“库存可用”。
- WMS 搬运：使用“等待 WMS 搬运到位”“WMS 回调证据”等措辞。
- 分拣机角色：只展示 `SOURCE_ARM`、`TARGET_ARM`、scan/workstation/station 等实际角色；NG 结果挂在 target arm 动作或 NG station 证据上。
- 合同字段缺失时降级为通用 evidence，不做业务推断。

## 6. 与既有现场态势图设计的关系

本设计是 `2026-06-05-runtime-workline-scene-monitor-design.md` 的边界增量：

- 保留 manifest 驱动、monitor-only `RuntimeSceneMap`、纯 adapter、资源证据投影等结论。
- 已修正该文档中 SMT 分拣入库的旧角色表述；后续实现必须采用“target arm + NG station evidence”口径。
- 不改变 `WorklineRouteMap` 在 sandbox、trace topology 等页面的复用策略。

## 7. 验收标准

1. `/runtime/monitor` 能区分 READY、Station lease busy、等待 WMS、active snapshot 四类运行语义。
2. 前端没有把 WES active snapshot 展示为 WMS 库存真相。
3. 前端没有出现 WES 直连 RCS/AGV/CTU 的调度暗示。
4. 分拣机现场图不把 NG 放置建模为独立机械臂或等价业务角色。
5. 合同字段缺失时 UI 降级为通用 evidence，且不会从 raw JSON 推断业务含义。
6. `stationLease` 覆盖 idle、active rack bound、active dispatch lease、active session bound、unknown，不遗漏 active rack binding 场景。
7. 桌面和移动视口下，lease、rack operation、resource evidence 文案不溢出、不遮挡。

## 8. 不在本阶段

- 不做库存查询页、库存授权页或全局 Location 占用视图。
- 不做真实 3D / VR 场景。
- 不做独立 WMS/RCS/AGV/CTU 调度看板。
- 不新增前端插件业务画像注册表。
- 不在前端补写后端尚未提供的业务合同。
