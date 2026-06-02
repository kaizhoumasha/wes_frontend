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
  /** Created At */
  created_at: z.string().datetime(),
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
  ip_whitelist: z.union([z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())), z.null()]).optional(),
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
  /** Permissions */
  permissions: z.array(z.lazy(() => PermissionResponseSchema)).optional(),
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
  ip_whitelist: z.union([z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())), z.null()]).optional(),
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
  /** Object Type */
  object_type: z.union([z.string().max(100), z.null()]).optional(),
  /** Action */
  action: z.union([z.string().max(50), z.null()]).optional(),
  /** Object Id */
  object_id: z.union([z.string().max(64), z.null()]).optional(),
  /** Change Summary */
  change_summary: z.union([z.string().max(255), z.null()]).optional(),
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
  menus: z.array(z.lazy(() => MenuTreeResponseSimpleSchema)),
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
 * 批量排序请求
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const BatchSortRequestSchema = z.object({
  /** Items */
  items: z.array(z.lazy(() => SortItemSchema)),
})


/**
 * 料箱格位聚合占用响应 Schema。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const BinCellOccupancyResponseSchema = z.object({
  /** Bin Code */
  bin_code: z.string().min(1).max(80),
  /** Bin Cell Code */
  bin_cell_code: z.union([z.string().max(80), z.null()]).optional(),
  /** Bin Cell Index */
  bin_cell_index: z.string().min(1).max(20),
  /** Material Identity Key */
  material_identity_key: z.string().min(1).max(300),
  /** Material Code */
  material_code: z.union([z.string().max(120), z.null()]).optional(),
  /** Lot Code */
  lot_code: z.union([z.string().max(120), z.null()]).optional(),
  /** Date Code */
  date_code: z.union([z.string().max(80), z.null()]).optional(),
  /** Reel Count */
  reel_count: z.number().min(0).optional().default(0),
  /** Used Depth Mm */
  used_depth_mm: z.string().regex(new RegExp("^(?!^[-+.]*$)[+-]?0*\\d*\\.?\\d*$")).optional().default("0"),
  /** Capacity Depth Mm */
  capacity_depth_mm: z.union([z.string().regex(new RegExp("^(?!^[-+.]*$)[+-]?0*\\d*\\.?\\d*$")), z.null()]).optional(),
  /** Remaining Depth Mm */
  remaining_depth_mm: z.union([z.string().regex(new RegExp("^(?!^[-+.]*$)[+-]?0*\\d*\\.?\\d*$")), z.null()]).optional(),
  /** 格位聚合占用状态 */
  occupancy_status: z.lazy(() => BinCellOccupancyStatusSchema).optional().default("UNKNOWN"),
  /** 来源系统 */
  source_system: z.lazy(() => ResourceSourceSystemSchema),
  /** Source Event Id */
  source_event_id: z.string().min(1).max(200),
  /** Source Version */
  source_version: z.union([z.string().max(100), z.null()]).optional(),
  /** Trace Id */
  trace_id: z.union([z.string().max(100), z.null()]).optional(),
  /** Session Id */
  session_id: z.union([z.string().max(100), z.null()]).optional(),
  /** Started At */
  started_at: z.string().datetime(),
  /** Ended At */
  ended_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Metadata Json */
  metadata_json: z.record(z.any()).optional(),
  /** Id */
  id: z.number(),
})


/**
 * 料箱格位聚合占用状态。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const BinCellOccupancyStatusSchema = z.enum(["OCCUPIED", "FULL", "REMOVED", "UNKNOWN"])


/**
 * 料箱内容快照明细响应 Schema。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const BinContentSnapshotItemResponseSchema = z.object({
  /** Snapshot Id */
  snapshot_id: z.string().min(1).max(160),
  /** Bin Cell Code */
  bin_cell_code: z.union([z.string().max(80), z.null()]).optional(),
  /** Bin Cell Index */
  bin_cell_index: z.union([z.string().max(20), z.null()]).optional(),
  /** Pkg Code */
  pkg_code: z.union([z.string().max(200), z.null()]).optional(),
  /** Material Code */
  material_code: z.union([z.string().max(120), z.null()]).optional(),
  /** Vendor Code */
  vendor_code: z.union([z.string().max(120), z.null()]).optional(),
  /** Lot Code */
  lot_code: z.union([z.string().max(120), z.null()]).optional(),
  /** Date Code */
  date_code: z.union([z.string().max(80), z.null()]).optional(),
  /** Qty Snapshot */
  qty_snapshot: z.union([z.number().min(0), z.null()]).optional(),
  /** Thickness Mm */
  thickness_mm: z.union([z.number().min(0), z.null()]).optional(),
  /** Dims Json */
  dims_json: z.record(z.any()).optional(),
  /** Wms Inventory Id */
  wms_inventory_id: z.union([z.string().max(160), z.null()]).optional(),
  /** Id */
  id: z.number(),
})


/**
 * 料箱内容快照头响应 Schema。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const BinContentSnapshotResponseSchema = z.object({
  /** Snapshot Id */
  snapshot_id: z.string().min(1).max(160),
  /** Bin Code */
  bin_code: z.string().min(1).max(80),
  /** Source Session Id */
  source_session_id: z.union([z.number(), z.null()]).optional(),
  /** Source Event Id */
  source_event_id: z.union([z.string().max(200), z.null()]).optional(),
  /** Captured At */
  captured_at: z.string().datetime(),
  /** 快照完整性 */
  snapshot_status: z.lazy(() => BinContentSnapshotStatusSchema).optional().default("UNKNOWN"),
  /** Snapshot Reason */
  snapshot_reason: z.union([z.string().max(80), z.null()]).optional(),
  /** Snapshot Group Key */
  snapshot_group_key: z.union([z.string().max(160), z.null()]).optional(),
  /** Snapshot Hash */
  snapshot_hash: z.string().min(1).max(128),
  /** Wms Snapshot Version */
  wms_snapshot_version: z.union([z.string().max(160), z.null()]).optional(),
  /** Id */
  id: z.number(),
})


/**
 * 料箱内容快照完整性。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const BinContentSnapshotStatusSchema = z.enum(["COMPLETE", "PARTIAL", "UNKNOWN"])


/**
 * 物料料箱格位投影响应 Schema。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const BinMaterialMountResponseSchema = z.object({
  /** Bin Cell Occupancy Id */
  bin_cell_occupancy_id: z.union([z.number(), z.null()]).optional(),
  /** Cell Stack Position */
  cell_stack_position: z.number().min(1).optional().default(1),
  /** Bin Code */
  bin_code: z.string().min(1).max(80),
  /** Bin Cell Code */
  bin_cell_code: z.union([z.string().max(80), z.null()]).optional(),
  /** Bin Cell Index */
  bin_cell_index: z.string().min(1).max(20),
  /** Material Identity Key */
  material_identity_key: z.string().min(1).max(300),
  /** Pkg Code */
  pkg_code: z.union([z.string().max(200), z.null()]).optional(),
  /** Material Code */
  material_code: z.union([z.string().max(120), z.null()]).optional(),
  /** Lot Code */
  lot_code: z.union([z.string().max(120), z.null()]).optional(),
  /** Date Code */
  date_code: z.union([z.string().max(80), z.null()]).optional(),
  /** Qty Snapshot */
  qty_snapshot: z.union([z.number().min(0), z.null()]).optional(),
  /** Reel Diameter */
  reel_diameter: z.union([z.string().max(80), z.null()]).optional(),
  /** Reel Thickness */
  reel_thickness: z.union([z.string().max(80), z.null()]).optional(),
  /** Wms Inventory Id */
  wms_inventory_id: z.union([z.string().max(120), z.null()]).optional(),
  /** Wms Inventory Version */
  wms_inventory_version: z.union([z.string().max(120), z.null()]).optional(),
  /** WMS 确认状态 */
  wms_confirmation_status: z.lazy(() => WmsConfirmationStatusSchema).optional().default("PENDING"),
  /** Writeback Evidence Id */
  writeback_evidence_id: z.union([z.number(), z.null()]).optional(),
  /** 物料占用状态 */
  mount_status: z.lazy(() => BinMaterialMountStatusSchema).optional().default("UNKNOWN"),
  /** 来源系统 */
  source_system: z.lazy(() => ResourceSourceSystemSchema),
  /** Source Event Id */
  source_event_id: z.string().min(1).max(200),
  /** Source Version */
  source_version: z.union([z.string().max(100), z.null()]).optional(),
  /** Trace Id */
  trace_id: z.union([z.string().max(100), z.null()]).optional(),
  /** Session Id */
  session_id: z.union([z.string().max(100), z.null()]).optional(),
  /** Started At */
  started_at: z.string().datetime(),
  /** Ended At */
  ended_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Id */
  id: z.number(),
})


/**
 * 物料料箱格位投影状态。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const BinMaterialMountStatusSchema = z.enum(["OCCUPIED", "REMOVED", "LOCKED", "UNKNOWN"])


/**
 * 料箱实例响应 Schema。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const BinResponseSchema = z.object({
  /** Bin Code */
  bin_code: z.string().min(1).max(80),
  /** Wms Bin Id */
  wms_bin_id: z.union([z.string().max(100), z.null()]).optional(),
  /** Bin Type Code */
  bin_type_code: z.string().min(1).max(50),
  /** 料箱主数据状态 */
  status: z.lazy(() => ResourceMasterStatusSchema).optional().default("ACTIVE"),
  /** 来源系统 */
  source_system: z.lazy(() => ResourceSourceSystemSchema).optional().default("MANUAL_IMPORT"),
  /** Source Version */
  source_version: z.union([z.string().max(100), z.null()]).optional(),
  /** Metadata Json */
  metadata_json: z.record(z.any()).optional(),
  /** Id */
  id: z.number(),
})


/**
 * 料箱内部槽位尺寸。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const BinSlotSizeSchema = z.enum(["7INCH", "13INCH", "15INCH", "LARGE"])


/**
 * 料箱槽位模板响应 Schema。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const BinSlotTemplateResponseSchema = z.object({
  /** Bin Type Code */
  bin_type_code: z.string().min(1).max(50),
  /** Bin Slot Code */
  bin_slot_code: z.string().min(1).max(50),
  /** 槽位尺寸 */
  slot_size: z.lazy(() => BinSlotSizeSchema),
  /** Max Depth Mm */
  max_depth_mm: z.union([z.number().min(1), z.null()]).optional(),
  /** Max Weight G */
  max_weight_g: z.union([z.number().min(1), z.null()]).optional(),
  /** Active */
  active: z.boolean().optional().default(true),
  /** Metadata Json */
  metadata_json: z.record(z.any()).optional(),
  /** Id */
  id: z.number(),
})


/**
 * 料箱类型响应 Schema。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const BinTypeResponseSchema = z.object({
  /** Bin Type Code */
  bin_type_code: z.string().min(1).max(50),
  /** Bin Type Name */
  bin_type_name: z.string().min(1).max(100),
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Active */
  active: z.boolean().optional().default(true),
  /** Metadata Json */
  metadata_json: z.record(z.any()).optional(),
  /** Id */
  id: z.number(),
})


/**
 * 设备事件回调接收响应数据。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const CallbackEventAcceptedResponseSchema = z.object({
  /** Status */
  status: z.enum(["submitted", "duplicate", "accepted"]),
  /** Device Code */
  device_code: z.string(),
  /** Request Id */
  request_id: z.union([z.string(), z.null()]).optional(),
  /** Trace Id */
  trace_id: z.union([z.string(), z.null()]).optional(),
  /** Event Id */
  event_id: z.union([z.string(), z.null()]).optional(),
  /** Causation Id */
  causation_id: z.union([z.string(), z.null()]).optional(),
  /** Diagnostic */
  diagnostic: z.union([z.record(z.any()), z.null()]).optional(),
})


export const CallbackEventIngressResponseSchema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** Data */
  data: z.union([z.lazy(() => CallbackEventAcceptedResponseSchema), z.lazy(() => CallbackRejectedResponseSchema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


/**
 * 外部系统回调接收响应数据。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const CallbackExternalAcceptedResponseSchema = z.object({
  /** Status */
  status: z.enum(["submitted", "duplicate"]),
  /** Callback Type */
  callback_type: z.string(),
  /** Request Id */
  request_id: z.union([z.string(), z.null()]).optional(),
  /** Trace Id */
  trace_id: z.union([z.string(), z.null()]).optional(),
  /** Event Id */
  event_id: z.union([z.string(), z.null()]).optional(),
  /** Causation Id */
  causation_id: z.union([z.string(), z.null()]).optional(),
})


export const CallbackExternalIngressResponseSchema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** Data */
  data: z.union([z.lazy(() => CallbackExternalAcceptedResponseSchema), z.lazy(() => CallbackRejectedResponseSchema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
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
  /** Subject Code */
  subject_code: z.string(),
  /** Request Body */
  request_body: z.record(z.any()),
  /** Client Ip */
  client_ip: z.union([z.string(), z.null()]),
  /** User Agent */
  user_agent: z.union([z.string(), z.null()]),
  /** Request Id */
  request_id: z.union([z.string(), z.null()]),
  /** Trace Id */
  trace_id: z.union([z.string(), z.null()]),
  /** Event Id */
  event_id: z.union([z.string(), z.null()]),
  /** Causation Id */
  causation_id: z.union([z.string(), z.null()]),
  /** Response Status */
  response_status: z.number(),
  /** Response Time Ms */
  response_time_ms: z.number(),
  /** Error Message */
  error_message: z.union([z.string(), z.null()]),
  /** Ingress Outcome */
  ingress_outcome: z.union([z.string(), z.null()]),
  /** Failure Stage */
  failure_stage: z.union([z.string(), z.null()]),
  /** Created At */
  created_at: z.string().datetime(),
  /** Updated At */
  updated_at: z.string().datetime(),
})


/**
 * 回调主体维度回调日志列表响应。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const CallbackLogSubjectResponseSchema = z.object({
  /** Subject Code */
  subject_code: z.string(),
  /** Count */
  count: z.number().min(0),
  /** Items */
  items: z.array(z.lazy(() => CallbackLogResponseSchema)),
})


/**
 * Trace 维度回调日志列表响应。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const CallbackLogTraceResponseSchema = z.object({
  /** Trace Id */
  trace_id: z.string(),
  /** Count */
  count: z.number().min(0),
  /** Items */
  items: z.array(z.lazy(() => CallbackLogResponseSchema)),
})


/**
 * Callback 入口拒收响应数据。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const CallbackRejectedResponseSchema = z.object({
  /** Ack */
  ack: z.boolean().optional().default(false),
  /** Reason Code */
  reason_code: z.union([z.string(), z.null()]).optional(),
  /** Diagnostic */
  diagnostic: z.union([z.record(z.any()), z.null()]).optional(),
})


/**
 * 设备结果回调接收响应数据。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const CallbackResultAcceptedResponseSchema = z.object({
  /** Ack */
  ack: z.boolean().optional().default(true),
  /** Request Id */
  request_id: z.union([z.string(), z.null()]).optional(),
  /** Trace Id */
  trace_id: z.union([z.string(), z.null()]).optional(),
  /** Event Id */
  event_id: z.union([z.string(), z.null()]).optional(),
  /** Causation Id */
  causation_id: z.union([z.string(), z.null()]).optional(),
})


export const CallbackResultIngressResponseSchema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** Data */
  data: z.union([z.lazy(() => CallbackResultAcceptedResponseSchema), z.lazy(() => CallbackRejectedResponseSchema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


/**
 * 人工清除 WorkLine 急停请求。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ClearWorkLineEstopRequestSchema = z.object({
  /** Checks */
  checks: z.record(z.boolean()).optional(),
  /** Reason */
  reason: z.union([z.string().max(500), z.null()]).optional(),
})


/**
 * 非生产调试过程数据清理请求。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DebugDataCleanupRequestSchema = z.object({
  /** Dry Run */
  dry_run: z.boolean().optional().default(true),
  /** Confirmation */
  confirmation: z.union([z.string().max(200), z.null()]).optional(),
})


/**
 * 非生产调试过程数据清理响应。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DebugDataCleanupResponseSchema = z.object({
  /** Scope */
  scope: z.string().regex(new RegExp("^(WORKLINE|ALL)$")),
  /** Workline Id */
  workline_id: z.union([z.number(), z.null()]).optional(),
  /** Dry Run */
  dry_run: z.boolean(),
  /** Deleted */
  deleted: z.boolean(),
  /** Counts */
  counts: z.record(z.number()).optional(),
  /** Affected Workline Ids */
  affected_workline_ids: z.array(z.number()).optional(),
  /** Affected Session Ids */
  affected_session_ids: z.array(z.number()).optional(),
  /** Message */
  message: z.string(),
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
  /** Capabilities Json */
  capabilities_json: z.record(z.any()).optional(),
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
  /** Callback Path */
  callback_path: z.union([z.string().max(255), z.null()]).optional(),
  /** 设备实时状态（IDLE/RUNNING/ERROR/OFFLINE/MAINTENANCE） */
  device_status: z.lazy(() => DeviceStatusSchema).optional().default("IDLE"),
  /** Current Command Id */
  current_command_id: z.union([z.number(), z.null()]).optional(),
  /** Last Heartbeat At */
  last_heartbeat_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Error Code */
  error_code: z.union([z.string().max(50), z.null()]).optional(),
  /** Maintenance Mode */
  maintenance_mode: z.boolean().optional().default(false),
  /** Max Concurrent Tasks */
  max_concurrent_tasks: z.number().min(1).max(1).optional().default(1),
  /** Idempotency Ttl */
  idempotency_ttl: z.number().min(60).max(86400).optional().default(3600),
  /** Diagnostic Profile */
  diagnostic_profile: z.record(z.any()).optional(),
})


/**
 * 设备维护操作请求。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceMaintenanceRequestSchema = z.object({
  /** Reason */
  reason: z.union([z.string().max(50), z.null()]).optional(),
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
  /** Capabilities Json */
  capabilities_json: z.record(z.any()).optional(),
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
  /** Callback Path */
  callback_path: z.union([z.string().max(255), z.null()]).optional(),
  /** 设备实时状态（IDLE/RUNNING/ERROR/OFFLINE/MAINTENANCE） */
  device_status: z.lazy(() => DeviceStatusSchema).optional().default("IDLE"),
  /** Current Command Id */
  current_command_id: z.union([z.number(), z.null()]).optional(),
  /** Last Heartbeat At */
  last_heartbeat_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Error Code */
  error_code: z.union([z.string().max(50), z.null()]).optional(),
  /** Maintenance Mode */
  maintenance_mode: z.boolean().optional().default(false),
  /** Max Concurrent Tasks */
  max_concurrent_tasks: z.number().min(1).max(1).optional().default(1),
  /** Idempotency Ttl */
  idempotency_ttl: z.number().min(60).max(86400).optional().default(3600),
  /** Diagnostic Profile */
  diagnostic_profile: z.record(z.any()).optional(),
  /** Id */
  id: z.number(),
  /** Version */
  version: z.number(),
})


/**
 * 设备角色要求明细。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceRoleRequirementOptionSchema = z.object({
  /** Role */
  role: z.string(),
  /** Min Count */
  min_count: z.number(),
  /** Max Count */
  max_count: z.union([z.number(), z.null()]).optional(),
  /** Capabilities */
  capabilities: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
})


/**
 * 设备运行态空操作请求，保留扩展位。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceRuntimeActionRequestSchema = z.object({
  /** Reason */
  reason: z.union([z.string().max(200), z.null()]).optional(),
})


/**
 * 设备状态枚举（白皮书 5.2 节）
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceStatusSchema = z.enum(["IDLE", "RUNNING", "ERROR", "OFFLINE", "MAINTENANCE"])


/**
 * 设备更新 Schema - 只允许主数据与通信配置，运行态走专用操作
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceUpdateSchema = z.object({
  /** Device Code */
  device_code: z.union([z.string().min(1).max(50), z.null()]).optional(),
  /** Device Name */
  device_name: z.union([z.string().min(1).max(100), z.null()]).optional(),
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
  /** Capabilities Json */
  capabilities_json: z.union([z.record(z.any()), z.null()]).optional(),
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
  /** Callback Path */
  callback_path: z.union([z.string().max(255), z.null()]).optional(),
  /** Idempotency Ttl */
  idempotency_ttl: z.union([z.number().min(60).max(86400), z.null()]).optional(),
  /** Diagnostic Profile */
  diagnostic_profile: z.union([z.record(z.any()), z.null()]).optional(),
  /** Version */
  version: z.number(),
})


export const DiagnosticCardResponseSchema = z.object({
  /** Title */
  title: z.string(),
  /** Summary */
  summary: z.string(),
  /** Error Code */
  error_code: z.string(),
  /** Error Domain */
  error_domain: z.string(),
  /** Severity */
  severity: z.string(),
  /** Recoverability */
  recoverability: z.string(),
  /** Problem Class */
  problem_class: z.string(),
  /** User Message */
  user_message: z.string(),
  /** Operator Action */
  operator_action: z.union([z.string(), z.null()]).optional(),
  /** Technical Summary */
  technical_summary: z.union([z.string(), z.null()]).optional(),
  /** Next Steps */
  next_steps: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
  context: z.lazy(() => TraceDiagnosticContextItemSchema),
})


/**
 * Failed command evidence for operator review.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const FailedCommandEvidenceSchema = z.object({
  /** Command Id */
  command_id: z.union([z.number(), z.null()]).optional(),
  /** Command Code */
  command_code: z.union([z.string(), z.null()]).optional(),
  /** Status */
  status: z.union([z.string(), z.null()]).optional(),
  /** Result */
  result: z.union([z.string(), z.null()]).optional(),
  /** Error Detail */
  error_detail: z.union([z.record(z.any()), z.null()]).optional(),
  /** Result Data */
  result_data: z.union([z.record(z.any()), z.null()]).optional(),
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
 * 最新集成调试案件列表。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const IntegrationDebugCaseListResponseSchema = z.object({
  /** Total */
  total: z.number(),
  /** Items */
  items: z.array(z.lazy(() => IntegrationDebugCaseResponseSchema)).optional(),
})


/**
 * 集成调试案件定位结果。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const IntegrationDebugCaseResponseSchema = z.object({
  /** Case Id */
  case_id: z.string(),
  /** Session Id */
  session_id: z.union([z.number(), z.null()]).optional(),
  /** Session Code */
  session_code: z.union([z.string(), z.null()]).optional(),
  /** Trace Id */
  trace_id: z.union([z.string(), z.null()]).optional(),
  /** Request Id */
  request_id: z.union([z.string(), z.null()]).optional(),
  /** Command Code */
  command_code: z.union([z.string(), z.null()]).optional(),
  /** Status */
  status: z.string(),
  /** Phase */
  phase: z.string(),
  /** Verdict */
  verdict: z.string(),
  /** Blocking Domain */
  blocking_domain: z.union([z.string(), z.null()]).optional(),
  /** Blocking Code */
  blocking_code: z.union([z.string(), z.null()]).optional(),
  /** Owner */
  owner: z.string(),
  /** Severity */
  severity: z.string(),
  /** Recoverability */
  recoverability: z.string(),
  /** Summary */
  summary: z.string(),
  /** Facts */
  facts: z.record(z.any()).optional(),
  /** Stage Checks */
  stage_checks: z.array(z.lazy(() => IntegrationDebugStageCheckSchema)).optional(),
  /** Evidence Links */
  evidence_links: z.array(z.lazy(() => IntegrationDebugEvidenceLinkSchema)).optional(),
  /** Next Actions */
  next_actions: z.array(z.lazy(() => IntegrationDebugNextActionSchema)).optional(),
  trace_detail: z.union([z.lazy(() => TraceDetailResponseSchema), z.null()]).optional(),
})


/**
 * 调试证据跳转。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const IntegrationDebugEvidenceLinkSchema = z.object({
  /** Kind */
  kind: z.string(),
  /** Label */
  label: z.string(),
  /** Api Path */
  api_path: z.union([z.string(), z.null()]).optional(),
  /** Route Name */
  route_name: z.union([z.string(), z.null()]).optional(),
  /** Route Params */
  route_params: z.record(z.any()).optional(),
  /** Route Query */
  route_query: z.record(z.any()).optional(),
})


/**
 * 只读下一步建议。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const IntegrationDebugNextActionSchema = z.object({
  /** Kind */
  kind: z.string(),
  /** Label */
  label: z.string(),
  /** Description */
  description: z.string(),
  /** Route Name */
  route_name: z.union([z.string(), z.null()]).optional(),
  /** Route Params */
  route_params: z.record(z.any()).optional(),
  /** Route Query */
  route_query: z.record(z.any()).optional(),
})


/**
 * 集成链路单阶段定位结果。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const IntegrationDebugStageCheckSchema = z.object({
  /** Key */
  key: z.string(),
  /** Label */
  label: z.string(),
  /** State */
  state: z.string(),
  /** Evidence Count */
  evidence_count: z.number().optional().default(0),
  /** Primary Evidence */
  primary_evidence: z.union([z.string(), z.null()]).optional(),
  /** Links */
  links: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
})


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


export const ListResponseData_BinCellOccupancyResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => BinCellOccupancyResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_BinContentSnapshotItemResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => BinContentSnapshotItemResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_BinContentSnapshotResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => BinContentSnapshotResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_BinMaterialMountResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => BinMaterialMountResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_BinResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => BinResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_BinSlotTemplateResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => BinSlotTemplateResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_BinTypeResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => BinTypeResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_CallbackLogResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => CallbackLogResponseSchema)).optional(),
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


export const ListResponseData_RackBinMountResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => RackBinMountResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_RackPlacementResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => RackPlacementResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_RackResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => RackResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_RackSlotTemplateResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => RackSlotTemplateResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_RackTypeResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => RackTypeResponseSchema)).optional(),
  /** Limit */
  limit: z.number().min(0).optional().default(0),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


export const ListResponseData_ResourceStateEventResponse_Schema = z.object({
  /** Total */
  total: z.number().min(0).optional().default(0),
  /** Items */
  items: z.array(z.lazy(() => ResourceStateEventResponseSchema)).optional(),
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


export const ListResponseSchemaModel_BinCellOccupancyResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_BinCellOccupancyResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_BinContentSnapshotItemResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_BinContentSnapshotItemResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_BinContentSnapshotResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_BinContentSnapshotResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_BinMaterialMountResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_BinMaterialMountResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_BinResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_BinResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_BinSlotTemplateResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_BinSlotTemplateResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_BinTypeResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_BinTypeResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_CallbackLogResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_CallbackLogResponse_Schema), z.null()]).optional(),
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


export const ListResponseSchemaModel_RackBinMountResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_RackBinMountResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_RackPlacementResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_RackPlacementResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_RackResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_RackResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_RackSlotTemplateResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_RackSlotTemplateResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_RackTypeResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_RackTypeResponse_Schema), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.string().optional(),
})


export const ListResponseSchemaModel_ResourceStateEventResponse_Schema = z.object({
  /** Code */
  code: z.string().optional().default("1000"),
  /** Message */
  message: z.string().optional().default("操作成功"),
  /** 响应数据 */
  data: z.union([z.lazy(() => ListResponseData_ResourceStateEventResponse_Schema), z.null()]).optional(),
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

包含访问令牌、刷新令牌元数据和用户信息
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const LoginResponseSchema = z.object({
  /** Access Token */
  access_token: z.string(),
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
 * 人工操作请求。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ManualOperationRequestSchema = z.object({
  /** Operation */
  operation: z.string().regex(new RegExp("^(HOLD|RESUME|CANCEL)$")),
  /** Operator Id */
  operator_id: z.string().min(1).max(100),
  /** Reason */
  reason: z.string().min(1).max(500),
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
  /** Has Children */
  has_children: z.boolean().optional().default(false),
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
  /** Has Children */
  has_children: z.boolean().optional().default(false),
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
  /** Has Children */
  has_children: z.boolean().optional().default(false),
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
  /** Children */
  children: z.array(z.lazy(() => MenuTreeResponseSchema)).optional(),
}))


/**
 * 菜单树响应 Schema
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const MenuTreeResponseSimpleSchema = z.lazy((): z.ZodTypeAny => z.object({
  /** Parent Id */
  parent_id: z.union([z.number(), z.null()]).optional(),
  /** Tree Path */
  tree_path: z.string().optional().default("/"),
  /** Level */
  level: z.number().optional().default(1),
  /** Sort Order */
  sort_order: z.number().optional().default(0),
  /** Has Children */
  has_children: z.boolean().optional().default(false),
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
  /** Children */
  children: z.array(z.lazy(() => MenuTreeResponseSimpleSchema)).optional(),
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
  /** Has Children */
  has_children: z.union([z.boolean(), z.null()]).optional(),
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
 * Operator-selected NG reason.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const NgReasonInputSchema = z.object({
  /** Source */
  source: z.string(),
  /** Code */
  code: z.string().min(1).max(100),
  /** Label */
  label: z.string().min(1).max(200),
})


/**
 * NG reason option.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const NgReasonOptionSchema = z.object({
  /** Source */
  source: z.string(),
  /** Code */
  code: z.string(),
  /** Label */
  label: z.string(),
  /** Plugin Key */
  plugin_key: z.union([z.string(), z.null()]).optional(),
  /** Contract Version */
  contract_version: z.union([z.string(), z.null()]).optional(),
  /** Maps From */
  maps_from: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
})


/**
 * NG return item response.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const NgReturnItemResponseSchema = z.object({
  /** Id */
  id: z.number(),
  /** Source Workline Id */
  source_workline_id: z.number(),
  /** Source Session Id */
  source_session_id: z.number(),
  /** Source Command Id */
  source_command_id: z.union([z.number(), z.null()]).optional(),
  /** Source Event Id */
  source_event_id: z.union([z.string(), z.null()]).optional(),
  /** Material Identity Key */
  material_identity_key: z.string(),
  /** Material Identity Json */
  material_identity_json: z.record(z.any()),
  /** Physical Handoff Evidence Json */
  physical_handoff_evidence_json: z.record(z.any()),
  /** Disposition */
  disposition: z.string(),
  /** Ng Reason Source */
  ng_reason_source: z.string(),
  /** Ng Reason Code */
  ng_reason_code: z.string(),
  /** Ng Reason Label */
  ng_reason_label: z.string(),
  /** Operator Note */
  operator_note: z.union([z.string(), z.null()]).optional(),
  /** Created From Runtime Hold Id */
  created_from_runtime_hold_id: z.union([z.number(), z.null()]).optional(),
  /** Status */
  status: z.string(),
  /** Confirmed By */
  confirmed_by: z.union([z.number(), z.null()]).optional(),
  /** Confirmed At */
  confirmed_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Created At */
  created_at: z.union([z.string().datetime(), z.null()]).optional(),
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
  /** Has Children */
  has_children: z.boolean().optional().default(false),
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
  /** Has Children */
  has_children: z.boolean().optional().default(false),
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
})


/**
 * API 权限树形结构 Schema

用于权限分组展示和管理（如按模块分组）
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PermissionTreeSchema = z.lazy((): z.ZodTypeAny => z.object({
  /** Parent Id */
  parent_id: z.union([z.number(), z.null()]).optional(),
  /** Tree Path */
  tree_path: z.string().optional().default("/"),
  /** Level */
  level: z.number().optional().default(1),
  /** Sort Order */
  sort_order: z.number().optional().default(0),
  /** Has Children */
  has_children: z.boolean().optional().default(false),
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
  /** Children */
  children: z.array(z.lazy(() => PermissionTreeSchema)).optional(),
}))


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
  /** Has Children */
  has_children: z.union([z.boolean(), z.null()]).optional(),
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
 * Client-submitted physical handoff evidence.

Server-owned facts such as confirmed_by, confirmed_at and material_identity
are intentionally not part of this schema.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PhysicalHandoffEvidenceInputSchema = z.object({
  /** Ng Location Code */
  ng_location_code: z.string().min(1).max(100),
  /** Ng Location Scan */
  ng_location_scan: z.string().min(1).max(500),
  /** Material Scan Payload */
  material_scan_payload: z.union([z.record(z.any()), z.string()]),
  /** Line Clear Checked */
  line_clear_checked: z.boolean(),
  /** Late Callback Reviewed */
  late_callback_reviewed: z.boolean(),
  /** Handoff Witness Id */
  handoff_witness_id: z.union([z.string().max(100), z.null()]).optional(),
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
 * 料箱挂载投影响应 Schema。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RackBinMountResponseSchema = z.object({
  /** Rack Code */
  rack_code: z.string().min(1).max(80),
  /** Rack Slot Code */
  rack_slot_code: z.string().min(1).max(50),
  /** Bin Code */
  bin_code: z.string().min(1).max(80),
  /** 料箱挂载状态 */
  mount_status: z.lazy(() => RackBinMountStatusSchema).optional().default("UNKNOWN"),
  /** 来源系统 */
  source_system: z.lazy(() => ResourceSourceSystemSchema),
  /** Source Event Id */
  source_event_id: z.string().min(1).max(200),
  /** Source Version */
  source_version: z.union([z.string().max(100), z.null()]).optional(),
  /** Trace Id */
  trace_id: z.union([z.string().max(100), z.null()]).optional(),
  /** Session Id */
  session_id: z.union([z.string().max(100), z.null()]).optional(),
  /** Started At */
  started_at: z.string().datetime(),
  /** Ended At */
  ended_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Id */
  id: z.number(),
})


/**
 * 料箱挂载投影状态。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RackBinMountStatusSchema = z.enum(["MOUNTED", "UNMOUNTED", "EXCHANGING", "UNKNOWN"])


/**
 * 货架物理结构类型。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RackKindSchema = z.enum(["SINGLE_LAYER", "FIVE_LAYER", "RETURN", "TRANSFER", "PRODUCTION"])


/**
 * 货架位置投影响应 Schema。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RackPlacementResponseSchema = z.object({
  /** Rack Code */
  rack_code: z.string().min(1).max(80),
  /** 货架类型 */
  rack_kind: z.union([z.lazy(() => RackKindSchema), z.null()]).optional(),
  /** Location Code */
  location_code: z.union([z.string().max(80), z.null()]).optional(),
  /** Workline Id */
  workline_id: z.union([z.number(), z.null()]).optional(),
  /** Workline Code */
  workline_code: z.union([z.string().max(50), z.null()]).optional(),
  /** Position Code */
  position_code: z.union([z.string().max(80), z.null()]).optional(),
  /** Position Role */
  position_role: z.union([z.string().max(80), z.null()]).optional(),
  /** Logic Location Code */
  logic_location_code: z.union([z.string().max(120), z.null()]).optional(),
  /** External Location Code */
  external_location_code: z.union([z.string().max(120), z.null()]).optional(),
  /** 位置投影状态 */
  placement_status: z.lazy(() => RackPlacementStatusSchema).optional().default("UNKNOWN"),
  /** 来源系统 */
  source_system: z.lazy(() => ResourceSourceSystemSchema),
  /** Source Task Id */
  source_task_id: z.union([z.string().max(120), z.null()]).optional(),
  /** Source Event Id */
  source_event_id: z.string().min(1).max(200),
  /** Source Version */
  source_version: z.union([z.string().max(100), z.null()]).optional(),
  /** Trace Id */
  trace_id: z.union([z.string().max(100), z.null()]).optional(),
  /** Session Id */
  session_id: z.union([z.string().max(100), z.null()]).optional(),
  /** Started At */
  started_at: z.string().datetime(),
  /** Ended At */
  ended_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Id */
  id: z.number(),
})


/**
 * 货架位置投影状态。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RackPlacementStatusSchema = z.enum(["ARRIVED", "IN_TRANSIT", "DEPARTED", "UNKNOWN"])


/**
 * 货架实例响应 Schema。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RackResponseSchema = z.object({
  /** Rack Code */
  rack_code: z.string().min(1).max(80),
  /** Wms Rack Id */
  wms_rack_id: z.union([z.string().max(100), z.null()]).optional(),
  /** Rack Type Code */
  rack_type_code: z.string().min(1).max(50),
  /** 货架主数据状态 */
  status: z.lazy(() => ResourceMasterStatusSchema).optional().default("ACTIVE"),
  /** 来源系统 */
  source_system: z.lazy(() => ResourceSourceSystemSchema).optional().default("MANUAL_IMPORT"),
  /** Source Version */
  source_version: z.union([z.string().max(100), z.null()]).optional(),
  /** Metadata Json */
  metadata_json: z.record(z.any()).optional(),
  /** Id */
  id: z.number(),
})


/**
 * 货架槽位承载对象类型。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RackSlotKindSchema = z.enum(["BIN_SLOT", "MATERIAL_SLOT"])


/**
 * 货架槽位面。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RackSlotSideSchema = z.enum(["A", "B", "NONE"])


/**
 * 货架槽位模板响应 Schema。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RackSlotTemplateResponseSchema = z.object({
  /** Rack Type Code */
  rack_type_code: z.string().min(1).max(50),
  /** Slot Code */
  slot_code: z.string().min(1).max(50),
  /** 槽位面 */
  side: z.lazy(() => RackSlotSideSchema).optional().default("NONE"),
  /** Layer No */
  layer_no: z.number().min(1).optional().default(1),
  /** Position No */
  position_no: z.number().min(1).optional().default(1),
  /** 槽位承载对象类型 */
  slot_kind: z.lazy(() => RackSlotKindSchema),
  /** Allowed Bin Types */
  allowed_bin_types: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
  /** Allowed Material Carrier Types */
  allowed_material_carrier_types: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
  /** Active */
  active: z.boolean().optional().default(true),
  /** Id */
  id: z.number(),
})


/**
 * 货架类型响应 Schema。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RackTypeResponseSchema = z.object({
  /** Rack Type Code */
  rack_type_code: z.string().min(1).max(50),
  /** Rack Type Name */
  rack_type_name: z.string().min(1).max(100),
  /** 货架物理结构类型 */
  rack_kind: z.lazy(() => RackKindSchema),
  /** Slot Count */
  slot_count: z.number().min(1),
  /** Has Side */
  has_side: z.boolean().optional().default(false),
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Active */
  active: z.boolean().optional().default(true),
  /** Metadata Json */
  metadata_json: z.record(z.any()).optional(),
  /** Id */
  id: z.number(),
})


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
 * Replay 请求。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ReplayInboxRequestSchema = z.object({
  /** Reason */
  reason: z.string().min(1).max(500),
  /** Operator Id */
  operator_id: z.union([z.string().max(100), z.null()]).optional(),
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
 * Resolve Runtime Hold request.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ResolveRuntimeHoldRequestSchema = z.object({
  /** Resolution */
  resolution: z.enum(["COMPLETED", "FAILED", "CANCELLED"]),
  /** Checks */
  checks: z.record(z.boolean()),
  /** Operator Note */
  operator_note: z.string().min(1).max(1000),
  /** Material Disposition */
  material_disposition: z.enum(["CONTINUE", "RETURN_TO_NG"]),
  /** RETURN_TO_NG 时必填 */
  ng_reason: z.union([z.lazy(() => NgReasonInputSchema), z.null()]).optional(),
  /** RETURN_TO_NG 时必填；只包含客户端可提交证据 */
  physical_handoff_evidence: z.union([z.lazy(() => PhysicalHandoffEvidenceInputSchema), z.null()]).optional(),
  /** Result Payload */
  result_payload: z.union([z.record(z.any()), z.null()]).optional(),
  /** Hold Version */
  hold_version: z.number().min(0),
  /** Latest Evidence Hash */
  latest_evidence_hash: z.string().min(1).max(200),
})


/**
 * Resolve Runtime Hold response.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ResolveRuntimeHoldResponseSchema = z.object({
  /** Hold Id */
  hold_id: z.number(),
  /** Status */
  status: z.string(),
  /** Workline Id */
  workline_id: z.number(),
  /** Workline Runtime Status */
  workline_runtime_status: z.string(),
  /** Remaining Active Blocking Holds */
  remaining_active_blocking_holds: z.number(),
  /** Released Outbox Count */
  released_outbox_count: z.number(),
  /** Ng Return Item Id */
  ng_return_item_id: z.union([z.number(), z.null()]).optional(),
  /** Created Inbox Id */
  created_inbox_id: z.union([z.number(), z.null()]).optional(),
})


/**
 * 人工运行时对账解除请求。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ResolveRuntimeReconciliationRequestSchema = z.object({
  /** Resolution */
  resolution: z.string().regex(new RegExp("^(COMPLETED|FAILED|CANCELLED)$")),
  /** Checks */
  checks: z.record(z.boolean()),
  /** Operator Note */
  operator_note: z.string().min(1).max(1000),
  /** Result Payload */
  result_payload: z.union([z.record(z.any()), z.null()]).optional(),
  /** Confirmed At */
  confirmed_at: z.string().datetime(),
})


/**
 * 资源主数据启停状态。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ResourceMasterStatusSchema = z.enum(["ACTIVE", "DISABLED"])


/**
 * 资源事实来源系统。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ResourceSourceSystemSchema = z.enum(["WMS", "RCS", "ECS", "WES_RUNTIME", "MANUAL_IMPORT", "MANUAL"])


/**
 * 资源事实响应 Schema。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ResourceStateEventResponseSchema = z.object({
  /** Event Code */
  event_code: z.string().min(1).max(160),
  /** Idempotency Key */
  idempotency_key: z.union([z.string().max(240), z.null()]).optional(),
  /** 资源事件类型 */
  event_type: z.lazy(() => ResourceStateEventTypeSchema),
  /** 资源类型 */
  resource_type: z.lazy(() => ResourceTypeSchema),
  /** Resource Code */
  resource_code: z.string().min(1).max(120),
  /** 来源系统 */
  source_system: z.lazy(() => ResourceSourceSystemSchema),
  /** Source Event Id */
  source_event_id: z.string().min(1).max(200),
  /** Source Version */
  source_version: z.union([z.string().max(100), z.null()]).optional(),
  /** Trace Id */
  trace_id: z.union([z.string().max(100), z.null()]).optional(),
  /** Session Id */
  session_id: z.union([z.string().max(100), z.null()]).optional(),
  /** Workline Id */
  workline_id: z.union([z.number(), z.null()]).optional(),
  /** Workline Code */
  workline_code: z.union([z.string().max(50), z.null()]).optional(),
  /** Position Code */
  position_code: z.union([z.string().max(80), z.null()]).optional(),
  /** Logic Location Code */
  logic_location_code: z.union([z.string().max(120), z.null()]).optional(),
  /** External Location Code */
  external_location_code: z.union([z.string().max(120), z.null()]).optional(),
  /** Payload Json */
  payload_json: z.record(z.any()).optional(),
  /** Occurred At */
  occurred_at: z.string().datetime(),
  /** Received At */
  received_at: z.string().datetime(),
  /** Id */
  id: z.number(),
})


/**
 * 资源事实事件类型。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ResourceStateEventTypeSchema = z.enum(["RACK_ARRIVED", "RACK_DEPARTED", "BIN_ARRIVED", "BIN_DEPARTED", "BIN_MOUNTED", "BIN_UNMOUNTED", "MATERIAL_MOUNTED", "MATERIAL_UNMOUNTED", "EXCHANGE_STATUS_UPDATED", "RESOURCE_RECONCILED"])


/**
 * WES 运行时资源类型。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ResourceTypeSchema = z.enum(["RACK", "BIN", "MATERIAL"])


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
 * 角色响应 Schema（简化版，不含权限）
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RoleResponseSimpleSchema = z.object({
  /** Name */
  name: z.string().max(100),
  /** Description */
  description: z.union([z.string().max(255), z.null()]).optional(),
  /** Id */
  id: z.number(),
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


export const RuntimeBlockingReasonSchema = z.object({
  /** Device Id */
  device_id: z.union([z.number(), z.null()]).optional(),
  /** Reason */
  reason: z.string(),
  /** Detail */
  detail: z.union([z.string(), z.null()]).optional(),
})


export const RuntimeDeviceDetailResponseSchema = z.object({
  summary: z.lazy(() => RuntimeDeviceSummarySchema),
  /** Recent Commands */
  recent_commands: z.array(z.lazy(() => TraceCommandItemSchema)).optional(),
  /** Recent Callbacks */
  recent_callbacks: z.array(z.lazy(() => TraceCallbackLogItemSchema)).optional(),
  /** Active Sessions */
  active_sessions: z.array(z.lazy(() => RuntimeTraceListItemSchema)).optional(),
})


export const RuntimeDeviceHealthSummarySchema = z.object({
  /** Total */
  total: z.number().optional().default(0),
  /** Abnormal */
  abnormal: z.number().optional().default(0),
  /** Maintenance */
  maintenance: z.number().optional().default(0),
  /** Loaded */
  loaded: z.number().optional().default(0),
  /** Healthy */
  healthy: z.number().optional().default(0),
})


export const RuntimeDeviceSummarySchema = z.object({
  /** Id */
  id: z.number(),
  /** Device Code */
  device_code: z.string(),
  /** Device Name */
  device_name: z.string(),
  /** Device Role */
  device_role: z.string(),
  /** Role Index */
  role_index: z.number(),
  /** Workline Id */
  workline_id: z.union([z.number(), z.null()]).optional(),
  /** Workline Name */
  workline_name: z.union([z.string(), z.null()]).optional(),
  /** Workline Code */
  workline_code: z.union([z.string(), z.null()]).optional(),
  /** Device Status */
  device_status: z.string(),
  /** Maintenance Mode */
  maintenance_mode: z.boolean().optional().default(false),
  /** Current Command Id */
  current_command_id: z.union([z.number(), z.null()]).optional(),
  /** Open Command Count */
  open_command_count: z.number().optional().default(0),
  /** Pending Command Count */
  pending_command_count: z.number().optional().default(0),
  /** Blocked Outbox Count */
  blocked_outbox_count: z.number().optional().default(0),
  /** Open Issue Count */
  open_issue_count: z.number().optional().default(0),
  /** Active Runtime Hold Ids */
  active_runtime_hold_ids: z.array(z.number()).optional(),
  /** Last Heartbeat At */
  last_heartbeat_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Recent Callback At */
  recent_callback_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Error Code */
  error_code: z.union([z.string(), z.null()]).optional(),
})


/**
 * Another active hold blocking the same WorkLine.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RuntimeHoldBlockerSchema = z.object({
  /** Id */
  id: z.number(),
  /** Hold Type */
  hold_type: z.string(),
  /** Status */
  status: z.string(),
  /** Source Reason */
  source_reason: z.string(),
  /** Session Id */
  session_id: z.union([z.number(), z.null()]).optional(),
  /** Source Device Id */
  source_device_id: z.union([z.number(), z.null()]).optional(),
})


/**
 * Runtime Hold detail response.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RuntimeHoldDetailResponseSchema = z.object({
  summary: z.lazy(() => RuntimeHoldSummarySchema),
  source: z.lazy(() => RuntimeHoldSourceSchema),
  /** Evidence Snapshot Json */
  evidence_snapshot_json: z.record(z.any()),
  /** Release Evidence Json */
  release_evidence_json: z.record(z.any()),
  failed_command_evidence: z.union([z.lazy(() => FailedCommandEvidenceSchema), z.null()]).optional(),
  release_eligibility: z.lazy(() => RuntimeHoldReleaseEligibilitySchema),
  /** Blockers */
  blockers: z.array(z.lazy(() => RuntimeHoldBlockerSchema)).optional(),
})


/**
 * Current release decision model.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RuntimeHoldReleaseEligibilitySchema = z.object({
  /** Can Resolve */
  can_resolve: z.boolean(),
  /** Required Checks */
  required_checks: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
  /** Allowed Resolutions */
  allowed_resolutions: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
  /** Allowed Material Dispositions */
  allowed_material_dispositions: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
  /** Latest Evidence Hash */
  latest_evidence_hash: z.string(),
  /** Reason */
  reason: z.union([z.string(), z.null()]).optional(),
})


/**
 * Runtime Hold source refs.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RuntimeHoldSourceSchema = z.object({
  /** Source Kind */
  source_kind: z.string(),
  /** Source Reason */
  source_reason: z.string(),
  /** Source Inbox Id */
  source_inbox_id: z.union([z.number(), z.null()]).optional(),
  /** Source Outbox Id */
  source_outbox_id: z.union([z.number(), z.null()]).optional(),
  /** Source Command Id */
  source_command_id: z.union([z.number(), z.null()]).optional(),
  /** Source Device Id */
  source_device_id: z.union([z.number(), z.null()]).optional(),
  /** Source Idempotency Key */
  source_idempotency_key: z.string(),
})


/**
 * Runtime Hold summary.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RuntimeHoldSummarySchema = z.object({
  /** Id */
  id: z.number(),
  /** Hold Type */
  hold_type: z.string(),
  /** Status */
  status: z.string(),
  /** Blocking */
  blocking: z.boolean(),
  /** Workline Id */
  workline_id: z.number(),
  /** Session Id */
  session_id: z.union([z.number(), z.null()]).optional(),
  /** Trace Id */
  trace_id: z.union([z.string(), z.null()]).optional(),
  /** Plugin Key */
  plugin_key: z.union([z.string(), z.null()]).optional(),
  /** Contract Version */
  contract_version: z.union([z.string(), z.null()]).optional(),
  /** Source Reason */
  source_reason: z.string(),
  /** Material Disposition */
  material_disposition: z.union([z.string(), z.null()]).optional(),
  /** Ng Reason Code */
  ng_reason_code: z.union([z.string(), z.null()]).optional(),
  /** Ng Reason Label */
  ng_reason_label: z.union([z.string(), z.null()]).optional(),
  /** Version */
  version: z.number(),
  /** Created At */
  created_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Resolved At */
  resolved_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Resolved By */
  resolved_by: z.union([z.number(), z.null()]).optional(),
})


export const RuntimeOverviewResponseSchema = z.object({
  /** Stats */
  stats: z.array(z.lazy(() => RuntimeStatCardSchema)),
  /** Recent Failed Traces */
  recent_failed_traces: z.array(z.lazy(() => RuntimeTraceListItemSchema)).optional(),
  /** Hot Worklines */
  hot_worklines: z.array(z.lazy(() => RuntimeWorklineSummarySchema)).optional(),
  /** Abnormal Devices */
  abnormal_devices: z.array(z.lazy(() => RuntimeDeviceSummarySchema)).optional(),
  device_health: z.lazy(() => RuntimeDeviceHealthSummarySchema).optional(),
})


export const RuntimeStatCardSchema = z.object({
  /** Key */
  key: z.string(),
  /** Label */
  label: z.string(),
  /** Value */
  value: z.number(),
  /** Status */
  status: z.string().optional().default("info"),
})


export const RuntimeTraceDeviceActionSchema = z.object({
  /** Kind */
  kind: z.string(),
  /** Label */
  label: z.string(),
  /** Status */
  status: z.union([z.string(), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.union([z.string().datetime(), z.null()]).optional(),
  /** Message */
  message: z.union([z.string(), z.null()]).optional(),
})


export const RuntimeTraceDevicePathNodeSchema = z.object({
  /** Device Id */
  device_id: z.number(),
  /** Device Code */
  device_code: z.union([z.string(), z.null()]).optional(),
  /** Device Name */
  device_name: z.union([z.string(), z.null()]).optional(),
  /** Device Role */
  device_role: z.union([z.string(), z.null()]).optional(),
  /** Is Current */
  is_current: z.boolean().optional().default(false),
  /** Actions */
  actions: z.array(z.lazy(() => RuntimeTraceDeviceActionSchema)).optional(),
})


/**
 * Trace 列表项。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RuntimeTraceListItemSchema = z.object({
  /** Session Id */
  session_id: z.number(),
  /** Session Code */
  session_code: z.string(),
  /** Trace Id */
  trace_id: z.union([z.string(), z.null()]).optional(),
  /** Request Id */
  request_id: z.union([z.string(), z.null()]).optional(),
  /** Last Inbox Id */
  last_inbox_id: z.union([z.number(), z.null()]).optional(),
  /** Event Type */
  event_type: z.union([z.string(), z.null()]).optional(),
  /** Event Payload */
  event_payload: z.union([z.record(z.any()), z.null()]).optional(),
  /** Business Key */
  business_key: z.union([z.string(), z.null()]).optional(),
  /** Barcode */
  barcode: z.union([z.string(), z.null()]).optional(),
  /** Workline Id */
  workline_id: z.number(),
  /** Workline Name */
  workline_name: z.union([z.string(), z.null()]).optional(),
  /** Workline Code */
  workline_code: z.union([z.string(), z.null()]).optional(),
  /** Device Id */
  device_id: z.union([z.number(), z.null()]).optional(),
  /** Device Name */
  device_name: z.union([z.string(), z.null()]).optional(),
  /** Device Code */
  device_code: z.union([z.string(), z.null()]).optional(),
  /** Command Code */
  command_code: z.union([z.string(), z.null()]).optional(),
  /** Current Device Id */
  current_device_id: z.union([z.number(), z.null()]).optional(),
  /** Current Device Name */
  current_device_name: z.union([z.string(), z.null()]).optional(),
  /** Current Device Code */
  current_device_code: z.union([z.string(), z.null()]).optional(),
  /** Current Action */
  current_action: z.union([z.string(), z.null()]).optional(),
  /** Current Action Source */
  current_action_source: z.union([z.string(), z.null()]).optional(),
  /** Last Device Id */
  last_device_id: z.union([z.number(), z.null()]).optional(),
  /** Last Device Name */
  last_device_name: z.union([z.string(), z.null()]).optional(),
  /** Last Device Code */
  last_device_code: z.union([z.string(), z.null()]).optional(),
  /** Status */
  status: z.string(),
  /** Current Wait Type */
  current_wait_type: z.union([z.string(), z.null()]).optional(),
  /** Failure Domain */
  failure_domain: z.union([z.string(), z.null()]).optional(),
  /** Failure Code */
  failure_code: z.union([z.string(), z.null()]).optional(),
  /** Latest Timeline Action */
  latest_timeline_action: z.union([z.string(), z.null()]).optional(),
  /** Latest Timeline Status */
  latest_timeline_status: z.union([z.string(), z.null()]).optional(),
  /** Latest Timeline Message */
  latest_timeline_message: z.union([z.string(), z.null()]).optional(),
  /** Started At */
  started_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Last Ingress At */
  last_ingress_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Deadline At */
  deadline_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Is Timed Out */
  is_timed_out: z.boolean().optional().default(false),
})


/**
 * Trace 列表响应。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RuntimeTraceListResponseSchema = z.object({
  /** Total */
  total: z.number(),
  /** Items */
  items: z.array(z.lazy(() => RuntimeTraceListItemSchema)),
})


export const RuntimeTracePathResponseSchema = z.object({
  /** Workline Id */
  workline_id: z.union([z.number(), z.null()]).optional(),
  /** Session Id */
  session_id: z.union([z.number(), z.null()]).optional(),
  /** Trace Id */
  trace_id: z.union([z.string(), z.null()]).optional(),
  /** Devices */
  devices: z.array(z.lazy(() => RuntimeTraceDevicePathNodeSchema)).optional(),
  /** Timeline Groups */
  timeline_groups: z.array(z.lazy(() => RuntimeTraceTimelineGroupSchema)).optional(),
  /** Current Blocking Device Id */
  current_blocking_device_id: z.union([z.number(), z.null()]).optional(),
  blocking_reason: z.union([z.lazy(() => RuntimeBlockingReasonSchema), z.null()]).optional(),
  evidence: z.union([z.lazy(() => TraceDetailResponseSchema), z.null()]).optional(),
})


export const RuntimeTraceTimelineGroupSchema = z.object({
  /** Group Key */
  group_key: z.string(),
  /** Group Type */
  group_type: z.string(),
  /** Display Name */
  display_name: z.string(),
  /** Device Id */
  device_id: z.union([z.number(), z.null()]).optional(),
  /** Device Code */
  device_code: z.union([z.string(), z.null()]).optional(),
  /** Is Current */
  is_current: z.boolean().optional().default(false),
  /** Is Blocked */
  is_blocked: z.boolean().optional().default(false),
  /** Events */
  events: z.array(z.lazy(() => TraceTimelineItemSchema)).optional(),
})


export const RuntimeWorklineDetailResponseSchema = z.object({
  summary: z.lazy(() => RuntimeWorklineSummarySchema),
  /** Devices */
  devices: z.array(z.lazy(() => RuntimeWorklineDeviceItemSchema)).optional(),
  /** Active Sessions */
  active_sessions: z.array(z.lazy(() => RuntimeTraceListItemSchema)).optional(),
  /** Recent Failed Traces */
  recent_failed_traces: z.array(z.lazy(() => RuntimeTraceListItemSchema)).optional(),
  /** Recent Completed Traces */
  recent_completed_traces: z.array(z.lazy(() => RuntimeTraceListItemSchema)).optional(),
})


export const RuntimeWorklineDeviceItemSchema = z.object({
  /** Id */
  id: z.number(),
  /** Device Code */
  device_code: z.string(),
  /** Device Name */
  device_name: z.string(),
  /** Device Role */
  device_role: z.string(),
  /** Role Index */
  role_index: z.number(),
  /** Upstream Device Id */
  upstream_device_id: z.union([z.number(), z.null()]).optional(),
  /** Device Status */
  device_status: z.string(),
  /** Maintenance Mode */
  maintenance_mode: z.boolean().optional().default(false),
  /** Current Command Id */
  current_command_id: z.union([z.number(), z.null()]).optional(),
  /** Open Command Count */
  open_command_count: z.number().optional().default(0),
  /** Pending Command Count */
  pending_command_count: z.number().optional().default(0),
  /** Blocked Outbox Count */
  blocked_outbox_count: z.number().optional().default(0),
  /** Open Issue Count */
  open_issue_count: z.number().optional().default(0),
  /** Active Runtime Hold Ids */
  active_runtime_hold_ids: z.array(z.number()).optional(),
  /** Last Heartbeat At */
  last_heartbeat_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Error Code */
  error_code: z.union([z.string(), z.null()]).optional(),
})


export const RuntimeWorklineSummarySchema = z.object({
  /** Id */
  id: z.number(),
  /** Line Code */
  line_code: z.string(),
  /** Line Name */
  line_name: z.string(),
  /** Line Type */
  line_type: z.string(),
  /** Zone Name */
  zone_name: z.union([z.string(), z.null()]).optional(),
  /** Plugin Key */
  plugin_key: z.union([z.string(), z.null()]).optional(),
  /** Contract Version */
  contract_version: z.union([z.string(), z.null()]).optional(),
  /** Is Active */
  is_active: z.boolean(),
  /** Device Count */
  device_count: z.number().optional().default(0),
  /** Active Session Count */
  active_session_count: z.number().optional().default(0),
  /** Waiting Session Count */
  waiting_session_count: z.number().optional().default(0),
  /** Failed Session Count */
  failed_session_count: z.number().optional().default(0),
  /** Error Device Count */
  error_device_count: z.number().optional().default(0),
  /** Offline Device Count */
  offline_device_count: z.number().optional().default(0),
  /** Maintenance Device Count */
  maintenance_device_count: z.number().optional().default(0),
  /** Run Mode */
  run_mode: z.string().optional().default("AUTO"),
  /** Runtime Status */
  runtime_status: z.string().optional().default("STOPPED"),
  /** Active Safety Incident Id */
  active_safety_incident_id: z.union([z.number(), z.null()]).optional(),
  /** Stopped At */
  stopped_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Stopped Reason */
  stopped_reason: z.union([z.string(), z.null()]).optional(),
  /** Resumed At */
  resumed_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Start Admission Status */
  start_admission_status: z.union([z.string(), z.null()]).optional(),
  /** Start Admission Message */
  start_admission_message: z.union([z.string(), z.null()]).optional(),
  /** Start Admission Failed Device Code */
  start_admission_failed_device_code: z.union([z.string(), z.null()]).optional(),
  /** Start Admission Checked At */
  start_admission_checked_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Last Start Request Id */
  last_start_request_id: z.union([z.string(), z.null()]).optional(),
  /** Last Start Trace Id */
  last_start_trace_id: z.union([z.string(), z.null()]).optional(),
  /** Last Activity At */
  last_activity_at: z.union([z.string().datetime(), z.null()]).optional(),
})


/**
 * 沙箱 Command ACK 模拟请求。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const SandboxAckRequestSchema = z.object({
  /** Dispatch Key */
  dispatch_key: z.string().min(1).max(200),
})


/**
 * 沙箱工作线清理请求。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const SandboxCleanupRequestSchema = z.object({
  /** Dry Run */
  dry_run: z.boolean().optional().default(true),
  /** Confirmation */
  confirmation: z.union([z.string().max(200), z.null()]).optional(),
})


/**
 * 沙箱工作线清理响应。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const SandboxCleanupResponseSchema = z.object({
  /** Workline Id */
  workline_id: z.number(),
  /** Dry Run */
  dry_run: z.boolean(),
  /** Deleted */
  deleted: z.boolean(),
  /** Counts */
  counts: z.record(z.number()).optional(),
  /** Affected Session Ids */
  affected_session_ids: z.array(z.number()).optional(),
  /** Message */
  message: z.string(),
})


/**
 * 沙箱 Event 发送请求。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const SandboxEventRequestSchema = z.object({
  /** Workline Id */
  workline_id: z.number(),
  /** Device Id */
  device_id: z.number(),
  /** Event Type */
  event_type: z.string().min(1).max(100),
  /** Trace Id */
  trace_id: z.union([z.string().max(200), z.null()]).optional(),
  /** Session Id */
  session_id: z.union([z.number(), z.null()]).optional(),
  /** Payload */
  payload: z.record(z.any()).optional(),
  /** Timestamp */
  timestamp: z.union([z.string().datetime(), z.null()]).optional(),
})


/**
 * 沙箱 Event 模板。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const SandboxEventTemplateSchema = z.object({
  /** Event Type */
  event_type: z.string(),
  /** Label */
  label: z.string(),
  /** Payload Template */
  payload_template: z.record(z.any()).optional(),
})


/**
 * 沙箱 External HTTP 回调模拟请求。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const SandboxExternalCallbackRequestSchema = z.object({
  /** Dispatch Key */
  dispatch_key: z.string().min(1).max(200),
  /** Callback Type */
  callback_type: z.union([z.string().max(100), z.null()]).optional(),
  /** Payload */
  payload: z.record(z.any()).optional(),
  /** Source System */
  source_system: z.string().regex(new RegExp("^(WMS|RCS)$")).optional().default("WMS"),
  /** Source Event Id */
  source_event_id: z.union([z.string().max(200), z.null()]).optional(),
  /** Source Version */
  source_version: z.string().max(50).optional().default("1"),
  /** Request Id */
  request_id: z.union([z.string().max(200), z.null()]).optional(),
  /** Occurred At */
  occurred_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.union([z.string().datetime(), z.null()]).optional(),
  /** Signature */
  signature: z.string().max(500).optional().default("sandbox"),
})


/**
 * 沙箱 Command Result 模拟请求。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const SandboxResultRequestSchema = z.object({
  /** Command Code */
  command_code: z.string().min(1).max(100),
  /** Device Code */
  device_code: z.string().min(1).max(100),
  /** Result */
  result: z.string().regex(new RegExp("^(SUCCESS|FAILED)$")),
  /** Payload */
  payload: z.record(z.any()).optional(),
  /** Error Detail */
  error_detail: z.union([z.string().max(500), z.null()]).optional(),
  /** Timestamp */
  timestamp: z.union([z.string().datetime(), z.null()]).optional(),
})


/**
 * 沙箱 Result 模板。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const SandboxResultTemplateSchema = z.object({
  /** Command Type */
  command_type: z.string(),
  /** Label */
  label: z.string(),
  /** Success Payload Template */
  success_payload_template: z.record(z.any()).optional(),
  /** Failed Payload Template */
  failed_payload_template: z.record(z.any()).optional(),
  /** Error Template */
  error_template: z.union([z.string(), z.null()]).optional(),
})


/**
 * 沙箱模板响应。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const SandboxTemplatesResponseSchema = z.object({
  /** Event Templates */
  event_templates: z.array(z.lazy(() => SandboxEventTemplateSchema)).optional(),
  /** Result Templates */
  result_templates: z.array(z.lazy(() => SandboxResultTemplateSchema)).optional(),
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
 * 沙箱模拟 WorkLine 软件急停请求。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const SimulateWorkLineEstopRequestSchema = z.object({
  /** Reason */
  reason: z.union([z.string().max(500), z.null()]).optional(),
  /** Source Device Id */
  source_device_id: z.union([z.number(), z.null()]).optional(),
  /** Payload */
  payload: z.record(z.any()).optional(),
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
 * 批量排序项
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const SortItemSchema = z.object({
  /** Id */
  id: z.number(),
  /** Parent Id */
  parent_id: z.union([z.number(), z.null()]).optional(),
  /** Sort Order */
  sort_order: z.number().optional().default(0),
})


export const TraceBlockingPointResponseSchema = z.object({
  /** Trace Id */
  trace_id: z.string(),
  /** Request Id */
  request_id: z.union([z.string(), z.null()]).optional(),
  /** Blocking Point */
  blocking_point: z.string(),
  /** Owner */
  owner: z.string(),
  /** Recoverability */
  recoverability: z.string(),
  /** Operator Action */
  operator_action: z.string(),
  diagnostic_card: z.lazy(() => DiagnosticCardResponseSchema),
  /** Evidence */
  evidence: z.record(z.any()).optional(),
  /** Next Steps */
  next_steps: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
})


export const TraceCallbackLogItemSchema = z.object({
  /** Id */
  id: z.number(),
  /** Callback Type */
  callback_type: z.string(),
  /** Subject Code */
  subject_code: z.string(),
  /** Request Id */
  request_id: z.union([z.string(), z.null()]).optional(),
  /** Trace Id */
  trace_id: z.union([z.string(), z.null()]).optional(),
  /** Event Id */
  event_id: z.union([z.string(), z.null()]).optional(),
  /** Causation Id */
  causation_id: z.union([z.string(), z.null()]).optional(),
  /** Response Status */
  response_status: z.number(),
  /** Response Time Ms */
  response_time_ms: z.number(),
  /** Error Message */
  error_message: z.union([z.string(), z.null()]).optional(),
  /** Ingress Outcome */
  ingress_outcome: z.union([z.string(), z.null()]).optional(),
  /** Failure Stage */
  failure_stage: z.union([z.string(), z.null()]).optional(),
  /** Request Body */
  request_body: z.record(z.any()),
  /** Created At */
  created_at: z.string().datetime(),
  /** Updated At */
  updated_at: z.union([z.string().datetime(), z.null()]).optional(),
})


export const TraceCommandItemSchema = z.object({
  /** Id */
  id: z.number(),
  /** Device Id */
  device_id: z.number(),
  /** Command Code */
  command_code: z.string(),
  /** Trace Id */
  trace_id: z.union([z.string(), z.null()]).optional(),
  /** Workline Id */
  workline_id: z.union([z.number(), z.null()]).optional(),
  /** Session Id */
  session_id: z.union([z.string(), z.null()]).optional(),
  /** Task Type */
  task_type: z.string(),
  /** Status */
  status: z.string(),
  /** Result */
  result: z.union([z.string(), z.null()]).optional(),
  /** Retry Count */
  retry_count: z.number().optional().default(0),
  /** Sent At */
  sent_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Ack Received At */
  ack_received_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Completed At */
  completed_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Ack Code */
  ack_code: z.union([z.number(), z.null()]).optional(),
  /** Ack Message */
  ack_message: z.union([z.string(), z.null()]).optional(),
  /** Ack Trace Id */
  ack_trace_id: z.union([z.string(), z.null()]).optional(),
  /** Params */
  params: z.record(z.any()),
  /** Result Data */
  result_data: z.union([z.record(z.any()), z.null()]).optional(),
  /** Error Detail */
  error_detail: z.union([z.record(z.any()), z.null()]).optional(),
  /** Duration Ms */
  duration_ms: z.union([z.number(), z.null()]).optional(),
})


export const TraceContextResponseSchema = z.object({
  /** Request Id */
  request_id: z.union([z.string(), z.null()]).optional(),
  /** Trace Id */
  trace_id: z.union([z.string(), z.null()]).optional(),
  /** Event Id */
  event_id: z.union([z.string(), z.null()]).optional(),
  /** Causation Id */
  causation_id: z.union([z.string(), z.null()]).optional(),
  /** Workline Id */
  workline_id: z.union([z.number(), z.null()]).optional(),
  /** Session Id */
  session_id: z.union([z.number(), z.null()]).optional(),
  /** Inbox Id */
  inbox_id: z.union([z.number(), z.null()]).optional(),
  /** Device Id */
  device_id: z.union([z.number(), z.null()]).optional(),
  /** Device Code */
  device_code: z.union([z.string(), z.null()]).optional(),
  /** Command Id */
  command_id: z.union([z.number(), z.null()]).optional(),
  /** Command Code */
  command_code: z.union([z.string(), z.null()]).optional(),
  /** Outbox Id */
  outbox_id: z.union([z.number(), z.null()]).optional(),
  /** Dispatch Key */
  dispatch_key: z.union([z.string(), z.null()]).optional(),
  /** Canonical Event Type */
  canonical_event_type: z.union([z.string(), z.null()]).optional(),
  /** Transition */
  transition: z.union([z.string(), z.null()]).optional(),
  /** Plugin Key */
  plugin_key: z.union([z.string(), z.null()]).optional(),
  /** Contract Version */
  contract_version: z.union([z.string(), z.null()]).optional(),
})


export const TraceDetailResponseSchema = z.object({
  trace: z.lazy(() => TraceContextResponseSchema),
  summary: z.lazy(() => TraceOverviewSummarySchema),
  session: z.union([z.lazy(() => TraceSessionItemSchema), z.null()]).optional(),
  /** Sessions */
  sessions: z.array(z.lazy(() => TraceSessionItemSchema)).optional(),
  /** Callback Logs */
  callback_logs: z.array(z.lazy(() => TraceCallbackLogItemSchema)).optional(),
  /** Inboxes */
  inboxes: z.array(z.lazy(() => TraceInboxItemSchema)).optional(),
  /** Commands */
  commands: z.array(z.lazy(() => TraceCommandItemSchema)).optional(),
  /** Outboxes */
  outboxes: z.array(z.lazy(() => TraceOutboxItemSchema)).optional(),
  /** Dispatch Attempts */
  dispatch_attempts: z.array(z.lazy(() => TraceDispatchAttemptItemSchema)).optional(),
  /** Timelines */
  timelines: z.array(z.lazy(() => TraceTimelineItemSchema)).optional(),
  /** Diagnostics */
  diagnostics: z.array(z.lazy(() => TraceDiagnosticItemSchema)).optional(),
  resource_evidence: z.lazy(() => TraceResourceEvidenceResponseSchema).optional(),
})


export const TraceDiagnosticContextItemSchema = z.object({
  /** Request Id */
  request_id: z.union([z.string(), z.null()]).optional(),
  /** Trace Id */
  trace_id: z.union([z.string(), z.null()]).optional(),
  /** Session Id */
  session_id: z.union([z.number(), z.null()]).optional(),
  /** Inbox Id */
  inbox_id: z.union([z.number(), z.null()]).optional(),
  /** Outbox Id */
  outbox_id: z.union([z.number(), z.null()]).optional(),
  /** Command Code */
  command_code: z.union([z.string(), z.null()]).optional(),
  /** Device Code */
  device_code: z.union([z.string(), z.null()]).optional(),
  /** Workline Id */
  workline_id: z.union([z.number(), z.null()]).optional(),
  /** Workline Code */
  workline_code: z.union([z.string(), z.null()]).optional(),
  /** Plugin Key */
  plugin_key: z.union([z.string(), z.null()]).optional(),
  /** Canonical Event Type */
  canonical_event_type: z.union([z.string(), z.null()]).optional(),
  /** Transition */
  transition: z.union([z.string(), z.null()]).optional(),
  /** Extra */
  extra: z.record(z.any()).optional(),
})


export const TraceDiagnosticItemSchema = z.object({
  /** Request Id */
  request_id: z.union([z.string(), z.null()]).optional(),
  /** Trace Id */
  trace_id: z.union([z.string(), z.null()]).optional(),
  /** Session Id */
  session_id: z.union([z.number(), z.null()]).optional(),
  /** Inbox Id */
  inbox_id: z.union([z.number(), z.null()]).optional(),
  /** Outbox Id */
  outbox_id: z.union([z.number(), z.null()]).optional(),
  /** Command Code */
  command_code: z.union([z.string(), z.null()]).optional(),
  /** Device Code */
  device_code: z.union([z.string(), z.null()]).optional(),
  /** Workline Id */
  workline_id: z.union([z.number(), z.null()]).optional(),
  /** Workline Code */
  workline_code: z.union([z.string(), z.null()]).optional(),
  /** Plugin Key */
  plugin_key: z.union([z.string(), z.null()]).optional(),
  /** Canonical Event Type */
  canonical_event_type: z.union([z.string(), z.null()]).optional(),
  /** Transition */
  transition: z.union([z.string(), z.null()]).optional(),
  /** Extra */
  extra: z.record(z.any()).optional(),
})


export const TraceDispatchAttemptItemSchema = z.object({
  /** Id */
  id: z.number(),
  /** Outbox Id */
  outbox_id: z.number(),
  /** Dispatch Key */
  dispatch_key: z.string(),
  /** Attempt No */
  attempt_no: z.number(),
  /** Lease Token */
  lease_token: z.string(),
  /** Status */
  status: z.string(),
  /** Target Type */
  target_type: z.union([z.string(), z.null()]).optional(),
  /** Target Code */
  target_code: z.union([z.string(), z.null()]).optional(),
  /** Started At */
  started_at: z.string().datetime(),
  /** Finalized At */
  finalized_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Error Message */
  error_message: z.union([z.string(), z.null()]).optional(),
  /** Response Json */
  response_json: z.record(z.any()).optional(),
  /** Trace Json */
  trace_json: z.record(z.any()).optional(),
})


export const TraceInboxItemSchema = z.object({
  /** Id */
  id: z.number(),
  /** Kind */
  kind: z.string(),
  /** Source System */
  source_system: z.string(),
  /** Source Message Id */
  source_message_id: z.union([z.string(), z.null()]).optional(),
  /** Trace Id */
  trace_id: z.union([z.string(), z.null()]).optional(),
  /** Event Id */
  event_id: z.union([z.string(), z.null()]).optional(),
  /** Causation Id */
  causation_id: z.union([z.string(), z.null()]).optional(),
  /** Workline Id */
  workline_id: z.union([z.number(), z.null()]).optional(),
  /** Device Id */
  device_id: z.union([z.number(), z.null()]).optional(),
  /** Command Id */
  command_id: z.union([z.number(), z.null()]).optional(),
  /** Session Id */
  session_id: z.union([z.number(), z.null()]).optional(),
  /** Status */
  status: z.string(),
  /** Received At */
  received_at: z.string().datetime(),
  /** Processed At */
  processed_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Attempt Count */
  attempt_count: z.number().optional().default(0),
  /** Max Attempts */
  max_attempts: z.number().optional().default(0),
  /** Next Retry At */
  next_retry_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Error Message */
  error_message: z.union([z.string(), z.null()]).optional(),
  /** Payload Json */
  payload_json: z.record(z.any()),
})


export const TraceOutboxItemSchema = z.object({
  /** Id */
  id: z.number(),
  /** Session Id */
  session_id: z.union([z.number(), z.null()]).optional(),
  /** Workline Id */
  workline_id: z.number(),
  /** Dispatch Type */
  dispatch_type: z.string(),
  /** Dispatch Key */
  dispatch_key: z.string(),
  /** Target Type */
  target_type: z.string(),
  /** Target Code */
  target_code: z.string(),
  /** Status */
  status: z.string(),
  /** Attempt Count */
  attempt_count: z.number().optional().default(0),
  /** Next Retry At */
  next_retry_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Last Error */
  last_error: z.union([z.string(), z.null()]).optional(),
  /** Blocked By Runtime Hold Id */
  blocked_by_runtime_hold_id: z.union([z.number(), z.null()]).optional(),
  /** Blocked By Reconciliation Session Id */
  blocked_by_reconciliation_session_id: z.union([z.number(), z.null()]).optional(),
  /** Blocked Device Id */
  blocked_device_id: z.union([z.number(), z.null()]).optional(),
  /** Blocked Workline Id */
  blocked_workline_id: z.union([z.number(), z.null()]).optional(),
  /** Blocked Reason */
  blocked_reason: z.union([z.string(), z.null()]).optional(),
  /** Created At */
  created_at: z.string().datetime(),
  /** Sent At */
  sent_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Finished At */
  finished_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Payload Json */
  payload_json: z.record(z.any()),
})


/**
 * Trace 详情页顶部摘要。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const TraceOverviewSummarySchema = z.object({
  /** Callback Logs */
  callback_logs: z.number().optional().default(0),
  /** Inboxes */
  inboxes: z.number().optional().default(0),
  /** Commands */
  commands: z.number().optional().default(0),
  /** Outboxes */
  outboxes: z.number().optional().default(0),
  /** Timelines */
  timelines: z.number().optional().default(0),
  /** Diagnostics */
  diagnostics: z.number().optional().default(0),
  /** Session Status */
  session_status: z.union([z.string(), z.null()]).optional(),
  /** Current Wait Type */
  current_wait_type: z.union([z.string(), z.null()]).optional(),
  /** Latest Timeline Action */
  latest_timeline_action: z.union([z.string(), z.null()]).optional(),
  /** Latest Timeline Status */
  latest_timeline_status: z.union([z.string(), z.null()]).optional(),
  /** Latest Timeline Message */
  latest_timeline_message: z.union([z.string(), z.null()]).optional(),
})


/**
 * Trace 列表查询请求。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const TraceQueryRequestSchema = z.object({
  /** Workline Id */
  workline_id: z.union([z.number(), z.null()]).optional(),
  /** Device Id */
  device_id: z.union([z.number(), z.null()]).optional(),
  /** Status */
  status: z.union([z.string(), z.null()]).optional(),
  /** Keyword */
  keyword: z.union([z.string(), z.null()]).optional(),
  /** Only Active */
  only_active: z.boolean().optional().default(false),
  /** Only Failed */
  only_failed: z.boolean().optional().default(false),
  /** Limit */
  limit: z.number().min(1).max(100).optional().default(20),
  /** Offset */
  offset: z.number().min(0).optional().default(0),
})


/**
 * Trace 关联的资源域证据链。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const TraceResourceEvidenceResponseSchema = z.object({
  /** Resource State Events */
  resource_state_events: z.array(z.record(z.any())).optional(),
  /** Rack Releases */
  rack_releases: z.array(z.record(z.any())).optional(),
  /** Rack Release Bin Snapshots */
  rack_release_bin_snapshots: z.array(z.record(z.any())).optional(),
  /** Wms Writeback Evidence */
  wms_writeback_evidence: z.array(z.record(z.any())).optional(),
  /** Rack Bin Mounts */
  rack_bin_mounts: z.array(z.record(z.any())).optional(),
  /** Runtime Holds */
  runtime_holds: z.array(z.record(z.any())).optional(),
})


export const TraceSessionItemSchema = z.object({
  /** Id */
  id: z.number(),
  /** Session Code */
  session_code: z.string(),
  /** Workline Id */
  workline_id: z.number(),
  /** Plugin Key */
  plugin_key: z.string(),
  /** Run Mode */
  run_mode: z.string(),
  /** Business Key */
  business_key: z.union([z.string(), z.null()]).optional(),
  /** Barcode */
  barcode: z.union([z.string(), z.null()]).optional(),
  /** Status */
  status: z.string(),
  /** Trace Id */
  trace_id: z.union([z.string(), z.null()]).optional(),
  /** Started At */
  started_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Ended At */
  ended_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Current Wait Type */
  current_wait_type: z.union([z.string(), z.null()]).optional(),
  /** Current Wait Timeout Seconds */
  current_wait_timeout_seconds: z.union([z.number(), z.null()]).optional(),
  /** Waiting Since */
  waiting_since: z.union([z.string().datetime(), z.null()]).optional(),
  /** Deadline At */
  deadline_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Awaiting Command Id */
  awaiting_command_id: z.union([z.number(), z.null()]).optional(),
  /** Reconciliation State */
  reconciliation_state: z.union([z.string(), z.null()]).optional(),
  /** Reconciliation Reason */
  reconciliation_reason: z.union([z.string(), z.null()]).optional(),
  /** Reconciliation Source Kind */
  reconciliation_source_kind: z.union([z.string(), z.null()]).optional(),
  /** Reconciliation Source Inbox Id */
  reconciliation_source_inbox_id: z.union([z.number(), z.null()]).optional(),
  /** Reconciliation Source Outbox Id */
  reconciliation_source_outbox_id: z.union([z.number(), z.null()]).optional(),
  /** Reconciliation Command Id */
  reconciliation_command_id: z.union([z.number(), z.null()]).optional(),
  /** Reconciliation Device Id */
  reconciliation_device_id: z.union([z.number(), z.null()]).optional(),
  /** Reconciliation Wait Token */
  reconciliation_wait_token: z.union([z.string(), z.null()]).optional(),
  /** Reconciliation Ack Received At */
  reconciliation_ack_received_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Reconciliation Deadline At */
  reconciliation_deadline_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Reconciliation Occurred At */
  reconciliation_occurred_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Reconciliation Late Evidence Received */
  reconciliation_late_evidence_received: z.boolean().optional().default(false),
  /** Reconciliation Resolution */
  reconciliation_resolution: z.union([z.string(), z.null()]).optional(),
  /** Reconciliation Resolved At */
  reconciliation_resolved_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Required Operator Action */
  required_operator_action: z.union([z.string(), z.null()]).optional(),
  /** Failure Domain */
  failure_domain: z.union([z.string(), z.null()]).optional(),
  /** Failure Code */
  failure_code: z.union([z.string(), z.null()]).optional(),
  /** Failure Message */
  failure_message: z.union([z.string(), z.null()]).optional(),
  /** Ingress Count */
  ingress_count: z.number().optional().default(0),
  /** Last Request Id */
  last_request_id: z.union([z.string(), z.null()]).optional(),
  /** Last Ingress At */
  last_ingress_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Last Inbox Id */
  last_inbox_id: z.union([z.number(), z.null()]).optional(),
  /** Context Json */
  context_json: z.record(z.any()),
})


export const TraceTimelineItemSchema = z.object({
  /** Id */
  id: z.number(),
  /** Session Id */
  session_id: z.number(),
  /** Workline Id */
  workline_id: z.number(),
  /** Trace Id */
  trace_id: z.union([z.string(), z.null()]).optional(),
  /** Seq No */
  seq_no: z.number(),
  /** Occurred At */
  occurred_at: z.string().datetime(),
  /** Stage */
  stage: z.string(),
  /** Action Type */
  action_type: z.string(),
  /** Actor Type */
  actor_type: z.string(),
  /** Actor Code */
  actor_code: z.union([z.string(), z.null()]).optional(),
  /** From Status */
  from_status: z.union([z.string(), z.null()]).optional(),
  /** To Status */
  to_status: z.union([z.string(), z.null()]).optional(),
  /** Status */
  status: z.string(),
  /** Failure Domain */
  failure_domain: z.union([z.string(), z.null()]).optional(),
  /** Message */
  message: z.union([z.string(), z.null()]).optional(),
  /** Payload Json */
  payload_json: z.union([z.record(z.any()), z.null()]).optional(),
  /** Related Inbox Id */
  related_inbox_id: z.union([z.number(), z.null()]).optional(),
  /** Related Command Id */
  related_command_id: z.union([z.number(), z.null()]).optional(),
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
  /** Created By */
  created_by: z.union([z.number(), z.null()]).optional(),
  /** Updated At */
  updated_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Updated By */
  updated_by: z.union([z.number(), z.null()]).optional(),
  /** Deleted By */
  deleted_by: z.union([z.number(), z.null()]).optional(),
  /** Deleted At */
  deleted_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Roles */
  roles: z.array(z.lazy(() => RoleResponseSimpleSchema)).optional(),
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
  /** Created By */
  created_by: z.union([z.number(), z.null()]).optional(),
  /** Updated At */
  updated_at: z.union([z.string().datetime(), z.null()]).optional(),
  /** Updated By */
  updated_by: z.union([z.number(), z.null()]).optional(),
  /** Deleted By */
  deleted_by: z.union([z.number(), z.null()]).optional(),
  /** Deleted At */
  deleted_at: z.union([z.string().datetime(), z.null()]).optional(),
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
 * WMS 确认状态。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WmsConfirmationStatusSchema = z.enum(["PENDING", "CONFIRMED", "REJECTED", "NOT_REQUIRED"])


/**
 * 作业线启用前结构化检查项。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineConfigurationCheckSchema = z.object({
  /** Code */
  code: z.string(),
  /** Status */
  status: z.enum(["PASS", "FAIL", "WARN"]),
  /** Severity */
  severity: z.enum(["INFO", "WARNING", "BLOCKER"]),
  /** Context */
  context: z.record(z.any()).optional(),
})


/**
 * 作业线配置状态响应。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineConfigurationStatusSchema = z.object({
  /** Workline Id */
  workline_id: z.number(),
  /** Is Active */
  is_active: z.boolean(),
  /** Can Activate */
  can_activate: z.boolean(),
  /** Checks */
  checks: z.array(z.lazy(() => WorkLineConfigurationCheckSchema)).optional(),
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
  /** 作业线类型 */
  line_type: z.lazy(() => LineTypeSchema),
  /** Zone Name */
  zone_name: z.union([z.string().max(100), z.null()]).optional(),
  /** Plugin Key */
  plugin_key: z.union([z.string().max(100), z.null()]).optional(),
  /** Contract Version */
  contract_version: z.union([z.string().max(50), z.null()]).optional(),
  /** Config */
  config: z.record(z.any()).optional(),
  /** Runtime Config Json */
  runtime_config_json: z.record(z.any()).optional(),
  /** 工作线运行模式 */
  run_mode: z.lazy(() => WorkLineRunModeSchema).optional().default("AUTO"),
  /** Diagnostic Profile */
  diagnostic_profile: z.record(z.any()).optional(),
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
})


/**
 * 作业线插件下拉选项。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLinePluginOptionSchema = z.object({
  /** Plugin Key */
  plugin_key: z.string(),
  /** Label */
  label: z.string(),
  /** Contract Versions */
  contract_versions: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
  /** Default Contract Version */
  default_contract_version: z.string(),
  /** Required Device Roles */
  required_device_roles: z.array(z.lazy(() => DeviceRoleRequirementOptionSchema)).optional(),
  /** Supported Events */
  supported_events: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
  /** Supported Commands */
  supported_commands: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
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
  /** Plugin Key */
  plugin_key: z.union([z.string().max(100), z.null()]).optional(),
  /** Contract Version */
  contract_version: z.union([z.string().max(50), z.null()]).optional(),
  /** Config */
  config: z.record(z.any()).optional(),
  /** Runtime Config Json */
  runtime_config_json: z.record(z.any()).optional(),
  /** 工作线运行模式 */
  run_mode: z.lazy(() => WorkLineRunModeSchema).optional().default("AUTO"),
  /** Diagnostic Profile */
  diagnostic_profile: z.record(z.any()).optional(),
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Id */
  id: z.number(),
  /** Version */
  version: z.number(),
  /** Is Active */
  is_active: z.boolean(),
})


/**
 * 作业线运行模式枚举。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineRunModeSchema = z.enum(["AUTO", "MANUAL", "SIMULATION"])


/**
 * 作业线启停请求。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineStateTransitionRequestSchema = z.object({
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
  /** Plugin Key */
  plugin_key: z.union([z.string().max(100), z.null()]).optional(),
  /** Contract Version */
  contract_version: z.union([z.string().max(50), z.null()]).optional(),
  /** Config */
  config: z.union([z.record(z.any()), z.null()]).optional(),
  /** Runtime Config Json */
  runtime_config_json: z.union([z.record(z.any()), z.null()]).optional(),
  /** 工作线运行模式 */
  run_mode: z.union([z.lazy(() => WorkLineRunModeSchema), z.null()]).optional(),
  /** Diagnostic Profile */
  diagnostic_profile: z.union([z.record(z.any()), z.null()]).optional(),
  /** Description */
  description: z.union([z.string().max(500), z.null()]).optional(),
  /** Version */
  version: z.number(),
})
