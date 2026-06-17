# 日志中心后端需求变更说明书

> 日期：2026-04-14
> 范围：审计日志、API 访问日志
> 优先级：P1（配合前端 Phase 2 实施）

---

## 1. 背景与目标

### 1.1 背景

前端日志中心已完成 Phase 1 改造：

- Toolbar 精简为异常定位入口
- 时间粒度筛选移入智能搜索 Popover
- 统计卡片已用简化版实现（基于当前页数据估算）

### 1.2 目标

为支持前端 Phase 2 完整功能，后端需提供：

1. 高效的聚合统计接口（替代前端估算）
2. 专用的异常查询接口（支持实时最近异常）
3. 慢请求分析接口（支持性能分析）

---

## 2. 接口需求清单

### 2.1 审计日志统计接口

#### 接口定义

```
GET /api/v1/sys/audit-logs/stats
```

#### 请求参数

| 参数       | 类型     | 必填 | 说明                                         |
| ---------- | -------- | ---- | -------------------------------------------- |
| time_range | string   | 否   | 时间范围：1h, 4h, 24h, today, 7d，默认 today |
| start_time | datetime | 否   | 自定义开始时间（与 time_range 二选一）       |
| end_time   | datetime | 否   | 自定义结束时间（与 time_range 二选一）       |

#### 响应 Schema

```typescript
interface AuditLogStatsResponse {
  // 时间范围
  time_range: {
    start: string // ISO 8601
    end: string // ISO 8601
  }

  // 总体统计
  total: number // 总操作数
  success: number // 成功数
  fail: number // 失败数

  // 分类统计
  by_action: Array<{
    action: string
    count: number
    success: number
    fail: number
  }>

  by_object_type: Array<{
    object_type: string
    count: number
    success: number
    fail: number
  }>

  // 趋势（按小时）
  hourly_trend: Array<{
    hour: string // "2026-04-14 10:00"
    count: number
    success: number
    fail: number
  }>

  // 最近异常（前 5 条）
  recent_failures: AuditLogResponse[]
}
```

#### 性能要求

- 响应时间：< 500ms（今日数据量 10 万条）
- 支持缓存：建议 Redis 缓存 30 秒

---

### 2.2 API 访问日志统计接口

#### 接口定义

```
GET /api/v1/api_auth/access-log/stats
```

#### 请求参数

| 参数       | 类型     | 必填 | 说明                                         |
| ---------- | -------- | ---- | -------------------------------------------- |
| time_range | string   | 否   | 时间范围：1h, 4h, 24h, today, 7d，默认 today |
| start_time | datetime | 否   | 自定义开始时间                               |
| end_time   | datetime | 否   | 自定义结束时间                               |

#### 响应 Schema

```typescript
interface APIAccessLogStatsResponse {
  // 时间范围
  time_range: {
    start: string
    end: string
  }

  // 总体统计
  total: number // 总请求数
  success_2xx: number // 2xx 成功
  client_error_4xx: number // 4xx 错误
  server_error_5xx: number // 5xx 错误

  // 慢请求统计
  slow_requests: {
    total: number // 慢请求总数（>= 1s）
    by_threshold: Array<{
      threshold_ms: number // 1000, 3000, 5000
      count: number
    }>
  }

  // 性能指标
  performance: {
    avg_response_time_ms: number
    p50_response_time_ms: number
    p95_response_time_ms: number
    p99_response_time_ms: number
  }

  // 按应用统计
  by_app: Array<{
    app_id: string
    app_name: string
    count: number
    error_5xx: number
    avg_response_time_ms: number
  }>

  // 按路径统计（TOP 10）
  by_path: Array<{
    path: string
    method: string
    count: number
    error_5xx: number
    avg_response_time_ms: number
  }>

  // 最近异常（前 5 条 5xx）
  recent_5xx: APIAccessLogResponse[]

  // 最近慢请求（前 5 条）
  recent_slow: APIAccessLogResponse[]
}
```

#### 性能要求

- 响应时间：< 500ms（今日数据量 15 万条）
- 支持缓存：建议 Redis 缓存 30 秒

---

### 2.3 最近异常查询接口（审计日志）

#### 接口定义

```
GET /api/v1/sys/audit-logs/recent-anomalies
```

#### 请求参数

| 参数  | 类型    | 必填 | 说明                      |
| ----- | ------- | ---- | ------------------------- |
| limit | integer | 否   | 返回条数，默认 5，最大 20 |
| hours | integer | 否   | 查询最近 N 小时，默认 24  |

#### 响应 Schema

```typescript
interface RecentAnomaliesResponse {
  items: AuditLogResponse[]
  total: number // 满足条件的总数
}
```

#### 性能要求

- 响应时间：< 200ms
- 查询优化：需确保 `status` + `opera_time` 复合索引生效

---

### 2.4 最近异常查询接口（API 访问日志）

#### 接口定义

```
GET /api/v1/api_auth/access-log/recent-anomalies
```

#### 请求参数

| 参数  | 类型    | 必填 | 说明                               |
| ----- | ------- | ---- | ---------------------------------- |
| limit | integer | 否   | 返回条数，默认 5，最大 20          |
| hours | integer | 否   | 查询最近 N 小时，默认 24           |
| type  | string  | 否   | 异常类型：5xx, slow, all，默认 all |

#### 响应 Schema

```typescript
interface RecentAPIAnomaliesResponse {
  items: APIAccessLogResponse[]
  total: {
    '5xx': number
    slow: number
    all: number
  }
}
```

#### 性能要求

- 响应时间：< 200ms
- 查询优化：需确保 `status_code` + `created_at` 复合索引生效

---

### 2.5 慢请求分析接口（API 访问日志）

#### 接口定义

```
GET /api/v1/api_auth/access-log/slow-analysis
```

#### 请求参数

| 参数         | 类型    | 必填 | 说明                  |
| ------------ | ------- | ---- | --------------------- |
| time_range   | string  | 否   | 时间范围，默认 today  |
| threshold_ms | integer | 否   | 慢请求阈值，默认 1000 |
| limit        | integer | 否   | TOP N 条，默认 10     |

#### 响应 Schema

```typescript
interface SlowAnalysisResponse {
  // 总体统计
  total_slow: number
  percentage: number // 占总请求百分比

  // 按应用分布
  by_app: Array<{
    app_id: string
    app_name: string
    count: number
    avg_time_ms: number
    max_time_ms: number
  }>

  // 按路径分布（TOP N）
  by_path: Array<{
    path: string
    method: string
    count: number
    avg_time_ms: number
    max_time_ms: number
    p95_time_ms: number
  }>

  // 时间分布（按小时）
  hourly_distribution: Array<{
    hour: string
    count: number
  }>

  // 慢请求列表（TOP N）
  top_slow_requests: APIAccessLogResponse[]
}
```

---

## 3. 数据库索引建议

### 3.1 审计日志表

```sql
-- 已有索引（确认）
CREATE INDEX idx_audit_log_opera_time ON audit_log(opera_time DESC);
CREATE INDEX idx_audit_log_username ON audit_log(username);
CREATE INDEX idx_audit_log_trace_id ON audit_log(trace_id);

-- 建议新增索引
CREATE INDEX idx_audit_log_status_time ON audit_log(status, opera_time DESC);
CREATE INDEX idx_audit_log_action_time ON audit_log(action, opera_time DESC);
CREATE INDEX idx_audit_log_object_time ON audit_log(object_type, opera_time DESC);
```

### 3.2 API 访问日志表

```sql
-- 已有索引（确认）
CREATE INDEX idx_api_access_app_created ON api_access_log(app_id, created_at DESC);
CREATE INDEX idx_api_access_status_created ON api_access_log(status_code, created_at DESC);
CREATE INDEX idx_api_access_path_created ON api_access_log(path, created_at DESC);

-- 建议新增索引
CREATE INDEX idx_api_access_time_status ON api_access_log(created_at DESC, status_code);
CREATE INDEX idx_api_access_slow ON api_access_log(response_time_ms DESC, created_at DESC)
  WHERE response_time_ms >= 1000;
```

---

## 4. 缓存策略建议

### 4.1 统计接口缓存

```python
# 建议缓存键
"audit_log_stats:{time_range}:{date}"
"api_access_log_stats:{time_range}:{date}"

# 缓存时间
TTL = 30 秒  # 平衡实时性与性能
```

### 4.2 缓存失效策略

- 新日志写入时：延迟 10 秒后异步刷新缓存
- 手动刷新：支持 `?refresh=1` 强制跳过缓存

---

## 5. 实施顺序建议

| 顺序 | 接口                     | 优先级 | 前端依赖       |
| ---- | ------------------------ | ------ | -------------- |
| 1    | 审计日志统计接口         | P0     | 统计卡片完整版 |
| 2    | API 访问日志统计接口     | P0     | 统计卡片完整版 |
| 3    | 最近异常查询接口（审计） | P1     | 最近异常列表   |
| 4    | 最近异常查询接口（API）  | P1     | 最近异常列表   |
| 5    | 慢请求分析接口           | P2     | 慢请求分析抽屉 |

---

## 6. 验收标准

状态同步 2026-06-08：已核对前后端实现，当前仅有审计日志和 API 访问日志的只读 CRUD、前端列表页、基础权限和模型测试。未发现本需求要求的统计接口、最近异常接口、慢请求分析接口、专项性能验收或对应 OpenAPI/权限契约，因此以下验收项保持未完成。
状态同步 2026-06-15：再次核对 `src/api/generated/openapi-types.ts`、`src/api/modules/sys.ts`、`src/api/modules/apiAuth.ts`、前端日志页和 `../wes_backend/src/app/sys` / `../wes_backend/src/app/api_auth`，仍只发现 `/audit-logs/query`、`/audit-logs/{id}`、`/access-log/query`、`/access-log/{id}` 等只读 CRUD；未发现 `/stats`、`/recent-anomalies`、`/slow-analysis` 或对应专项性能/契约测试，验收项继续保持未完成。
状态同步 2026-06-15 后端近期变更复核：`../wes_backend` 近期 workline/runtime 变更未补齐日志中心专项接口；`../wes_backend/src/app/sys/v1/audit_log.py` 与 `../wes_backend/src/app/api_auth/v1/api_access_log.py` 仍由 `BaseAPI` 生成只读 CRUD。因此本需求仍有效且未完成，不应归档。

### 6.1 功能验收

- [ ] 审计日志统计接口返回正确聚合数据
- [ ] API 访问日志统计接口返回正确聚合数据
- [ ] 最近异常接口返回最近 N 条异常记录
- [ ] 慢请求分析接口返回正确分析数据

### 6.2 性能验收

- [ ] 统计接口响应时间 < 500ms（10万条数据量）
- [ ] 最近异常接口响应时间 < 200ms
- [ ] 慢请求分析接口响应时间 < 500ms

### 6.3 契约验收

- [ ] OpenAPI 文档已更新
- [ ] 前端类型已重新生成
- [ ] 接口权限已配置

---

## 7. 附录：前端调用示例

### 7.1 获取今日审计统计

```typescript
const stats = await sysApi.getStats({ time_range: 'today' })
console.log(stats.total) // 1245
console.log(stats.fail) // 5
console.log(stats.recent_failures) // 最近 5 条失败记录
```

### 7.2 获取今日 API 统计

```typescript
const stats = await apiAuthApi.getAccessLogStats({ time_range: 'today' })
console.log(stats.total) // 156789
console.log(stats.server_error_5xx) // 23
console.log(stats.performance.p99_response_time_ms) // 1200
```

### 7.3 获取最近异常

```typescript
const anomalies = await apiAuthApi.getRecentAnomalies({
  limit: 5,
  hours: 1,
  type: '5xx'
})
```

---

**文档版本**：v1.0
**编写日期**：2026-04-14
**前端对接人**：待填写
**后端负责人**：待填写
**预计完成时间**：待评估

状态同步 2026-06-08：负责人和排期仍未在文档中确认。
