/**
 * Zod Validation Schemas
 *
 * 此文件由 scripts/generate-zod-from-openapi.ts 自动生成
 * 从后端 FastAPI OpenAPI schema 提取验证规则
 *
 * ⚠️ 请勿手动编辑此文件
 * 如需自定义验证规则，请修改 src/types/zod-extensions.ts
 *
 * 生成时间: 2026-03-19T06:49:42.614Z
 */

import { z } from 'zod'


export const APIAccessLogResponseSchema = z.object({
  /** App Id */
  app_id: z.string().max(50),
  /** App Name */
  app_name: z.string().max(100),
  /** Request Id */
  request_id: z.string().max(50),
  /** Method */
  method: z.string().max(10),
  /** Path */
  path: z.string().max(500),
  /** Status Code */
  status_code: z.number(),
  /** Response Time Ms */
  response_time_ms: z.number(),
  /** Ip Address */
  ip_address: z.string().max(50),
  /** User Agent */
  user_agent: z.union([z.string().max(500), z.null()]).optional(),
  /** Error Message */
  error_message: z.union([z.string().max(1000), z.null()]).optional(),
  /** Id */
  id: z.number(),
})


export const APIApplicationCreateSchema = z.object({
  /** App Name */
  app_name: z.string().max(100),
  /** 应用类型 */
  app_type: z.lazy(() => AppTypeSchema).optional().default("ECS"),
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Ip Whitelist */
  ip_whitelist: z.union([z.array(z.string()), z.null()]).optional(),
  /** Rate Limit Per Minute */
  rate_limit_per_minute: z.number().min(1).max(10000).optional().default(100),
  /** Rate Limit Per Hour */
  rate_limit_per_hour: z.number().min(1).max(1000000).optional().default(5000),
  /** 有效期时长 */
  validity_period: z.lazy(() => ValidityPeriodSchema).optional().default("1y"),
})


export const APIApplicationResponseSchema = z.object({
  /** Version */
  version: z.number().optional().default(0),
  /** Created At */
  created_at: z.string().datetime().optional(),
  /** Updated At */
  updated_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Id */
  id: z.union([z.number(), z.null()]).optional(),
  /** Deleted By */
  deleted_by: z.union([z.number(), z.null()]).optional(),
  /** Deleted At */
  deleted_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Is Deleted */
  is_deleted: z.boolean().optional().default(false),
  /** Created By */
  created_by: z.union([z.number(), z.null()]).optional(),
  /** Updated By */
  updated_by: z.union([z.number(), z.null()]).optional(),
  /** App Name */
  app_name: z.string().max(100),
  /** 应用类型 */
  app_type: z.lazy(() => AppTypeSchema).optional().default("ECS"),
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Ip Whitelist */
  ip_whitelist: z.union([z.array(z.string()), z.null()]).optional(),
  /** Rate Limit Per Minute */
  rate_limit_per_minute: z.number().min(1).max(10000).optional().default(100),
  /** Rate Limit Per Hour */
  rate_limit_per_hour: z.number().min(1).max(1000000).optional().default(5000),
  /** 有效期时长 */
  validity_period: z.lazy(() => ValidityPeriodSchema).optional().default("1y"),
  /** App Id */
  app_id: z.string(),
  status: z.lazy(() => AppStatusSchema).optional().default("active"),
  /** Expires At */
  expires_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Remaining Days */
  remaining_days: z.union([z.number(), z.null()]),
})


export const APIApplicationUpdateSchema = z.object({
  /** App Name */
  app_name: z.union([z.string().max(100), z.null()]).optional(),
  /** 应用类型 */
  app_type: z.union([z.lazy(() => AppTypeSchema), z.null()]).optional(),
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Ip Whitelist */
  ip_whitelist: z.union([z.array(z.string()), z.null()]).optional(),
  /** Rate Limit Per Minute */
  rate_limit_per_minute: z.union([z.number().min(1).max(10000), z.null()]).optional(),
  /** Rate Limit Per Hour */
  rate_limit_per_hour: z.union([z.number().min(1).max(1000000), z.null()]).optional(),
  /** 有效期时长 */
  validity_period: z.union([z.lazy(() => ValidityPeriodSchema), z.null()]).optional(),
  /** Version */
  version: z.number(),
})


/**
 * 活跃会话列表响应 Schema

包含用户所有活跃会话
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ActiveSessionsResponseSchema = z.object({
  /** Total */
  total: z.number(),
  /** Sessions */
  sessions: z.array(z.lazy(() => SessionInfoSchema)),
})


/**
 * API 权限信息 Schema

描述单个 API 权限的详细信息
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ApiPermissionInfoSchema = z.object({
  /** Id */
  id: z.number(),
  /** Name */
  name: z.string(),
  /** Description */
  description: z.union([z.string(), z.null()]).optional(),
  /** Type */
  type: z.string(),
  /** Category */
  category: z.union([z.string(), z.null()]).optional(),
  /** Resource */
  resource: z.union([z.string(), z.null()]).optional(),
  /** Action */
  action: z.union([z.string(), z.null()]).optional(),
  /** Method */
  method: z.union([z.string(), z.null()]).optional(),
  /** Path */
  path: z.union([z.string(), z.null()]).optional(),
})


export const AppStatusSchema = z.enum(["active", "revoked", "expired"])


export const AppTypeSchema = z.enum(["ECS", "RCS", "WMS", "Third-Party"])


/**
 * AuditLog 响应 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const AuditLogResponseSchema = z.object({
  /** Trace Id */
  trace_id: z.string().max(64),
  /** Username */
  username: z.union([z.string().max(32), z.null()]).optional(),
  /** Method */
  method: z.string().max(10),
  /** Title */
  title: z.string().max(100),
  /** Path */
  path: z.string().max(200),
  /** Ip */
  ip: z.string().max(64),
  /** Country */
  country: z.union([z.string().max(64), z.null()]).optional(),
  /** Region */
  region: z.union([z.string().max(64), z.null()]).optional(),
  /** City */
  city: z.union([z.string().max(64), z.null()]).optional(),
  /** User Agent */
  user_agent: z.string().max(500),
  /** Os */
  os: z.union([z.string().max(64), z.null()]).optional(),
  /** Browser */
  browser: z.union([z.string().max(64), z.null()]).optional(),
  /** Device */
  device: z.union([z.string().max(64), z.null()]).optional(),
  /** Args */
  args: z.union([z.record(z.any()), z.null()]).optional(),
  /** 操作状态 */
  status: z.lazy(() => OperaStatusSchema).optional().default("SUCCESS"),
  /** Code */
  code: z.string().max(20),
  /** Msg */
  msg: z.union([z.string(), z.null()]).optional(),
  /** Cost Time */
  cost_time: z.number().min(0),
  /** Opera Time */
  opera_time: z.string().datetime().optional(),
  /** Id */
  id: z.number(),
})


/**
 * 当前登录用户上下文响应 Schema

一次性返回前端初始化所需核心数据：
- 当前用户信息
- API 权限列表
- 菜单树
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const AuthMyResponseSchema = z.object({
  /** 当前用户信息 */
  user: z.lazy(() => UserResponseSchema),
  /** Permissions */
  permissions: z.array(z.lazy(() => ApiPermissionInfoSchema)),
  /** Menus */
  menus: z.array(z.lazy(() => MenuTreeResponseSchema)),
})


/**
 * 批量操作响应模型

专门用于批量操作的响应模型。

Example:
    ```python
    @router.post('/users/batch', response_model=BatchOperationResponseModel)
    def batch_create_users(users: List[UserCreate]) -> BatchOperationResponseModel:
        result = process_batch_create(users)
        return BatchOperationResponseModel(
            code=SuccessCode.CREATED,
            data=result
        )
    ```
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const BatchOperationResponseModelSchema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => BatchOperationResultSchema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


/**
 * 批量操作结果模型

用于批量操作（如批量创建、批量更新、批量删除）的响应数据。

Attributes:
    success: 成功数量
    failed: 失败数量
    total: 总数量
    results: 详细结果列表（可选）
    errors: 错误信息列表（可选）

Example:
    ```python
    result = BatchOperationResult(
        success=8,
        failed=2,
        total=10,
        errors=[
            {"index": 3, "message": "参数错误"},
            {"index": 7, "message": "权限不足"}
        ]
    )
    ```
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const BatchOperationResultSchema = z.object({
  /** Success */
  success: z.number().min(0).optional().default(0),
  /** Failed */
  failed: z.number().min(0).optional().default(0),
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Results */
  results: z.union([z.array(z.any()), z.null()]).optional(),
  /** Errors */
  errors: z.union([z.array(z.record(z.any())), z.null()]).optional(),
})


/**
 * 回调日志响应 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const CallbackLogResponseSchema = z.object({
  /** Id */
  id: z.number(),
  /** Callback Type */
  callback_type: z.string(),
  /** Device Id */
  device_id: z.string(),
  /** Request Body */
  request_body: z.record(z.any()),
  /** Client Ip */
  client_ip: z.union([z.string(), z.null()]),
  /** User Agent */
  user_agent: z.union([z.string(), z.null()]),
  /** Request Id */
  request_id: z.union([z.string(), z.null()]),
  /** Correlation Id */
  correlation_id: z.union([z.string(), z.null()]),
  /** Response Status */
  response_status: z.number(),
  /** Response Time Ms */
  response_time_ms: z.number(),
  /** Error Message */
  error_message: z.union([z.string(), z.null()]),
  /** Created At */
  created_at: z.string().datetime(),
  /** Updated At */
  updated_at: z.string().datetime(),
})


/**
 * 指令回调结果 Schema - 设备回调时使用
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const CommandCallbackResultSchema = z.object({
  /** Command Code */
  command_code: z.string(),
  /** Device Code */
  device_code: z.string(),
  /** 执行结果 */
  result: z.lazy(() => CommandResultSchema),
  /** Finish Time */
  finish_time: z.number(),
  /** Data */
  data: z.union([z.record(z.any()), z.null()]).optional(),
  /** Error Detail */
  error_detail: z.union([z.record(z.any()), z.null()]).optional(),
})


/**
 * 指令执行结果枚举
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const CommandResultSchema = z.enum(["SUCCESS", "FAILED"])


/**
 * DemoProduct 创建模型
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DemoProductCreateSchema = z.object({
  /** Name */
  name: z.string().max(100),
  /** Price */
  price: z.number().min(0),
  /** Stock */
  stock: z.number().min(0),
  /** Product Lists */
  product_lists: z.array(z.lazy(() => DemoProductListCreateSchema)).optional(),
})


/**
 * DemoProductList 创建模型

注意：product_id 在创建时是可选的，因为会自动从主表 ID 设置
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DemoProductListCreateSchema = z.object({
  /** Product Id */
  product_id: z.union([z.number(), z.null()]).optional(),
  /** Quantity */
  quantity: z.number().min(0),
})


/**
 * DemoProductList 响应模型
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DemoProductListResponseSchema = z.object({
  /** Product Id */
  product_id: z.number(),
  /** Quantity */
  quantity: z.number().min(0),
  /** Id */
  id: z.number(),
})


/**
 * DemoProductList 更新模型

注意：在更新主表时，使用 Diff 算法处理从表：
- 有 id：更新现有记录
- 无 id：创建新记录
- 缺失：删除记录

因此 id 和 product_id 都是可选的
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DemoProductListUpdateSchema = z.object({
  /** Product Id */
  product_id: z.union([z.number(), z.null()]).optional(),
  /** Quantity */
  quantity: z.union([z.number().min(0), z.null()]).optional(),
  /** Id */
  id: z.union([z.number(), z.null()]).optional(),
})


/**
 * DemoProduct 响应模型

包含 version 字段，前端在更新时必须传回该字段
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DemoProductResponseSchema = z.object({
  /** Deleted By */
  deleted_by: z.union([z.number(), z.null()]).optional(),
  /** Deleted At */
  deleted_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Is Deleted */
  is_deleted: z.boolean().optional().default(false),
  /** Version */
  version: z.number().optional().default(0),
  /** Created At */
  created_at: z.string().datetime().optional(),
  /** Updated At */
  updated_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Created By */
  created_by: z.union([z.number(), z.null()]).optional(),
  /** Updated By */
  updated_by: z.union([z.number(), z.null()]).optional(),
  /** Name */
  name: z.string().max(100),
  /** Price */
  price: z.number().min(0),
  /** Stock */
  stock: z.number().min(0),
  /** Id */
  id: z.number(),
  /** Product Lists */
  product_lists: z.array(z.lazy(() => DemoProductListResponseSchema)),
})


/**
 * DemoProduct 更新模型

注意：更新时必须包含 version 字段（乐观锁）
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DemoProductUpdateSchema = z.object({
  /** Name */
  name: z.union([z.string().max(100), z.null()]).optional(),
  /** Price */
  price: z.union([z.number().min(0), z.null()]).optional(),
  /** Stock */
  stock: z.union([z.number().min(0), z.null()]).optional(),
  /** Version */
  version: z.number(),
  /** Product Lists */
  product_lists: z.array(z.lazy(() => DemoProductListUpdateSchema)).optional(),
})


/**
 * 设备创建 Schema - 接收客户端输入
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceCreateSchema = z.object({
  /** Device Code */
  device_code: z.string().min(1).max(50),
  /** Device Name */
  device_name: z.string().min(1).max(100),
  /** 设备类型 */
  device_type: z.lazy(() => DeviceTypeSchema),
  /** Work Line Id */
  work_line_id: z.union([z.number(), z.null()]).optional(),
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Is Active */
  is_active: z.boolean().optional().default(true),
  /** Sort Order */
  sort_order: z.number().optional().default(0),
  /** Device Role */
  device_role: z.string().max(50),
  /** Role Index */
  role_index: z.number().min(1).optional().default(1),
  /** Upstream Device Id */
  upstream_device_id: z.union([z.number(), z.null()]).optional(),
  /** Vendor Type */
  vendor_type: z.union([z.string().max(50), z.null()]).optional(),
  /** Capabilities */
  capabilities: z.array(z.string()),
  /** Host */
  host: z.union([z.string().max(100), z.null()]).optional(),
  /** Port */
  port: z.union([z.number().min(1).max(65535), z.null()]).optional(),
  /** 通信协议 */
  protocol: z.lazy(() => DeviceProtocolSchema).optional().default("HTTP"),
  /** Auth Token */
  auth_token: z.union([z.string().max(500), z.null()]).optional(),
  /** Timeout */
  timeout: z.number().min(1000).max(300000).optional().default(10000),
  /** 设备实时状态（IDLE/RUNNING/ERROR/OFFLINE） */
  device_status: z.lazy(() => DeviceStatusSchema).optional().default("IDLE"),
  /** Current Command Id */
  current_command_id: z.union([z.number(), z.null()]).optional(),
  /** Last Heartbeat At */
  last_heartbeat_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Error Code */
  error_code: z.union([z.string().max(50), z.null()]).optional(),
  /** Supported Commands */
  supported_commands: z.array(z.string()),
  /** Max Concurrent Tasks */
  max_concurrent_tasks: z.number().min(1).max(10).optional().default(1),
  /** Idempotency Ttl */
  idempotency_ttl: z.number().min(60).max(86400).optional().default(3600),
})


/**
 * 设备通信协议枚举（白皮书 2.1 节）
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceProtocolSchema = z.enum(["HTTP", "HTTPS", "TCP", "MODBUS", "MQTT"])


/**
 * 设备响应 Schema - 返回给客户端
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceResponseSchema = z.object({
  /** Device Code */
  device_code: z.string().min(1).max(50),
  /** Device Name */
  device_name: z.string().min(1).max(100),
  /** 设备类型 */
  device_type: z.lazy(() => DeviceTypeSchema),
  /** Work Line Id */
  work_line_id: z.union([z.number(), z.null()]).optional(),
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Is Active */
  is_active: z.boolean().optional().default(true),
  /** Sort Order */
  sort_order: z.number().optional().default(0),
  /** Device Role */
  device_role: z.string().max(50),
  /** Role Index */
  role_index: z.number().min(1).optional().default(1),
  /** Upstream Device Id */
  upstream_device_id: z.union([z.number(), z.null()]).optional(),
  /** Vendor Type */
  vendor_type: z.union([z.string().max(50), z.null()]).optional(),
  /** Capabilities */
  capabilities: z.array(z.string()).optional(),
  /** Host */
  host: z.union([z.string().max(100), z.null()]).optional(),
  /** Port */
  port: z.union([z.number().min(1).max(65535), z.null()]).optional(),
  /** 通信协议 */
  protocol: z.lazy(() => DeviceProtocolSchema).optional().default("HTTP"),
  /** Auth Token */
  auth_token: z.union([z.string().max(500), z.null()]).optional(),
  /** Timeout */
  timeout: z.number().min(1000).max(300000).optional().default(10000),
  /** 设备实时状态（IDLE/RUNNING/ERROR/OFFLINE） */
  device_status: z.lazy(() => DeviceStatusSchema).optional().default("IDLE"),
  /** Current Command Id */
  current_command_id: z.union([z.number(), z.null()]).optional(),
  /** Last Heartbeat At */
  last_heartbeat_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Error Code */
  error_code: z.union([z.string().max(50), z.null()]).optional(),
  /** Supported Commands */
  supported_commands: z.array(z.string()).optional(),
  /** Max Concurrent Tasks */
  max_concurrent_tasks: z.number().min(1).max(10).optional().default(1),
  /** Idempotency Ttl */
  idempotency_ttl: z.number().min(60).max(86400).optional().default(3600),
  /** Id */
  id: z.number(),
  /** Version */
  version: z.number(),
})


/**
 * 设备状态枚举（白皮书 5.2 节）
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceStatusSchema = z.enum(["IDLE", "RUNNING", "ERROR", "OFFLINE"])


/**
 * 设备类型枚举 (SRS 3.3.0 节)
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceTypeSchema = z.enum(["PDA", "INDUSTRIAL_PC", "PRINTER", "COMPUTER", "LCR_TESTER", "ROBOTIC_ARM", "VISION_CAMERA", "CONVEYOR", "LABELER", "XRAY", "SCANNER"])


/**
 * 设备更新 Schema - 所有字段可选
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceUpdateSchema = z.object({
  /** Device Code */
  device_code: z.union([z.string().min(1).max(50), z.null()]).optional(),
  /** Device Name */
  device_name: z.union([z.string().min(1).max(100), z.null()]).optional(),
  /** 设备类型 */
  device_type: z.union([z.lazy(() => DeviceTypeSchema), z.null()]).optional(),
  /** Work Line Id */
  work_line_id: z.union([z.number(), z.null()]).optional(),
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Is Active */
  is_active: z.union([z.boolean(), z.null()]).optional(),
  /** Sort Order */
  sort_order: z.union([z.number(), z.null()]).optional(),
  /** Device Role */
  device_role: z.union([z.string().max(50), z.null()]).optional(),
  /** Role Index */
  role_index: z.union([z.number().min(1), z.null()]).optional(),
  /** Upstream Device Id */
  upstream_device_id: z.union([z.number(), z.null()]).optional(),
  /** Vendor Type */
  vendor_type: z.union([z.string().max(50), z.null()]).optional(),
  /** Capabilities */
  capabilities: z.union([z.array(z.string()), z.null()]).optional(),
  /** Host */
  host: z.union([z.string().max(100), z.null()]).optional(),
  /** Port */
  port: z.union([z.number().min(1).max(65535), z.null()]).optional(),
  /** 通信协议 */
  protocol: z.union([z.lazy(() => DeviceProtocolSchema), z.null()]).optional(),
  /** Auth Token */
  auth_token: z.union([z.string().max(500), z.null()]).optional(),
  /** Timeout */
  timeout: z.union([z.number().min(1000).max(300000), z.null()]).optional(),
  /** 设备实时状态（IDLE/RUNNING/ERROR/OFFLINE） */
  device_status: z.union([z.lazy(() => DeviceStatusSchema), z.null()]).optional(),
  /** Current Command Id */
  current_command_id: z.union([z.number(), z.null()]).optional(),
  /** Last Heartbeat At */
  last_heartbeat_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Error Code */
  error_code: z.union([z.string().max(50), z.null()]).optional(),
  /** Supported Commands */
  supported_commands: z.union([z.array(z.string()), z.null()]).optional(),
  /** Max Concurrent Tasks */
  max_concurrent_tasks: z.union([z.number().min(1).max(10), z.null()]).optional(),
  /** Idempotency Ttl */
  idempotency_ttl: z.union([z.number().min(60).max(86400), z.null()]).optional(),
  /** Version */
  version: z.number(),
})


/**
 * 事件上报请求 Schema - 设备回调时使用
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const EventRequestSchema = z.object({
  /** Device Code */
  device_code: z.string(),
  /** 事件类型 */
  event_type: z.lazy(() => EventTypeSchema),
  /** Timestamp */
  timestamp: z.union([z.number(), z.null()]).optional(),
  /** Data */
  data: z.union([z.record(z.any()), z.null()]).optional(),
})


/**
 * 事件类型枚举 (白皮书 3.2.2)
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const EventTypeSchema = z.enum(["ESTOP_PRESSED", "DEVICE_ONLINE", "DEVICE_OFFLINE", "DEVICE_ERROR", "MATERIAL_ARRIVED", "SCAN_COMPLETED", "PICK_COMPLETED", "PUT_COMPLETED", "PROCESS_COMPLETED"])


/**
 * 单个过滤条件
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const FilterConditionSchema = z.object({
  /** Field */
  field: z.string(),
  op: z.lazy(() => FilterOperatorSchema),
  /** Value */
  value: z.union([z.any(), z.null()]).optional(),
})


/**
 * 过滤条件组
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const FilterGroupSchema = z.lazy((): z.ZodTypeAny => z.object({
  /** Couple */
  couple: z.enum(["and", "or", "not"]).optional().default("and"),
  /** Conditions */
  conditions: z.array(z.union([z.lazy(() => FilterConditionSchema), z.lazy(() => FilterGroupSchema)])).optional(),
}))


/**
 * 过滤操作符
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const FilterOperatorSchema = z.enum(["eq", "ne", "gt", "ge", "lt", "le", "in", "nin", "ilike", "between", "is_null", "not_null"])


/**
 * 作业线类型枚举
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const LineTypeSchema = z.enum(["AUTO", "MANUAL", "HYBRID"])


export const ListResponseData_APIAccessLogResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => APIAccessLogResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_APIApplicationResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => APIApplicationResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_AuditLogResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => AuditLogResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_DemoProductResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => DemoProductResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_DeviceResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => DeviceResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_MenuResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => MenuResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_PermissionResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => PermissionResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_RoleResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => RoleResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_UserResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => UserResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_WorkLineResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => WorkLineResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseSchemaModel_APIAccessLogResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_APIAccessLogResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_APIApplicationResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_APIApplicationResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_AuditLogResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_AuditLogResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_DemoProductResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_DemoProductResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_DeviceResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_DeviceResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_MenuResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_MenuResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_PermissionResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_PermissionResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_RoleResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_RoleResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_UserResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_UserResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_WorkLineResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_WorkLineResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


/**
 * 登录请求 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const LoginRequestSchema = z.object({
  /** Username */
  username: z.string().min(3).max(50),
  /** Password */
  password: z.string().min(6).max(100),
})


/**
 * 登录响应 Schema

包含访问令牌、刷新令牌和用户信息
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const LoginResponseSchema = z.object({
  /** Access Token */
  access_token: z.string(),
  /** Refresh Token */
  refresh_token: z.string(),
  /** Access Token Jti */
  access_token_jti: z.string(),
  /** Refresh Token Jti */
  refresh_token_jti: z.string(),
  /** Access Token Expire Time */
  access_token_expire_time: z.string().datetime(),
  /** Refresh Token Expire Time */
  refresh_token_expire_time: z.string().datetime(),
  /** Session Uuid */
  session_uuid: z.string(),
  /** 用户信息 */
  user: z.lazy(() => UserResponseSchema),
  /** Expires In */
  expires_in: z.number(),
  /** Refresh Expires In */
  refresh_expires_in: z.number(),
})


/**
 * 登出响应 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const LogoutResponseSchema = z.object({
  /** Message */
  message: z.string(),
  /** Revoked Count */
  revoked_count: z.number().optional().default(0),
})


/**
 * 菜单创建 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const MenuCreateSchema = z.object({
  /** Parent Id */
  parent_id: z.union([z.number(), z.null()]).optional(),
  /** Tree Path */
  tree_path: z.string().optional().default("/"),
  /** Level */
  level: z.number().optional().default(1),
  /** Sort Order */
  sort_order: z.number().optional().default(0),
  /** Name */
  name: z.string().max(50),
  /** Title */
  title: z.string().max(50),
  /** Path */
  path: z.string().max(200),
  /** Component */
  component: z.union([z.string().max(200), z.null()]).optional(),
  /** Icon */
  icon: z.union([z.string().max(50), z.null()]).optional(),
  /** Is Hidden */
  is_hidden: z.boolean().optional().default(false),
})


/**
 * 菜单响应 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const MenuResponseSchema = z.object({
  /** Parent Id */
  parent_id: z.union([z.number(), z.null()]).optional(),
  /** Tree Path */
  tree_path: z.string().optional().default("/"),
  /** Level */
  level: z.number().optional().default(1),
  /** Sort Order */
  sort_order: z.number().optional().default(0),
  /** Name */
  name: z.string().max(50),
  /** Title */
  title: z.string().max(50),
  /** Path */
  path: z.string().max(200),
  /** Component */
  component: z.union([z.string().max(200), z.null()]).optional(),
  /** Icon */
  icon: z.union([z.string().max(50), z.null()]).optional(),
  /** Is Hidden */
  is_hidden: z.boolean().optional().default(false),
  /** Id */
  id: z.number(),
  /** Version */
  version: z.number(),
  /** Roles */
  roles: z.array(z.lazy(() => RoleResponseSchema)).optional(),
})


/**
 * 菜单树响应 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const MenuTreeResponseSchema = z.lazy((): z.ZodTypeAny => z.object({
  /** Parent Id */
  parent_id: z.union([z.number(), z.null()]).optional(),
  /** Tree Path */
  tree_path: z.string().optional().default("/"),
  /** Level */
  level: z.number().optional().default(1),
  /** Sort Order */
  sort_order: z.number().optional().default(0),
  /** Name */
  name: z.string().max(50),
  /** Title */
  title: z.string().max(50),
  /** Path */
  path: z.string().max(200),
  /** Component */
  component: z.union([z.string().max(200), z.null()]).optional(),
  /** Icon */
  icon: z.union([z.string().max(50), z.null()]).optional(),
  /** Is Hidden */
  is_hidden: z.boolean().optional().default(false),
  /** Id */
  id: z.number(),
  /** Children */
  children: z.array(z.lazy(() => MenuTreeResponseSchema)).optional(),
}))


/**
 * 菜单更新 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const MenuUpdateSchema = z.object({
  /** Parent Id */
  parent_id: z.union([z.number(), z.null()]).optional(),
  /** Tree Path */
  tree_path: z.union([z.string(), z.null()]).optional(),
  /** Level */
  level: z.union([z.number(), z.null()]).optional(),
  /** Sort Order */
  sort_order: z.union([z.number(), z.null()]).optional(),
  /** Name */
  name: z.union([z.string().max(50), z.null()]).optional(),
  /** Title */
  title: z.union([z.string().max(50), z.null()]).optional(),
  /** Path */
  path: z.union([z.string().max(200), z.null()]).optional(),
  /** Component */
  component: z.union([z.string().max(200), z.null()]).optional(),
  /** Icon */
  icon: z.union([z.string().max(50), z.null()]).optional(),
  /** Is Hidden */
  is_hidden: z.union([z.boolean(), z.null()]).optional(),
  /** Version */
  version: z.number(),
})


/**
 * 操作日志状态
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const OperaStatusSchema = z.enum(["FAIL", "SUCCESS"])


/**
 * API 权限创建 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PermissionCreateSchema = z.object({
  /** Parent Id */
  parent_id: z.union([z.number(), z.null()]).optional(),
  /** Tree Path */
  tree_path: z.string().optional().default("/"),
  /** Level */
  level: z.number().optional().default(1),
  /** Sort Order */
  sort_order: z.number().optional().default(0),
  /** Name */
  name: z.string().max(100),
  /** Description */
  description: z.union([z.string().max(255), z.null()]).optional(),
  /** Type */
  type: z.string().max(20).optional().default("user_api"),
  /** Category */
  category: z.union([z.string().max(50), z.null()]).optional(),
  /** Resource */
  resource: z.union([z.string().max(50), z.null()]).optional(),
  /** Action */
  action: z.union([z.string().max(50), z.null()]).optional(),
  /** Method */
  method: z.union([z.string().max(10), z.null()]).optional(),
  /** Path */
  path: z.union([z.string().max(255), z.null()]).optional(),
})


/**
 * API 权限响应 Schema（完整版）
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PermissionResponseSchema = z.object({
  /** Parent Id */
  parent_id: z.union([z.number(), z.null()]).optional(),
  /** Tree Path */
  tree_path: z.string().optional().default("/"),
  /** Level */
  level: z.number().optional().default(1),
  /** Sort Order */
  sort_order: z.number().optional().default(0),
  /** Name */
  name: z.string().max(100),
  /** Description */
  description: z.union([z.string().max(255), z.null()]).optional(),
  /** Type */
  type: z.string().max(20).optional().default("user_api"),
  /** Category */
  category: z.union([z.string().max(50), z.null()]).optional(),
  /** Resource */
  resource: z.union([z.string().max(50), z.null()]).optional(),
  /** Action */
  action: z.union([z.string().max(50), z.null()]).optional(),
  /** Method */
  method: z.union([z.string().max(10), z.null()]).optional(),
  /** Path */
  path: z.union([z.string().max(255), z.null()]).optional(),
  /** Id */
  id: z.number(),
  /** Version */
  version: z.number(),
  /** Full Name */
  full_name: z.string(),
})


/**
 * API 权限更新 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PermissionUpdateSchema = z.object({
  /** Parent Id */
  parent_id: z.union([z.number(), z.null()]).optional(),
  /** Tree Path */
  tree_path: z.union([z.string(), z.null()]).optional(),
  /** Level */
  level: z.union([z.number(), z.null()]).optional(),
  /** Sort Order */
  sort_order: z.union([z.number(), z.null()]).optional(),
  /** Name */
  name: z.union([z.string().max(100), z.null()]).optional(),
  /** Description */
  description: z.union([z.string().max(255), z.null()]).optional(),
  /** Type */
  type: z.union([z.string().max(20), z.null()]).optional(),
  /** Category */
  category: z.union([z.string().max(50), z.null()]).optional(),
  /** Resource */
  resource: z.union([z.string().max(50), z.null()]).optional(),
  /** Action */
  action: z.union([z.string().max(50), z.null()]).optional(),
  /** Method */
  method: z.union([z.string().max(10), z.null()]).optional(),
  /** Path */
  path: z.union([z.string().max(255), z.null()]).optional(),
  /** Version */
  version: z.number(),
})


/**
 * 查询选项
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const QueryOptionsSchema = z.object({
  filters: z.union([z.lazy(() => FilterGroupSchema), z.null()]).optional(),
  /** Sort */
  sort: z.union([z.array(z.lazy(() => SortFieldSchema)), z.null()]).optional(),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
  /** Limit */
  limit: z.number().min(1).max(100).optional().default(10),
  /** Max Depth */
  max_depth: z.number().min(0).max(3).optional().default(1),
  /** Include Deleted */
  include_deleted: z.boolean().optional().default(false),
})


/**
 * 刷新令牌响应 Schema

包含新的访问令牌和刷新令牌
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RefreshTokenResponseSchema = z.object({
  /** Access Token */
  access_token: z.string(),
  /** Refresh Token */
  refresh_token: z.string(),
  /** Access Token Jti */
  access_token_jti: z.string(),
  /** Refresh Token Jti */
  refresh_token_jti: z.string(),
  /** Access Token Expire Time */
  access_token_expire_time: z.string().datetime(),
  /** Refresh Token Expire Time */
  refresh_token_expire_time: z.string().datetime(),
  /** Session Uuid */
  session_uuid: z.string(),
  /** Expires In */
  expires_in: z.number(),
  /** Refresh Expires In */
  refresh_expires_in: z.number(),
})


/**
 * 管理员重置密码请求
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ResetPasswordRequestSchema = z.object({
  /** New Password */
  new_password: z.string().min(6).max(100),
})


/**
 * 重置有效期 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ResetValidityPeriodSchemaSchema = z.object({
  /** Version */
  version: z.number().optional().default(0),
  /** 新的有效期时长 */
  validity_period: z.lazy(() => ValidityPeriodSchema),
})


/**
 * 撤销会话响应 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RevokeSessionResponseSchema = z.object({
  /** Message */
  message: z.string(),
  /** Session Uuid */
  session_uuid: z.string(),
})


/**
 * 角色创建 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RoleCreateSchema = z.object({
  /** Name */
  name: z.string().max(100),
  /** Description */
  description: z.union([z.string().max(255), z.null()]).optional(),
})


/**
 * 角色响应 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RoleResponseSchema = z.object({
  /** Name */
  name: z.string().max(100),
  /** Description */
  description: z.union([z.string().max(255), z.null()]).optional(),
  /** Id */
  id: z.number(),
  /** Version */
  version: z.number(),
  /** Permissions */
  permissions: z.array(z.lazy(() => PermissionResponseSchema)).optional(),
})


/**
 * 角色更新 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RoleUpdateSchema = z.object({
  /** Name */
  name: z.union([z.string().max(100), z.null()]).optional(),
  /** Description */
  description: z.union([z.string().max(255), z.null()]).optional(),
  /** Version */
  version: z.number(),
})


/**
 * 会话信息 Schema

描述一个活跃的用户会话
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const SessionInfoSchema = z.object({
  /** Session Uuid */
  session_uuid: z.string(),
  /** Jti */
  jti: z.string(),
  /** Created At */
  created_at: z.string().datetime(),
  /** Device Info */
  device_info: z.union([z.record(z.any()), z.null()]).optional(),
  /** Last Active */
  last_active: z.union([z.string().datetime(), z.null()]).optional(),
})


/**
 * 排序字段
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const SortFieldSchema = z.object({
  /** Field */
  field: z.string(),
  /** Order */
  order: z.enum(["asc", "desc"]).optional().default("desc"),
})


/**
 * 测试 API 调用数据模型
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const TryInvokeApplicationSchema = z.object({
  /** Command Name */
  command_name: z.string(),
  /** Command Description */
  command_description: z.string(),
  /** Command Parameters */
  command_parameters: z.array(z.string()),
  /** Command Response */
  command_response: z.string(),
})


/**
 * 测试 API 调用请求模型（包裹格式）
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const TryInvokeApplicationRequestSchema = z.object({
  data: z.lazy(() => TryInvokeApplicationSchema),
})


/**
 * 用户创建 Schema - 接收客户端输入
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const UserCreateSchema = z.object({
  /** Username */
  username: z.string().min(3).max(50),
  /** Email */
  email: z.string().max(100).email(),
  /** Full Name */
  full_name: z.union([z.string().max(100), z.null()]).optional(),
  /** Password */
  password: z.string().min(6).max(100),
})


/**
 * 用户权限列表响应 Schema

包含用户有权限访问的所有 API 权限
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const UserPermissionsResponseSchema = z.object({
  /** Total */
  total: z.number(),
  /** Permissions */
  permissions: z.array(z.lazy(() => ApiPermissionInfoSchema)),
})


/**
 * 用户响应 Schema - 返回给客户端
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const UserResponseSchema = z.object({
  /** Username */
  username: z.string().min(3).max(50),
  /** Email */
  email: z.string().max(100).email(),
  /** Full Name */
  full_name: z.union([z.string().max(100), z.null()]).optional(),
  /** Id */
  id: z.number(),
  /** Version */
  version: z.number().optional().default(0),
  /** Is Superuser */
  is_superuser: z.boolean(),
  /** Is Multi Login */
  is_multi_login: z.boolean(),
  /** Created At */
  created_at: z.string().datetime(),
  /** Updated At */
  updated_at: z.union([z.string().datetime(), z.null()]),
  /** Roles */
  roles: z.array(z.lazy(() => RoleResponseSchema)).optional(),
})


/**
 * 用户响应 Schema 无关联关系 - 返回给客户端
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const UserSimpleResponseSchema = z.object({
  /** Username */
  username: z.string().min(3).max(50),
  /** Email */
  email: z.string().max(100).email(),
  /** Full Name */
  full_name: z.union([z.string().max(100), z.null()]).optional(),
  /** Id */
  id: z.number(),
  /** Version */
  version: z.number().optional().default(0),
  /** Is Superuser */
  is_superuser: z.boolean(),
  /** Is Multi Login */
  is_multi_login: z.boolean(),
  /** Created At */
  created_at: z.string().datetime(),
  /** Updated At */
  updated_at: z.union([z.string().datetime(), z.null()]),
})


/**
 * 用户更新 Schema - 所有字段可选
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const UserUpdateSchema = z.object({
  /** Username */
  username: z.union([z.string().min(3).max(50), z.null()]).optional(),
  /** Email */
  email: z.union([z.string().max(100).email(), z.null()]).optional(),
  /** Full Name */
  full_name: z.union([z.string().max(100), z.null()]).optional(),
  /** Version */
  version: z.number(),
})


export const ValidationErrorSchema = z.object({
  /** Location */
  loc: z.array(z.union([z.string(), z.number()])),
  /** Message */
  msg: z.string(),
  /** Error Type */
  type: z.string(),
  /** Input */
  input: z.any().optional(),
  /** Context */
  ctx: z.record(z.any()).optional(),
})


/**
 * 有效期枚举
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ValidityPeriodSchema = z.enum(["1d", "1w", "1m", "6m", "1y", "never"])


/**
 * 作业线创建 Schema - 接收客户端输入
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineCreateSchema = z.object({
  /** Line Code */
  line_code: z.string().min(1).max(50),
  /** Line Name */
  line_name: z.string().min(1).max(100),
  /** 作业线类型 */
  line_type: z.lazy(() => LineTypeSchema),
  /** Zone Name */
  zone_name: z.union([z.string().max(100), z.null()]).optional(),
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Is Active */
  is_active: z.boolean().optional().default(true),
  /** Capacity */
  capacity: z.union([z.number(), z.null()]).optional(),
  /** Sort Order */
  sort_order: z.number().optional().default(0),
})


/**
 * 作业线响应 Schema - 返回给客户端
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineResponseSchema = z.object({
  /** Line Code */
  line_code: z.string().min(1).max(50),
  /** Line Name */
  line_name: z.string().min(1).max(100),
  /** 作业线类型 */
  line_type: z.lazy(() => LineTypeSchema),
  /** Zone Name */
  zone_name: z.union([z.string().max(100), z.null()]).optional(),
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Is Active */
  is_active: z.boolean().optional().default(true),
  /** Capacity */
  capacity: z.union([z.number(), z.null()]).optional(),
  /** Sort Order */
  sort_order: z.number().optional().default(0),
  /** Id */
  id: z.number(),
  /** Version */
  version: z.number(),
})


/**
 * 作业线更新 Schema - 所有字段可选
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineUpdateSchema = z.object({
  /** Line Code */
  line_code: z.union([z.string().min(1).max(50), z.null()]).optional(),
  /** Line Name */
  line_name: z.union([z.string().min(1).max(100), z.null()]).optional(),
  /** 作业线类型 */
  line_type: z.union([z.lazy(() => LineTypeSchema), z.null()]).optional(),
  /** Zone Name */
  zone_name: z.union([z.string().max(100), z.null()]).optional(),
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Is Active */
  is_active: z.union([z.boolean(), z.null()]).optional(),
  /** Capacity */
  capacity: z.union([z.number(), z.null()]).optional(),
  /** Sort Order */
  sort_order: z.union([z.number(), z.null()]).optional(),
  /** Version */
  version: z.number(),
})
