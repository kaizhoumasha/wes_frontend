/** @openapi-sha256 6653931532482447766eee6163bd1256d799ae8206665f43f972182b9f417a20 */
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
  /** Workline Session Id */
  workline_session_id: z.union([z.number(), z.null()]).optional(),
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
  /** Workline Session Id */
  workline_session_id: z.union([z.number(), z.null()]).optional(),
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
  /** Bin Slot Index */
  bin_slot_index: z.number().min(1),
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


export const DebugTransportTaskCreatedSchema = z.object({
  /** Transport Task Id */
  transport_task_id: z.string(),
  /** Client Request Id */
  client_request_id: z.string(),
})


export const DeviceCommandCallbackResponseSchema = z.object({
  /** Result */
  result: z.string(),
  /** Data */
  data: z.record(z.any()),
  /** Error Detail */
  error_detail: z.union([z.record(z.any()), z.null()]),
  /** Source Event Id */
  source_event_id: z.string(),
  /** Received At */
  received_at: z.string(),
  /** Apply Status */
  apply_status: z.string(),
})


/**
 * 设备创建合同。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceCreateSchema = z.object({
  /** Device Code */
  device_code: z.string().min(1).max(100),
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
  device_role: z.string().min(1).max(50),
  /** Role Index */
  role_index: z.number().min(1).optional().default(1),
  /** Upstream Device Id */
  upstream_device_id: z.union([z.number(), z.null()]).optional(),
  /** Diagnostic Profile */
  diagnostic_profile: z.record(z.any()).optional(),
  /** Endpoint Base Url */
  endpoint_base_url: z.union([z.string().max(255), z.null()]).optional(),
})


export const DeviceIngressKindSchema = z.enum(["DEVICE_RESULT", "DEVICE_EVENT"])


/**
 * 设备静态主数据响应。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceResponseSchema = z.object({
  /** Device Code */
  device_code: z.string().min(1).max(100),
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
  device_role: z.string().min(1).max(50),
  /** Role Index */
  role_index: z.number().min(1).optional().default(1),
  /** Upstream Device Id */
  upstream_device_id: z.union([z.number(), z.null()]).optional(),
  /** Diagnostic Profile */
  diagnostic_profile: z.record(z.any()).optional(),
  /** Endpoint Base Url */
  endpoint_base_url: z.union([z.string().max(255), z.null()]).optional(),
  /** Id */
  id: z.number(),
  /** Version */
  version: z.number(),
})


/**
 * 设备静态主数据更新合同。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const DeviceUpdateSchema = z.object({
  /** Device Code */
  device_code: z.union([z.string().min(1).max(100), z.null()]).optional(),
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
  device_role: z.union([z.string().min(1).max(50), z.null()]).optional(),
  /** Role Index */
  role_index: z.union([z.number().min(1), z.null()]).optional(),
  /** Upstream Device Id */
  upstream_device_id: z.union([z.number(), z.null()]).optional(),
  /** Diagnostic Profile */
  diagnostic_profile: z.union([z.record(z.any()), z.null()]).optional(),
  /** Endpoint Base Url */
  endpoint_base_url: z.union([z.string().max(255), z.null()]).optional(),
  /** Version */
  version: z.number(),
})


export const EcsCallbackAckSchema = z.object({
  /** Code */
  code: z.number(),
  /** Message */
  message: z.string(),
  error_detail: z.union([z.lazy(() => EcsCallbackRejectionDetailSchema), z.null()]).optional(),
})


export const EcsCallbackRejectionDetailSchema = z.object({
  /** Issues */
  issues: z.array(z.lazy(() => EcsCallbackValidationIssueSchema)),
})


export const EcsCallbackValidationIssueSchema = z.object({
  /** Field */
  field: z.string(),
  /** Code */
  code: z.string(),
  /** Expected */
  expected: z.union([z.string(), z.null()]).optional(),
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
  /** Device Code */
  device_code: z.string().min(1).max(100).regex(new RegExp("^[A-Za-z0-9][A-Za-z0-9._:-]*$")),
  mode: z.lazy(() => EcsDeviceModeSchema),
  status: z.lazy(() => EcsDeviceStateSchema),
  /** Is Online */
  is_online: z.boolean(),
  /** Current Command Code */
  current_command_code: z.union([z.string().min(1).max(160).regex(new RegExp("^[A-Za-z0-9][A-Za-z0-9._:-]*$")), z.null()]),
  /** Scenario */
  scenario: z.union([z.string().min(1).max(100).regex(new RegExp("^[A-Za-z0-9][A-Za-z0-9._:-]*$")), z.null()]),
  /** Updated At */
  updated_at: z.number().max(9223372036854776000),
})


export const EcsDeviceStateSchema = z.enum(["IDLE", "RUNNING", "ERROR", "PAUSED", "STOPPED", "OFFLINE", "UNKNOWN"])


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


export const InboundEvidenceApplyStatusSchema = z.enum(["PENDING", "APPLIED", "IGNORED", "RECONCILING"])


/**
 * 作业线类型枚举。
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


export const ManualDebugDeviceCommandCreateSchema = z.object({
  /** Client Request Id */
  client_request_id: z.string().min(36).max(36).regex(new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")),
  /** Endpoint Base Url */
  endpoint_base_url: z.string().min(1).max(255),
  /** Device Code */
  device_code: z.string().min(1).max(100).regex(new RegExp("^[A-Za-z0-9][A-Za-z0-9._:-]*$")),
  /** Timeout */
  timeout: z.number().max(2147483647),
  /** Task Type */
  task_type: z.string().min(1).max(100).regex(new RegExp("^[A-Za-z0-9][A-Za-z0-9._:-]*$")),
  /** Params */
  params: z.record(z.any()).optional(),
  /** Reason */
  reason: z.string().min(1).max(500),
})


export const ManualDebugDeviceCommandCreatedSchema = z.object({
  /** Command Code */
  command_code: z.string(),
  /** Client Request Id */
  client_request_id: z.string(),
  /** Status */
  status: z.string(),
})


export const ManualDebugDeviceCommandResponseSchema = z.object({
  /** Command Code */
  command_code: z.string(),
  /** Client Request Id */
  client_request_id: z.string(),
  /** Device Code */
  device_code: z.string(),
  /** Endpoint Base Url */
  endpoint_base_url: z.string(),
  /** Contract Key */
  contract_key: z.string(),
  /** Contract Version */
  contract_version: z.string(),
  /** Command Timeout Ms */
  command_timeout_ms: z.number(),
  /** Task Type */
  task_type: z.string(),
  /** Params */
  params: z.record(z.any()),
  /** Trace Id */
  trace_id: z.union([z.string(), z.null()]),
  /** Status */
  status: z.string(),
  /** Attempt Count */
  attempt_count: z.number(),
  /** Ack Received At */
  ack_received_at: z.union([z.string(), z.null()]),
  /** Completed At */
  completed_at: z.union([z.string(), z.null()]),
  /** Failure Code */
  failure_code: z.union([z.string(), z.null()]),
  /** Reconciliation Reason */
  reconciliation_reason: z.union([z.string(), z.null()]),
  /** Execution Reason */
  execution_reason: z.string(),
  /** Created By */
  created_by: z.number(),
  callback: z.union([z.lazy(() => DeviceCommandCallbackResponseSchema), z.null()]),
})


export const ManualDebugPreflightDeviceSchema = z.object({
  device: z.lazy(() => EcsDeviceInfoSchema),
  state: z.lazy(() => EcsDeviceRuntimeStateSchema),
  /** Admissible */
  admissible: z.boolean(),
  /** Rejection Code */
  rejection_code: z.union([z.string(), z.null()]),
})


export const ManualDebugPreflightRequestSchema = z.object({
  /** Endpoint Base Url */
  endpoint_base_url: z.string().min(1).max(255),
})


export const ManualDebugPreflightResponseSchema = z.object({
  /** Endpoint Base Url */
  endpoint_base_url: z.string(),
  /** Devices */
  devices: z.array(z.lazy(() => ManualDebugPreflightDeviceSchema)),
})


/**
 * MaterialLocationQuery 冲突状态。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const MaterialLocationConflictStateSchema = z.enum(["OK", "NOT_FOUND", "RECONCILING", "WMS_UNAVAILABLE"])


/**
 * 单个位置来源 evidence。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const MaterialLocationEvidenceSchema = z.object({
  /** Source */
  source: z.string(),
  /** Priority */
  priority: z.number(),
  /** Object Type */
  object_type: z.string(),
  /** Object Key */
  object_key: z.string(),
  /** Location Scope */
  location_scope: z.union([z.string(), z.null()]).optional(),
  /** Location Code */
  location_code: z.union([z.string(), z.null()]).optional(),
  /** Semantic Status */
  semantic_status: z.union([z.string(), z.null()]).optional(),
  /** Evidence Ref */
  evidence_ref: z.union([z.string(), z.null()]).optional(),
  /** Evidence Json */
  evidence_json: z.record(z.any()).optional(),
  /** Correlation Id */
  correlation_id: z.union([z.string(), z.null()]).optional(),
  /** Provider Code */
  provider_code: z.union([z.string(), z.null()]).optional(),
  /** Source Event Id */
  source_event_id: z.union([z.string(), z.null()]).optional(),
  /** Source Version */
  source_version: z.union([z.string(), z.null()]).optional(),
  /** External Reference */
  external_reference: z.union([z.string(), z.null()]).optional(),
  /** Observed At */
  observed_at: z.union([z.string().datetime(), z.null()]).optional(),
})


/**
 * 统一位置查询结果。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const MaterialLocationResultSchema = z.object({
  /** Query Entry */
  query_entry: z.string(),
  conflict_state: z.lazy(() => MaterialLocationConflictStateSchema),
  /** Object Type */
  object_type: z.union([z.string(), z.null()]).optional(),
  /** Object Key */
  object_key: z.union([z.string(), z.null()]).optional(),
  /** Location Scope */
  location_scope: z.union([z.string(), z.null()]).optional(),
  /** Location Code */
  location_code: z.union([z.string(), z.null()]).optional(),
  /** Source */
  source: z.union([z.string(), z.null()]).optional(),
  /** Correlation Id */
  correlation_id: z.union([z.string(), z.null()]).optional(),
  /** Evidence */
  evidence: z.array(z.lazy(() => MaterialLocationEvidenceSchema)).optional(),
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
 * 只暴露低基数 identity、operation mode 和聚合 SLI，不暴露行级证据或 payload。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const NorthboundOperationHealthSchema = z.object({
  /** Provider Profile Identity */
  provider_profile_identity: z.string().min(1).max(240),
  /** Operation Identity */
  operation_identity: z.string().min(1).max(240),
  /** Mode */
  mode: z.enum(["QUERY", "EFFECT"]),
  /** Backlog Count */
  backlog_count: z.number().min(0),
  /** Active Lease Count */
  active_lease_count: z.number().min(0),
  /** Unknown Count */
  unknown_count: z.number().min(0),
  /** Oldest Queue Age Seconds */
  oldest_queue_age_seconds: z.number().min(0),
  /** Rate Limited Count */
  rate_limited_count: z.number().min(0),
  /** Lease Loss Count */
  lease_loss_count: z.number().min(0),
  /** Reconciliation Open Count */
  reconciliation_open_count: z.number().min(0),
})


/**
 * 租户作用域的北向运维快照。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const NorthboundOperationalSnapshotSchema = z.object({
  /** Schema Version */
  schema_version: z.literal("northbound-operational-snapshot.v1").optional().default("northbound-operational-snapshot.v1"),
  /** Catalog Version */
  catalog_version: z.literal("northbound-operation-slo.v1").optional().default("northbound-operation-slo.v1"),
  /** Generated At */
  generated_at: z.string().datetime(),
  /** Tenant Scope */
  tenant_scope: z.enum(["WORKLINE_OWNER", "PLATFORM"]),
  /** Tenant Id */
  tenant_id: z.union([z.number(), z.null()]),
  /** Workline Id */
  workline_id: z.union([z.number(), z.null()]),
  /** Operations */
  operations: z.array(z.lazy(() => NorthboundOperationHealthSchema)),
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
  /** To Code */
  to_code: z.string().min(1).max(120),
  /** Label */
  label: z.union([z.string().max(120), z.null()]).optional(),
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
  /** Label */
  label: z.string().min(1).max(120),
  /** Kind */
  kind: z.string().min(1).max(80),
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
 * WorkLine plane static scene view.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneSceneViewSchema = z.object({
  /** Schema Version */
  schema_version: z.literal("plane.scene.v1"),
  /** Workline Code */
  workline_code: z.string().min(1).max(80),
  /** Nodes */
  nodes: z.array(z.lazy(() => PlaneNodeSchema)),
  /** Edges */
  edges: z.array(z.lazy(() => PlaneEdgeSchema)),
})


/**
 * WorkLine plane dynamic snapshot.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const PlaneSnapshotSchema = z.object({
  /** Schema Version */
  schema_version: z.literal("plane.snapshot.v1"),
  /** Workline Code */
  workline_code: z.string().min(1).max(80),
  /** Scene Schema Version */
  scene_schema_version: z.literal("plane.scene.v1"),
  /** Objects */
  objects: z.array(z.lazy(() => PlaneObjectSnapshotSchema)),
  /** Extremes */
  extremes: z.array(z.lazy(() => PlaneExtremeStateSchema)),
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
  /** Workline Session Id */
  workline_session_id: z.union([z.number(), z.null()]).optional(),
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


export const RackFaceSchema = z.enum(["A", "B"])


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
  /** Workline Session Id */
  workline_session_id: z.union([z.number(), z.null()]).optional(),
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
  /** Request Id */
  request_id: z.string().min(1).max(100),
  /** Reason */
  reason: z.string().min(1).max(500),
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
 * 人工 EFFECT 对账决议请求。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const ResolveEffectReconciliationRequestSchema = z.object({
  /** Request Id */
  request_id: z.union([z.string().min(1).max(100), z.null()]).optional(),
  /** Resolution */
  resolution: z.union([z.string().regex(new RegExp("^(COMPLETED|REJECTED)$")), z.null()]).optional(),
  /** E03/E07 同步义务 typed 对账裁决 */
  obligation_resolution: z.union([z.lazy(() => WmsSyncObligationResolutionSchema), z.null()]).optional(),
  /** Operator Note */
  operator_note: z.string().min(1).max(1000),
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
  /** Workline Session Id */
  workline_session_id: z.union([z.number(), z.null()]).optional(),
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


/**
 * Active object 关联 RuntimeHold 展示字段。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const RuntimeHoldViewSchema = z.object({
  /** Reason Code */
  reason_code: z.union([z.string(), z.null()]).optional(),
  /** Freeze Scope */
  freeze_scope: z.union([z.string(), z.null()]).optional(),
  /** Allowed Next Effect Scope */
  allowed_next_effect_scope: z.union([z.string(), z.null()]).optional(),
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


export const TransportEvidenceResponseSchema = z.object({
  /** Operation */
  operation: z.string(),
  /** Operation Id */
  operation_id: z.string(),
  /** Outcome Revision */
  outcome_revision: z.union([z.number(), z.null()]),
  /** Status */
  status: z.enum(["PENDING", "APPLIED", "CONFLICT"]),
  /** Conflict Code */
  conflict_code: z.union([z.string(), z.null()]),
  /** Received At */
  received_at: z.string(),
  /** Processed At */
  processed_at: z.union([z.string(), z.null()]),
})


export const TransportTaskResponseSchema = z.object({
  /** Transport Task Id */
  transport_task_id: z.string(),
  /** Client Request Id */
  client_request_id: z.string(),
  /** Submit Operation Id */
  submit_operation_id: z.string(),
  /** Kind */
  kind: z.enum(["RACK_MOVE", "RACK_ROTATE", "BIN_MOVE", "BIN_EXCHANGE"]),
  /** Status */
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "SUCCEEDED", "FAILED", "RECONCILING"]),
  /** Reason Code */
  reason_code: z.union([z.string(), z.null()]),
  /** Created At */
  created_at: z.string(),
  /** Updated At */
  updated_at: z.string(),
  latest_evidence: z.union([z.lazy(() => TransportEvidenceResponseSchema), z.null()]),
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
 * 明确满足单项 E03/E07 同步义务的已关闭对账裁决。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WmsSyncObligationResolutionSchema = z.object({
  /** Resolved Operation Identity */
  resolved_operation_identity: z.enum(["wms.inventory.confirm_inbound@v1", "wms.fulfillment.notify_pkg_binding@v1"]),
  /** Resolved Fact Version */
  resolved_fact_version: z.string().min(1).max(120),
  /** Resolution */
  resolution: z.literal("OBLIGATION_SATISFIED"),
  /** Source Event Id */
  source_event_id: z.string().min(1).max(240),
  /** Evidence Reference */
  evidence_reference: z.string().min(1).max(500),
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
 * 作业线创建 Schema。
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
 * 作业线响应 Schema。
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
 * Stable machine-readable START rejection.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineStartErrorResponseSchema = z.object({
  /** Reason */
  reason: z.enum(["WORKLINE_NOT_FOUND", "INVALID_STATE", "CONFIGURATION_INVALID", "IDEMPOTENCY_CONFLICT", "SERVICE_UNAVAILABLE"]),
})


/**
 * Stable identity for one WorkLine START attempt.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineStartRequestSchema = z.object({
  /** Request Id */
  request_id: z.string().min(1).max(100),
})


/**
 * Frozen Epoch identity and the current WorkLine projection.
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorkLineStartResponseSchema = z.object({
  /** Line Run Epoch Id */
  line_run_epoch_id: z.number(),
  /** Epoch Code */
  epoch_code: z.string(),
  /** Workline Id */
  workline_id: z.number(),
  /** Plugin Key */
  plugin_key: z.string(),
  /** Plugin Version */
  plugin_version: z.string(),
  /** Flow Mode */
  flow_mode: z.string(),
  /** Epoch Status */
  epoch_status: z.enum(["ACTIVE", "CLOSED"]),
  /** Epoch Started At */
  epoch_started_at: z.string().datetime(),
  /** Epoch Closed At */
  epoch_closed_at: z.union([z.string().datetime(), z.null()]),
  /** Current Workline Runtime Status */
  current_workline_runtime_status: z.union([z.string(), z.null()]),
  /** Created */
  created: z.boolean(),
})


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
 * 作业线更新 Schema。
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


/**
 * WorklineActiveObjects 冲突展示状态。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorklineActiveObjectConflictStateSchema = z.enum(["OK", "TRANSIENT", "RECONCILING"])


/**
 * 单个 active object 只读视图。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorklineActiveObjectViewSchema = z.object({
  /** Object Type */
  object_type: z.string(),
  /** Object Key */
  object_key: z.string(),
  conflict_state: z.lazy(() => WorklineActiveObjectConflictStateSchema),
  /** Primary Source */
  primary_source: z.union([z.string(), z.null()]).optional(),
  /** All Sources */
  all_sources: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
  /** Operator Hint */
  operator_hint: z.union([z.string(), z.null()]).optional(),
  location_summary: z.union([z.lazy(() => MaterialLocationResultSchema), z.null()]).optional(),
  runtime_hold: z.union([z.lazy(() => RuntimeHoldViewSchema), z.null()]).optional(),
  /** Evidence Refs */
  evidence_refs: z.preprocess((val) => {
        // 如果输入是字符串（换行符分隔），转换为数组
        if (typeof val === 'string') {
          return val.split('\n').map(s => s.trim()).filter(s => s)
        }
        return val
      }, z.array(z.string())).optional(),
})


/**
 * WorkLine active objects 聚合响应。
 *
 * 从后端 OpenAPI 自动生成，请勿手动编辑
 * 如需添加自定义验证，请在扩展文件中修改
 */
export const WorklineActiveObjectsResponseSchema = z.object({
  /** Workline Id */
  workline_id: z.number(),
  /** Objects */
  objects: z.array(z.lazy(() => WorklineActiveObjectViewSchema)).optional(),
  /** Truncated */
  truncated: z.boolean().optional().default(false),
  /** Total Count */
  total_count: z.number().optional().default(0),
})


export const _BinExchangeDataSchema = z.object({
  /** Exchange Pairs */
  exchange_pairs: z.array(z.lazy(() => _BinExchangePairSchema)),
})


export const _BinExchangeDebugTaskSchema = z.object({
  /** Client Request Id */
  client_request_id: z.string().min(36).max(36).regex(new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")),
  /** Station Id */
  station_id: z.union([z.string().min(1).max(100).regex(new RegExp(".*\\S.*")), z.null()]).optional(),
  /** Kind */
  kind: z.literal("BIN_EXCHANGE"),
  data: z.lazy(() => _BinExchangeDataSchema),
})


export const _BinExchangePairSchema = z.object({
  /** Left Bin Id */
  left_bin_id: z.string().min(1).max(100).regex(new RegExp(".*\\S.*")),
  left_location: z.lazy(() => _RackBinSlotSchema),
  /** Right Bin Id */
  right_bin_id: z.string().min(1).max(100).regex(new RegExp(".*\\S.*")),
  right_location: z.lazy(() => _RackBinSlotSchema),
})


export const _BinMoveDataSchema = z.object({
  /** Moves */
  moves: z.array(z.lazy(() => _BinMoveMemberSchema)),
})


export const _BinMoveDebugTaskSchema = z.object({
  /** Client Request Id */
  client_request_id: z.string().min(36).max(36).regex(new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")),
  /** Station Id */
  station_id: z.union([z.string().min(1).max(100).regex(new RegExp(".*\\S.*")), z.null()]).optional(),
  /** Kind */
  kind: z.literal("BIN_MOVE"),
  data: z.lazy(() => _BinMoveDataSchema),
})


export const _BinMoveMemberSchema = z.object({
  /** Bin Id */
  bin_id: z.string().min(1).max(100).regex(new RegExp(".*\\S.*")),
  source: z.lazy(() => _BinPositionSchema),
  target: z.lazy(() => _BinPositionSchema),
})


export const _BinPositionSchema = z.union([z.lazy(() => _RackBinSlotSchema), z.lazy(() => _HandoffPositionSchema)])


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
  /** Rack Id */
  rack_id: z.string().min(1).max(100).regex(new RegExp(".*\\S.*")),
  rack_face: z.lazy(() => RackFaceSchema),
  /** Slot Id */
  slot_id: z.string().min(1).max(100).regex(new RegExp(".*\\S.*")),
})


export const _RackMoveDataSchema = z.object({
  /** Rack Id */
  rack_id: z.string().min(1).max(100).regex(new RegExp(".*\\S.*")),
  source: z.lazy(() => _RackPositionSchema),
  target: z.lazy(() => _RackPositionSchema),
  target_face: z.lazy(() => RackFaceSchema),
})


export const _RackMoveDebugTaskSchema = z.object({
  /** Client Request Id */
  client_request_id: z.string().min(36).max(36).regex(new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")),
  /** Station Id */
  station_id: z.union([z.string().min(1).max(100).regex(new RegExp(".*\\S.*")), z.null()]).optional(),
  /** Kind */
  kind: z.literal("RACK_MOVE"),
  data: z.lazy(() => _RackMoveDataSchema),
})


export const _RackPositionSchema = z.object({
  /** Kind */
  kind: z.literal("RACK_POSITION"),
  /** Location Code */
  location_code: z.string().min(1).max(100).regex(new RegExp(".*\\S.*")),
})


export const _RackRotateDataSchema = z.object({
  /** Rack Id */
  rack_id: z.string().min(1).max(100).regex(new RegExp(".*\\S.*")),
  position: z.lazy(() => _RackPositionSchema),
  target_face: z.lazy(() => RackFaceSchema),
})


export const _RackRotateDebugTaskSchema = z.object({
  /** Client Request Id */
  client_request_id: z.string().min(36).max(36).regex(new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")),
  /** Station Id */
  station_id: z.union([z.string().min(1).max(100).regex(new RegExp(".*\\S.*")), z.null()]).optional(),
  /** Kind */
  kind: z.literal("RACK_ROTATE"),
  data: z.lazy(() => _RackRotateDataSchema),
})
