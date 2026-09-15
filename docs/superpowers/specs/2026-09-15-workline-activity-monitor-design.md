# 工作线活动监控页面设计规格

日期：2026-09-15  
状态：设计已确认，等待用户审阅文档  
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
            ├── role_key / display_name / stable_order
            ├── declared constraints
            ├── binding
            │   ├── code / name / type
            │   └── enabled
            └── binding_state
```

`binding_state` 至少区分：

- `BOUND`：存在且通过配置校验。
- `UNBOUND`：Definition 声明但 WorkLine 未绑定。
- `INVALID`：存在绑定数据，但已失效或不符合 Definition。

Scene 不返回任务、货架、料箱、Transport 或 Evidence。

### 5.2 `plane.snapshot.v2`

Snapshot 与 Scene revision 绑定，只返回资源级摘要：

```text
PlaneSnapshotV2
├── schema_version = plane.snapshot.v2
├── scene_revision
├── generated_at
├── truncated / total_count
├── resource_states[]
│   ├── role_key
│   ├── active_object_count
│   └── highest_conflict_state
└── unmapped_object_count
```

Snapshot 不重复返回完整 Active Object，也不改变 Scene 的资源顺序和分组。

### 5.3 Active Objects

完整对象仍由 `active-objects` 提供，用于右侧上下文和底部台账。每个对象必须提供可选的资源关联键；没有关联键或关联无效时进入未映射集合。

资源关联键由后端投影明确产生，前端不得根据位置码、对象类型、业务步骤、任务顺序或历史活动猜测 `role_key/slot_key`。对象来源、位置摘要和 Evidence refs 只能展示响应中已返回的字段；没有详情查询合同的引用只显示为引用，不补写解析后的事实。

### 5.4 一致性保护

- Snapshot 的 `scene_revision` 与当前 Scene 不一致时停止资源状态叠加。
- Scene 仍可展示；Snapshot 与 Active Objects 进入“版本不匹配”状态。
- 截断结果必须显式返回 `truncated`，以及可用时的 `total_count`。
- 前端不得用已展示行数推断总数或“全部正常”。

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

头部只展示 WorkLine 静态身份和刷新可信度：

- WorkLine 编码与名称。
- 插件显示名、`plugin_key@plugin_version`。
- WorkLine 启用状态与运行模式。
- 最近成功刷新时间。
- 手动刷新按钮。刷新只读取数据，不触发任何业务或设备动作。

### 6.2 双分组资源矩阵

主区域分为“位置槽位”和“设备角色”两个矩阵。每个资源占一行，字段固定对齐：

| 字段     | 来源              | 规则                          |
| -------- | ----------------- | ----------------------------- |
| 角色     | Plugin Definition | 显示稳定 `role_key`           |
| 名称     | Plugin Definition | 使用插件声明的 `display_name` |
| 实际绑定 | WorkLine          | 显示实际位置或设备编码        |
| 绑定状态 | Scene             | `BOUND / UNBOUND / INVALID`   |
| 活动摘要 | Snapshot          | 活动数量与最高冲突状态        |

资源行不因活动对象数量改变高度。活动对象不会嵌入资源行内展开。

### 6.3 右侧上下文

默认不自动选中资源。未选择时展示全线摘要：

- 资源总数、已绑定、未绑定、失效绑定数量。
- 活动对象总数与各冲突状态数量。
- 未映射对象数量。
- 最近成功刷新时间与当前数据新鲜度。
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

- 按冲突状态、对象类型、资源角色筛选。
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

| 区域                  | 加载中             | 空状态                      | 请求失败                 | 成功                     | 部分可用                     |
| --------------------- | ------------------ | --------------------------- | ------------------------ | ------------------------ | ---------------------------- |
| WorkLine / Definition | 标题保留，资源骨架 | 无声明资源时仅显示 WorkLine | 资源定义不可用           | 展示全部资源             | WorkLine 可用时保留基础信息  |
| 资源绑定              | 显示读取中         | 未绑定                      | 绑定信息不可用           | 显示实际编码             | 个别无效只影响对应资源       |
| Snapshot              | 静态资源保持可见   | 当前无活动                  | 首次失败显示状态不可用   | 展示摘要                 | 刷新失败保留旧快照并标记过期 |
| 右侧上下文            | WorkLine 摘要骨架  | 显示零活动                  | 静态摘要保留             | 默认全线、选择后资源详情 | 旧数据标记截至时间           |
| 对象台账              | 表头与行骨架       | 解释当前无活动              | 不解释为空数据           | 展示并筛选               | 截断时显示已展示范围         |
| 对象映射              | 暂不映射           | 不占主视觉                  | 保留对象身份             | 映射到角色或槽位         | 未映射对象独立展示           |
| Evidence              | 抽屉骨架           | 明确没有 Evidence           | 保留对象身份并可重试读取 | 展示来源与引用           | 逐来源标记失败               |

### 7.2 旧快照

刷新失败但存在最后成功快照时：

- 保留最后快照，整体降低强调度。
- 页面顶部持续显示“动态数据更新失败”。
- 每处动态状态显示“截至 HH:mm:ss”。
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

Scene 只在 WorkLine 版本或插件版本变化时重新读取。Snapshot 与 Active Objects 可按统一刷新周期读取，但各自保留独立的加载、错误和截断状态。

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
- 当前后端 `plane.scene.v1` 从 WorkLine 与 `pipeline_queues` 生成通用节点；`plane.snapshot.v1` 仍为空壳，不能直接支撑本设计。

## 15. 实现任务

- [ ] **T1（P1）后端 Scene 合同**：定义 `plane.scene.v2`，从 WorkLine 与 Installed Plugin Definition 组装资源分组、绑定和版本信息。
- [ ] **T2（P1）后端 Snapshot assembler**：定义 `plane.snapshot.v2`，按资源输出 Active Object 数量、最高冲突状态、未映射数量、时间与截断信息。
- [ ] **T3（P1）Active Object 关联**：为过程对象提供可选资源关联键，无法映射时保留身份并进入未映射集合。
- [ ] **T4（P2）前端资源矩阵**：实现位置槽位与设备角色双分组矩阵，以及静态绑定/动态过程双状态。
- [ ] **T5（P2）上下文与台账联动**：实现全线摘要、资源选择、对象筛选和只读 Evidence 详情。
- [ ] **T6（P2）可信状态覆盖**：实现加载、空、首次失败、旧快照、部分来源失败、截断和版本不匹配状态。
- [ ] **T7（P2）响应式与无障碍**：实现桌面分栏、窄屏抽屉、手机三列矩阵、焦点返回与键盘操作。
- [ ] **T8（P2）验证**：增加合同测试、Scene/Snapshot 一致性测试、资源映射测试、组件状态测试与响应式人工截图检查。

## 16. 验收标准

- 页面结构完全由 WorkLine 与 Plugin Definition 生成。
- 设计示例明确标注模拟数据、未来合同和配置草稿状态；不把静态 fixture 展示成实时 KT16。
- 换成另一个插件时，页面不需要新增插件专用 Vue 模板。
- 过程对象数量变化不会改变资源结构和资源行高度。
- 页面不存在 `R1 / R2` 或其他未声明领域角色。
- Definition 未定义连线时，页面不绘制连线。
- 未绑定、过程异常、旧快照、请求失败、截断和未映射状态可被明确区分。
- Scene/Snapshot 版本不匹配时不会错误叠加。
- 没有 `generated_at` 或 `scene_revision` 时不显示“截至”“快照有效”等实时可信度文案。
- 所有详情保持只读，不提供业务或设备动作。
- 桌面、平板与手机布局均能完成资源选择和对象详情查看。

## GSTACK REVIEW REPORT

| Review        | Trigger               |                       Why | Runs | Status   | Findings                            |
| ------------- | --------------------- | ------------------------: | ---: | -------- | ----------------------------------- |
| CEO Review    | `/plan-ceo-review`    |          Scope & strategy |    0 | —        | 未运行                              |
| Codex Review  | `/codex review`       |   Independent 2nd opinion |    0 | —        | 未运行                              |
| Eng Review    | `/plan-eng-review`    |      Architecture & tests |    0 | REQUIRED | 新增 Scene/Snapshot v2 需要工程评审 |
| Design Review | `/plan-design-review` |                UI/UX gaps |    1 | CLEAR    | 4/10 → 10/10，9 项设计决定          |
| DX Review     | `/plan-devex-review`  | Developer experience gaps |    0 | —        | 未运行                              |

**VERDICT:** DESIGN CLEARED；进入实现计划前需要 Eng Review。

NO UNRESOLVED DECISIONS
