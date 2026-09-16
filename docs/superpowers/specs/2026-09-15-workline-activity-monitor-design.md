# 工作线活动监控页面设计规格

日期：2026-09-15  
状态：设计已确认；实施前复审通过，等待 T1–T3 合同门禁（见 §19）  
目标页面：工作线活动监控  
示例上下文：WorkLine `KT16`，插件 `manual-picking`

## 1. 背景

旧视觉稿把一次人工拣料过程中的货架、料箱和任务身份画成固定拓扑，并引入了插件与 WorkLine 均未定义的 `R1 / R2` 角色。这会让过程数据反向决定页面结构，也会把 Transport 的独立推进关系误解成静态业务模型。

新方案把页面分为两个严格独立的层次：

```text
静态 Scene = WorkLine 实例配置 × Plugin Definition

动态 Snapshot = Scene revision + 资源状态摘要

Active Objects = 完整过程对象 + Evidence 入口
```

前端不直接读取 Python `definition.py`，也不自行组合插件领域结构。后端负责把 WorkLine 与已安装插件 Definition 组装成稳定、可版本化的 Scene 合同，前端只按合同渲染。

当前文档与视觉原型是 **v2 合同的设计示例**，不是当前 KT16 的实时页面。原型中的资源、对象、状态和时间均为模拟数据，必须显式标注“设计示例 · 模拟数据”；在后端返回 `generated_at` 与 `scene_revision` 之前，不得使用“截至”“快照有效”“当前”等实时语义，也不得用静态样例作为接口失败时的成功兜底。

## 2. 目标

页面打开后，用户应在五秒内回答三个问题，顺序不可颠倒：

1. 这条 WorkLine 由哪些插件资源组成，实际绑定了什么？
2. 哪些资源现在存在活动或需要关注？
3. 选中的资源关联哪些任务、货架、料箱、Transport 与 Evidence？

页面必须保持只读。监控失败、数据截断和旧快照不得被展示成“无活动”或“全部正常”。

## 3. 不在范围

- 物理平面布局编辑器。
- 插件流程编排器。
- 根据一次任务或历史活动推断插件拓扑。
- Transport、DeviceCommand、WorkLine 启停或重试操作。
- 现场物理完成确认。
- 为单个页面新增全局业务语义颜色 token。

## 4. 权威输入

### 4.1 WorkLine 实例

WorkLine 提供实例级事实：

- `line_code`、`line_name`、`line_type`、`zone_name`。
- `plugin_key`、`plugin_version`。
- `run_mode`、`is_active`、WorkLine `version`。
- 设备绑定与位置绑定。
- 绑定的实际资源编码、名称与启用状态。

### 4.2 Plugin Definition

Plugin Definition 提供可用资源的声明，不提供当前占用或运行状态。

`manual-picking` 当前声明：

- 设备角色：`SCAN1`、`SCAN2`、`SCAN3`、`SCAN4`。
- 位置槽位：`FIVE_RACK`、`RETURN_RACK`、`TRANSFER_RACK`、`INLET`、`OUTLET`。
- 每个角色或槽位的显示名称、位置类型、位置语义和允许的货架类型。

Definition 中 tuple 的顺序只用于稳定展示顺序，不推导业务先后关系或节点连线。

### 4.3 过程数据

以下内容只能作为动态叠加，不能创建或移动静态资源：

- PickingTask、TransportTask、DeviceCommand、Passage。
- Rack、Bin 或其他 Active Object。
- Evidence、位置投影、冲突状态、操作提示。
- WMS、ECS/RCS 和 WES 的处理结果。

无法映射到 Scene 资源的过程对象保留原身份，并进入“未映射对象”筛选，不得猜测所属资源。

## 5. API 合同方向

### 5.1 `plane.scene.v2`

新增资源中心的 Scene 合同，旧 `plane.scene.v1` 保留兼容，不改变原语义。

建议结构：

```text
PlaneSceneV2
├── schema_version = plane.scene.v2
├── scene_revision
├── workline
│   ├── id / version / line_code / line_name / line_type
│   ├── is_active / run_mode
│   └── plugin_key / plugin_version / plugin_display_name
├── generated_from
│   ├── workline_version
│   └── plugin_version
└── resource_groups
    ├── POSITION_SLOT[]
    └── DEVICE_ROLE[]
        └── resource
            ├── key = role_key | slot_key
            ├── display_name / stable_order
            ├── declared constraints
            ├── binding
            │   ├── code / name / type
            │   └── enabled
            └── binding_state
```

`scene_revision` 是服务端生成的不可猜测版本标识；WorkLine 配置版本、插件身份或 Definition 资源集合发生变化时必须变化。它不是客户端请求时间，也不能只用 `plugin_version` 代替。Snapshot 与 Active Objects 的资源关联必须回传同一个 revision，前端只接受与当前 Scene 一致的动态叠加。

`binding_state` 至少区分：

- `BOUND`：存在且通过配置校验。
- `UNBOUND`：Definition 声明但 WorkLine 未绑定。
- `INVALID`：存在绑定数据，但已失效或不符合 Definition。

`ORPHANED` 不属于当前资源行的 `binding_state`：它只出现在 `diagnostics.orphan_bindings[]` 中，因为对应的 Definition 资源已经不存在，不能创建伪造资源行。

当前 `WorkLineDeviceRole` 只有 `role_key` 与 `display_name`，首版 `DEVICE_ROLE` 的 `declared_constraints` 允许为空对象；不能为了和位置槽位对称而虚构设备约束。`config` 继续保留现有 JSON 存储，不要求本次引入数据库迁移；Scene assembler 必须在读取边界使用 Definition 驱动的适配器校验其形状、键和值。未知键、错误类型或无法解析的绑定进入 `INVALID`，不得静默忽略。

Scene 同时返回不属于当前 Definition 资源行的诊断：

```text
diagnostics
└── orphan_bindings[]
    ├── group = POSITION_SLOT | DEVICE_ROLE
    ├── key
    ├── bound_code
    └── reason
```

`ORPHANED` 诊断必须在全线摘要、配置诊断入口和筛选中独立可见，并与 `UNBOUND`、`INVALID` 分开计数。

Scene 不返回任务、货架、料箱、Transport 或 Evidence，也不返回原始插件私有 `config`；诊断只保留可核对的键、编码和稳定原因码。v2 继续复用现有 plane read 权限与读取审计边界。

### 5.2 `plane.snapshot.v2`

Snapshot 与 Scene revision 绑定，只返回资源级摘要：

```text
PlaneSnapshotV2
├── schema_version = plane.snapshot.v2
├── scene_revision
├── generated_at
├── source_status = COMPLETE | PARTIAL | FAILED | STALE
├── truncated / total_count
├── resource_states[]
│   ├── resource_ref
│   │   ├── group = POSITION_SLOT | DEVICE_ROLE
│   │   └── key = slot_key | role_key
│   ├── active_object_count
│   └── highest_conflict_state
└── unmapped_object_count
```

Snapshot 不重复返回完整 Active Object，也不改变 Scene 的资源顺序和分组。

`generated_at` 是服务器生成时间，不等同于客户端请求完成时间；来源失败时允许为 `null`。`source_status` 为 `PARTIAL`、`FAILED` 或 `STALE` 时，前端必须保留静态 Scene，但不得把缺失的资源摘要渲染成 `0 · 无活动`。只有 `COMPLETE` 且资源计数明确为零时，才显示“无活动”。

### 5.3 Active Objects

完整对象仍由 `active-objects` 提供，用于右侧上下文和底部台账。每个对象必须提供可选的资源关联键；没有关联键或关联无效时进入未映射集合。

v2 响应在顶层返回 `scene_revision`（兼容旧响应时可为 `null`），对象使用统一的 `resource_ref { group, key }` 关联位置槽位或设备角色。`scene_revision = null` 或资源引用缺失时，前端保留对象身份但不得把它归入任一资源行。

资源关联键由后端投影明确产生，前端不得根据位置码、对象类型、业务步骤、任务顺序或历史活动猜测 `role_key/slot_key`。对象来源、位置摘要和 Evidence refs 只能展示响应中已返回的字段；没有详情查询合同的引用只显示为引用，不补写解析后的事实。Evidence 抽屉按对象类型复用现有只读查询；没有可复用查询时降级为引用列表，不新增一个猜测式通用详情接口。

### 5.4 一致性保护

- Snapshot 的 `scene_revision` 与当前 Scene 不一致时停止资源状态叠加。
- Active Objects 的 `scene_revision` 或对象 `resource_ref` 与当前 Scene 不一致、缺失时，同样进入“版本不匹配/未映射”状态；不得按位置码或对象类型补猜关联。
- Scene 仍可展示；Snapshot 与 Active Objects 分别保留自己的错误与版本状态。
- 截断结果必须显式返回 `truncated`，以及可用时的 `total_count`。
- 前端不得用已展示行数推断总数或“全部正常”。
- Scene assembler 的 `config` 解析失败时，Scene 可以保留 Definition 资源结构，但对应绑定必须显示为 `INVALID`，同时暴露诊断原因。

## 6. 页面信息架构

```text
┌─────────────────────────────────────────────────────────────────────┐
│ 工作线活动监控                                                      │
│ KT16 · 人工拣料 · manual-picking@0.1.0 · 配置草稿 · 模拟数据     │
├────────────────────────────────────────────┬────────────────────────┤
│ 工作线资源                                 │ WorkLine / 资源上下文  │
│                                            │                        │
│ 位置槽位矩阵                               │ 未选择资源：           │
│ 角色 | 名称 | 实际绑定 | 绑定状态 | 活动摘要│ 显示全线摘要           │
│                                            │                        │
│ 设备角色矩阵                               │ 已选择资源：           │
│ 角色 | 名称 | 实际绑定 | 绑定状态 | 活动摘要│ 显示资源与关联对象     │
├────────────────────────────────────────────┴────────────────────────┤
│ 全线活动对象台账                                                    │
│ 状态筛选 | 类型筛选 | 资源筛选 | 未映射对象                        │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.1 页面头部

头部只展示 WorkLine 静态身份和动态刷新状态：

- WorkLine 编码与名称。
- 插件显示名、`plugin_key@plugin_version`。
- WorkLine 启用状态与运行模式。
- 最近成功刷新时间（只有服务端返回 `generated_at` 时才显示时间可信度）。
- 手动刷新按钮。刷新只读取数据，不触发任何业务或设备动作。

### 6.2 双分组资源矩阵

主区域分为“位置槽位”和“设备角色”两个矩阵。每个资源占一行，字段固定对齐：

| 字段     | 来源              | 规则                                             |
| -------- | ----------------- | ------------------------------------------------ |
| 资源键   | Plugin Definition | 位置槽位显示 `slot_key`，设备角色显示 `role_key` |
| 名称     | Plugin Definition | 使用插件声明的 `display_name`                    |
| 实际绑定 | WorkLine          | 显示实际位置或设备编码                           |
| 绑定状态 | Scene             | `BOUND / UNBOUND / INVALID`                      |
| 活动摘要 | Snapshot          | 活动数量与最高冲突状态                           |

资源行不因活动对象数量改变高度。活动对象不会嵌入资源行内展开。

### 6.3 右侧上下文

默认不自动选中资源。未选择时展示全线摘要：

- 资源总数、已绑定、未绑定、失效绑定数量。
- 孤儿绑定数量；点击后进入只读配置诊断，不创建伪造资源行。
- 活动对象总数与各冲突状态数量。
- 未映射对象数量。
- 最近成功刷新时间；只有服务端返回 `generated_at` 时才展示数据新鲜度。
- 少量需要关注的资源入口，但不自动改变选择。

选择资源后，右侧切换为资源上下文：

- Definition 身份与 WorkLine 实际绑定。
- 绑定状态与动态过程状态分别展示。
- 关联 Active Objects 列表。
- 每个对象的类型、身份、冲突状态、位置摘要和操作提示。
- “查看完整对象详情”进入 Evidence 抽屉。

清除选择后返回全线摘要。

### 6.4 活动对象台账

台账展示全线完整过程对象，支持：

- 按冲突状态、对象类型、资源引用筛选。
- 单独查看未映射对象。
- 从资源选择同步过滤，也允许清除资源过滤查看全线。
- 点击对象打开 Evidence 详情。

台账不承担静态资源结构展示。

## 7. 状态语义

资源行同时展示两个互不替代的状态：

1. 绑定状态：静态配置事实。
2. 过程状态：动态运行事实。

`UNBOUND` 不等于 `RECONCILING`，也不使用过程异常的红黄绿语义色。过程摘要中的最高冲突状态只由映射到该资源的 Active Objects 计算。

### 7.1 状态矩阵

| 区域                  | 加载中             | 空状态                               | 请求失败                 | 成功                         | 部分可用                         |
| --------------------- | ------------------ | ------------------------------------ | ------------------------ | ---------------------------- | -------------------------------- |
| WorkLine / Definition | 标题保留，资源骨架 | 无声明资源时仅显示 WorkLine          | 资源定义不可用           | 展示全部资源                 | WorkLine 可用时保留基础信息      |
| 资源绑定              | 显示读取中         | 未绑定                               | 绑定信息不可用           | 显示实际编码                 | 个别无效只影响对应资源           |
| 配置诊断              | 读取中             | 无诊断                               | 保留原始键和值并标记失败 | 展示 `INVALID/ORPHANED` 原因 | 孤儿绑定独立计数与筛选           |
| Snapshot              | 静态资源保持可见   | 仅 `COMPLETE` 且明确为零时显示无活动 | 首次失败显示状态不可用   | 展示摘要                     | 刷新失败保留旧快照并标记过期     |
| 右侧上下文            | WorkLine 摘要骨架  | 未收到动态数据时不显示零活动         | 静态摘要保留             | 默认全线、选择后资源详情     | 有 `generated_at` 才标记截至时间 |
| 对象台账              | 表头与行骨架       | 解释当前无活动                       | 不解释为空数据           | 展示并筛选                   | 截断时显示已展示范围             |
| 对象映射              | 暂不映射           | 不占主视觉                           | 保留对象身份             | 映射到角色或槽位             | 未映射对象独立展示               |
| Evidence              | 抽屉骨架           | 明确没有 Evidence                    | 保留对象身份并可重试读取 | 展示来源与引用               | 逐来源标记失败                   |

### 7.2 旧快照

刷新失败但存在最后成功快照时：

- 保留最后快照，整体降低强调度。
- 页面顶部持续显示“动态数据更新失败”。
- 仅在最后成功快照带有 `generated_at` 时显示“截至 HH:mm:ss”；没有时间戳时只显示“动态数据来源失败/不可用”。
- 禁止使用“实时”“当前”等措辞。
- 自动重试不改变用户当前选择。

首次动态请求失败时没有旧快照可展示，只保留静态 Scene，并显示“动态状态不可用”。

### 7.3 来源标识

资源矩阵和上下文详情必须在字段或分组标题上标出来源：

- `Definition`：角色键、显示名、位置类型、允许约束和稳定顺序。
- `WorkLine`：实际绑定编码、名称、类型和启用状态。
- `Scene`：绑定状态与 Scene revision。
- `Snapshot`：资源级活动数量、最高冲突状态、生成时间和截断信息。
- `Active Objects`：对象身份、来源、位置摘要、操作提示和 Evidence refs。

来源请求独立处理加载、失败、过期和部分可用状态；不能把某一来源缺失渲染成全线“无活动”或“全部正常”。

## 8. 用户旅程

| 阶段     | 用户行为               | 页面反馈                       | 目标感受                       |
| -------- | ---------------------- | ------------------------------ | ------------------------------ |
| 进入页面 | 选择或打开 KT16        | 先稳定显示 WorkLine 与资源结构 | 知道页面没有根据任务临时变形   |
| 扫描状态 | 浏览两组资源矩阵       | 一眼区分绑定缺口与过程关注项   | 知道问题属于配置还是运行       |
| 定位资源 | 选择一个资源行         | 右侧原位切换到资源上下文       | 不丢失全线位置感               |
| 查看对象 | 选择关联 Active Object | 打开只读 Evidence 抽屉         | 能追溯依据，但不会误触现场动作 |
| 清除选择 | 返回全线摘要           | 资源过滤清除，台账恢复全线     | 可以快速继续巡检               |
| 刷新失败 | 保持查看               | 旧快照保留并明确过期           | 不丢线索，也不会误信旧数据     |

## 9. 视觉方向

页面属于 OPERATE 型应用界面，延续现有 `DESIGN.md` 的工业仓储视觉语言：

- 深色与浅色主题均使用现有全局 token。
- 琥珀色只用于当前选择、键盘焦点和关键关注入口。
- 红、黄、绿只表达过程语义，不表达绑定状态。
- 角色键、设备编码、位置编码与数量使用 JetBrains Mono。
- UI 文本使用现有 Inter 字体。
- 使用紧凑矩阵和分隔线，不使用卡片拼图、装饰性网格平面或发光边缘。
- 不使用持续脉冲动画。状态变化使用 150–250ms 的颜色与背景过渡。
- 资源行选中使用低透明琥珀背景与清晰焦点环，不增加顶部语义色条。

这些页面级取舍不修改全局设计系统，只避免在数据密集型矩阵中套用统计卡片样式。

## 10. 响应式设计

### ≥1200px

- 资源矩阵与右侧上下文使用约 70/30 分栏。
- 活动对象台账位于下方并占满内容宽度。
- 右侧上下文保持可见，不覆盖矩阵。

### 768–1199px

- 资源矩阵占满主区。
- 选择资源后从右侧打开上下文抽屉。
- 关闭抽屉后焦点返回触发资源行。
- 对象台账仍位于资源矩阵下方。

### <768px

- 资源矩阵保留“角色、绑定、状态”三列。
- 显示名称作为角色单元格的第二行。
- WorkLine 摘要、资源矩阵与活动对象成为明确页签或分段导航。
- 上下文与 Evidence 使用全高抽屉。
- 不使用双层横向滚动。

## 11. 无障碍

- 资源矩阵使用可聚焦行或语义按钮，不用仅支持鼠标的容器。
- 选择状态通过 `aria-selected` 和视觉状态共同表达。
- 状态不只依赖颜色，始终显示文字。
- 键盘支持选择资源、关闭抽屉、返回触发行。
- 触控目标不小于 44px。
- 正文对比度不低于 4.5:1。
- 动态刷新使用非打断式 live region；刷新失败提示不会反复朗读。
- `prefers-reduced-motion` 下取消非必要过渡。
- 长任务号、设备码和位置码可换行或省略，并提供可访问的完整值。

## 12. 数据流

```text
选择 WorkLine
  ├── GET Scene v2
  │     └── 渲染稳定资源矩阵
  ├── GET Snapshot v2
  │     └── 校验 scene_revision 后叠加摘要
  └── GET Active Objects
        ├── 建立资源关联索引
        ├── 渲染右侧上下文
        └── 渲染完整对象台账

选择资源
  ├── 过滤资源关联对象
  ├── 更新右侧上下文
  └── 同步台账资源筛选

选择对象
  └── 打开只读 Evidence 详情
```

Scene 只在 WorkLine 版本或插件版本变化时重新读取。首版 Snapshot 与 Active Objects 采用页面可见期间的 15 秒轮询；手动刷新立即并行读取两者，但不触发业务或设备动作。失败后按 15s、30s、60s、120s 退避，成功后恢复 15s 周期；每个来源保留独立的加载、错误、过期和截断状态。首版不引入 SSE，后续只有在轮询无法满足刷新时效目标时才重新评估。

## 13. KT16 示例渲染

KT16 示例必须由合同生成，不在页面代码中硬编码。设计稿可以使用模拟 fixture，但必须明确标为“配置草稿/模拟响应”，不得冒充当前已启用 WorkLine：

- WorkLine：`KT16`。
- 插件：`manual-picking@0.1.0`，显示名“人工拣料”。
- 位置槽位来自 Definition：`FIVE_RACK`、`RETURN_RACK`、`TRANSFER_RACK`、`INLET`、`OUTLET`。
- 设备角色来自 Definition：`SCAN1`～`SCAN4`。
- 现场绑定示例可展示 `FIVE_RACK → KT16`、`INLET → CNV0301`、`SCAN1～SCAN4 → STATION_SCAN9～STATION_SCAN12`，但值必须来自 WorkLine Scene 响应；若同时演示 `RETURN_RACK`、`TRANSFER_RACK` 未绑定，页面状态必须标记为未启用配置草稿，因为当前启用校验要求 Definition 的全部槽位与设备角色完成绑定。
- `510002`、`510059`、`610007`、`A000000394` 等只允许出现在 Snapshot/Active Objects 示例中。
- 不显示 `R1 / R2`，不显示 Definition 未声明的流程箭头或节点。

## 14. What already exists

- 仓库已有 `DESIGN.md`，提供深浅主题、工业琥珀、语义色、字体、间距和焦点规则。
- WorkLine 配置页面已有 WorkLine 身份、插件选择、设备与位置绑定的展示语言，应复用命名与字段顺序。
- `workLinesApiMethods` 已有 `activeObjects`、`planeScene` 与 `planeSnapshot` 入口。
- 通用 CRUD 表格已有加载、空、错误与详情模式，应复用可用基础组件，不另造表格框架。
- 当前后端 `plane.scene.v1` 从 WorkLine 与 `pipeline_queues` 生成通用节点；`plane.snapshot.v1` 已有 `objects[]`、`extremes[]` 和 `scene_schema_version`，但其中是无资源关联语义的通用字符串负载，不能直接支撑本设计。v2 上线前，前端不把 v1 负载转换成资源摘要；v2 上线后由页面切换到 v2，v1 仅按后端兼容策略保留。

## 15. 实现任务

- [ ] **T1（P1）后端 Scene 合同**：定义 `plane.scene.v2`，从 WorkLine 与 Installed Plugin Definition 组装资源分组、绑定、`scene_revision`、版本信息与 `diagnostics.orphan_bindings`；在 assembler 边界用 Definition 校验 JSON `config`，将未知/畸形绑定标记为 `INVALID`，孤儿历史绑定标记为 `ORPHANED`，不返回原始私有 config，并复用既有 plane read 权限与读取审计。
- [ ] **T2（P1）后端 Snapshot assembler**：定义 `plane.snapshot.v2`，按 Scene revision 和 `resource_ref { group, key }` 输出资源活动数量、最高冲突状态、未映射数量、`generated_at`、`source_status`、总数与截断信息；缺失来源不得被编码成零活动，只有 COMPLETE 且明确为零才返回零活动；复用既有 plane read 权限与读取审计。
- [ ] **T3（P1）Active Object 关联**：为过程对象提供顶层 `scene_revision` 与可选 `resource_ref { group, key }`，无法映射时保留身份并进入未映射集合；禁止前端按位置码或对象类型补猜。
- [ ] **T4（P2）前端资源矩阵**：在 v2 OpenAPI/Zod 类型冻结并生成后，新建只读监控矩阵组件；不假设 `DEVICE_ROLE` 存在声明约束；实现位置槽位与设备角色双分组矩阵，以及静态绑定/动态过程双状态与孤儿绑定诊断入口。
- [ ] **T5（P2）上下文与台账联动**：新建只读监控上下文/台账组件，实现全线摘要、资源选择、对象筛选、孤儿绑定诊断；Evidence 详情按对象类型复用已有只读查询，没有查询合同时只展示引用。
- [ ] **T6（P2）可信状态覆盖**：实现 15 秒轮询、失败退避、加载、空、首次失败、旧快照、部分来源失败、截断和版本不匹配状态；手动刷新与轮询复用同一只读查询。
- [ ] **T7（P2）响应式与无障碍**：实现桌面分栏、窄屏抽屉、手机三列矩阵、Evidence 替换上下文、焦点返回与键盘操作。
- [ ] **T8（P2）验证**：增加合同测试与 OpenAPI/Zod 冻结校验、Scene/Snapshot 一致性测试、config 畸形/孤儿绑定测试、资源映射测试、轮询退避测试、组件状态测试与响应式人工截图检查。
- [ ] **T9（P2）启用状态契约确认**：把“启用要求全部槽位和设备角色绑定”作为后端 `configuration-status`/启动流程的显式契约测试；若该规则发生变化，必须同步更新 KT16 fixture 与 `UNBOUND` 展示语义。

## 16. 验收标准

- 页面结构完全由 WorkLine 与 Plugin Definition 生成。
- 设计示例明确标注模拟数据、未来合同和配置草稿状态；不把静态 fixture 展示成实时 KT16。
- 换成另一个插件时，页面不需要新增插件专用 Vue 模板。
- 过程对象数量变化不会改变资源结构和资源行高度。
- 页面不存在 `R1 / R2` 或其他未声明领域角色。
- Definition 未定义连线时，页面不绘制连线。
- 未绑定、过程异常、旧快照、请求失败、截断和未映射状态可被明确区分。
- `INVALID` 与 `ORPHANED` 绑定诊断可独立查看；插件升级后的历史孤儿绑定不会静默消失。
- `config` 出现未知键、错误类型或无法解析的值时，页面保留原始诊断，不猜测绑定，也不显示为已绑定。
- 资源活动摘要必须使用带分组的 `resource_ref`，不能把 `slot_key` 当作 `role_key` 或反向混用。
- Scene/Snapshot 版本不匹配时不会错误叠加。
- 没有 `generated_at` 或 `scene_revision` 时不显示“截至”“快照有效”等实时可信度文案。
- 只有动态来源明确返回 COMPLETE 且计数为零时，页面才显示“无活动”；来源缺失、失败或过期不得伪装成零。
- 动态数据采用 15 秒轮询，失败按 15/30/60/120 秒退避；手动刷新不触发副作用。
- 所有详情保持只读，不提供业务或设备动作。
- 桌面、平板与手机布局均能完成资源选择和对象详情查看。

## 17. Eng Review 详情（架构与测试）

评审范围：本文档 §1–§16 的架构方向、契约方向与实现任务分解；评审方法为对照本仓库现有代码与契约核对文档中的"已有事实"与"新增事实"是否准确、任务颗粒度是否覆盖真实差异。评审未接触后端仓库源码，涉及后端内部实现的判断已在下方逐条标注为待后端确认。

### 结论

Scene / Snapshot / Active Objects 三层分离、`binding_state` 三态模型、未映射对象的处理方式，均与既有工程约定一致（静态/动态严格分层、fail-closed、不猜测归属）。架构方向 **CLEAR**。以下 7 项发现（3 MAJOR · 3 MINOR · 1 NOTE）均为实现前应显式解决的跟进项，不构成方向性否决。

### 发现项

1. **[MAJOR] T1 范围被低估——role_key/slot_key 绑定当前存放在无 schema 的 `config` 字段中。**
   `PUT /work_lines/{id}/configuration` 的 `config` 在 OpenAPI 契约中是裸 `object`（见 `WorkLineConfigurationResponse`），实际内容由前端在 `WorkLineBusinessConfigurationPanel.vue` 组装为 `{ device_bindings: Record<role_key, device_code>, position_bindings: Record<slot_key, position_code> }`，没有后端 schema 保障键名或值的合法性。Scene v2 assembler 要读取的正是这份契约外的 JSON，而不是重新投影某个已有强类型字段。
   建议：T1 明确写出（a）是否要为 `config` 按插件补一层强类型 schema，（b）assembler 遇到未知/畸形 `config` 时的降级行为（记为 `INVALID` 还是视为断言失败）。

2. **[MAJOR] Definition 未提供 DEVICE_ROLE 的 "declared constraints"。**
   现有 `WorkLineDeviceRole` 只有 `role_key` + `display_name`，没有任何约束字段；而位置槽位（`WorkLinePositionSlot`）已有 `position_type` / `location_type` / `allowed_rack_kind`。§5.1 的 `resource_groups.DEVICE_ROLE[].resource` 结构隐含设备角色也带声明约束。若这是 v2 新增内容，需要先确认约束字段来自插件 `definition.py` 的 manifest 变更（后端仓库改动，超出前端可验证范围）；否则 T4 不应假设两组矩阵字段对称。
   建议：T1 明确 DEVICE_ROLE 的 declared constraints 在首版可以为空集合，T4 的表格渲染按"该列可能为空"设计，不要求两个矩阵结构完全对称。

3. **[MAJOR/RISK] 插件升级后孤儿绑定会被静默吞掉。**
   Scene 由"以 Definition 迭代生成 `resource_groups`"（§5.1）。如果插件升级删除了某个 `role_key`/`slot_key`，但 `config` 里仍保留该 key 的历史绑定，新 Scene 不会展示这条绑定（因为它已不在 Definition 迭代范围内），页面上不会有任何"存在无效残留绑定"的提示。这是一种既非 `BOUND`/`UNBOUND`/`INVALID`、也未被资源矩阵覆盖的第四种情况。与 §16"未绑定、过程异常、旧快照、请求失败、截断和未映射状态可被明确区分"的验收精神有缺口。
   建议：在 T1/T3 中显式定义这一场景（孤儿绑定如何呈现，是否需要一个独立的诊断入口），并补一条验收标准。

4. **[MINOR] §14 "`plane.snapshot.v1` 仍为空壳" 的表述不够准确。**
   从前端契约看，`PlaneSnapshot`（v1）已有 `objects[]` / `extremes[]` / `scene_schema_version` 等字段，结构并非空响应，只是内容是通用字符串负载（`object_code/object_label/state` 都不带资源关联语义），确实无法承载本设计。建议把措辞改为"v1 的 objects/extremes 是通用字符串负载，不具备资源分组与绑定语义"，并请后端确认 v1 调用点在 v2 上线后的存留/废弃计划——文档目前只说"旧 v1 保留兼容"，未说明前端何时切换、是否有页面仍在消费 v1。

5. **[MINOR] 刷新机制（轮询 vs SSE）未选定。**
   仓库中已有两种先例：`transport-diagnostics` 用 SSE（`useTransportDebugRunStream.ts`），其余多处用 `setInterval` 轮询。§12 只说"按统一刷新周期读取"，未指明机制、周期与失败退避策略，而这会直接影响与"旧快照标注"与"手动刷新不触发副作用"共存的实现方式，也影响 T8 的测试设计（轮询与 SSE 的测试策略不同）。
   建议：作为一条明确的工程决策在 T5/T6 之前拍板，写入任务卡片而非留给实现者临场决定。

6. **[MINOR] §14 对 UI 组件复用的估计偏乐观。**
   "通用 CRUD 表格" 对 §6.4 的活动对象台账（本质是可筛选表格）复用是合理的；但 §6.2/§6.3 的双分组资源矩阵 + 右侧上下文抽屉是一种新的只读监控布局，`worklines` 目录下现有组件（如 `WorkLineBusinessConfigurationPanel.vue`）都是表单/配置类，没有对应的只读监控组件可复用。
   建议：T4/T7 按"新建组件"而非"复用微调"估算排期，避免 P2 优先级下工作量被低估。

7. **[NOTE，已纳入 T9] "启用要求全部槽位/设备角色完成绑定"（§13）是否为现有行为。**
   `configuration-status` 的 `checks[].code` 在契约层是不透明字符串，前端仓库无法单独确认这条规则当前是否已实现、还是本次设计顺带引入的行为变更。该不确定性已从隐含前提升级为 T9 的显式后端契约测试；在真实契约确认前，KT16 仅作为示例数据，不把该规则写成前端推断。

### 评审提出的工程决策（已在 §18 收敛）

以下保留评审提出的原始问题，最终决策与实现边界见 §18；不再留给实现阶段临场决定。

- 决策 A：`config` 字段是否升级为按插件的强类型 schema，以及升级节奏（对应发现 1）。
- 决策 B：孤儿绑定（插件降级/角色被移除后残留的历史绑定）的呈现方式（对应发现 3）。
- 决策 C：Snapshot / Active Objects 的刷新机制与周期（轮询 or SSE）、失败退避策略（对应发现 5）。

## GSTACK REVIEW REPORT

| Review        | Trigger               |                       Why | Runs | Status                            | Findings                                   |
| ------------- | --------------------- | ------------------------: | ---: | --------------------------------- | ------------------------------------------ |
| CEO Review    | `/plan-ceo-review`    |          Scope & strategy |    0 | —                                 | 未运行                                     |
| Codex Review  | `/codex review`       |   Independent 2nd opinion |    0 | —                                 | 未运行                                     |
| Eng Review    | `/plan-eng-review`    |      Architecture & tests |    2 | CLEAR — FOLLOW-UPS RESOLVED       | §17 跟进项已收敛；本轮实施前复审见 §19     |
| Design Review | `/plan-design-review` |                UI/UX gaps |    2 | CLEAR — IMPLEMENTATION GATE ADDED | 原型与数据边界静态复核通过，实施门禁见 §19 |
| DX Review     | `/plan-devex-review`  | Developer experience gaps |    0 | —                                 | 未运行                                     |

**VERDICT:** DESIGN CLEARED + ENG REVIEW CLEARED；评审跟进项已在 §18 收敛，可进入实现排期，但代码启动门禁以 §19 的 T1–T3 合同条件为准。

UNRESOLVED DECISIONS: 0（A/B/C 已在 §18 收敛）

## 18. 根据 Eng Review 收敛后的实现决策

### 决策 A：保留 JSON 存储，在 Scene assembler 边界强校验

本阶段不修改 `WorkLine.config` 的持久化形状，也不把插件私有配置直接暴露给前端。后端新增 Definition 驱动的 typed adapter/validator：

- 合法的 `device_bindings`、`position_bindings` 进入 Scene v2。
- 未知键、重复值、错误类型或不存在的绑定目标标记为 `INVALID`，返回稳定诊断码。
- 适配器必须保留原始键和值的可核对信息，但不得把无法解析的值变成可用绑定。

升级触发器：当多个插件需要稳定读取同一组业务配置、或需要数据库级查询/索引时，再单独提出持久化 schema 迁移。

### 决策 B：孤儿绑定使用独立 `ORPHANED` 诊断

插件 Definition 删除或重命名角色后，历史 `config` 中的绑定不得消失。Scene v2 返回 `diagnostics.orphan_bindings[]`，页面在全线摘要和只读诊断入口中显示；不为孤儿绑定创建虚假资源行，也不把它归入 `UNBOUND` 或 `INVALID`。

### 决策 C：首版采用 15 秒轮询，不引入 SSE

页面可见时每 15 秒并行读取 Snapshot v2 与 Active Objects；失败按 15/30/60/120 秒退避，成功恢复 15 秒。手动刷新复用同一查询函数并重置退避，不触发任何业务或设备动作。只有性能或时效验收明确证明轮询不足时，才重新评估 SSE。

### 评审闭环

上述决策已反映到 T1–T9、状态矩阵、数据流和验收标准；外部 Eng Review 的 3 项待拍板决策关闭，方案可进入实现计划。后端 Scene/Snapshot/Active Object 合同仍是实现前置条件，前端不得绕过合同直接拼装运行数据。

## 19. 实施前复审（2026-09-15）

本轮对照当前后端源码、前端生成契约和最终视觉原型复核，重点检查“页面能否只按合同实现”，不把现有 v1 接口误当成 v2 能力。

### 复核证据

- `manual-picking/definition.py` 当前声明 4 个设备角色（`SCAN1`～`SCAN4`）和 5 个位置槽位（`FIVE_RACK`、`RETURN_RACK`、`TRANSFER_RACK`、`INLET`、`OUTLET`）；设备角色没有声明约束字段。
- WorkLine 当前以 JSON `config` 保存 `device_bindings` / `position_bindings`；启用校验要求 Definition 声明的设备角色和位置槽位全部完成绑定。
- 现有 `plane.scene.v1` 只返回通用节点，`plane.snapshot.v1` 的 `objects[]/extremes[]` 没有资源关联语义；`active-objects` 当前没有 `role_key/slot_key` 关联字段。
- 最终原型已标注“设计示例 · 模拟数据”和 v2 依赖，且没有 `R1/R2` 或未声明连线；它仍是交互示例，不可作为 v2 合同的静态兜底。

### 本轮发现与处理

| 级别    | 发现                                                         | 处理结果                                                      |
| ------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| BLOCKER | Scene 没有稳定版本标识，Snapshot/Active Objects 无法安全叠加 | §5.1/§5.3 增加 `scene_revision`，并纳入 T1–T3                 |
| MAJOR   | `resource_states` 只写 `role_key`，无法表达位置槽位          | 统一为带 `group + key` 的 `resource_ref`，纳入 T2–T4          |
| MAJOR   | 来源失败、空响应和真实零活动可能被渲染成同一个“0 · 无活动”   | §5.2、§7.1、§7.2、T2 和验收标准已区分 COMPLETE 零值与缺失来源 |
| MINOR   | Evidence 详情、权限审计和生成类型的实现边界未写死            | §5.1、§5.3、T1、T2、T4、T5、T8 已补齐复用与降级边界           |

### 评分与门禁

| 维度               | 评分   | 结论                                                             |
| ------------------ | ------ | ---------------------------------------------------------------- |
| 数据来源与领域边界 | 9/10   | WorkLine/Definition 与过程数据已分层，KT16 示例不反向定义拓扑    |
| API 合同可实现性   | 8/10   | v2 字段边界已明确，但 T1–T3 尚未落地，不能提前写前端假数据适配器 |
| 状态与失败语义     | 9/10   | `INVALID`、`ORPHANED`、版本不匹配、来源失败和真实零活动可区分    |
| 视觉与交互落地     | 8.5/10 | 原型可作为布局和交互参考，不能代替错误态和合同测试               |
| 测试与发布门禁     | 8/10   | 已覆盖合同、映射、轮询和响应式检查，仍需先冻结后端 v2 OpenAPI    |

**实施前结论：PLAN CLEARED；CODE START GATE = T1–T3。**

允许进入实现排期，但前端 T4–T7 的编码开始条件必须按以下顺序满足：

1. 后端冻结 `plane.scene.v2`、`plane.snapshot.v2`、`active-objects v2` 的 OpenAPI 与权限/审计行为。
2. 后端通过 `scene_revision` 一致性、`resource_ref` 映射、畸形/孤儿配置和 COMPLETE 零值语义测试。
3. 前端执行 `contract:freeze`、`generate:types`、`generate:zod`，再开始矩阵与上下文组件。

在上述门禁完成前，任何页面实现只能继续使用“设计示例 · 模拟数据”原型，不得接入 v1 并猜测资源关联。

## 20. 终审（对照最终原型与规格文档，2026-09-16）

复核对象：已批准的交互原型 `finalized.html`（approved_at 2026-09-15T07:37:49Z，`.gstack` 设计记录）与当前规格文档 §1–§19（含 Eng Review 收敛决策与实施前复审）。方法：直接读取 `finalized.html` 的样式、JS 状态机与示例数据，逐条核对是否已吸收 §18 决策 A/B/C 与 §19 的复核结论，而不是只看设计截图。

### 发现

1. **[MAJOR] 绑定状态组件只实现了 BOUND/UNBOUND 两态，没有 INVALID/ORPHANED 的视觉与文案。**
   `bindingBadge()` 的逻辑是 `bindingState === 'BOUND' ? '已绑定' : '未绑定'`，CSS 只定义了 `.binding-badge` 与 `.binding-badge.unbound` 两个样式，没有对应 `INVALID`/`ORPHANED` 的类。若照抄这个组件实现 T4，一旦 Scene v2 返回 `INVALID`，UI 会把它显示成"未绑定"，直接违反 §16 验收标准"`INVALID` 与 `ORPHANED` 绑定诊断可独立查看"。
   建议：T4 开工前把 `bindingBadge` 的二态判断换成三态映射（`BOUND`/`UNBOUND`/`INVALID`）并补一条 CSS，改动量很小，不需要重新设计组件。

2. **[MAJOR] WorkLine 摘要面板缺少"孤儿绑定"入口。**
   §6.3 明确摘要面板要展示"孤儿绑定数量；点击后进入只读配置诊断"，但 `summaryMarkup()` 的"配置状态 · 模拟 Scene"区块只有"未绑定"和"未映射对象"两项，没有孤儿绑定统计或诊断入口。这是原型在批准（07:37）之后没有跟上 §18 决策 B 的直接证据。
   建议：补一行孤儿绑定占位（示例数据没有孤儿场景，可先用 0 值展示入口存在），给 T5 一个可复制的交互样例，而不是让实现者凭空设计。

3. **[MINOR，非阻塞，记录以避免重复劳动]** 原型已吸收了两处更早的反馈：header 不再显示会和"未绑定槽位"矛盾的"已启用"徽标，改成中性的"设计示例 · 模拟数据"；顶部时间戳从"截至 HH:mm:ss"改成"客户端演示时刻 · 非服务器生成时间"，不再暗示真实新鲜度。这两处与 §7.2/§16 的措辞要求一致，说明原型确实按早期反馈更新过一轮，只是没有覆盖到 §18 决策 B。

4. **[NOTE]** `DEVICE_ROLE` 资源的 `declaration` 字段仍是占位字符串 `'DEVICE_ROLE'` 而非真实约束，这与 §18 决策"`DEVICE_ROLE` 的 `declared_constraints` 首版允许为空"一致，不是缺陷，无需改动。

### 终审判定

- 规格文档（§1–§19）：CLEAR，可作为 T1–T9 的实现依据。
- 最终交互原型 `finalized.html`：CLEAR，但需要在 T4 启动前补齐发现 1、2（预计改动在 30 行以内，不涉及布局或交互重设计）。
- 二者一致性：除发现 1、2 外无其他矛盾；无 `R1`/`R2`、无推断拓扑、无伪造资源行，域边界符合 §3/§4。

**FINAL VERDICT：APPROVED WITH FOLLOW-UPS。T1–T3 后端合同工作可按 §19 门禁立即开始；T4/T5 前端编码在补齐发现 1、2 后开始，不阻塞 T1–T3。**
