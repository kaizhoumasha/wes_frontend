/** @openapi-sha256 a7bfb0d3efac9515ac6e227fb1532a7b5c2e9f1287b02a292b915b1fc0035029 */
/**
 * Zod Validation Schemas
 *
 * 此文件由 scripts/generate-zod-from-openapi.ts 自动生成
 * 从后端 FastAPI OpenAPI schema 提取验证规则
 *
 * ⚠️ 请勿手动编辑此文件
 * 如需自定义验证规则，请修改 src/types/zod-extensions.ts
 */

import { z } from 'zod'


export const APIAccessLogResponseSchema = z.object({
  /** App Id */
  app_id: z.string().max(50),
  /** App Name */
  app_name: z.string().max(100),
  /** Created At */
  created_at: z.string().datetime(),
  /** Error Message */
  error_message: z.union([z.string().max(1000), z.null()]).optional(),
  /** Id */
  id: z.number(),
  /** Ip Address */
  ip_address: z.string().max(50),
  /** Method */
  method: z.string().max(10),
  /** Path */
  path: z.string().max(500),
  /** Request Id */
  request_id: z.string().max(50),
  /** Response Time Ms */
  response_time_ms: z.number(),
  /** Status Code */
  status_code: z.number(),
  /** User Agent */
  user_agent: z.union([z.string().max(500), z.null()]).optional(),
})


export const APIApplicationCreateSchema = z.object({
  /** App Name */
  app_name: z.string().max(100),
  /** 应用类型 */
  app_type: z.lazy(() => AppTypeSchema).optional().default("ECS"),
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Ip Whitelist */
  ip_whitelist: z.union([z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())), z.null()]).optional(),
  /** Rate Limit Per Hour */
  rate_limit_per_hour: z.number().min(1).max(1000000).optional().default(5000),
  /** Rate Limit Per Minute */
  rate_limit_per_minute: z.number().min(1).max(10000).optional().default(100),
  /** 有效期时长 */
  validity_period: z.lazy(() => ValidityPeriodSchema).optional().default("1y"),
})


export const APIApplicationResponseSchema = z.object({
  /** App Id */
  app_id: z.string(),
  /** App Name */
  app_name: z.string().max(100),
  /** 应用类型 */
  app_type: z.lazy(() => AppTypeSchema).optional().default("ECS"),
  /** Created At */
  created_at: z.string().datetime().optional(),
  /** Created By */
  created_by: z.union([z.number(), z.null()]).optional(),
  /** Deleted At */
  deleted_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Deleted By */
  deleted_by: z.union([z.number(), z.null()]).optional(),
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Expires At */
  expires_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Id */
  id: z.union([z.number(), z.null()]).optional(),
  /** Ip Whitelist */
  ip_whitelist: z.union([z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())), z.null()]).optional(),
  /** Is Deleted */
  is_deleted: z.boolean().optional().default(false),
  /** Permissions */
  permissions: z.array(z.lazy(() => PermissionResponseSchema)).optional(),
  /** Rate Limit Per Hour */
  rate_limit_per_hour: z.number().min(1).max(1000000).optional().default(5000),
  /** Rate Limit Per Minute */
  rate_limit_per_minute: z.number().min(1).max(10000).optional().default(100),
  /** Remaining Days */
  remaining_days: z.union([z.number(), z.null()]),
  status: z.lazy(() => AppStatusSchema).optional().default("active"),
  /** Updated At */
  updated_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Updated By */
  updated_by: z.union([z.number(), z.null()]).optional(),
  /** 有效期时长 */
  validity_period: z.lazy(() => ValidityPeriodSchema).optional().default("1y"),
  /** Version */
  version: z.number().optional().default(0),
})


export const APIApplicationUpdateSchema = z.object({
  /** App Name */
  app_name: z.union([z.string().max(100), z.null()]).optional(),
  /** 应用类型 */
  app_type: z.union([z.lazy(() => AppTypeSchema), z.null()]).optional(),
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Ip Whitelist */
  ip_whitelist: z.union([z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())), z.null()]).optional(),
  /** Rate Limit Per Hour */
  rate_limit_per_hour: z.union([z.number().min(1).max(1000000), z.null()]).optional(),
  /** Rate Limit Per Minute */
  rate_limit_per_minute: z.union([z.number().min(1).max(10000), z.null()]).optional(),
  /** 有效期时长 */
  validity_period: z.union([z.lazy(() => ValidityPeriodSchema), z.null()]).optional(),
  /** Version */
  version: z.number(),
})


export const AbortTransportDebugRunRequestSchema = z.object({
  /** Assertion */
  assertion: z.literal("PHYSICAL_STATE_VERIFIED"),
  /** Reason */
  reason: z.string().min(1).max(500),
})


/**
 * 活跃会话列表响应 Schema

包含用户所有活跃会话
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ActiveSessionsResponseSchema = z.object({
  /** Sessions */
  sessions: z.array(z.lazy(() => SessionInfoSchema)),
  /** Total */
  total: z.number(),
})


/**
 * API 权限信息 Schema

描述单个 API 权限的详细信息
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ApiPermissionInfoSchema = z.object({
  /** Action */
  action: z.union([z.string(), z.null()]).optional(),
  /** Category */
  category: z.union([z.string(), z.null()]).optional(),
  /** Description */
  description: z.union([z.string(), z.null()]).optional(),
  /** Id */
  id: z.number(),
  /** Method */
  method: z.union([z.string(), z.null()]).optional(),
  /** Name */
  name: z.string(),
  /** Path */
  path: z.union([z.string(), z.null()]).optional(),
  /** Resource */
  resource: z.union([z.string(), z.null()]).optional(),
  /** Type */
  type: z.string(),
})


export const AppStatusSchema = z.enum(["active", "revoked", "expired"])


export const AppTypeSchema = z.enum(["ECS", "RCS", "WMS", "Third-Party"])


/**
 * 为用户分配角色请求
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const AssignRolesRequestSchema = z.object({
  /** Role Ids */
  role_ids: z.array(z.number()),
})


/**
 * AuditLog 响应 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const AuditLogResponseSchema = z.object({
  /** Action */
  action: z.union([z.string().max(50), z.null()]).optional(),
  /** Args */
  args: z.union([z.record(z.any()), z.null()]).optional(),
  /** Browser */
  browser: z.union([z.string().max(64), z.null()]).optional(),
  /** Change Summary */
  change_summary: z.union([z.string().max(255), z.null()]).optional(),
  /** City */
  city: z.union([z.string().max(64), z.null()]).optional(),
  /** Code */
  code: z.string().max(20),
  /** Cost Time */
  cost_time: z.number().min(0),
  /** Country */
  country: z.union([z.string().max(64), z.null()]).optional(),
  /** Device */
  device: z.union([z.string().max(64), z.null()]).optional(),
  /** Id */
  id: z.number(),
  /** Ip */
  ip: z.string().max(64),
  /** Method */
  method: z.string().max(10),
  /** Msg */
  msg: z.union([z.string(), z.null()]).optional(),
  /** Object Id */
  object_id: z.union([z.string().max(64), z.null()]).optional(),
  /** Object Type */
  object_type: z.union([z.string().max(100), z.null()]).optional(),
  /** Opera Time */
  opera_time: z.string().datetime().optional(),
  /** Os */
  os: z.union([z.string().max(64), z.null()]).optional(),
  /** Path */
  path: z.string().max(200),
  /** Region */
  region: z.union([z.string().max(64), z.null()]).optional(),
  /** 操作状态 */
  status: z.lazy(() => OperaStatusSchema).optional().default("SUCCESS"),
  /** Title */
  title: z.string().max(100),
  /** Trace Id */
  trace_id: z.string().max(64),
  /** User Agent */
  user_agent: z.string().max(500),
  /** Username */
  username: z.union([z.string().max(32), z.null()]).optional(),
})


/**
 * 当前登录用户上下文响应 Schema

一次性返回前端初始化所需核心数据：
- 当前用户信息
- API 权限列表
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const AuthMyResponseSchema = z.object({
  /** Permissions */
  permissions: z.array(z.lazy(() => ApiPermissionInfoSchema)),
  /** 当前用户信息 */
  user: z.lazy(() => UserResponseSchema),
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
  /** 响应数据 */
  data: z.union([z.lazy(() => BatchOperationResultSchema), z.null()]).optional(),
  /** Message */
  message: z.string().optional().default("操作成功"),
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
  /** Errors */
  errors: z.union([z.array(z.record(z.any())), z.null()]).optional(),
  /** Failed */
  failed: z.number().min(0).optional().default(0),
  /** Results */
  results: z.union([z.array(z.any()), z.null()]).optional(),
  /** Success */
  success: z.number().min(0).optional().default(0),
  /** Total */
  total: z.number().min(0).optional().default(0),
})


/**
 * 回调日志响应 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const CallbackLogResponseSchema = z.object({
  /** Callback Type */
  callback_type: z.string(),
  /** Causation Id */
  causation_id: z.union([z.string(), z.null()]),
  /** Client Ip */
  client_ip: z.union([z.string(), z.null()]),
  /** Created At */
  created_at: z.string().datetime(),
  /** Error Message */
  error_message: z.union([z.string(), z.null()]),
  /** Event Id */
  event_id: z.union([z.string(), z.null()]),
  /** Failure Stage */
  failure_stage: z.union([z.string(), z.null()]),
  /** Id */
  id: z.number(),
  /** Ingress Outcome */
  ingress_outcome: z.union([z.string(), z.null()]),
  /** Request Body */
  request_body: z.record(z.any()),
  /** Request Id */
  request_id: z.union([z.string(), z.null()]),
  /** Response Status */
  response_status: z.number(),
  /** Response Time Ms */
  response_time_ms: z.number(),
  /** Subject Code */
  subject_code: z.string(),
  /** Trace Id */
  trace_id: z.union([z.string(), z.null()]),
  /** Updated At */
  updated_at: z.string().datetime(),
  /** User Agent */
  user_agent: z.union([z.string(), z.null()]),
})


/**
 * 回调主体维度回调日志列表响应。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const CallbackLogSubjectResponseSchema = z.object({
  /** Count */
  count: z.number().min(0),
  /** Items */
  items: z.array(z.lazy(() => CallbackLogResponseSchema)),
  /** Subject Code */
  subject_code: z.string(),
})


/**
 * Trace 维度回调日志列表响应。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const CallbackLogTraceResponseSchema = z.object({
  /** Count */
  count: z.number().min(0),
  /** Items */
  items: z.array(z.lazy(() => CallbackLogResponseSchema)),
  /** Trace Id */
  trace_id: z.string(),
})


export const ConfirmationObservationSchema = z.object({
  /** Attempt Count */
  attempt_count: z.number(),
  /** Deadline At */
  deadline_at: z.string(),
  /** Last Dispatch At */
  last_dispatch_at: z.union([z.string(), z.null()]),
  /** Next Attempt At */
  next_attempt_at: z.union([z.string(), z.null()]),
  /** Operation */
  operation: z.string(),
  /** Operation Id */
  operation_id: z.string(),
  /** Response Evidence Id */
  response_evidence_id: z.union([z.number(), z.null()]),
  /** Response Result */
  response_result: z.union([z.string(), z.null()]),
  /** Retry Eligible */
  retry_eligible: z.boolean(),
  status: z.lazy(() => WmsConfirmationStatusSchema),
  /** Updated At */
  updated_at: z.union([z.string(), z.null()]),
})


export const CreateTransportDebugRunRequestSchema = z.object({
  /** Face Groups */
  face_groups: z.array(z.lazy(() => TransportDebugRunFaceGroupRequestSchema)),
  /** Infeed Position */
  infeed_position: z.string().min(1).max(100).optional().default("CNV0301"),
  /** Outfeed Position */
  outfeed_position: z.string().min(1).max(100).optional().default("CNV0302"),
  /** Rack Id */
  rack_id: z.string().min(1).max(100),
  /** Scan Device Codes */
  scan_device_codes: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string().min(1).max(100))).optional().default(["STATION_SCAN9","STATION_SCAN10","STATION_SCAN11","STATION_SCAN12"]),
  /** Test Mode */
  test_mode: z.boolean().optional().default(false),
  /** Workline Code */
  workline_code: z.string().min(1).max(100),
  /** Workstation */
  workstation: z.string().min(1).max(100).optional().default("KT16"),
})


export const DebugTransportTaskCreatedSchema = z.object({
  /** Client Request Id */
  client_request_id: z.string(),
  /** Transport Task Id */
  transport_task_id: z.string(),
})


export const DebugTransportTaskResetPreviewSchema = z.object({
  /** Callback Receipt Count */
  callback_receipt_count: z.number(),
  /** Evidence Count */
  evidence_count: z.number(),
  /** Member Count */
  member_count: z.number(),
  /** Outcome Version */
  outcome_version: z.number(),
  /** Position Projection Count */
  position_projection_count: z.number(),
  /** Status */
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "SUCCEEDED", "FAILED", "RECONCILING"]),
  /** Transport Task Id */
  transport_task_id: z.string(),
})


export const DebugTransportTaskResetResultSchema = z.object({
  /** Deleted Callback Receipt Count */
  deleted_callback_receipt_count: z.number(),
  /** Deleted Evidence Count */
  deleted_evidence_count: z.number(),
  /** Deleted Member Count */
  deleted_member_count: z.number(),
  /** Deleted Position Projection Count */
  deleted_position_projection_count: z.number(),
  /** Transport Task Id */
  transport_task_id: z.string(),
})


export const DeviceCommandCallbackResponseSchema = z.object({
  /** Apply Status */
  apply_status: z.string(),
  /** Data */
  data: z.record(z.any()),
  /** Error Detail */
  error_detail: z.union([z.record(z.any()), z.null()]),
  /** Received At */
  received_at: z.string(),
  /** Result */
  result: z.string(),
  /** Source Event Id */
  source_event_id: z.string(),
})


/**
 * 设备创建合同。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceCreateSchema = z.object({
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Device Code */
  device_code: z.string().min(1).max(100),
  /** Device Name */
  device_name: z.string().min(1).max(100),
  /** Diagnostic Profile */
  diagnostic_profile: z.record(z.any()).optional(),
  /** Endpoint Base Url */
  endpoint_base_url: z.union([z.string().max(255), z.null()]).optional(),
  /** Is Active */
  is_active: z.boolean().optional().default(true),
  /** Sort Order */
  sort_order: z.number().optional().default(0),
  /** Upstream Device Id */
  upstream_device_id: z.union([z.number(), z.null()]).optional(),
})


/**
 * WES 设备诊断 Evidence 分类；不属于供应商 callback wire。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceEvidenceKindSchema = z.enum(["DEVICE_RESULT", "DEVICE_EVENT", "DEVICE_OBSERVATION"])


/**
 * device evidence 当前诊断快照；未处理的历史记录没有 processed_at。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceEvidenceUpdateSchema = z.object({
  /** Apply Status */
  apply_status: z.string(),
  /** Command Code */
  command_code: z.union([z.string(), z.null()]).optional(),
  /** Device Code */
  device_code: z.string(),
  /** Event Type */
  event_type: z.union([z.string(), z.null()]).optional(),
  /** Evidence Id */
  evidence_id: z.number(),
  kind: z.lazy(() => DeviceEvidenceKindSchema),
  /** Observation */
  observation: z.union([z.enum(["NOT_ACCEPTED", "RESULT_UNKNOWN"]), z.null()]).optional(),
  /** Observed At */
  observed_at: z.union([z.string(), z.null()]).optional(),
  /** Processed At */
  processed_at: z.union([z.string(), z.null()]),
  /** Reason Code */
  reason_code: z.union([z.string(), z.null()]).optional(),
  /** Source Event Id */
  source_event_id: z.string(),
})


/**
 * 一次 ECS callback HTTP 尝试的安全诊断快照。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceIngressAttemptSchema = z.object({
  /** Apply Status */
  apply_status: z.union([z.string(), z.null()]).optional(),
  /** Command Code */
  command_code: z.union([z.string(), z.null()]).optional(),
  /** Device Code */
  device_code: z.union([z.string(), z.null()]).optional(),
  disposition: z.lazy(() => DeviceIngressDispositionSchema),
  /** Error Code */
  error_code: z.union([z.string(), z.null()]).optional(),
  /** Event Type */
  event_type: z.union([z.string(), z.null()]).optional(),
  /** Evidence Id */
  evidence_id: z.union([z.number(), z.null()]).optional(),
  kind: z.lazy(() => DeviceIngressKindSchema),
  /** Observed Body Bytes */
  observed_body_bytes: z.number().min(0),
  /** Path */
  path: z.string(),
  /** Raw Payload */
  raw_payload: z.union([z.record(z.any()), z.null()]).optional(),
  /** Received At */
  received_at: z.string(),
  /** Request Id */
  request_id: z.string(),
  /** Source Event Id */
  source_event_id: z.union([z.string(), z.null()]).optional(),
  /** Status Code */
  status_code: z.number(),
})


export const DeviceIngressDispositionSchema = z.enum(["ACCEPTED", "DUPLICATE", "CONFLICT", "REJECTED"])


export const DeviceIngressHistoryItemSchema = z.object({
  attempt: z.union([z.lazy(() => DeviceIngressAttemptSchema), z.null()]),
  latest_update: z.union([z.lazy(() => DeviceEvidenceUpdateSchema), z.null()]),
  /** Recorded At */
  recorded_at: z.string(),
  /** Row Key */
  row_key: z.string(),
})


export const DeviceIngressHistoryPageSchema = z.object({
  /** Items */
  items: z.array(z.lazy(() => DeviceIngressHistoryItemSchema)),
  /** Next Cursor */
  next_cursor: z.union([z.string(), z.null()]),
})


export const DeviceIngressKindSchema = z.enum(["DEVICE_RESULT", "DEVICE_EVENT"])


/**
 * 设备静态主数据响应。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceResponseSchema = z.object({
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Device Code */
  device_code: z.string().min(1).max(100),
  /** Device Name */
  device_name: z.string().min(1).max(100),
  /** Diagnostic Profile */
  diagnostic_profile: z.record(z.any()).optional(),
  /** Endpoint Base Url */
  endpoint_base_url: z.union([z.string().max(255), z.null()]).optional(),
  /** Id */
  id: z.number(),
  /** Is Active */
  is_active: z.boolean().optional().default(true),
  /** Sort Order */
  sort_order: z.number().optional().default(0),
  /** Upstream Device Id */
  upstream_device_id: z.union([z.number(), z.null()]).optional(),
  /** Version */
  version: z.number(),
  /** Work Line Id */
  work_line_id: z.union([z.number(), z.null()]).optional(),
})


/**
 * 设备静态主数据更新合同。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceUpdateSchema = z.object({
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Device Code */
  device_code: z.union([z.string().min(1).max(100), z.null()]).optional(),
  /** Device Name */
  device_name: z.union([z.string().min(1).max(100), z.null()]).optional(),
  /** Diagnostic Profile */
  diagnostic_profile: z.union([z.record(z.any()), z.null()]).optional(),
  /** Endpoint Base Url */
  endpoint_base_url: z.union([z.string().max(255), z.null()]).optional(),
  /** Is Active */
  is_active: z.union([z.boolean(), z.null()]).optional(),
  /** Sort Order */
  sort_order: z.union([z.number(), z.null()]).optional(),
  /** Upstream Device Id */
  upstream_device_id: z.union([z.number(), z.null()]).optional(),
  /** Version */
  version: z.number(),
})


export const EcsCallbackAckSchema = z.object({
  /** Code */
  code: z.number(),
  error_detail: z.union([z.lazy(() => EcsCallbackRejectionDetailSchema), z.null()]).optional(),
  /** Message */
  message: z.string(),
})


export const EcsCallbackRejectionDetailSchema = z.object({
  /** Issues */
  issues: z.array(z.lazy(() => EcsCallbackValidationIssueSchema)),
})


export const EcsCallbackValidationIssueSchema = z.object({
  /** Code */
  code: z.string(),
  /** Expected */
  expected: z.union([z.string(), z.null()]).optional(),
  /** Field */
  field: z.string(),
})


/**
 * ECS 返回的设备静态描述。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const EcsDeviceInfoSchema = z.object({
  /** Device Code */
  device_code: z.string().min(1).max(100).regex(new RegExp("^[A-Za-z0-9][A-Za-z0-9._:-]*$")),
  /** Device Name */
  device_name: z.union([z.string().min(1).max(200), z.null()]),
  /** Device Type */
  device_type: z.union([z.string().min(1).max(100).regex(new RegExp("^[A-Za-z0-9][A-Za-z0-9._:-]*$")), z.null()]),
  /** Role */
  role: z.union([z.string().min(1).max(100).regex(new RegExp("^[A-Za-z0-9][A-Za-z0-9._:-]*$")), z.null()]),
  /** Supported Commands */
  supported_commands: z.union([z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())), z.null()]),
  /** Supported Events */
  supported_events: z.union([z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())), z.null()]),
})


export const EcsDeviceModeSchema = z.enum(["AUTO", "MANUAL", "MAINTENANCE", "UNKNOWN"])


/**
 * ECS 返回的设备运行状态。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const EcsDeviceRuntimeStateSchema = z.object({
  /** Current Command Code */
  current_command_code: z.union([z.string().min(1).max(160).regex(new RegExp("^[A-Za-z0-9][A-Za-z0-9._:-]*$")), z.null()]),
  /** Device Code */
  device_code: z.string().min(1).max(100).regex(new RegExp("^[A-Za-z0-9][A-Za-z0-9._:-]*$")),
  /** Is Online */
  is_online: z.boolean(),
  mode: z.lazy(() => EcsDeviceModeSchema),
  /** Scenario */
  scenario: z.union([z.string().min(1).max(100).regex(new RegExp("^[A-Za-z0-9][A-Za-z0-9._:-]*$")), z.null()]),
  status: z.lazy(() => EcsDeviceStateSchema),
  /** Updated At */
  updated_at: z.number().max(9223372036854776000),
})


export const EcsDeviceStateSchema = z.enum(["IDLE", "RUNNING", "ERROR", "PAUSED", "STOPPED", "OFFLINE", "UNKNOWN"])


export const EvidenceObservationSchema = z.object({
  apply_status: z.lazy(() => InboundEvidenceApplyStatusSchema),
  /** Decision Attempt Count */
  decision_attempt_count: z.number(),
  /** Decision Next Attempt At */
  decision_next_attempt_at: z.union([z.string(), z.null()]),
  /** Operation */
  operation: z.string(),
  /** Operation Id */
  operation_id: z.string(),
  /** Processed At */
  processed_at: z.union([z.string(), z.null()]),
  /** Published At */
  published_at: z.union([z.string(), z.null()]),
  /** Received At */
  received_at: z.string(),
})


export const ExchangeDetailSchema = z.object({
  /** Attempt Id */
  attempt_id: z.string().max(64),
  /** Build Version */
  build_version: z.string().max(64).optional().default("unknown"),
  /** Business Reference */
  business_reference: z.union([z.string().max(128), z.null()]).optional(),
  /** Comparisons */
  comparisons: z.array(z.lazy(() => FieldComparisonSchema)).optional(),
  /** Contract Status */
  contract_status: z.enum(["PASS", "ERROR", "NOT_VALIDATED"]).optional().default("NOT_VALIDATED"),
  /** Direction */
  direction: z.enum(["WMS_TO_WES", "WES_TO_WMS"]),
  /** Elapsed Ms */
  elapsed_ms: z.union([z.number(), z.null()]).optional(),
  /** Error Code */
  error_code: z.union([z.string().max(128), z.null()]).optional(),
  /** Exchange Id */
  exchange_id: z.string(),
  /** Incomplete */
  incomplete: z.boolean().optional().default(false),
  /** Method */
  method: z.string().max(8).optional().default("POST"),
  /** Observed At */
  observed_at: z.string().max(40),
  /** Operation */
  operation: z.union([z.string().max(128), z.null()]).optional(),
  /** Operation Id */
  operation_id: z.union([z.string().max(128), z.null()]).optional(),
  /** Path */
  path: z.union([z.string().max(256), z.null()]).optional(),
  request: z.lazy(() => WirePreviewSchema).optional(),
  response: z.lazy(() => WirePreviewSchema).optional(),
  /** Result */
  result: z.string().max(64).optional().default("NOT_OBSERVED"),
  /** Status Code */
  status_code: z.union([z.number(), z.null()]).optional(),
})


export const ExchangePageSchema = z.object({
  /** Items */
  items: z.array(z.lazy(() => ExchangeSummarySchema)),
  /** Next Cursor */
  next_cursor: z.union([z.string(), z.null()]),
  /** Retention Hours */
  retention_hours: z.number(),
  /** Scan Incomplete */
  scan_incomplete: z.boolean(),
})


export const ExchangeSummarySchema = z.object({
  /** Attempt Id */
  attempt_id: z.string().max(64),
  /** Business Reference */
  business_reference: z.union([z.string().max(128), z.null()]).optional(),
  /** Contract Status */
  contract_status: z.enum(["PASS", "ERROR", "NOT_VALIDATED"]).optional().default("NOT_VALIDATED"),
  /** Direction */
  direction: z.enum(["WMS_TO_WES", "WES_TO_WMS"]),
  /** Elapsed Ms */
  elapsed_ms: z.union([z.number(), z.null()]).optional(),
  /** Error Code */
  error_code: z.union([z.string().max(128), z.null()]).optional(),
  /** Exchange Id */
  exchange_id: z.union([z.string(), z.null()]).optional(),
  /** Incomplete */
  incomplete: z.boolean().optional().default(false),
  /** Method */
  method: z.string().max(8).optional().default("POST"),
  /** Observed At */
  observed_at: z.string().max(40),
  /** Operation */
  operation: z.union([z.string().max(128), z.null()]).optional(),
  /** Operation Id */
  operation_id: z.union([z.string().max(128), z.null()]).optional(),
  /** Path */
  path: z.union([z.string().max(256), z.null()]).optional(),
  /** Result */
  result: z.string().max(64).optional().default("NOT_OBSERVED"),
  /** Status Code */
  status_code: z.union([z.number(), z.null()]).optional(),
})


export const FieldComparisonSchema = z.object({
  /** Actual Present */
  actual_present: z.boolean(),
  /** Actual Value */
  actual_value: z.any().optional(),
  /** Expected Rule */
  expected_rule: z.string(),
  /** Expected Value */
  expected_value: z.any().optional(),
  /** Path */
  path: z.string(),
  /** Side */
  side: z.enum(["request", "response"]),
  /** Source */
  source: z.string(),
  /** Verdict */
  verdict: z.enum(["PASS", "ERROR", "NOT_VALIDATED"]),
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
  /** Conditions */
  conditions: z.array(z.union([z.lazy(() => FilterConditionSchema), z.lazy(() => FilterGroupSchema)])).optional(),
  /** Couple */
  couple: z.enum(["and", "or", "not"]).optional().default("and"),
}))


/**
 * 过滤操作符
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const FilterOperatorSchema = z.enum(["eq", "ne", "gt", "ge", "lt", "le", "in", "nin", "ilike", "between", "is_null", "not_null"])


export const InboundEvidenceApplyStatusSchema = z.enum(["PENDING", "APPLIED", "IGNORED", "RECONCILING"])


/**
 * 作业线类型枚举。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const LineTypeSchema = z.enum(["AUTO", "MANUAL", "HYBRID"])


export const ListResponseData_APIAccessLogResponse_Schema = z.object({
  /** Items */
  items: z.array(z.lazy(() => APIAccessLogResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
  /** Total */
  total: z.number().min(0).optional().default(0),
})


export const ListResponseData_APIApplicationResponse_Schema = z.object({
  /** Items */
  items: z.array(z.lazy(() => APIApplicationResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
  /** Total */
  total: z.number().min(0).optional().default(0),
})


export const ListResponseData_AuditLogResponse_Schema = z.object({
  /** Items */
  items: z.array(z.lazy(() => AuditLogResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
  /** Total */
  total: z.number().min(0).optional().default(0),
})


export const ListResponseData_CallbackLogResponse_Schema = z.object({
  /** Items */
  items: z.array(z.lazy(() => CallbackLogResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
  /** Total */
  total: z.number().min(0).optional().default(0),
})


export const ListResponseData_DeviceResponse_Schema = z.object({
  /** Items */
  items: z.array(z.lazy(() => DeviceResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
  /** Total */
  total: z.number().min(0).optional().default(0),
})


export const ListResponseData_PermissionResponse_Schema = z.object({
  /** Items */
  items: z.array(z.lazy(() => PermissionResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
  /** Total */
  total: z.number().min(0).optional().default(0),
})


export const ListResponseData_RoleResponse_Schema = z.object({
  /** Items */
  items: z.array(z.lazy(() => RoleResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
  /** Total */
  total: z.number().min(0).optional().default(0),
})


export const ListResponseData_UserResponse_Schema = z.object({
  /** Items */
  items: z.array(z.lazy(() => UserResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
  /** Total */
  total: z.number().min(0).optional().default(0),
})


export const ListResponseData_WorkLineResponse_Schema = z.object({
  /** Items */
  items: z.array(z.lazy(() => WorkLineResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
  /** Total */
  total: z.number().min(0).optional().default(0),
})


export const ListResponseSchemaModel_APIAccessLogResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_APIAccessLogResponse_Schema), z.null()]).optional(),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_APIApplicationResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_APIApplicationResponse_Schema), z.null()]).optional(),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_AuditLogResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_AuditLogResponse_Schema), z.null()]).optional(),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_CallbackLogResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_CallbackLogResponse_Schema), z.null()]).optional(),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_DeviceResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_DeviceResponse_Schema), z.null()]).optional(),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_PermissionResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_PermissionResponse_Schema), z.null()]).optional(),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_RoleResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_RoleResponse_Schema), z.null()]).optional(),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_UserResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_UserResponse_Schema), z.null()]).optional(),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_WorkLineResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_WorkLineResponse_Schema), z.null()]).optional(),
  /** Message */
  message: z.string().optional().default("操作成功"),
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
  /** Password */
  password: z.string().min(6).max(100),
  /** Username */
  username: z.string().min(3).max(50),
})


/**
 * 登录响应 Schema

包含访问令牌、刷新令牌元数据和用户信息
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const LoginResponseSchema = z.object({
  /** Access Token */
  access_token: z.string(),
  /** Access Token Expire Time */
  access_token_expire_time: z.string().datetime(),
  /** Access Token Jti */
  access_token_jti: z.string(),
  /** Expires In */
  expires_in: z.number(),
  /** Refresh Expires In */
  refresh_expires_in: z.number(),
  /** Refresh Token Expire Time */
  refresh_token_expire_time: z.string().datetime(),
  /** Refresh Token Jti */
  refresh_token_jti: z.string(),
  /** Session Uuid */
  session_uuid: z.string(),
  /** 用户信息 */
  user: z.lazy(() => UserResponseSchema),
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


export const ManualDebugDeviceCommandCreateSchema = z.object({
  /** Client Request Id */
  client_request_id: z.string().min(36).max(36).regex(new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")),
  /** Device Code */
  device_code: z.string().min(1).max(100).regex(new RegExp("^[A-Za-z0-9][A-Za-z0-9._:-]*$")),
  /** Endpoint Base Url */
  endpoint_base_url: z.string().min(1).max(255),
  /** Params */
  params: z.record(z.any()).optional(),
  /** Reason */
  reason: z.string().min(1).max(500),
  /** Task Type */
  task_type: z.string().min(1).max(100).regex(new RegExp("^[A-Za-z0-9][A-Za-z0-9._:-]*$")),
  /** Timeout */
  timeout: z.number().max(2147483647),
})


export const ManualDebugDeviceCommandCreatedSchema = z.object({
  /** Client Request Id */
  client_request_id: z.string(),
  /** Command Code */
  command_code: z.string(),
  /** Status */
  status: z.string(),
})


export const ManualDebugDeviceCommandResponseSchema = z.object({
  /** Ack Received At */
  ack_received_at: z.union([z.string(), z.null()]),
  /** Attempt Count */
  attempt_count: z.number(),
  callback: z.union([z.lazy(() => DeviceCommandCallbackResponseSchema), z.null()]),
  /** Client Request Id */
  client_request_id: z.string(),
  /** Command Code */
  command_code: z.string(),
  /** Command Timeout Ms */
  command_timeout_ms: z.number(),
  /** Completed At */
  completed_at: z.union([z.string(), z.null()]),
  /** Contract Key */
  contract_key: z.string(),
  /** Contract Version */
  contract_version: z.string(),
  /** Created By */
  created_by: z.number(),
  /** Device Code */
  device_code: z.string(),
  /** Endpoint Base Url */
  endpoint_base_url: z.string(),
  /** Execution Reason */
  execution_reason: z.string(),
  /** Failure Code */
  failure_code: z.union([z.string(), z.null()]),
  /** Params */
  params: z.record(z.any()),
  /** Reconciliation Reason */
  reconciliation_reason: z.union([z.string(), z.null()]),
  /** Status */
  status: z.string(),
  /** Task Type */
  task_type: z.string(),
  /** Trace Id */
  trace_id: z.union([z.string(), z.null()]),
})


export const ManualDebugPreflightDeviceSchema = z.object({
  /** Admissible */
  admissible: z.boolean(),
  device: z.lazy(() => EcsDeviceInfoSchema),
  /** Rejection Code */
  rejection_code: z.union([z.string(), z.null()]),
  state: z.lazy(() => EcsDeviceRuntimeStateSchema),
})


export const ManualDebugPreflightRequestSchema = z.object({
  /** Endpoint Base Url */
  endpoint_base_url: z.string().min(1).max(255),
})


export const ManualDebugPreflightResponseSchema = z.object({
  /** Devices */
  devices: z.array(z.lazy(() => ManualDebugPreflightDeviceSchema)),
  /** Endpoint Base Url */
  endpoint_base_url: z.string(),
})


/**
 * 操作日志状态
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const OperaStatusSchema = z.enum(["FAIL", "SUCCESS"])


/**
 * API 权限响应 Schema（完整版）
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PermissionResponseSchema = z.object({
  /** Action */
  action: z.union([z.string().max(50), z.null()]).optional(),
  /** Category */
  category: z.union([z.string().max(50), z.null()]).optional(),
  /** Description */
  description: z.union([z.string().max(255), z.null()]).optional(),
  /** Has Children */
  has_children: z.boolean().optional().default(false),
  /** Id */
  id: z.number(),
  /** Level */
  level: z.number().optional().default(1),
  /** Method */
  method: z.union([z.string().max(10), z.null()]).optional(),
  /** Name */
  name: z.string().max(100),
  /** Parent Id */
  parent_id: z.union([z.number(), z.null()]).optional(),
  /** Path */
  path: z.union([z.string().max(255), z.null()]).optional(),
  /** Resource */
  resource: z.union([z.string().max(50), z.null()]).optional(),
  /** Sort Order */
  sort_order: z.number().optional().default(0),
  /** Tree Path */
  tree_path: z.string().optional().default("/"),
  /** Type */
  type: z.string().max(20).optional().default("user_api"),
  /** Version */
  version: z.number(),
})


/**
 * API 权限树形结构 Schema

用于权限分组展示和管理（如按模块分组）
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PermissionTreeSchema = z.lazy((): z.ZodTypeAny => z.object({
  /** Action */
  action: z.union([z.string().max(50), z.null()]).optional(),
  /** Category */
  category: z.union([z.string().max(50), z.null()]).optional(),
  /** Children */
  children: z.array(z.lazy(() => PermissionTreeSchema)).optional(),
  /** Description */
  description: z.union([z.string().max(255), z.null()]).optional(),
  /** Has Children */
  has_children: z.boolean().optional().default(false),
  /** Id */
  id: z.number(),
  /** Level */
  level: z.number().optional().default(1),
  /** Method */
  method: z.union([z.string().max(10), z.null()]).optional(),
  /** Name */
  name: z.string().max(100),
  /** Parent Id */
  parent_id: z.union([z.number(), z.null()]).optional(),
  /** Path */
  path: z.union([z.string().max(255), z.null()]).optional(),
  /** Resource */
  resource: z.union([z.string().max(50), z.null()]).optional(),
  /** Sort Order */
  sort_order: z.number().optional().default(0),
  /** Tree Path */
  tree_path: z.string().optional().default("/"),
  /** Type */
  type: z.string().max(20).optional().default("user_api"),
}))


/**
 * Active Objects v2 的位置证据摘要；与 v1 同源，仅冲突状态改为字面量。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneActiveObjectLocationSchema = z.object({
  /** Conflict State */
  conflict_state: z.enum(["OK", "TRANSIENT", "RECONCILING"]),
  /** Evidence Refs */
  evidence_refs: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
  /** Location Code */
  location_code: z.string(),
  /** Location Scope */
  location_scope: z.string(),
})


/**
 * Active Objects v2 单个对象视图；在 v1 字段基础上追加 resource_ref。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneActiveObjectViewSchema = z.object({
  /** All Sources */
  all_sources: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
  /** Conflict State */
  conflict_state: z.enum(["OK", "TRANSIENT", "RECONCILING"]),
  /** Evidence Refs */
  evidence_refs: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
  location_summary: z.union([z.lazy(() => PlaneActiveObjectLocationSchema), z.null()]).optional(),
  /** Object Key */
  object_key: z.string(),
  /** Object Type */
  object_type: z.string(),
  /** Operator Hint */
  operator_hint: z.union([z.string(), z.null()]).optional(),
  /** Primary Source */
  primary_source: z.union([z.string(), z.null()]).optional(),
  resource_ref: z.union([z.lazy(() => PlaneResourceRefSchema), z.null()]).optional(),
})


/**
 * 资源中心的 WorkLine active objects；与 v1 并存，互不改变语义。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneActiveObjectsV2Schema = z.object({
  /** Objects */
  objects: z.array(z.lazy(() => PlaneActiveObjectViewSchema)).optional(),
  /** Scene Revision */
  scene_revision: z.union([z.string().max(64), z.null()]).optional(),
  /** Total Count */
  total_count: z.number().min(0).optional().default(0),
  /** Truncated */
  truncated: z.boolean().optional().default(false),
  /** Workline Id */
  workline_id: z.number(),
})


/**
 * 按需读取的 WorkLine 当前任务采样。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneCurrentTaskV2Schema = z.object({
  current_task: z.union([z.lazy(() => PlaneCurrentTaskViewSchema), z.null()]).optional(),
  /** Generated At */
  generated_at: z.string().datetime(),
  /** Schema Version */
  schema_version: z.literal("plane.current-task.v2"),
})


/**
 * WorkLine 当前绑定的 PickingTask 及其公开 plan_delta 目标。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneCurrentTaskViewSchema = z.object({
  /** Last Applied Plan Revision */
  last_applied_plan_revision: z.number().min(0),
  /** Status */
  status: z.enum(["PREPARING", "EXECUTING"]),
  /** Target Rack Face */
  target_rack_face: z.union([z.string(), z.null()]).optional(),
  /** Target Rack Id */
  target_rack_id: z.union([z.string(), z.null()]).optional(),
  /** Task Id */
  task_id: z.string(),
})


/**
 * Plane scene edge.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneEdgeSchema = z.object({
  /** Code */
  code: z.string().min(1).max(120),
  /** From Code */
  from_code: z.string().min(1).max(120),
  /** Label */
  label: z.union([z.string().max(120), z.null()]).optional(),
  /** To Code */
  to_code: z.string().min(1).max(120),
})


/**
 * Plane snapshot extreme state marker.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneExtremeStateSchema = z.object({
  /** Code */
  code: z.string().min(1).max(120),
  /** Label */
  label: z.string().min(1).max(120),
  /** Severity */
  severity: z.string().min(1).max(40),
})


/**
 * Plane scene node with stable code and display label.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneNodeSchema = z.object({
  /** Code */
  code: z.string().min(1).max(120),
  /** Kind */
  kind: z.string().min(1).max(80),
  /** Label */
  label: z.string().min(1).max(120),
})


/**
 * Plane snapshot object state.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneObjectSnapshotSchema = z.object({
  /** Object Code */
  object_code: z.string().min(1).max(120),
  /** Object Label */
  object_label: z.string().min(1).max(120),
  /** State */
  state: z.string().min(1).max(80),
})


/**
 * Definition 已不再声明、但历史 config 仍保留的绑定诊断。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneOrphanBindingSchema = z.object({
  /** Bound Code */
  bound_code: z.string().min(1).max(120),
  group: z.lazy(() => PlaneResourceGroupSchema),
  /** Key */
  key: z.string().min(1).max(100),
  /** Reason */
  reason: z.string().min(1).max(80),
})


/**
 * Scene v2 单个资源行：Definition 声明 + WorkLine 实际绑定 + 绑定状态。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneResourceSchema = z.object({
  binding: z.union([z.lazy(() => PlaneResourceBindingSchema), z.null()]).optional(),
  binding_state: z.lazy(() => SceneBindingStateSchema),
  /** Declared Constraints */
  declared_constraints: z.record(z.union([z.string(), z.null()])).optional(),
  /** Display Name */
  display_name: z.string().min(1).max(100),
  /** Key */
  key: z.string().min(1).max(100),
  /** Stable Order */
  stable_order: z.number().min(0),
})


/**
 * Scene v2 资源行的实际绑定；只暴露编码、名称和启用状态。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneResourceBindingSchema = z.object({
  /** Code */
  code: z.string().min(1).max(120),
  /** Enabled */
  enabled: z.boolean().optional().default(true),
  /** Name */
  name: z.union([z.string().max(120), z.null()]).optional(),
  /** Type */
  type: z.union([z.string().max(40), z.null()]).optional(),
})


/**
 * Scene v2 资源分组；只有这两组，不引入插件私有分组。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneResourceGroupSchema = z.enum(["POSITION_SLOT", "DEVICE_ROLE"])


/**
 * 按 Definition 资源类型分组，顺序即展示顺序。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneResourceGroupsSchema = z.object({
  /** Device Role */
  DEVICE_ROLE: z.array(z.lazy(() => PlaneResourceSchema)).optional(),
  /** Position Slot */
  POSITION_SLOT: z.array(z.lazy(() => PlaneResourceSchema)).optional(),
})


/**
 * Snapshot/Active Objects 关联 Scene 资源行的唯一引用；不表达绑定详情。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneResourceRefSchema = z.object({
  group: z.lazy(() => PlaneResourceGroupSchema),
  /** Key */
  key: z.string().min(1).max(100),
})


/**
 * 单个资源在当前 Snapshot 下的活动摘要；只在 source_status=COMPLETE 时可信。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneResourceStateSchema = z.object({
  /** Active Object Count */
  active_object_count: z.number().min(0),
  /** Highest Conflict State */
  highest_conflict_state: z.enum(["OK", "TRANSIENT", "RECONCILING"]),
  resource_ref: z.lazy(() => PlaneResourceRefSchema),
})


/**
 * Scene v2 附带诊断；不创建伪造资源行。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneSceneDiagnosticsSchema = z.object({
  /** Orphan Bindings */
  orphan_bindings: z.array(z.lazy(() => PlaneOrphanBindingSchema)).optional(),
})


/**
 * Scene v2 的重新生成触发依据；用于排查 revision 变化原因。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneSceneGeneratedFromSchema = z.object({
  /** Plugin Version */
  plugin_version: z.union([z.string(), z.null()]).optional(),
  /** Workline Version */
  workline_version: z.number(),
})


/**
 * 资源中心的 WorkLine plane 静态 scene；与 plane.scene.v1 并存，互不改变语义。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneSceneV2Schema = z.object({
  diagnostics: z.lazy(() => PlaneSceneDiagnosticsSchema),
  generated_from: z.lazy(() => PlaneSceneGeneratedFromSchema),
  resource_groups: z.lazy(() => PlaneResourceGroupsSchema),
  /** Scene Revision */
  scene_revision: z.string().min(1).max(64),
  /** Schema Version */
  schema_version: z.literal("plane.scene.v2"),
  workline: z.lazy(() => PlaneWorkLineIdentityV2Schema),
})


/**
 * WorkLine plane static scene view.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneSceneViewSchema = z.object({
  /** Edges */
  edges: z.array(z.lazy(() => PlaneEdgeSchema)),
  /** Nodes */
  nodes: z.array(z.lazy(() => PlaneNodeSchema)),
  /** Schema Version */
  schema_version: z.literal("plane.scene.v1"),
  /** Workline Code */
  workline_code: z.string().min(1).max(80),
})


/**
 * WorkLine plane dynamic snapshot.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneSnapshotSchema = z.object({
  /** Extremes */
  extremes: z.array(z.lazy(() => PlaneExtremeStateSchema)),
  /** Objects */
  objects: z.array(z.lazy(() => PlaneObjectSnapshotSchema)),
  /** Scene Schema Version */
  scene_schema_version: z.literal("plane.scene.v1"),
  /** Schema Version */
  schema_version: z.literal("plane.snapshot.v1"),
  /** Workline Code */
  workline_code: z.string().min(1).max(80),
})


/**
 * Snapshot v2 数据来源状态；非 COMPLETE 时前端不得渲染伪造的零活动。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneSnapshotSourceStatusSchema = z.enum(["COMPLETE", "PARTIAL", "FAILED", "STALE"])


/**
 * 资源中心的 WorkLine plane 动态 snapshot；与 plane.snapshot.v1 并存，互不改变语义。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneSnapshotV2Schema = z.object({
  /** Generated At */
  generated_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Resource States */
  resource_states: z.array(z.lazy(() => PlaneResourceStateSchema)).optional(),
  /** Scene Revision */
  scene_revision: z.union([z.string().max(64), z.null()]).optional(),
  /** Schema Version */
  schema_version: z.literal("plane.snapshot.v2"),
  source_status: z.lazy(() => PlaneSnapshotSourceStatusSchema),
  /** Total Count */
  total_count: z.number().min(0).optional().default(0),
  /** Truncated */
  truncated: z.boolean().optional().default(false),
  /** Unmapped Object Count */
  unmapped_object_count: z.number().min(0).optional().default(0),
})


/**
 * Scene v2 的 WorkLine 静态身份切片；不包含 config 等敏感字段。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneWorkLineIdentityV2Schema = z.object({
  /** Id */
  id: z.number(),
  /** Is Active */
  is_active: z.boolean(),
  /** Line Code */
  line_code: z.string().min(1).max(80),
  /** Line Name */
  line_name: z.string().min(1).max(120),
  /** Line Type */
  line_type: z.string(),
  /** Plugin Display Name */
  plugin_display_name: z.union([z.string(), z.null()]).optional(),
  /** Plugin Key */
  plugin_key: z.union([z.string(), z.null()]).optional(),
  /** Plugin Version */
  plugin_version: z.union([z.string(), z.null()]).optional(),
  /** Run Mode */
  run_mode: z.string(),
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
  /** Include Deleted */
  include_deleted: z.boolean().optional().default(false),
  /** Limit */
  limit: z.number().min(1).max(100).optional().default(10),
  /** Max Depth */
  max_depth: z.number().min(0).max(3).optional().default(1),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
  /** Sort */
  sort: z.union([z.array(z.lazy(() => SortFieldSchema)), z.null()]).optional(),
})


export const RackKindSchema = z.enum(["SINGLE_LAYER", "FIVE_LAYER", "RETURN", "TRANSFER", "PRODUCTION"])


export const RcsTemplateIdSchema = z.enum(["CTU01", "CTU02", "CTU03", "F01"])


/**
 * 刷新令牌响应 Schema

包含新的访问令牌和刷新令牌元数据
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RefreshTokenResponseSchema = z.object({
  /** Access Token */
  access_token: z.string(),
  /** Access Token Expire Time */
  access_token_expire_time: z.string().datetime(),
  /** Access Token Jti */
  access_token_jti: z.string(),
  /** Expires In */
  expires_in: z.number(),
  /** Refresh Expires In */
  refresh_expires_in: z.number(),
  /** Refresh Token Expire Time */
  refresh_token_expire_time: z.string().datetime(),
  /** Refresh Token Jti */
  refresh_token_jti: z.string(),
  /** Session Uuid */
  session_uuid: z.string(),
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
  /** 新的有效期时长 */
  validity_period: z.lazy(() => ValidityPeriodSchema),
  /** Version */
  version: z.number().optional().default(0),
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
  /** Description */
  description: z.union([z.string().max(255), z.null()]).optional(),
  /** Name */
  name: z.string().min(1).max(100),
})


/**
 * 角色响应 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RoleResponseSchema = z.object({
  /** Description */
  description: z.union([z.string().max(255), z.null()]).optional(),
  /** Id */
  id: z.number(),
  /** Name */
  name: z.string().min(1).max(100),
  /** Permissions */
  permissions: z.array(z.lazy(() => PermissionResponseSchema)).optional(),
  /** Version */
  version: z.number(),
})


/**
 * 角色响应 Schema（简化版，不含权限）
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RoleResponseSimpleSchema = z.object({
  /** Description */
  description: z.union([z.string().max(255), z.null()]).optional(),
  /** Id */
  id: z.number(),
  /** Name */
  name: z.string().min(1).max(100),
})


/**
 * 角色更新 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RoleUpdateSchema = z.object({
  /** Description */
  description: z.union([z.string().max(255), z.null()]).optional(),
  /** Name */
  name: z.union([z.string().min(1).max(100), z.null()]).optional(),
  /** Version */
  version: z.number(),
})


/**
 * Scene v2 资源行的静态绑定状态；不表达动态过程状态。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const SceneBindingStateSchema = z.enum(["BOUND", "UNBOUND", "INVALID"])


/**
 * 会话信息 Schema

描述一个活跃的用户会话
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const SessionInfoSchema = z.object({
  /** Created At */
  created_at: z.string().datetime(),
  /** Device Info */
  device_info: z.union([z.record(z.any()), z.null()]).optional(),
  /** Jti */
  jti: z.string(),
  /** Last Active */
  last_active: z.union([z.string().datetime(), z.null()]).optional(),
  /** Session Uuid */
  session_uuid: z.string(),
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


export const TransportCallbackReceiptResponseSchema = z.object({
  /** Conflict Code */
  conflict_code: z.union([z.string(), z.null()]),
  /** Operation */
  operation: z.string(),
  /** Operation Id */
  operation_id: z.string(),
  /** Received At */
  received_at: z.string(),
  /** Response Code */
  response_code: z.string(),
  /** Response Data */
  response_data: z.record(z.any()),
  /** Response Http Status */
  response_http_status: z.number(),
})


export const TransportDebugReturnedBinResponseSchema = z.object({
  /** Bin Code */
  bin_code: z.string(),
  /** Rack Face */
  rack_face: z.string().min(1).max(10).refine((value) => value.length > 0 && !value.includes(String.fromCharCode(0))),
  /** Rack Id */
  rack_id: z.string(),
  /** Slot Id */
  slot_id: z.string(),
})


export const TransportDebugRunBinRequestSchema = z.object({
  /** Bin Code */
  bin_code: z.string().min(1).max(100),
  /** Slot Id */
  slot_id: z.string().min(1).max(100),
})


export const TransportDebugRunBinResponseSchema = z.object({
  /** Bin Code */
  bin_code: z.string(),
  /** Slot Id */
  slot_id: z.string(),
})


export const TransportDebugRunFaceGroupRequestSchema = z.object({
  /** Bins */
  bins: z.array(z.lazy(() => TransportDebugRunBinRequestSchema)),
  /** Face */
  face: z.string().min(1).max(10).refine((value) => value.length > 0 && !value.includes(String.fromCharCode(0))),
})


export const TransportDebugRunFaceGroupResponseSchema = z.object({
  /** Bins */
  bins: z.array(z.lazy(() => TransportDebugRunBinResponseSchema)),
  /** Face */
  face: z.string().min(1).max(10).refine((value) => value.length > 0 && !value.includes(String.fromCharCode(0))),
})


export const TransportDebugRunPageResponseSchema = z.object({
  /** Items */
  items: z.array(z.lazy(() => TransportDebugRunResponseSchema)),
  /** Next Cursor */
  next_cursor: z.union([z.string(), z.null()]),
})


export const TransportDebugRunPhaseSchema = z.enum(["RACK_TO_STATION", "BINS_TO_INFEED", "WAIT_SCAN12", "BINS_TO_RACK", "ROTATE_TO_NEXT_FACE", "RACK_TO_STORAGE"])


export const TransportDebugRunResponseSchema = z.object({
  /** Aborted By User Id */
  aborted_by_user_id: z.union([z.number(), z.null()]),
  /** Aborted Reason */
  aborted_reason: z.union([z.string(), z.null()]),
  /** Attention Code */
  attention_code: z.union([z.string(), z.null()]),
  /** Attention Detail */
  attention_detail: z.union([z.string(), z.null()]),
  /** Can Abort */
  can_abort: z.boolean(),
  /** Created At */
  created_at: z.string(),
  /** Created By User Id */
  created_by_user_id: z.number(),
  /** Current Group Index */
  current_group_index: z.number(),
  current_phase: z.lazy(() => TransportDebugRunPhaseSchema),
  current_step: z.union([z.lazy(() => TransportDebugRunStepResponseSchema), z.null()]),
  /** Face Groups */
  face_groups: z.array(z.lazy(() => TransportDebugRunFaceGroupResponseSchema)),
  /** Infeed Position */
  infeed_position: z.string(),
  /** Observed Bin Codes */
  observed_bin_codes: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())),
  /** Outfeed Position */
  outfeed_position: z.string(),
  /** Rack Id */
  rack_id: z.string(),
  /** Returned Bins */
  returned_bins: z.array(z.lazy(() => TransportDebugReturnedBinResponseSchema)),
  /** Run Id */
  run_id: z.string(),
  /** Scan Device Codes */
  scan_device_codes: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())),
  status: z.lazy(() => TransportDebugRunStatusSchema),
  /** Steps */
  steps: z.array(z.lazy(() => TransportDebugRunStepResponseSchema)),
  /** Test Mode */
  test_mode: z.boolean().optional().default(false),
  /** Updated At */
  updated_at: z.string(),
  /** Version */
  version: z.number(),
  /** Workline Code */
  workline_code: z.string(),
  /** Workstation */
  workstation: z.string(),
})


export const TransportDebugRunStatusSchema = z.enum(["RUNNING", "NEEDS_ATTENTION", "COMPLETED", "FAILED", "ABORTED"])


export const TransportDebugRunStepResponseSchema = z.object({
  /** Client Request Id */
  client_request_id: z.union([z.string(), z.null()]),
  /** Created At */
  created_at: z.string(),
  /** Evidence High Watermark */
  evidence_high_watermark: z.union([z.number(), z.null()]),
  /** Evidence Not Before Ms */
  evidence_not_before_ms: z.union([z.number(), z.null()]),
  /** Group Index */
  group_index: z.union([z.number(), z.null()]),
  /** Observed Bin Codes */
  observed_bin_codes: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())),
  /** Ordinal */
  ordinal: z.number(),
  phase: z.lazy(() => TransportDebugRunPhaseSchema),
  /** Reason Code */
  reason_code: z.union([z.string(), z.null()]),
  status: z.lazy(() => TransportDebugRunStepStatusSchema),
  /** Transport Task Id */
  transport_task_id: z.union([z.string(), z.null()]),
  /** Updated At */
  updated_at: z.string(),
})


export const TransportDebugRunStepStatusSchema = z.enum(["PENDING", "WAITING", "SUCCEEDED", "FAILED", "NEEDS_ATTENTION"])


export const TransportDebugStepSchema = z.enum(["RACK_TO_STATION", "BINS_TO_INFEED", "BINS_TO_RACK", "RACK_TO_STORAGE"])


export const TransportEvidenceResponseSchema = z.object({
  /** Conflict Code */
  conflict_code: z.union([z.string(), z.null()]),
  /** Operation */
  operation: z.string(),
  /** Operation Id */
  operation_id: z.string(),
  /** Outcome Revision */
  outcome_revision: z.union([z.number(), z.null()]),
  /** Processed At */
  processed_at: z.union([z.string(), z.null()]),
  /** Received At */
  received_at: z.string(),
  /** Status */
  status: z.enum(["PENDING", "APPLIED", "CONFLICT"]),
})


export const TransportResultMemberResponseSchema = z.object({
  /** Arrival Face */
  arrival_face: z.union([z.string().min(1).max(10).refine((value) => value.length > 0 && !value.includes(String.fromCharCode(0))), z.null()]),
  /** Failure Code */
  failure_code: z.union([z.string(), z.null()]),
  /** Final Position */
  final_position: z.union([z.record(z.any()), z.null()]),
  /** Object Id */
  object_id: z.string(),
  /** Position Unknown */
  position_unknown: z.boolean(),
  /** Status */
  status: z.enum(["UNKNOWN", "FAILED", "SUCCEEDED"]),
})


export const TransportResultResponseSchema = z.object({
  /** Members */
  members: z.array(z.lazy(() => TransportResultMemberResponseSchema)),
  /** Outcome Version */
  outcome_version: z.number(),
  /** Reason Code */
  reason_code: z.union([z.string(), z.null()]),
  /** Status */
  status: z.enum(["SUCCEEDED", "FAILED", "REJECTED", "UNKNOWN"]),
})


export const TransportTaskKindSchema = z.enum(["RACK_MOVE", "RACK_ROTATE", "BIN_MOVE", "BIN_EXCHANGE"])


export const TransportTaskPageResponseSchema = z.object({
  /** Items */
  items: z.array(z.lazy(() => TransportTaskSummaryResponseSchema)),
  /** Next Cursor */
  next_cursor: z.union([z.string(), z.null()]),
})


export const TransportTaskResponseSchema = z.object({
  /** Client Request Id */
  client_request_id: z.string(),
  /** Created At */
  created_at: z.string(),
  /** Kind */
  kind: z.enum(["RACK_MOVE", "RACK_ROTATE", "BIN_MOVE", "BIN_EXCHANGE"]),
  latest_evidence: z.union([z.lazy(() => TransportEvidenceResponseSchema), z.null()]),
  /** Next Submit At */
  next_submit_at: z.union([z.string(), z.null()]),
  /** Outcome Version */
  outcome_version: z.number(),
  /** Pending Evidence Count */
  pending_evidence_count: z.number(),
  /** Published Outcome Version */
  published_outcome_version: z.number(),
  /** Reason Code */
  reason_code: z.union([z.string(), z.null()]),
  /** Request */
  request: z.record(z.any()),
  result: z.union([z.lazy(() => TransportResultResponseSchema), z.null()]),
  /** Result Deadline At */
  result_deadline_at: z.union([z.string(), z.null()]),
  /** Send Started At */
  send_started_at: z.union([z.string(), z.null()]),
  /** Status */
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "SUCCEEDED", "FAILED", "RECONCILING"]),
  /** Submit Attempt Count */
  submit_attempt_count: z.number(),
  /** Submit Operation Id */
  submit_operation_id: z.string(),
  /** Transport Task Id */
  transport_task_id: z.string(),
  /** Updated At */
  updated_at: z.string(),
})


export const TransportTaskStatusSchema = z.enum(["PENDING", "ACCEPTED", "REJECTED", "SUCCEEDED", "FAILED", "RECONCILING"])


export const TransportTaskSummaryResponseSchema = z.object({
  /** Client Request Id */
  client_request_id: z.string(),
  /** Created At */
  created_at: z.string(),
  /** Kind */
  kind: z.enum(["RACK_MOVE", "RACK_ROTATE", "BIN_MOVE", "BIN_EXCHANGE"]),
  latest_evidence: z.union([z.lazy(() => TransportEvidenceResponseSchema), z.null()]),
  /** Reason Code */
  reason_code: z.union([z.string(), z.null()]),
  /** Status */
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "SUCCEEDED", "FAILED", "RECONCILING"]),
  /** Submit Operation Id */
  submit_operation_id: z.string(),
  /** Transport Task Id */
  transport_task_id: z.string(),
  /** Updated At */
  updated_at: z.string(),
})


/**
 * 测试 API 调用数据模型
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const TryInvokeApplicationSchema = z.object({
  /** Command Description */
  command_description: z.string(),
  /** Command Name */
  command_name: z.string(),
  /** Command Parameters */
  command_parameters: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())),
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
  /** Email */
  email: z.string().max(100).email(),
  /** Full Name */
  full_name: z.union([z.string().max(100), z.null()]).optional(),
  /** Password */
  password: z.string().min(6).max(100),
  /** Username */
  username: z.string().min(3).max(50),
})


/**
 * 用户权限列表响应 Schema

包含用户有权限访问的所有 API 权限
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const UserPermissionsResponseSchema = z.object({
  /** Permissions */
  permissions: z.array(z.lazy(() => ApiPermissionInfoSchema)),
  /** Total */
  total: z.number(),
})


/**
 * 用户响应 Schema - 返回给客户端
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const UserResponseSchema = z.object({
  /** Created At */
  created_at: z.string().datetime(),
  /** Created By */
  created_by: z.union([z.number(), z.null()]).optional(),
  /** Deleted At */
  deleted_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Deleted By */
  deleted_by: z.union([z.number(), z.null()]).optional(),
  /** Email */
  email: z.string().max(100).email(),
  /** Full Name */
  full_name: z.union([z.string().max(100), z.null()]).optional(),
  /** Id */
  id: z.number(),
  /** Is Multi Login */
  is_multi_login: z.boolean(),
  /** Is Superuser */
  is_superuser: z.boolean(),
  /** Roles */
  roles: z.array(z.lazy(() => RoleResponseSimpleSchema)).optional(),
  /** Updated At */
  updated_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Updated By */
  updated_by: z.union([z.number(), z.null()]).optional(),
  /** Username */
  username: z.string().min(3).max(50),
  /** Version */
  version: z.number().optional().default(0),
})


/**
 * 用户响应 Schema 无关联关系 - 返回给客户端
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const UserSimpleResponseSchema = z.object({
  /** Created At */
  created_at: z.string().datetime(),
  /** Created By */
  created_by: z.union([z.number(), z.null()]).optional(),
  /** Deleted At */
  deleted_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Deleted By */
  deleted_by: z.union([z.number(), z.null()]).optional(),
  /** Email */
  email: z.string().max(100).email(),
  /** Full Name */
  full_name: z.union([z.string().max(100), z.null()]).optional(),
  /** Id */
  id: z.number(),
  /** Is Multi Login */
  is_multi_login: z.boolean(),
  /** Is Superuser */
  is_superuser: z.boolean(),
  /** Updated At */
  updated_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Updated By */
  updated_by: z.union([z.number(), z.null()]).optional(),
  /** Username */
  username: z.string().min(3).max(50),
  /** Version */
  version: z.number().optional().default(0),
})


/**
 * 用户更新 Schema - 所有字段可选
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const UserUpdateSchema = z.object({
  /** Email */
  email: z.union([z.string().max(100).email(), z.null()]).optional(),
  /** Full Name */
  full_name: z.union([z.string().max(100), z.null()]).optional(),
  /** Username */
  username: z.union([z.string().min(3).max(50), z.null()]).optional(),
  /** Version */
  version: z.number(),
})


export const ValidationErrorSchema = z.object({
  /** Context */
  ctx: z.record(z.any()).optional(),
  /** Input */
  input: z.any().optional(),
  /** Location */
  loc: z.array(z.union([z.string(), z.number()])),
  /** Message */
  msg: z.string(),
  /** Error Type */
  type: z.string(),
})


/**
 * 有效期枚举
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ValidityPeriodSchema = z.enum(["1d", "1w", "1m", "6m", "1y", "never"])


export const WirePreviewSchema = z.object({
  /** Body */
  body: z.union([z.string(), z.null()]).optional(),
  /** Headers */
  headers: z.array(z.array(z.any())).optional(),
  /** Source */
  source: z.enum(["WIRE", "FROZEN_PAYLOAD", "NOT_CAPTURED"]).optional().default("NOT_CAPTURED"),
  /** State */
  state: z.enum(["CAPTURED", "TRUNCATED", "UNSAFE_JSON", "EMPTY", "NOT_CAPTURED", "NO_RESPONSE"]).optional().default("NOT_CAPTURED"),
})


export const WmsConfirmationStatusSchema = z.enum(["PENDING", "DISPATCHING", "COMPLETED", "RECONCILING", "SUPERSEDED"])


/**
 * 一次清线归档的可核对结果。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineArchiveOpenWorkResponseSchema = z.object({
  /** Archived Picking Tasks */
  archived_picking_tasks: z.number().min(0),
  /** Archived Plugin Tasks */
  archived_plugin_tasks: z.number().min(0),
  /** Archived Single Picking Task */
  archived_single_picking_task: z.boolean().optional().default(false),
  /** Archived Single Picking Task Id */
  archived_single_picking_task_id: z.union([z.number(), z.null()]).optional(),
  /** Archived Total */
  archived_total: z.number().min(0),
  /** Picking Task Status Before */
  picking_task_status_before: z.union([z.string(), z.null()]).optional(),
  /** Version */
  version: z.number(),
  /** Workline Id */
  workline_id: z.number(),
})


/**
 * 已保存基础配置，版本与业务装配共用。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineBaseConfigurationResponseSchema = z.object({
  /** Device Codes */
  device_codes: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())),
  /** Is Active */
  is_active: z.boolean(),
  /** Positions */
  positions: z.array(z.lazy(() => WorkLinePositionInputSchema)),
  /** Version */
  version: z.number(),
  /** Workline Id */
  workline_id: z.number(),
})


/**
 * 稳定的工作位与物理设备全集；不包含插件配置。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineBaseConfigurationUpdateSchema = z.object({
  /** Device Codes */
  device_codes: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())),
  /** Positions */
  positions: z.array(z.lazy(() => WorkLinePositionInputSchema)),
  /** Version */
  version: z.number(),
})


/**
 * 作业线启用前结构化检查项。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineConfigurationCheckSchema = z.object({
  /** Code */
  code: z.string(),
  /** Context */
  context: z.record(z.any()).optional(),
  /** Severity */
  severity: z.enum(["INFO", "WARNING", "BLOCKER"]),
  /** Status */
  status: z.enum(["PASS", "FAIL", "WARN"]),
})


/**
 * 业务插件关联保存结果。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineConfigurationResponseSchema = z.object({
  /** Config */
  config: z.record(z.any()),
  /** Plugin Key */
  plugin_key: z.union([z.string(), z.null()]),
  /** Version */
  version: z.number(),
  /** Workline Id */
  workline_id: z.number(),
})


/**
 * 作业线配置状态响应。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineConfigurationStatusSchema = z.object({
  /** Can Activate */
  can_activate: z.boolean(),
  /** Checks */
  checks: z.array(z.lazy(() => WorkLineConfigurationCheckSchema)).optional(),
  /** Is Active */
  is_active: z.boolean(),
  /** Workline Id */
  workline_id: z.number(),
})


/**
 * 仅替换插件选择与角色映射，不修改本线物理资源。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineConfigurationUpdateSchema = z.object({
  /** Config */
  config: z.record(z.any()).optional(),
  /** Plugin Key */
  plugin_key: z.union([z.string().min(1).max(100), z.null()]).optional(),
  /** Version */
  version: z.number(),
})


/**
 * 作业线创建 Schema。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineCreateSchema = z.object({
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Diagnostic Profile */
  diagnostic_profile: z.record(z.any()).optional(),
  /** Line Code */
  line_code: z.string().min(1).max(50),
  /** Line Name */
  line_name: z.string().min(1).max(100),
  /** 作业线类型 */
  line_type: z.lazy(() => LineTypeSchema),
  /** 工作线运行模式 */
  run_mode: z.lazy(() => WorkLineRunModeSchema).optional().default("AUTO"),
  /** Runtime Config Json */
  runtime_config_json: z.record(z.any()).optional(),
  /** Zone Name */
  zone_name: z.union([z.string().max(100), z.null()]).optional(),
})


export const WorkLineDeviceRoleSchema = z.object({
  /** Display Name */
  display_name: z.string(),
  /** Role Key */
  role_key: z.string(),
})


/**
 * 部署清单中的业务插件及当前 WorkLine 兼容性。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLinePluginSummarySchema = z.object({
  /** Compatible */
  compatible: z.boolean(),
  /** Device Roles */
  device_roles: z.array(z.lazy(() => WorkLineDeviceRoleSchema)).optional().default([]),
  /** Display Name */
  display_name: z.string(),
  /** Incompatibility Reasons */
  incompatibility_reasons: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional().default([]),
  /** Plugin Key */
  plugin_key: z.string(),
  /** Plugin Version */
  plugin_version: z.string(),
  /** Position Slots */
  position_slots: z.array(z.lazy(() => WorkLinePositionSlotSchema)).optional().default([]),
  /** Supported Line Types */
  supported_line_types: z.array(z.lazy(() => LineTypeSchema)),
})


/**
 * 本线静态工作位；不包含承载物身份、占用或物理到位状态。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLinePositionInputSchema = z.object({
  allowed_rack_kind: z.union([z.lazy(() => RackKindSchema), z.null()]).optional(),
  /** Capacity */
  capacity: z.number().min(1).optional().default(1),
  /** Device Id */
  device_id: z.union([z.number(), z.null()]).optional(),
  /** Enabled */
  enabled: z.boolean().optional().default(true),
  /** External Location Code */
  external_location_code: z.union([z.string().min(1).max(120), z.null()]).optional(),
  /** Logic Location Code */
  logic_location_code: z.union([z.string().min(1).max(120), z.null()]).optional(),
  /** Position Code */
  position_code: z.string().min(1).max(80),
  /** Position Name */
  position_name: z.string().min(1).max(120),
  position_role: z.union([z.lazy(() => WorklineRackPositionRoleSchema), z.null()]).optional(),
  /** Position Type */
  position_type: z.enum(["RACK_POSITION", "STATION"]).optional().default("RACK_POSITION"),
  /** Priority */
  priority: z.number().min(0).optional().default(100),
})


export const WorkLinePositionSlotSchema = z.object({
  /** Allowed Rack Kind */
  allowed_rack_kind: z.union([z.enum(["SINGLE_LAYER", "FIVE_LAYER", "RETURN", "TRANSFER", "PRODUCTION"]), z.null()]).optional(),
  /** Display Name */
  display_name: z.string(),
  /** Location Type */
  location_type: z.string(),
  /** Position Type */
  position_type: z.enum(["RACK_POSITION", "STATION"]),
  /** Slot Key */
  slot_key: z.string(),
})


/**
 * 作业线响应 Schema。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineResponseSchema = z.object({
  /** Config */
  config: z.record(z.any()).optional(),
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Diagnostic Profile */
  diagnostic_profile: z.record(z.any()).optional(),
  /** Id */
  id: z.number(),
  /** Is Active */
  is_active: z.boolean(),
  /** Line Code */
  line_code: z.string().min(1).max(50),
  /** Line Name */
  line_name: z.string().min(1).max(100),
  /** 作业线类型 */
  line_type: z.lazy(() => LineTypeSchema),
  /** Plugin Key */
  plugin_key: z.union([z.string().min(1).max(100), z.null()]).optional(),
  /** Plugin Version */
  plugin_version: z.union([z.string().max(50), z.null()]).optional(),
  /** 工作线运行模式 */
  run_mode: z.lazy(() => WorkLineRunModeSchema).optional().default("AUTO"),
  /** Runtime Config Json */
  runtime_config_json: z.record(z.any()).optional(),
  /** Version */
  version: z.number(),
  /** Zone Name */
  zone_name: z.union([z.string().max(100), z.null()]).optional(),
})


/**
 * 作业线运行模式枚举。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineRunModeSchema = z.enum(["AUTO", "MANUAL", "SIMULATION", "ECS_TEST"])


export const WorkLineStartErrorResponseSchema = z.object({
  /** Reason */
  reason: z.enum(["WORKLINE_NOT_FOUND", "INVALID_STATE", "CONFIGURATION_INVALID", "VERSION_CONFLICT", "SERVICE_UNAVAILABLE"]),
})


export const WorkLineStartRequestSchema = z.object({
  /** Version */
  version: z.number().min(0),
})


export const WorkLineStartResponseSchema = z.object({
  /** Flow Mode */
  flow_mode: z.union([z.string(), z.null()]),
  /** Is Active */
  is_active: z.boolean(),
  /** Plugin Key */
  plugin_key: z.union([z.string(), z.null()]),
  /** Plugin Version */
  plugin_version: z.union([z.string(), z.null()]),
  /** Version */
  version: z.number(),
  /** Workline Id */
  workline_id: z.number(),
})


/**
 * 作业线启停请求。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineStateTransitionRequestSchema = z.object({
  /** Picking Task Id */
  picking_task_id: z.union([z.number().min(1), z.null()]).optional(),
  /** Task Id */
  task_id: z.union([z.string().min(1).max(100), z.null()]).optional(),
  /** Version */
  version: z.number(),
})


/**
 * 作业线更新 Schema。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineUpdateSchema = z.object({
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Diagnostic Profile */
  diagnostic_profile: z.union([z.record(z.any()), z.null()]).optional(),
  /** Line Code */
  line_code: z.union([z.string().min(1).max(50), z.null()]).optional(),
  /** Line Name */
  line_name: z.union([z.string().min(1).max(100), z.null()]).optional(),
  /** 作业线类型 */
  line_type: z.union([z.lazy(() => LineTypeSchema), z.null()]).optional(),
  /** 工作线运行模式 */
  run_mode: z.union([z.lazy(() => WorkLineRunModeSchema), z.null()]).optional(),
  /** Runtime Config Json */
  runtime_config_json: z.union([z.record(z.any()), z.null()]).optional(),
  /** Version */
  version: z.number(),
  /** Zone Name */
  zone_name: z.union([z.string().max(100), z.null()]).optional(),
})


/**
 * WorklineActiveObjects 冲突展示状态。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorklineActiveObjectConflictStateSchema = z.enum(["OK", "TRANSIENT", "RECONCILING"])


/**
 * 来自具体 Resource projection 的当前位置证据。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorklineActiveObjectLocationViewSchema = z.object({
  conflict_state: z.lazy(() => WorklineActiveObjectConflictStateSchema),
  /** Evidence Refs */
  evidence_refs: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
  /** Location Code */
  location_code: z.string(),
  /** Location Scope */
  location_scope: z.string(),
})


/**
 * 单个 active object 只读视图。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorklineActiveObjectViewSchema = z.object({
  /** All Sources */
  all_sources: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
  conflict_state: z.lazy(() => WorklineActiveObjectConflictStateSchema),
  /** Evidence Refs */
  evidence_refs: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
  location_summary: z.union([z.lazy(() => WorklineActiveObjectLocationViewSchema), z.null()]).optional(),
  /** Object Key */
  object_key: z.string(),
  /** Object Type */
  object_type: z.string(),
  /** Operator Hint */
  operator_hint: z.union([z.string(), z.null()]).optional(),
  /** Primary Source */
  primary_source: z.union([z.string(), z.null()]).optional(),
})


/**
 * WorkLine active objects 聚合响应。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorklineActiveObjectsResponseSchema = z.object({
  /** Objects */
  objects: z.array(z.lazy(() => WorklineActiveObjectViewSchema)).optional(),
  /** Total Count */
  total_count: z.number().optional().default(0),
  /** Truncated */
  truncated: z.boolean().optional().default(false),
  /** Workline Id */
  workline_id: z.number(),
})


/**
 * 工作线停靠位角色。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorklineRackPositionRoleSchema = z.enum(["SMT_CLASSIFIER_SINGLE_RACK_WORK", "SMT_RACK_EXCHANGE_AREA", "SMT_SORTER_QUEUE", "SMT_SORTER_STATION", "SMT_RETURN_RACK_POSITION", "SMT_TRANSFER_RACK_POSITION", "SMT_EMPTY_RACK_AREA"])


export const _BinExchangeDataSchema = z.object({
  /** Exchange Pairs */
  exchange_pairs: z.array(z.lazy(() => _BinExchangePairSchema)),
})


export const _BinExchangeDebugTaskSchema = z.object({
  /** Client Request Id */
  client_request_id: z.string().min(36).max(36).regex(new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")),
  data: z.lazy(() => _BinExchangeDataSchema),
  /** Kind */
  kind: z.literal("BIN_EXCHANGE"),
  /** Station Id */
  station_id: z.union([z.string().min(1).max(100).regex(new RegExp(".*\\S.*")), z.null()]).optional(),
})


export const _BinExchangePairSchema = z.object({
  /** Left Bin Code */
  left_bin_code: z.string().min(1).max(100).regex(new RegExp(".*\\S.*")),
  left_location: z.lazy(() => _RackBinSlotSchema),
  /** Right Bin Code */
  right_bin_code: z.string().min(1).max(100).regex(new RegExp(".*\\S.*")),
  right_location: z.lazy(() => _RackBinSlotSchema),
})


export const _BinMoveDataSchema = z.object({
  /** Moves */
  moves: z.array(z.lazy(() => _BinMoveMemberSchema)),
})


export const _BinMoveDebugTaskSchema = z.object({
  /** Client Request Id */
  client_request_id: z.string().min(36).max(36).regex(new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")),
  data: z.lazy(() => _BinMoveDataSchema),
  /** Kind */
  kind: z.literal("BIN_MOVE"),
  /** Station Id */
  station_id: z.union([z.string().min(1).max(100).regex(new RegExp(".*\\S.*")), z.null()]).optional(),
})


export const _BinMoveMemberSchema = z.object({
  /** Bin Code */
  bin_code: z.string().min(1).max(100).regex(new RegExp(".*\\S.*")),
  source: z.lazy(() => _BinPositionSchema),
  target: z.lazy(() => _BinPositionSchema),
})


export const _BinPositionSchema = z.union([z.lazy(() => _RackBinSlotSchema), z.lazy(() => _HandoffPositionSchema)])


export const _DebugTransportStepConfirmationSchema = z.object({
  /** Assertion */
  assertion: z.literal("PHYSICAL_TARGET_REACHED"),
  step: z.lazy(() => TransportDebugStepSchema),
})


export const _DebugTransportTaskRequestSchema = z.union([z.lazy(() => _RackMoveDebugTaskSchema), z.lazy(() => _RackRotateDebugTaskSchema), z.lazy(() => _BinMoveDebugTaskSchema), z.lazy(() => _BinExchangeDebugTaskSchema)])


export const _HandoffPositionSchema = z.object({
  /** Kind */
  kind: z.literal("HANDOFF_POSITION"),
  /** Location Code */
  location_code: z.string().min(1).max(100).regex(new RegExp(".*\\S.*")),
})


export const _RackBinSlotSchema = z.object({
  /** Kind */
  kind: z.literal("RACK_BIN_SLOT"),
  /** Rack Face */
  rack_face: z.string().min(1).max(10).refine((value) => value.length > 0 && !value.includes(String.fromCharCode(0))),
  /** Rack Id */
  rack_id: z.string().min(1).max(100).regex(new RegExp(".*\\S.*")),
  /** Slot Id */
  slot_id: z.string().min(1).max(100).regex(new RegExp(".*\\S.*")),
})


export const _RackMoveDataSchema = z.object({
  /** Rack Id */
  rack_id: z.string().min(1).max(100).regex(new RegExp(".*\\S.*")),
  rcs_template_id: z.union([z.lazy(() => RcsTemplateIdSchema), z.null()]).optional(),
  source: z.lazy(() => _RackMovePositionSchema),
  target: z.lazy(() => _RackMovePositionSchema),
  /** Target Face */
  target_face: z.union([z.string().min(1).max(10).refine((value) => value.length > 0 && !value.includes(String.fromCharCode(0))), z.null()]).optional(),
})


export const _RackMoveDebugTaskSchema = z.object({
  /** Client Request Id */
  client_request_id: z.string().min(36).max(36).regex(new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")),
  data: z.lazy(() => _RackMoveDataSchema),
  /** Kind */
  kind: z.literal("RACK_MOVE"),
  /** Station Id */
  station_id: z.union([z.string().min(1).max(100).regex(new RegExp(".*\\S.*")), z.null()]).optional(),
})


export const _RackMovePositionSchema = z.union([z.lazy(() => _RackReferenceSchema), z.lazy(() => _ZonePositionSchema), z.lazy(() => _RackPositionSchema)])


export const _RackPositionSchema = z.object({
  /** Kind */
  kind: z.literal("RACK_POSITION"),
  /** Location Code */
  location_code: z.string().min(1).max(100).regex(new RegExp(".*\\S.*")),
})


export const _RackReferenceSchema = z.object({
  /** Kind */
  kind: z.literal("RACK"),
  /** Location Code */
  location_code: z.string().min(1).max(100).regex(new RegExp(".*\\S.*")),
})


export const _RackRotateDataSchema = z.object({
  position: z.lazy(() => _RackPositionSchema),
  /** Rack Id */
  rack_id: z.string().min(1).max(100).regex(new RegExp(".*\\S.*")),
  rcs_template_id: z.union([z.lazy(() => RcsTemplateIdSchema), z.null()]).optional(),
  /** Target Face */
  target_face: z.string().min(1).max(10).refine((value) => value.length > 0 && !value.includes(String.fromCharCode(0))),
})


export const _RackRotateDebugTaskSchema = z.object({
  /** Client Request Id */
  client_request_id: z.string().min(36).max(36).regex(new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")),
  data: z.lazy(() => _RackRotateDataSchema),
  /** Kind */
  kind: z.literal("RACK_ROTATE"),
  /** Station Id */
  station_id: z.union([z.string().min(1).max(100).regex(new RegExp(".*\\S.*")), z.null()]).optional(),
})


export const _ZonePositionSchema = z.object({
  /** Kind */
  kind: z.literal("ZONE"),
  /** Location Code */
  location_code: z.string().min(1).max(100).regex(new RegExp(".*\\S.*")),
})
