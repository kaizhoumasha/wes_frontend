# 日志中心重构设计

> 日期：2026-04-13
> 范围：审计日志、API 访问日志
> 目标：在现有前端列表/详情能力基础上，按使用场景重构日志中心；审计日志以“审计合规优先”为目标，API 访问日志以“排障定位优先”为目标。

## 1. 背景

当前前端已经落地“日志中心”一期基础能力：

- 独立页面：
  - 审计日志
  - API 访问日志
- 均支持：
  - 只读列表
  - 详情抽屉
  - 智能搜索
  - 列表/详情中的页内快速筛选
  - 默认按时间倒序请求后端
- 当前默认行为：
  - 审计日志：按 `opera_time desc`
  - API 访问日志：按 `created_at desc`
  - “最近 24 小时”不再作为默认硬过滤条件，而是作为智能搜索中的快速查询条件

这套基础能力已经可用，但它仍然更接近“通用 CRUD 列表”，而不是围绕日志使用场景设计的专用工作台。

用户已经明确下一阶段方向：

- 审计日志：`审计合规优先`
- API 访问日志：`排障定位优先`
- Phase 1 优先解决可用性
- 保留智能搜索
- 同时增加页面顶部可见的任务型筛选入口
- 快速查询条件可以放入智能搜索框的下拉 Popover 内，不需要取消智能搜索工具栏

## 2. 事实基线

以下结论来自当前前后端代码，不基于推测。

### 2.1 审计日志后端现状

后端模型 `../wes_backend/src/app/sys/models/audit_log.py` 当前显式字段为：

- `trace_id`
- `username`
- `method`
- `title`
- `path`
- `ip`
- `country`
- `region`
- `city`
- `user_agent`
- `os`
- `browser`
- `device`
- `args`
- `status`
- `code`
- `msg`
- `cost_time`
- `opera_time`

响应 schema `AuditLogResponse` 当前仅为 `AuditLogBase + id`，没有显式的：

- `object_type`
- `action`
- `object_id`
- `change_summary`
- `before_data`
- `after_data`

审计日志写入链路事实：

- `../wes_backend/src/database/audit/hook_registrar.py`
  - Repository Hook 在创建/更新/删除后写入审计日志
  - `cost_time` 以秒为单位计算
- `../wes_backend/src/app/sys/services/audit_service.py`
  - `args` 当前已经承载高价值审计信息
  - Repository 操作日志会写入：
    - `model`
    - `operation`
    - `record_id`
    - `changes`

这意味着：`args` 不是无意义噪声，它已经是当前审计证据的重要载体。

### 2.2 API 访问日志后端现状

后端模型 `../wes_backend/src/app/api_auth/models/api_access_log.py` 当前显式字段为：

- `app_id`
- `app_name`
- `request_id`
- `method`
- `path`
- `status_code`
- `response_time_ms`
- `ip_address`
- `user_agent`
- `error_message`

响应 schema `APIAccessLogResponse` 当前仅为 `APIAccessLogBase + id`，没有显式返回：

- `created_at`
- `updated_at`
- `trace_id`
- `correlation_id`
- `route_template`
- `error_type`

### 2.3 时间戳与查询能力事实

两类日志模型都继承 `DataTableMixin`，而 `DataTableMixin` 又继承 `TimestampMixin`，因此数据库模型层都具备：

- `created_at`
- `updated_at`

但“数据库模型存在字段”不等于“接口响应已经返回字段”。

查询链路事实：

- `BaseAPI._register_list`
- `service`
- `BaseRepository.get_list`
- `QueryBuilder`

排序和过滤使用的是数据库模型属性，而不是响应 schema 字段集合。因此：

- 像 `created_at` 这类字段，即使当前没有在响应体显式暴露，也仍然可以被后端查询构建器用于过滤/排序
- 这解释了为什么前端现在可以用 `created_at desc` 作为 API 访问日志默认排序

### 2.4 当前索引事实

从模型定义可直接确认：

- 审计日志：
  - `trace_id` 有索引
  - `username` 有索引
  - `opera_time` 有索引
- API 访问日志：
  - `(app_id, created_at)` 复合索引
  - `(status_code, created_at)` 复合索引
  - `(path, created_at)` 复合索引
  - 未看到 `request_id` 的显式索引定义

## 3. 第一性原理下的优化方向

日志页面的价值不在“把字段列出来”，而在于让用户更快完成其核心任务。

### 3.1 审计日志的核心任务

审计日志首先服务于：

- 追责
- 合规留痕
- 操作还原
- 证据导出

因此它最重要的问题不是“这一条请求慢不慢”，而是：

- 谁做的
- 何时做的
- 对什么对象做的
- 做了什么动作
- 成功还是失败
- 改了哪些关键内容
- 原始证据在哪里

这决定了审计日志不能长期依赖用户展开 JSON 自行理解 `args`。高频审计维度必须被提升为稳定字段，用于列表显示、过滤、排序、导出和索引。

### 3.2 API 访问日志的核心任务

API 访问日志首先服务于：

- 失败请求排查
- 慢请求定位
- 某应用调用行为分析
- 某一次请求的上下文回放

因此它最重要的问题不是“这是不是一次合规操作”，而是：

- 什么时候发生的
- 哪个应用发起的
- 请求路径和方法是什么
- 状态码是什么
- 耗时是否异常
- 错误信息是什么
- 是否能快速定位到同一条请求

这决定了 API 访问日志应优先围绕“时间、应用、状态、耗时、请求 ID、路径”组织界面，而不是堆更多审计语义字段。

## 4. Phase 1 产品目标

Phase 1 只做高收益改造，不把范围扩展成完整可观测平台。

### 4.1 总体目标

- 保留现有两张独立页面，不合并为单一“全日志大盘”
- 保留智能搜索
- 在智能搜索 Popover 中补充快速查询项
- 在页面顶部增加可见的任务型筛选入口
- 默认不增加“最近 24 小时”硬过滤，避免用户误以为历史数据不存在
- 默认按时间倒序加载最近数据，提高首屏可用性
- 列表列设计、详情结构、默认筛选入口都围绕页面目标重排

### 4.2 非目标

Phase 1 明确不包含：

- 不做跨页面日志关联跳转
- 不做 URL 查询参数同步
- 不做链路追踪系统
- 不做指标图表大盘
- 不做统一全文检索引擎

## 5. 交互总设计

两类日志页面都采用“显式任务入口 + 智能搜索深筛选”的混合模型。

### 5.1 页面顶部显式任务入口

顶部工具栏用于承载高频、低学习成本操作，用户不必先打开搜索弹层。

入口形态建议：

- 时间范围快捷项
- 状态快捷项
- 场景快捷项
- 重置条件

### 5.2 智能搜索 Popover

智能搜索不取消，而是承担两类职责：

- 复杂组合条件输入
- 快速查询模板承载

这意味着 Popover 内应支持：

- 预置快速查询项
- 常用字段的默认操作符
- 对数值、时间、文本字段提供匹配的操作符集合

## 6. 审计日志设计

### 6.1 页面定位

页面定位：面向审计、复盘、追责场景的“证据优先”操作日志工作台。

### 6.2 顶部任务型入口

顶部直接提供以下快捷入口：

- 最近 24 小时
- 最近 7 天
- 仅失败操作
- 指定用户
- 指定对象类型
- 指定操作动作

其中：

- “最近 24 小时”“最近 7 天”也同步作为智能搜索 Popover 的快速查询项
- 用户、对象类型、操作动作是审计高频维度，应作为显式入口保留

### 6.3 列表信息架构

列表优先展示以下信息：

- 操作时间 `opera_time`
- 操作状态 `status`
- 操作用户 `username`
- 操作动作 `action`
- 对象类型 `object_type`
- 对象标识 `object_id`
- 操作名称 `title`
- 请求路径 `path`
- 耗时 `cost_time`
- 链路 ID `trace_id`

说明：

- `title` 保留，因为它是当前已有稳定字段
- `args` 不适合作为列表主列；它应在详情中作为原始证据展示
- `change_summary` 若后端提供，可替换或补充 `title` 成为更强的列表摘要字段

### 6.4 详情信息架构

详情分为三层：

1. 操作摘要
   - `opera_time`
   - `status`
   - `username`
   - `action`
   - `object_type`
   - `object_id`
   - `title`
   - `path`
   - `method`
   - `trace_id`
2. 变更内容
   - `change_summary`
   - `args.changes`
3. 原始证据
   - `args`
   - `msg`
   - `ip`
   - `country/region/city`
   - `user_agent`
   - `os/browser/device`

### 6.5 审计日志后端必需配合项

为实现“审计合规优先”，后端应补齐稳定审计维度，而不是继续只把它们埋在 JSON 里。

必需项：

- 新增并返回稳定字段：
  - `object_type`
  - `action`
  - `object_id`
  - `change_summary`
- 写入规则：
  - `object_type` 优先取 `args.model`
  - `action` 优先取 `args.operation`
  - `object_id` 优先取 `args.record_id`
  - `change_summary` 由后端基于当前 `changes` 生成简明摘要，用于列表快速阅读
- 保留 `args` 原样返回，不因字段提升而删除原始 JSON
- 明确 `cost_time` 的单位为“秒”，并在接口契约/字段说明中固定下来

为什么必须持久化为稳定字段，而不是只做前端解析：

- 审计筛选必须稳定、可索引、可导出
- 审计页面不能把核心检索能力建立在前端运行时解析 JSON 上
- 只在前端解析会导致排序、分页、导出、权限控制都失去一致性

### 6.6 审计日志后端建议配合项

建议项：

- 为 `object_type`、`action`、`status` 评估新增与 `opera_time` 组合的索引
- 为 `AuditLogResponse` 提供明确字段注释，避免前端再次误判单位或语义

### 6.7 审计日志智能搜索快速项

Popover 内建议提供：

- 最近 24 小时
- 最近 7 天
- 仅成功操作
- 仅失败操作
- 按用户筛选
- 按对象类型筛选
- 按动作筛选
- 按链路 ID 精确筛选

## 7. API 访问日志设计

### 7.1 页面定位

页面定位：面向排障、慢请求分析、失败请求定位的 API 调用工作台。

### 7.2 顶部任务型入口

顶部直接提供以下快捷入口：

- 最近 15 分钟
- 最近 1 小时
- 最近 24 小时
- 仅失败请求
- 仅 5xx
- 慢请求

其中“慢请求”建议至少提供两档：

- `response_time_ms >= 1000`
- `response_time_ms >= 3000`

### 7.3 列表信息架构

列表优先展示以下信息：

- 访问时间 `created_at`
- 应用名称 `app_name`
- 请求 ID `request_id`
- 请求方法 `method`
- 请求路径 `path`
- 状态码 `status_code`
- 响应耗时 `response_time_ms`
- 客户端 IP `ip_address`
- 错误信息摘要 `error_message`

说明：

- 目前前端能够基于 `created_at` 排序和筛选，但接口响应没有显式返回该字段
- 对排障场景来说，“访问时间”必须是用户可见字段，不能只作为隐藏查询字段存在

### 7.4 详情信息架构

详情优先展示：

- `created_at`
- `app_name`
- `app_id`
- `request_id`
- `method`
- `path`
- `status_code`
- `response_time_ms`
- `ip_address`
- `error_message`
- `user_agent`

### 7.5 API 访问日志后端必需配合项

Phase 1 的后端最小改动应聚焦在“把已有关键上下文显式暴露给前端”。

必需项：

- 在 `APIAccessLogResponse` 中显式返回 `created_at`

原因：

- 当前页面已经按 `created_at` 倒序请求
- 排障时必须在列表和详情中直观看到访问时间
- 仅可排序/可过滤但不可见，会让用户无法解释结果顺序

### 7.6 API 访问日志后端建议配合项

建议项：

- 为 `created_at` 添加明确字段注释，前端统一展示为“访问时间”
- 评估是否需要在响应中返回 `updated_at`；如果无业务价值，可继续不暴露
- 评估是否为 `request_id` 增加索引；排障场景下它是高频精确定位键

### 7.7 API 访问日志智能搜索快速项

Popover 内建议提供：

- 最近 15 分钟
- 最近 1 小时
- 最近 24 小时
- 仅失败请求
- 仅 5xx
- 慢请求 >= 1 s
- 慢请求 >= 3 s
- 按应用筛选
- 按请求 ID 精确筛选
- 按路径筛选
- 按客户端 IP 筛选

## 8. Phase 2 可选增强

以下增强有价值，但不建议混入 Phase 1。

### 8.1 审计日志

- 审计导出模板
- 风险等级或敏感操作标签
- 面向合规人员的固定视图

### 8.2 API 访问日志

当前模型里不存在以下字段，若后端后续愿意增强，可作为 Phase 2 候选：

- `trace_id` 或 `correlation_id`
- 路由模板字段，例如 `/api/users/{id}`
- 更结构化的错误分类字段，例如 `error_type`

这些能力会显著提升故障归因效率，但它们不是当前模型已具备的事实能力，因此不纳入 Phase 1 必需项。

## 9. 实施顺序建议

建议顺序：

1. 后端先补齐审计日志稳定字段与 API 访问日志 `created_at` 响应字段
2. 前端再按本设计重排两页的信息架构与顶部任务型工具栏
3. 最后补齐智能搜索 Popover 内的快速查询项与默认模板

这样做的原因：

- 审计日志列表列设计高度依赖 `object_type`、`action`、`object_id`
- API 访问日志时间列需要后端先稳定输出
- 先固化契约，再做页面交互，返工最少

## 10. 交付判断标准

满足以下条件，即可认为 Phase 1 达标：

- 审计日志页面能直接按“谁、何时、对什么对象、做了什么”定位记录
- 审计日志详情既能看结构化摘要，也能看原始 `args`
- API 访问日志页面能直接按“什么时候、哪个应用、哪条请求、失败还是慢”定位问题
- 智能搜索仍然保留，且其 Popover 内包含快速查询项
- 页面顶部存在显式任务入口，常见查询不必先打开智能搜索
- 默认只做时间倒序，不做隐藏时间硬过滤
