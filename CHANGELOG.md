# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.13.1.0] - 2026-09-03

### Changed

- Transport 自动联调改为由操作员直接录入货架、货架面、料箱和原槽位，不再依赖货架料箱挂载基础数据；货架面继续按原始字符串下发。
- 自动联调观察器集中展示整轮持久步骤历史，包括货架进站、逐面料箱搬出、`SCAN12`、料箱回架、跨面旋转及最终返库。

### Fixed

- 货架返库步骤不再错误展示上一货架面的料箱和槽位信息。
- 已清理的历史 Transport 任务查询失败时保留自动联调窗口和错误上下文，不再误导操作员任务记录仍可直接打开。

### Verification

- 695 项 Vitest 测试、类型检查、ESLint、Prettier、Stylelint、生产构建、契约与权限同步校验通过；自动联调关键路径覆盖审计达到 86%。
- 联调环境已人工确认直接录入值进入真实 WMS/RCS 链路、`SCAN12` 驱动料箱回架并触发最终 `CTU03`，以及刷新或重新登录后仍可查看终态步骤历史。

## [0.13.0.0] - 2026-09-03

### Added

- 运输接入诊断新增持久化自动联调入口，可按当前挂载事实选择任意货架，并按货架面分组选择每面 1～4 个料箱。
- 货架面由操作员直接输入并按原始字符串下发；页面预览 `CTU01` 进站、逐面料箱往返、`SCAN12` Evidence、跨面 `CTU02` 旋转和最终 `CTU03` 返库顺序。
- 自动联调观察器展示冻结配置、当前阶段、关联 Transport、已扫描/待扫描料箱和 `NEEDS_ATTENTION` 持久状态。

### Changed

- 移除固定 `510056`、固定料箱和人工确认推进的旧联调步进，改由 WMS 回调与 `SCAN12` 设备 Evidence 自动完成整轮。
- SSE 只作为失效通知；页面始终回读持久轮次，并在无 SSE 或详情权限时使用有权限的 HTTP 查询兜底，不从 ACK 或连接状态推断物理完成。

### Fixed

- 自动联调直接调用可静态证明的生成 API 方法，确保 release consumer 能导出完整的联调接口需求并构建不可变前端候选。

### Verification

- 683 项 Vitest 测试、release consumer 导出、类型检查、ESLint、Prettier、Stylelint、生产构建、契约与权限同步校验通过。
- 本机后端编排完成 Alembic `8f3c61e57a90` 升级，并验证 API、Worker、WMS Worker、Beat、前端与 Mock 服务健康；未触发真实 Transport 自动联调轮次。

## [0.12.11.0] - 2026-09-01

### Added

- 系统管理员现在可以在设备管理页按 ECS Endpoint 主动发现设备，并按 Endpoint 冲突、信息不一致、本次未发现、待接管和已接管五种状态查看当前比对结果。
- 发现抽屉支持优先展示有变化的设备、筛选和搜索，并在设备详情中显示实时状态、`supported_commands` 与 `supported_events`。

### Changed

- 待接管设备复用现有新增设备表单，仅预填设备编码、非空名称和 ECS canonical Endpoint；创建成功后自动刷新主列表与当前比对，不自动修改或删除已有设备。

### Fixed

- 创建表单从发现抽屉打开时使用新的对话框层级，避免被抽屉遮挡。

### Verification

- 658 项 Vitest 测试、类型检查、ESLint、Prettier、Stylelint、生产构建、契约与权限同步校验通过；浏览器 QA 覆盖桌面端与移动端发现、筛选、能力详情和接管预填流程。

## [0.12.10.0] - 2026-09-01

### Fixed

- 移除未随生产镜像发布的默认 `/vite.svg` 图标引用，避免登录页每次加载产生静态资源 404。

### Verification

- 新增 `index.html` 资产回归测试；现场其余 JS/CSS 资源逐项返回 200。

## [0.12.9.0] - 2026-09-01

### Fixed

- Jenkins shell checkout 改为使用带凭据的外部 TLS GitLab 精确 ref fetch，避免在明文内网 HTTP 上传递凭据；不截断 source 历史，确保多提交 push 的祖先校验正确，并保留 180 秒硬超时、插件绕过与 webhook SHA 校验。

### Verification

- Jenkins #75 实跑确认插件绕过生效并定位内网端点实际需要认证；新增合同锁定 TLS、凭据不进 URL/trace、完整历史的精确 refspec 与超时边界。

## [0.12.8.0] - 2026-09-01

### Fixed

- Jenkins 工作区改为在流水线 shell 内初始化并精确 fetch/checkout webhook source ref，阻断 GitLab 插件通过 `RevisionParameterAction` 动态注入 `PreBuildMerge`；质量检查与镜像构建始终使用已核验的 source Commit。

### Verification

- Jenkins #72 实跑确认旧 `checkout` 步骤仍被插件注入 merge 后新增回归合同；新路径不再调用 Jenkins GitSCM `checkout`，并保留 webhook source SHA fail-closed 核验。

## [0.12.7.0] - 2026-09-01

### Fixed

- Jenkins 源码检出改用构建节点可直接匿名只读访问的内网 GitLab 地址，避免公网域名链路低速导致 10 分钟 checkout 超时，且不在明文内网连接上传输凭证。
- 所有构建在执行源码前将远端 source ref 与 webhook 不可变 Commit 进行 fail-closed 核验；MR 不再合入无法经同一可信事件验证的 HTTP target ref。

### Verification

- checkout 合同测试完成 RED → GREEN，锁定内网仓库地址并禁止重新引入公网域名；聚焦质量门禁测试通过。

## [0.12.6.0] - 2026-09-01

### Fixed

- 根据 Jenkins 构建节点实测撤销生产 Docker 对 `npmmirror` 的强制覆盖，恢复 lockfile 默认官方 registry，同时保留仓库级有限重试与超时预算。

### Verification

- registry fallback 聚焦测试完成 RED → GREEN；此前 Jenkins 官方 registry 候选已完成 727/729 个依赖，而区域镜像候选约 10 分钟仅完成 23/729 并持续发生 DNS、连接重置与 socket timeout。
- 官方 registry 无缓存完整镜像构建在 47.6 秒内下载 729 个依赖并成功生成生产镜像；全量 630 项测试、合同/权限校验、typecheck、ESLint、Prettier、Stylelint 与生产构建通过。

## [0.12.5.0] - 2026-09-01

### Fixed

- 仅在生产 Docker builder 的 frozen 依赖安装中使用区域 npm 镜像，避免 Jenkins 官方 registry 网络抖动，同时不改变开发机与 GitHub Actions 的默认供应链来源。

### Verification

- pnpm 配置与 release consumer 聚焦测试 41 项通过；Docker 零缓存从镜像下载 729 个包约 53 秒完成。
- 全量 630 项测试、typecheck、ESLint、Prettier、Stylelint、生产构建、合同与权限校验通过；fresh Review 无剩余 finding。

## [0.12.4.0] - 2026-09-01

### Fixed

- 生产镜像的 pnpm 下载增加有界重试和超时预算，降低 Jenkins 构建阶段因 registry 短暂连接重置而失败的概率。
- 仓库级 `.npmrc` 纳入 Docker 依赖安装输入和 release recipe fingerprint，配置变化可被不可变制品证据检测。

### Verification

- pnpm 配置与 release consumer 聚焦测试 41 项通过；typecheck、ESLint、Prettier、Stylelint、生产构建、合同与权限校验通过。
- fresh Review 无剩余 finding；本版本不包含 510056 物理动作或业务验收。

## [0.12.3.0] - 2026-08-31

### Changed

- “运输接入诊断”的 510056 联调循环直接使用 canonical Transport reset 合同提交现场到位确认，并显式发送确认对象或 `null` 请求体。
- OpenAPI、Zod、metadata 与权限生成物同步到后端 `develop@30d3da57`，工作线活动对象位置结构与当前后端合同保持一致。

### Fixed

- 可选 JSON 请求体现在可被类型生成器正确识别；无请求体操作会收紧为 `never`，避免错误接受任意 body。
- 补齐真实默认 API 适配器、请求体类型分支和生成器回归测试，确认联调步进不会回落到临时重复模块。

### Removed

- 移除后端已退役的 10 个端点、10 项权限及对应的陈旧生成物和无调用模块。

### Verification

- 83 个测试文件、624 项测试通过；typecheck、ESLint、Prettier、Stylelint、生产构建、合同与权限同步校验全部通过。
- 当前差异覆盖审计为 100%，fresh Review 无剩余意见；本次发布不包含再次部署、现场物理动作或业务验收。

## [0.12.2.0] - 2026-08-31

### Added

- 在现有“运输接入诊断”页面增加 510056 固定联调步进，覆盖货架进站、两料箱投料、SCAN9～12 等待、料箱回架和货架回库五个步骤。
- Transport 步骤只在操作员确认现场已完成后提交 `PHYSICAL_TARGET_REACHED`，并显示对应本地任务身份和非业务权威审计说明。

### Fixed

- 下一步骤下发失败时不重复确认已完成的清理；确认失败保留当前任务，快速重复操作由 busy guard 拒绝。
- 联调入口仅对同时具备 Transport 读取、创建和清理权限的用户显示。

### Verification

- 83 个测试文件、623 项测试通过；typecheck、ESLint、Prettier、Stylelint、生产构建与合同校验通过。
- 补充真实 API 接线、确认失败恢复、并发保护、下一轮重启和权限隐藏测试，覆盖审计由 61% 提升至约 94%。
- 浏览器 QA 已覆盖桌面与移动视口且未创建真实 Transport 任务；本次验证不包含现场物理完成或业务验收。

## [0.12.1.1] - 2026-08-30

### Fixed

- Docker 开发环境在冷启动后首次打开懒加载页面时，即使 Vite 正在刷新新发现的依赖，也会继续完成在途请求，不再返回 `504 Outdated Optimize Dep`。
- 增加 Vite 配置回归测试，确保保留懒加载依赖发现能力，同时冻结过期请求不中断的行为。

### Verification

- 81 个测试文件、614 项测试通过；typecheck、ESLint、Prettier、Stylelint 与生产构建通过。
- 覆盖审计为 90%，fresh pre-landing Review 无剩余意见；浏览器 QA 已覆盖 6 个冷路由且无 504/console error。
- 本次发布不包含后端接口、合同、权限、生产部署、现场物理动作或业务验收。

## [0.12.1.0] - 2026-08-28

### Added

- 运输接入诊断页增加按当前 `transport_task_id` 清理联调任务的入口、完整链路预检弹窗，以及独立的预检/清理权限控制。
- 同步后端 reset API、OpenAPI types、Zod、metadata 和权限生成物，页面明确清理只影响 WES 本地链路，不会取消 WMS/RCS 请求或撤销物理动作。

### Fixed

- 清理成功后失效在途详情响应并结束详情加载状态，避免已删除任务的旧响应回填或页面永久停留在加载中。
- 预检、清理失败和列表刷新失败保持可恢复状态；已成功清理不会因后续刷新失败被误判为失败并诱导重复操作。

### Verification

- 最终 80 个测试文件、613 项测试通过；typecheck、ESLint、Prettier、Stylelint、生产构建、合同与权限同步校验通过。
- 覆盖审计 97%，fresh Review 与代码级设计检查无剩余意见；本次发布不包含再次 Deploy、现场物理动作或业务验收。

## [0.12.0.0] - 2026-08-28

### Added

- 新增运输接入诊断页：支持按 Transport kind/status 查询持久任务、游标加载、按需查看持久详情，并明确区分提交接纳、Evidence、Transport 终态与现场物理验收。
- 新增 Transport live-only SSE 通知与四类真实调试任务入口；真实任务必须先生成不可变请求预览并显式确认，页面不会把 ACK 或 SSE 通知描述为物理完成。

### Changed

- 设备与 Transport SSE 统一复用带鉴权刷新、协议边界、显式关闭及 gap 状态的共享连接实现；OpenAPI、Zod 与权限目录同步到后端 `41ab69bf`。

### Fixed

- 列表和详情请求增加 generation guard，避免慢响应覆盖较新的过滤结果或当前选中任务。

### Verification

- 最终功能快照 79 个测试文件、591 项测试通过；typecheck、ESLint、Prettier、Stylelint、生产构建、合同测试、合同同步与权限同步校验全部通过。
- 本地浏览器 QA 覆盖菜单与深链、SSE 连接、过滤、持久详情、不可变预览及桌面/平板/移动视口；未提交真实 Transport 任务，未执行部署、现场物理动作或业务验收。

## [0.11.2.0] - 2026-08-24

### Fixed

- 登录用户刷新页面后会重新恢复权限与菜单；重叠导航复用同一次认证上下文请求，临时加载失败后可在下一次导航重试，合法空权限仍保持 fail closed。
- 桌面与移动端的导航切换按钮会按当前状态提供准确的可访问名称，辅助技术可区分收起、展开、打开和关闭动作。

### Verification

- 68 个测试文件、501 项测试通过；typecheck、ESLint、Prettier 与 Stylelint 全部通过，行为覆盖审计为 86%，fresh pre-landing Review 无剩余问题。
- 本地浏览器 QA 覆盖硬刷新菜单恢复、深链与新标签页、登出回跳、移动端导航及设备诊断入口；未执行真实 ECS、现场物理动作、部署或业务验收。

## [0.11.1.1] - 2026-08-24

### Fixed

- 将 OpenAPI 与权限同步记录重新冻结到本次实际发布的后端合并提交；契约和权限哈希均未变化，只修正成对发布的来源身份。

### Verification

- 契约重新生成结果仅变更两份同步记录的 `backendCommit`；合同测试、合同同步、权限同步、类型检查及版本一致性检查通过。
- 本次不改变前端运行时行为，不包含部署、真实 ECS、现场物理动作或业务验收。

## [0.11.1.0] - 2026-08-24

### Changed

- 诊断 SSE 只有在收到首个完整 frame 后才显示已连接，并在鉴权重试、协议失败或主动取消前释放旧响应体；非 SSE、非法 UTF-8、超大或未闭合尾帧均安全失败。
- 活动消息缓冲按 `raw_payload` 的 JSON UTF-8 实际大小执行 16 MiB 上限，关联行详情同时展示完整 ingress attempt 与 latest evidence update。

### Fixed

- 页面刷新后会恢复超级用户完整上下文；权限加载失败继续 fail closed，普通用户访问诊断页仍进入 403。
- 中等视口下 Evidence 状态列保持可见，用户可通过横向滚动访问操作列，不再由固定列遮挡诊断状态。

### Verification

- 最终快照 66 个测试文件、493 项测试通过；typecheck、ESLint、Prettier、Stylelint、生产构建与合同校验通过，行为覆盖审计为 83%，最终 Review 无剩余问题。
- 本地 Mock 浏览器 QA 覆盖管理员与普通用户、RESULT/EVENT、过滤、清空、重连、详情、受控手动下发和桌面/移动视口；未执行真实 ECS、现场物理动作、部署或业务验收。

## [0.11.0.0] - 2026-08-23

### Added

- 超级用户可在设备接入实时诊断页观察 `DEVICE_RESULT` 与 `DEVICE_EVENT` 的 live-only SSE 消息，并按设备、类型和处理状态筛选、清空或查看结构化详情。
- 新增受控真实设备指令联调入口：从 ECS 状态枚举设备与 `task_type`，由用户填写参数，经不可变预览和显式二次确认后创建命令并轮询结果。

### Changed

- OpenAPI、TypeScript、Zod 与权限 provenance 统一同步到后端 `a6559ccc`；SSE 200 响应现在生成明确的 `text/event-stream: string` 合同，权限总数保持 137 条。
- 运维菜单与直接 URL 统一复用现有超级用户通配权限，普通账号不会看到入口，直达页面时进入 403，不新增诊断权限或角色白名单。

### Fixed

- 修复 SSE 浏览器 fetch、空表格式化、空权限守卫、ECS URL 切换时旧 preflight 响应回写，以及持续 401/403 导致无限重连和重复刷新 token 的问题。
- 不可准入设备现在直接展示实时 mode、status 与 rejection code；诊断状态徽章统一使用低饱和语义色、状态圆点和 6px 圆角。

### Verification

- 最终快照 66 个测试文件、485 项测试通过；lint、生产构建、contract:test、contract:verify 与 permission:verify 全部通过。
- 双轮合同、类型、Zod 与权限生成 fingerprint 一致；行为覆盖审计为 96%，fresh pre-landing Review 无剩余问题。
- 既有本地 Mock 浏览器 QA 覆盖管理员/普通用户、RESULT/EVENT、过滤/清空/重连、手动命令和多尺寸交互；未执行真实 ECS、现场物理动作、部署或业务验收。

## [0.10.1.0] - 2026-08-22

### Changed

- 将 OpenAPI 与权限生成记录绑定到已通过前后端 QA 的后端 `4ca6045`，保证后续镜像和部署门禁使用同一份后端来源。

### Fixed

- 在 Docker 开发环境中预构建 Element Plus 深层样式依赖，避免首次打开懒加载页面时出现 `504 Outdated Optimize Dep` 和动态导入失败。

### Verification

- 前端 57 个测试文件、446 项测试通过；lint、契约校验、权限同步校验与冷缓存 9 个懒加载路由验收通过。
- 记录移动端日志筛选工具栏在 375px 视口下的 P3 布局问题，保留为后续视觉优化，不阻塞本次功能发布。

## [0.10.0.0] - 2026-08-21

### Added

- 新增代码生成的只读权限目录页面与请求适配器，权限树、列表和详情继续可浏览，但不再向用户暴露后端已退役的权限定义写操作。
- 前端镜像写入自身 revision、批准的后端 revision、OpenAPI 与权限摘要，供配对 TEST 切换在暴露流量前核验不可变来源。

### Changed

- OpenAPI 类型、Zod Schema、API 模块和 137 条浏览器权限同步到后端 `0.27.0.0` 授权目录与 Transport 调试合同；两份 provenance 记录绑定同一后端提交。
- CRUD 页面权限绑定区分单条删除、批量删除、恢复和永久删除；只读资源不再因生成模块存在通用写方法而误入可写分支。
- 应用权限配置继续只管理厂商 API permission；WMS Transport callback 使用 Transport 专属合同，不再依赖旧通用外部回调权限。

### Fixed

- 修复并发 2012/2013 响应共享全局重试计数、刷新队列漏唤醒和旧 token 晚到后重复 refresh 的竞态；每个请求最多续期一次，并复用已经发布的新 generation token。
- 修复刷新成功后的权限上下文请求与慢响应相互撤销 token、回退 localStorage 或误触发登出的问题。

### Removed

- 删除已退役 `/callback/external` 的前端合同、生成模块消费者和兼容依赖，不保留重定向或双路径。

### Verification

- 最终 frontend HEAD 全门禁通过：56 个测试文件、443 tests；typecheck、ESLint、Prettier、Stylelint、contract:test、contract:verify 与 permission:verify 全部通过。
- 双轮 contract freeze、类型、Zod 与权限生成 fingerprint 一致；除两份 backendCommit provenance 记录外无生成差异。
- 跨仓计划审计为 48 DONE、2 项等价 CHANGED、0 PARTIAL；最终 frozen-head review 为 No issues found。状态边界为 `IMPLEMENTED — NOT DEPLOYED`。

## [0.9.0.0] - 2026-08-20

### Added

- 作业线管理员现在可以维护粗分机三类设备与四个位置的结构化静态配置，并在激活前获得缺失、重复和非法绑定的明确校验结果。
- 已激活作业线新增正式 START 操作，支持在投递结果未知时保留同一请求身份并安全重放，同时区分历史运行代际事实与当前作业线投影。
- 设备创建、编辑和详情支持 Endpoint 地址配置，并允许将已有地址显式清空为 `null`。

### Changed

- 前端合同、类型、Zod Schema 和 111 条权限同步到后端 WorkLine Epoch 基线；镜像同时记录精确源码提交与 source tree，便于不可变交付核验。
- 粗分机配置在作业线激活或账号缺少更新权限时保持只读，保存期间锁定会话、关闭入口和表单，避免异步结果污染其他作业线。

### Fixed

- START 请求身份改用普通局域网 HTTP 可用的安全随机数生成方式，并将本地身份准备失败与未知投递明确区分。
- 修复粗分机配置加载和保存的跨作业线竞态、列表刷新失败误判保存失败，以及设备 Endpoint 表单测试告警。

### Removed

- 删除 Sandbox START 兼容路径，以及 Dashboard、登录页和侧边栏中无法由真实系统事实支撑的指标、健康状态与版本展示。

## [0.8.1.0] - 2026-08-19

### Changed

- 前端合同同步到后端 `3a3759a` 基线，入库恢复裁决事件和 WMS event 通用回执语义可由 canonical OpenAPI、TypeScript 类型与 Zod schema 一致复现。
- 合同与权限记录继续绑定同一后端提交；110 条权限保持不变，系统接口仍不会生成浏览器 API 模块。

### Removed

- 删除后端已退役的 WMS 确认状态及物料挂载确认字段生成物，避免二次开发继续依赖失效合同。
- 将已完成的旧 Runtime 清理实施计划移出项目目录归档，避免历史过程文档继续被当作当前真源。

## [0.8.0.0] - 2026-08-18

### Added

- 新增可复现的后端契约冻结、权限来源校验、浏览器端点所有权和生成物零差异门禁，开发者可以在不启动临时后端服务的情况下验证前端合同。
- 新增旧运行域移除、基础能力依赖边界、静态设备与作业线页面，以及契约生成链路的回归测试。

### Changed

- 设备与作业线页面收敛为静态主数据 CRUD，只保留当前 OpenAPI 合同允许维护的字段、操作和默认值。
- OpenAPI 类型、字段元数据、Zod schema 与权限常量统一由冻结的后端 commit 和 canonical snapshot 生成，CI、Git hooks 与本地命令执行相同的 fail-closed 校验。
- 契约开发、同步、测试和 CRUD 文档更新为当前单一真源流程，过期实施计划与设计文档移出项目目录归档。

### Fixed

- 修复可空数字字段被通用表单绑定转换为空字符串并最终提交为 `0` 的问题，设备可以在不指定作业线和上游设备时正常创建、编辑。
- 修复非 JSON 错误响应被重复读取，导致原始服务端错误被 `body stream already read` 覆盖的问题。
- 修复 pre-push 门禁向测试进程泄漏当前仓库 Git 环境，导致临时仓库测试无法独立提交的问题。

### Removed

- 删除旧 Runtime 路由、菜单、页面、组件、状态、SSE 客户端、诊断工具及其测试闭包；访问 `/runtime/*` 统一进入 NotFound。
- 删除旧工作线插件配置页、运行态设备操作入口、过期脚本和不再适用的过程任务文档，不保留兼容别名或迁移层。

## [0.7.2.0] - 2026-06-18

### Changed

- 工作线插件 manifest 合同同步到可复现的本地 OpenAPI snapshot，配置页和运行态依赖的 API 类型、metadata 与 Zod schema 保持一致。
- API 类型、Zod 生成和契约校验支持通过精确 OpenAPI 文件或 URL 复现同一合同 hash，避免依赖临时本地后端端口。
- 自动生成的 API 合同文件不再写入 OpenAPI 来源地址，减少不同机器或端口造成的无意义生成差异。

### Fixed

- 更新契约测试文档中的完整 OpenAPI 地址示例，改用 `BACKEND_OPENAPI_URL`，避免旧 `BACKEND_URL` 示例被当作后端 base URL 再追加路径。

## [0.7.1.0] - 2026-06-18

### Added

- **Token 三层契约落地**:`globals.css` 新增 L2a 静态工业 token 层(`--color-industrial-{dark,light}-{bg,surface,surface-elevated,border,border-hover,text,text-secondary,text-muted}` + 各 `-rgb` 三元组,空格分隔)与 L2b 主题感知层(`--color-bg/-bg-solid/-body-text/-surface/-surface-elevated/-surface-subtle/-border/-border-hover/-border-strong/-text-{primary,secondary,muted,disabled,inverse}/-shadow-rgb`),`html.dark` 与 `html:not(.dark)` 各定义一套,SFC 引用主题感知 token 自动跟随主题切换。
- **Stylelint 硬编码已建模色拦截**(`stylelint.config.js`):新增 `declaration-property-value-disallowed-list` 规则,Vue override 启用,18 项 regex 覆盖主色 / 语义色 / 工业中性色族,违规 = error 阻塞 lint;`globals.css` 自身豁免(token 定义源头需要硬编码原始值)。
- **Token 不变量测试**(`tests/unit/styles/style-token-invariants.test.ts`):9 项不变量验证 token 三层契约 — 旧 token 定义/引用零、`--color-*-rgb` 空格分隔、dark/light selector 暴露相同 `--color-*` 与 `--runtime-*` 名称、每个 `--runtime-*` 派生自 `--color-*`、`--runtime-badge-info-*` 用 `--color-info` 而非 safety-blue、SFC `<style>` 块零硬编码、CSS 无双斜线 TODO。
- DESIGN.md 新增 `### Token 引用契约` 子节,定义 L1/L2a/L2b/L3 引用规则与 Stylelint 拦截策略。

### Changed

- **`--runtime-*` 改为派生层**:`html.dark` / `html:not(.dark)` 各 ~42 个 `--runtime-*` 变量从硬编码 hex/rgb 改为 100% `var(--color-*)` 或 `rgb(var(--color-*-rgb) / α)` 派生。改主色一处,Runtime Monitor 与全站同步响应。
- **删除旧 token 体系**(R3-C C2):删除 `globals.css` 中 13 个旧 token(`--body-bg/--body-color/--surface-bg*/--border-color*/--text-{primary,secondary,muted,disabled,inverse}`)的定义与引用,SFC 中 22 处 `var(--legacy)` 引用全部替换为 `var(--color-*)`。
- **CSS Color 4 slash-alpha 语法迁移**:5 个 `--color-*-rgb` 元组从逗号分隔(`245, 158, 11`)改为空格分隔(`245 158 11`),18 处 `rgb(var(--color-*-rgb), N)` 旧逗号 alpha 语法迁移为 `rgb(var(--color-*-rgb) / N)` slash 语法。
- **SFC 硬编码颜色清零**:543 处违规 → 0,57 个 SFC 文件全部改用 `var(--color-*)` 派生(主色族 / 语义色 / industrial 中性色)。共新增 565 处 `var(--color-*)` 引用(280 主色 + 141 语义色 + 145 industrial 静态)。
- **Runtime Light Theme 段归位**:`globals.css:1306` 起原本位于 `@layer theme` 之外的 Light Theme overrides 段已归位到 `html:not(.dark)` 块内(R2 Q4 失误修正)。
- **运行态色彩语义对齐 SPEC**(P1):`--runtime-rail` / `--runtime-border-neutral` 从中灰半透改为琥珀半透;`--runtime-badge-info-*` 从 cyan(`#22d3ee`)改为 info-blue(`var(--color-info-light)`);light 模式 `--color-border-hover` 从主色高亮改为中灰(`#CBD5E1`)。

### Fixed

- 修复 `--runtime-badge-info-*` 此前误用不存在的 `--color-safety-blue-rgb`(实际项目变量是 `--color-info-rgb`)的隐 bug(R3-F)。
- 修复 `--color-*-rgb` 与 `rgb(var(...) / α)` 格式不兼容导致的视觉静默失败(空格分隔 RGB + slash alpha 是 CSS Color 4 唯一兼容组合)。

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
