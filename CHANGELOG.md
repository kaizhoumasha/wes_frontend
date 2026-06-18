# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.2.0] - 2026-06-18

### Changed

- 工作线插件 manifest 合同同步到可复现的本地 OpenAPI snapshot，配置页和运行态依赖的 API 类型、metadata 与 Zod schema 保持一致。
- API 类型、Zod 生成和契约校验支持通过精确 OpenAPI 文件或 URL 复现同一合同 hash，避免依赖临时本地后端端口。
- 自动生成的 API 合同文件不再写入 OpenAPI 来源地址，减少不同机器或端口造成的无意义生成差异。

### Fixed

- 更新契约测试文档中的完整 OpenAPI 地址示例，改用 `BACKEND_OPENAPI_URL`，避免旧 `BACKEND_URL` 示例被当作后端 base URL 再追加路径。

## [0.7.0.0] - 2026-06-17

### Added

- 工作线监控接入 dashboard-v3 右侧行动舱，按设备、货位和空闲状态展示报警、ECS ACK 链、料箱孪生、货架库存矩阵和真实操作入口。
- 中央拓扑支持 manifest `DEVICE_ROLE` / `RACK_POSITION` 显式节点与边，并在 manifest 缺失时保留稳定 fallback 连线。
- 新增运行监控右栏组件、拓扑布局、资源矩阵、路由同步、运行事件和画布交互回归测试。

### Changed

- `/runtime/monitor` 右侧面板改为按选择目标自动切换的单视图，移除旧双 Tab 和旧 safety/reconciliation 独立面板。
- 运行监控画布改为容器适配渲染，并让 compact/default 绘制尺寸、hit-test 和布局配置保持一致。
- 前端 OpenAPI 类型、metadata 与 Zod schema 同步运行监控 command snapshot 合同。

### Fixed

- 修复设备 status、拒绝 ACK、离线/故障节点、货架选择、Path2D 缓存和静态告警边重绘等运行监控回归。
- 修复多货架工作线的库存矩阵串货、切换工作线后旧货架选择残留，以及无设备选中时清急停入口不可见的问题。
- 隐藏 `CLASSIFIER_WORK` 等非传输角色，避免它们出现在 topology 画布中。

## [0.6.0.0] - 2026-06-15

### Added

- 工作线配置页接入新插件 manifest 合同，展示设备、事件、命令、货架位、资源边界和硬件能力要求。
- 运行态现场模型支持通过 manifest `rack_positions` 与 `resource_boundaries` 构建资源边界，并在 manifest 缺失或加载失败时保留通用 evidence 降级。
- 新增 manifest 版本加载、货架位能力诊断、runtime scene 合同迁移和合同噪声防回归测试。

### Changed

- 前端 OpenAPI 类型、metadata 与 Zod schema 同步到 rack position manifest 合同，移除旧 manifest 字段依赖。
- 单插件 manifest 请求按工作线固定 `contract_version` 加载，运行态 manifest 缓存也按插件 key 和合同版本隔离。
- 合同生成与同步记录统一本地 OpenAPI 源标签，避免不同本地端口造成无意义生成差异。

### Fixed

- 修复禁用货架位导致的能力预检失败只显示泛化文案的问题，现在会提示先启用对应货架位。
- 修复工作线固定非默认合同版本时配置页误取默认 manifest，导致设备、事件和角色覆盖丢失的问题。
- 修复运行监控窄屏布局中关键状态区域可能拥挤溢出的回归。

## [0.5.0.0] - 2026-06-11

### Added

- 工作线监控主屏切换到工作线级监控投影，操作员可以在 `/runtime/monitor` 直接看到投影驱动的线体目录、实时场景和行动舱。
- 行动舱接入 `pending_reconciliation` 候选，支持在可核销对象存在时完成运行时对账解除，并在成功后刷新投影与工作线摘要。
- 新增 dev proxy 防回归测试和投影刷新边界测试，覆盖本地代理端口、刷新失败保留旧投影、清空后在途响应不能复活旧状态。

### Changed

- Runtime API、Pinia store、scene builder、monitor/sandbox/trace 消费者统一使用 OpenAPI 生成的 `RuntimeWorklineMonitorProjectionResponse`，不再保留旧 `detail/loadDetail/refreshDetail` 主屏入口。
- `/runtime/monitor` 改为目录、场景、行动舱三栏结构，资源证据、capped sessions/traces、Manifest 降级和移动 smoke fixture 都基于投影 shape。
- Runtime SSE 主屏刷新只接受 canonical `workline_runtime` 域，旧 `workline_trace`、`device`、`safety` 等域不再驱动监控主屏刷新。

### Fixed

- 修复开发环境代理误指向 WMS mock 端口导致本地登录和 `/api/v1/auth/login` 404 的问题，`.env.development` 与契约同步记录统一指向本地 WES backend `8001`。

## [0.4.6.0] - 2026-06-09

### Added

- `/runtime/monitor` 新增按现场位置分组的资源布局视图，聚合 Rack、Bin、Slot、Cell、PKG、Part SN 等证据 stack，并提供焦点面板和未定位证据审计区。
- 新增共享 `RuntimeSceneDeviceFlow`，统一 monitor、sandbox 与 trace topology 中的设备状态、trace path、Runtime Hold、停靠 outbox 和未完成命令表达。
- 新增资源布局、焦点面板、共享设备流和 smoke fixture 覆盖，验证 stationless、重复资源、fallback manifest、桌面/移动端布局和完整设备拓扑场景。

### Changed

- `RuntimeSceneModel` 改为按物理位置解析资源 evidence，支持 manifest 边界、同位置多站点、模糊 stationless evidence、fallback 边界和未定位审计项。
- 沙箱工作台与 trace 完整拓扑从旧 `WorklineRouteMap` 收敛到共享设备流，保留选择设备、双击发送 Event 和右键查看 Outbox 的页面行为。
- Runtime smoke 脚本扩展资源布局 fixture、trace 拓扑验证和可选截图采集，便于发布前复核 monitor、devices、sandbox 与 trace 路由。

### Fixed

- 修复共享设备流长设备名称、编码和 badge 在紧凑拓扑中可能横向溢出的问题。
- 更新资源布局执行资料，确保共享拓扑收敛和焦点面板交付范围与本次发布一致。

## [0.4.5.0] - 2026-06-08

### Added

- `/runtime/monitor` 新增单层货架运行资源边界展示，覆盖工作线 readiness、站点 lease、active snapshot、货架等待操作，以及 Rack、Bin、PKG、Slot、Cell、Part SN 等结构化 evidence。
- 运行态 API 类型、OpenAPI metadata 与 Zod schema 同步资源边界契约，并接入单插件 manifest summary 生成方法。
- 新增 `useRuntimeSceneManifest`、scene adapter、现场态势图组件和浏览器 smoke 覆盖，验证桌面/移动端资源证据展示和 fallback 语义。

### Changed

- 现场态势图改为 monitor-only 的资源边界/evidence scene model，manifest 加载按合同版本缓存并防止工作线切换后的陈旧覆盖。
- `pnpm smoke:runtime:agent-browser` 扩展为种子化后端 monitor 状态，并校验桌面与移动端关键视口无横向溢出。
- 更新单层货架边界、资源布局和执行计划文档，明确运行投影与库存事实边界。

### Fixed

- 归一化旧前缀 `*_NG_ARM` 设备角色显示，避免现场态势图继续露出 “NG 机械臂” 命名。
- 修复现场态势图设备卡片横向溢出，以及移动端刷新时间胶囊宽度溢出。
- 放行 smoke fallback 种子中预期的缺失 manifest 告警，避免把已验证的降级路径误判为失败。

## [0.4.4.0] - 2026-06-06

### Added

- 工作线监控新增 manifest 驱动的现场态势图，操作员可以在 `/runtime/monitor` 直接查看设备角色段、现场流向、配置缺口和运行证据叠层。
- 前端接入单插件 manifest summary 接口，并缓存插件语义，避免工作线切换和 SSE 刷新时重复拉取相同 manifest。
- 新增 Runtime scene model、现场态势图、manifest 缓存、路由同步和运行证据投影回归测试，覆盖缺失角色、SMT 角色、设备流向、Runtime Hold、停靠 outbox、命令状态和 raw JSON 资源证据隔离。

### Changed

- `/runtime/monitor` 主叙事从设备拓扑卡片切换为现场态势图，保留 Session 看板作为辅助列表，并继续只在 monitor 页面替换主图。
- 现场模型统一按后端 manifest、设备运行状态和结构化运行字段生成，不在前端硬编码具体插件 key。

## [0.4.3.0] - 2026-06-05

### Added

- 工作线现场态势监控设计文档，明确 `/runtime/monitor` 后续按 manifest 驱动现场模型、设备节点、执行证据叠层和资源投影边界。
- 集成调试台最新案件状态筛选支持 `RETRY`，便于直接定位重试中的运行案件。
- 新增集成调试台状态筛选回归测试，确保 `RETRY` 后续不会从筛选项中丢失。

### Changed

- 归档历史 superpowers 计划与设计文档，保持当前 specs 目录聚焦正在推进的运行现场态势监控设计。
- 统一 Trace Explorer 模板格式，保持 merged trace path 变更通过当前 Prettier 规则。

## [0.4.2.0] - 2026-06-05

### Added

- Runtime Trace/Cases 支持后端 trace path 诊断契约，统一 sessionId、traceId 入口，并展示诊断结论、执行证据、设备摘要和资源快照。
- 新增 Runtime trace path OpenAPI metadata、Zod schema 和前端类型，覆盖 DiagnosisVerdict、RuntimeTracePath、ResourceView、active bin/rack 等合同。
- 新增诊断 verdict、拓扑摘要、TraceExplorer 布局和 timeline groups 回归测试，覆盖 trace path 合同的主要 UI 分支。

### Changed

- Trace Focus、blocking point、case hero 和 topology summary 改为消费后端诊断证据，减少前端重复推断逻辑。
- Runtime trace topology 和 diagnosis verdict 工具函数同步到后端 evidence contract，确保状态、资源和阻塞点文案一致。

### Fixed

- 修复 trace 详情缺少统一诊断证据时，前端阻塞点、资源快照和 timeline group 展示不稳定的问题。

## [0.4.1.0] - 2026-06-02

### Added

- 沙箱工作台支持在 STOPPED 仿真工作线上模拟现场 START，并通过用户鉴权的工作线操作接口提交准入请求。
- 工作线列表、总览、决策条和沙箱工作台展示 START 准入状态、失败设备、Request 和 Trace 诊断，帮助现场直接判断为什么还不能接收生产 Event。
- 新增 STOPPED/START 合同回归测试，覆盖风险排序、运行态文案、保留事件过滤、START 拒收诊断、Replay 禁用和 SSE 状态刷新。

### Changed

- STOPPED 工作线在前端统一显示为“等待现场硬件 START”，并在进入 READY 前禁止发送生产 Event 和重放 Event。
- Runtime OpenAPI 类型、字段元数据和 Zod schema 同步到后端 START 准入合同。

### Fixed

- 修复 STOPPED 工作线可能被总览归类为稳定、在排序中丢失 blocker 权重或继续暴露生产 Event 操作的问题。
- 修复硬件 START 后沙箱工作台可能继续读取陈旧 STOPPED detail，导致生产 Event 按钮保持禁用的问题。
- 修复 START 准入拒收时设备非 AUTO/IDLE 等诊断信息没有展示给操作员的问题。

## [0.4.0.0] - 2026-05-23

### Added

- 设备运行时支持从运行监控上下文打开设备详情抽屉，并可从设备当前会话直接跳转到 Trace 追溯。
- 沙箱测试新增独立工作台深链，操作员可以从工作线选择进入带设备拓扑、Event Composer、Result 处置、清理和急停恢复的一体化调试界面。
- 沙箱已完成卡片支持按设备和外部目标分组展示命令历史，失败设备组会在组头给出视觉标记。
- 新增 Runtime Hold 列表直接查询入口，支持活跃 Hold 快速筛选和详情跳转。
- 新增运行时导航、沙箱清理、沙箱动作流、Hold 列表、工作线详情竞态等回归测试覆盖。

### Changed

- 运行监控路由移除旧兼容重定向，统一使用 `/runtime/overview`、`/runtime/monitor`、`/runtime/traces`、`/runtime/holds`、`/runtime/sandbox` 和 `/runtime/devices`。
- 沙箱工作台组件拆分并重组为当前页面容器，运行态页面继续复用全局 SSE 单例。
- Runtime API 封装更新为直接调用新的 Hold 列表和沙箱清理端点，并同步最新权限与 Zod schema。
- 管理端设备、工作线入口和运行时优先级队列统一跳转到新的运行监控路由名称。

### Fixed

- 修复沙箱恢复接收、清理确认、模拟急停和 Result 提交后的刷新与锁定回归。
- 修复运行时页面在旧路由、查询参数和直接深链场景下的导航回归。
- 修复工作线详情请求竞态，避免较早请求晚返回后覆盖较新的工作线详情。
- 修复运行时 SSE 被页面重复订阅导致的重复连接问题。

## [0.3.0.1] - 2026-05-13

### Changed

- 运行监控中心拆解为 6 个独立模块：运行总览、工作线监控、Trace 追溯、Hold 处置、沙箱测试、设备运行时
- SSE 连接管理统一为 Pinia store 单例，消除每页面独立连接
- Trace 追溯和沙箱测试恢复为可见菜单入口
- 42 个运行时组件按模块目录重组 (overview/monitor/trace/holds/sandbox/devices)

### Added

- 新增 Hold 列表页，支持类型/状态筛选和 Promise.allSettled 容错聚合
- 新增设备运行时网格视图，跨工作线聚合设备状态卡片
- 新增工作线目录搜索（纯前端过滤名称/编码/区域）
- 新增 Trace 对比视图（并排时间线 + 分叉点自动检测高亮）
- 新增浏览器桌面通知（急停/Hold 事件推送，60s 防抖，权限降级）

### Fixed

- Trace 对比视图改用 Promise.allSettled 处理单Trace查询失败

### Removed

- 移除 WorklineRuntimePage 巨页面（被 WorklineMonitorPage 替换）
- 移除 useWorklineMode composable

## [0.3.0.0] - 2026-05-12

### Added

- 新增工作线运行态控制台，现场可在同一页面查看设备拓扑、Session、任务队列、健康状态和安全事件。
- 新增 Runtime Hold 页面与释放处置组件，支持查看阻断原因、证据、冲突、检查清单和处置表单。
- 新增沙盒工作台，支持组合设备事件、提交结果、查看待处理队列和验证安全锁状态。
- 新增 Trace 调查视图、执行路径、时间线分组、阻断点和后续动作面板，便于从失败链路直接定位原因。
- 新增 StandardDrawer、运行态 store、Runtime SSE、运行态显示/优先级/安全工具函数及对应单元测试。

### Changed

- 运行态、设备、工作线、回调日志、审计日志和管理页配置同步到最新后端 OpenAPI 契约。
- OpenAPI 类型生成改为分文件输出并泛型化响应类型，减少单文件元数据体积。
- 全局视觉系统、布局、标准对话框、详情面板和表格操作列对齐当前运行态控制台体验。
- 登录与鉴权启动流程补齐超级管理员通配权限，前端路由新增 Runtime Hold 与 Trace 重定向入口。

### Fixed

- 修复运行态兼容路由、分支测试、急停清除权限、审计/API 访问日志详情字段和菜单路由同步问题。
- 修复 Vitest 在当前 Node 环境下没有可用 `localStorage`/`sessionStorage` 导致认证相关测试失败的问题。
- 修复沙盒结果流、安全锁、Trace 时间线、Runtime Hold 页面和运行态路由同步的回归测试覆盖。

### Removed

- 移除旧插件状态字段消费和 StandardDialog 旧常量依赖，收敛到当前运行态与抽屉交互模型。

## [0.2.0.0] - 2026-04-28

### Added

- 新增任务驱动的运行监控 Dashboard，可直接查看系统健康、优先级队列、设备健康和近期 Trace 状态。
- 新增工作线运行态主视图，将设备拓扑、活跃 Session、失败 Trace 和设备详情合并到工作线上下文中。
- 新增 Trace 处置台深链能力，支持按 Trace、Session、Request、Command、Dispatch 等锚点进入案件调查。
- 新增 Sandbox 调试台，支持待处理 Outbox、Replay Inbox 和人工 Session 操作入口。
- 新增运行时标签、优先级分类、路由查询、sticky context 和 API wrapper 的关键路径测试。

### Changed

- 将设备运行监控入口并入工作线运行态，管理端设备/工作线页面的运行态入口统一跳转到新的运行监控路径。
- 重构运行监控组件体系，统一状态徽标、Trace 列表、设备详情、拓扑、系统裁决和空态体验。
- 更新运行时 API 类型、Zod schema、契约同步记录和权限同步记录，以匹配当前后端契约。
- 优化 SSE 客户端在可恢复断线、重连和 stale connection 场景下的状态与日志行为。

### Fixed

- 修复运行监控 SPA 导航时 SSE 可恢复断线污染控制台的问题。
- 修复带 `deviceId` 直接进入工作线运行态时设备详情面板不会自动打开的问题。
- 修复 Trace 列表业务标识显示优先级，优先展示 `barcode` / `business_key`，并修复空失败域展示。
- 修复运行监控浅色模式、滚动、Trace 案件锚点、路由同步和布局平衡相关问题。

### Removed

- 移除独立的 `/runtime/devices` 和旧 `/runtime/overview` 运行监控页面实现，改由 Dashboard 与 Workline 承担主流程。

## [0.1.0.0] - 2026-03-26

### Added

- 新增角色管理 CRUD 功能（RoleListPage、fieldConfig、pageConfig）
- 添加后端 API 能力自动检查 Hooks（.claude/hooks/check-backend-api.sh）
- 添加 Git Pre-commit Hook 检查 API 契约（scripts/hooks/pre-commit-check-api）
- 新增用户管理扩展 API（resetPassword、assignRoles）

### Changed

- 重构 CRUD 开发指南（docs/CRUD_DEVELOPMENT_GUIDE.md），添加：
  - 5 分钟快速开始指南
  - 后端契约同步说明（Step 0）
  - API 能力检查清单
  - 常见坑点记录
  - 自动化检查 Hooks 配置
- 优化详情组件性能与样式（CrudDetailBody、CrudDetailPanel、CrudDetailSection）
- 更新 Claude Code 配置（.claude/settings.json）

### Fixed

- 修复 CrudDetailActions.vue Map 内存泄漏（使用 delete 替代 set false）
- 修复 check-backend-api.sh 管道逻辑错误
- 优化 shell 脚本效率，减少重复文件读取

## [0.0.1] - 2026-03-14

### Added

- 初始项目结构
- 基础 CRUD 组件架构
- 用户认证系统
