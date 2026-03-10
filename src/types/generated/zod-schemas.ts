/**
 * Zod Validation Schemas
 *
 * 此文件由 scripts/generate-zod-from-openapi.ts 自动生成
 * 从后端 FastAPI OpenAPI schema 提取验证规则
 *
 * ⚠️ 请勿手动编辑此文件
 * 如需自定义验证规则，请修改 src/types/zod-extensions.ts
 *
 * 生成时间: 2026-03-10T01:52:32.206Z
 */

import { z } from 'zod'


export const APIApplicationCreateSchema = z.object({
  /** App Name */
  app_name: z.string().max(100),
  /** 应用类型 */
  app_type: z.any().optional().default("ECS"),
  /** Description */
  description: z.union([z.string(), z.null()]).optional(),
  /** Ip Whitelist */
  ip_whitelist: z.union([z.array(z.any()), z.null()]).optional(),
  /** Rate Limit Per Minute */
  rate_limit_per_minute: z.number().min(1).max(10000).optional().default(100),
  /** Rate Limit Per Hour */
  rate_limit_per_hour: z.number().min(1).max(1000000).optional().default(5000),
  /** 有效期时长 */
  validity_period: z.any().optional().default("1y"),
})


export const APIApplicationUpdateSchema = z.object({
  /** App Name */
  app_name: z.union([z.string(), z.null()]).optional(),
  /** 应用类型 */
  app_type: z.union([z.any(), z.null()]).optional(),
  /** Description */
  description: z.union([z.string(), z.null()]).optional(),
  /** Ip Whitelist */
  ip_whitelist: z.union([z.array(z.any()), z.null()]).optional(),
  /** Rate Limit Per Minute */
  rate_limit_per_minute: z.union([z.number(), z.null()]).optional(),
  /** Rate Limit Per Hour */
  rate_limit_per_hour: z.union([z.number(), z.null()]).optional(),
  /** 有效期时长 */
  validity_period: z.union([z.any(), z.null()]).optional(),
  /** Version */
  version: z.number().optional().default(0),
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


/**
 * 指令回调结果 Schema - 设备回调时使用
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const CommandCallbackResultSchema = z.object({
  /** Command Id */
  command_id: z.string(),
  /** Device Code */
  device_code: z.string(),
  /** 执行结果 */
  result: z.any(),
  /** Finish Time */
  finish_time: z.number(),
  /** Data */
  data: z.union([z.record(z.any()), z.null()]).optional(),
  /** Error Detail */
  error_detail: z.union([z.record(z.any()), z.null()]).optional(),
})


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
  product_lists: z.array(z.any()).optional(),
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
  quantity: z.union([z.number(), z.null()]).optional(),
  /** Id */
  id: z.union([z.number(), z.null()]).optional(),
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
  name: z.union([z.string(), z.null()]).optional(),
  /** Price */
  price: z.union([z.number(), z.null()]).optional(),
  /** Stock */
  stock: z.union([z.number(), z.null()]).optional(),
  /** Version */
  version: z.number().optional().default(0),
  /** Product Lists */
  product_lists: z.array(z.any()).optional(),
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
  /** Device Type */
  device_type: z.string().max(50),
  /** Work Line Id */
  work_line_id: z.union([z.number(), z.null()]).optional(),
  /** Description */
  description: z.union([z.string(), z.null()]).optional(),
  /** Is Active */
  is_active: z.boolean().optional().default(true),
  /** Sort Order */
  sort_order: z.number().optional().default(0),
  /** Host */
  host: z.union([z.string(), z.null()]).optional(),
  /** Port */
  port: z.union([z.number(), z.null()]).optional(),
  /** Protocol */
  protocol: z.string().max(10).optional().default("HTTP"),
  /** Auth Token */
  auth_token: z.union([z.string(), z.null()]).optional(),
  /** Timeout */
  timeout: z.number().min(1000).max(300000).optional().default(10000),
  /** Device Status */
  device_status: z.string().max(20).optional().default("IDLE"),
  /** Current Command Id */
  current_command_id: z.union([z.number(), z.null()]).optional(),
  /** Last Heartbeat At */
  last_heartbeat_at: z.union([z.string(), z.null()]).optional(),
  /** Error Code */
  error_code: z.union([z.string(), z.null()]).optional(),
  /** Supported Commands */
  supported_commands: z.array(z.any()),
  /** Max Concurrent Tasks */
  max_concurrent_tasks: z.number().min(1).max(10).optional().default(1),
  /** Idempotency Ttl */
  idempotency_ttl: z.number().min(60).max(86400).optional().default(3600),
})


/**
 * 设备更新 Schema - 所有字段可选
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceUpdateSchema = z.object({
  /** Device Code */
  device_code: z.union([z.string(), z.null()]).optional(),
  /** Device Name */
  device_name: z.union([z.string(), z.null()]).optional(),
  /** Device Type */
  device_type: z.union([z.string(), z.null()]).optional(),
  /** Work Line Id */
  work_line_id: z.union([z.number(), z.null()]).optional(),
  /** Description */
  description: z.union([z.string(), z.null()]).optional(),
  /** Is Active */
  is_active: z.union([z.boolean(), z.null()]).optional(),
  /** Sort Order */
  sort_order: z.union([z.number(), z.null()]).optional(),
  /** Host */
  host: z.union([z.string(), z.null()]).optional(),
  /** Port */
  port: z.union([z.number(), z.null()]).optional(),
  /** Protocol */
  protocol: z.union([z.string(), z.null()]).optional(),
  /** Auth Token */
  auth_token: z.union([z.string(), z.null()]).optional(),
  /** Timeout */
  timeout: z.union([z.number(), z.null()]).optional(),
  /** Device Status */
  device_status: z.union([z.string(), z.null()]).optional(),
  /** Current Command Id */
  current_command_id: z.union([z.number(), z.null()]).optional(),
  /** Last Heartbeat At */
  last_heartbeat_at: z.union([z.string(), z.null()]).optional(),
  /** Error Code */
  error_code: z.union([z.string(), z.null()]).optional(),
  /** Supported Commands */
  supported_commands: z.union([z.array(z.any()), z.null()]).optional(),
  /** Max Concurrent Tasks */
  max_concurrent_tasks: z.union([z.number(), z.null()]).optional(),
  /** Idempotency Ttl */
  idempotency_ttl: z.union([z.number(), z.null()]).optional(),
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
  event_type: z.any(),
  /** Timestamp */
  timestamp: z.union([z.number(), z.null()]).optional(),
  /** Data */
  data: z.union([z.record(z.any()), z.null()]).optional(),
})


/**
 * 单个过滤条件
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const FilterConditionSchema = z.object({
  /** Field */
  field: z.string(),
  op: z.any(),
  /** Value */
  value: z.union([z.any(), z.null()]).optional(),
})


/**
 * 过滤条件组
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const FilterGroupSchema = z.object({
  /** Couple */
  couple: z.enum(["and", "or", "not"]).optional().default("and"),
  /** Conditions */
  conditions: z.array(z.any()).optional(),
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
  component: z.union([z.string(), z.null()]).optional(),
  /** Icon */
  icon: z.union([z.string(), z.null()]).optional(),
  /** Is Hidden */
  is_hidden: z.boolean().optional().default(false),
})


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
  name: z.union([z.string(), z.null()]).optional(),
  /** Title */
  title: z.union([z.string(), z.null()]).optional(),
  /** Path */
  path: z.union([z.string(), z.null()]).optional(),
  /** Component */
  component: z.union([z.string(), z.null()]).optional(),
  /** Icon */
  icon: z.union([z.string(), z.null()]).optional(),
  /** Is Hidden */
  is_hidden: z.union([z.boolean(), z.null()]).optional(),
})


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
  description: z.union([z.string(), z.null()]).optional(),
  /** Type */
  type: z.string().max(20).optional().default("user_api"),
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
  name: z.union([z.string(), z.null()]).optional(),
  /** Description */
  description: z.union([z.string(), z.null()]).optional(),
  /** Type */
  type: z.union([z.string(), z.null()]).optional(),
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


/**
 * 查询选项
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const QueryOptionsSchema = z.object({
  filters: z.union([z.any(), z.null()]).optional(),
  /** Sort */
  sort: z.union([z.array(z.any()), z.null()]).optional(),
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
 * 重置有效期 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ResetValidityPeriodSchemaSchema = z.object({
  /** Version */
  version: z.number().optional().default(0),
  /** 新的有效期时长 */
  validity_period: z.any(),
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
  description: z.union([z.string(), z.null()]).optional(),
})


/**
 * 角色更新 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RoleUpdateSchema = z.object({
  /** Name */
  name: z.union([z.string(), z.null()]).optional(),
  /** Description */
  description: z.union([z.string(), z.null()]).optional(),
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
  last_active: z.union([z.string(), z.null()]).optional(),
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
  command_parameters: z.array(z.any()),
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
  data: z.any(),
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
  email: z.string().max(100),
  /** Full Name */
  full_name: z.union([z.string(), z.null()]).optional(),
  /** Password */
  password: z.string().min(6).max(100),
})


/**
 * 用户更新 Schema - 所有字段可选
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const UserUpdateSchema = z.object({
  /** Username */
  username: z.union([z.string(), z.null()]).optional(),
  /** Email */
  email: z.union([z.string(), z.null()]).optional(),
  /** Full Name */
  full_name: z.union([z.string(), z.null()]).optional(),
})


export const ValidationErrorSchema = z.object({
  /** Location */
  loc: z.array(z.any()),
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
  /** Line Type */
  line_type: z.string().max(50),
  /** Zone Name */
  zone_name: z.union([z.string(), z.null()]).optional(),
  /** Description */
  description: z.union([z.string(), z.null()]).optional(),
  /** Is Active */
  is_active: z.boolean().optional().default(true),
  /** Capacity */
  capacity: z.union([z.number(), z.null()]).optional(),
  /** Sort Order */
  sort_order: z.number().optional().default(0),
})


/**
 * 作业线更新 Schema - 所有字段可选
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineUpdateSchema = z.object({
  /** Line Code */
  line_code: z.union([z.string(), z.null()]).optional(),
  /** Line Name */
  line_name: z.union([z.string(), z.null()]).optional(),
  /** Line Type */
  line_type: z.union([z.string(), z.null()]).optional(),
  /** Zone Name */
  zone_name: z.union([z.string(), z.null()]).optional(),
  /** Description */
  description: z.union([z.string(), z.null()]).optional(),
  /** Is Active */
  is_active: z.union([z.boolean(), z.null()]).optional(),
  /** Capacity */
  capacity: z.union([z.number(), z.null()]).optional(),
  /** Sort Order */
  sort_order: z.union([z.number(), z.null()]).optional(),
})
