/**
 * 自动生成的 OpenAPI schema 字段元数据: BinMaterialMountResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const BinMaterialMountResponseMetadata = {
  "title": "BinMaterialMountResponse",
  "description": "物料料箱格位投影响应 Schema。",
  "required": [
    "bin_code",
    "bin_cell_index",
    "material_identity_key",
    "source_system",
    "source_event_id",
    "started_at",
    "id"
  ],
  "fields": {
    "bin_cell_occupancy_id": {
      "title": "Bin Cell Occupancy Id",
      "description": "关联料箱格位聚合占用 ID",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "cell_stack_position": {
      "title": "Cell Stack Position",
      "description": "同一料格内入格顺序，1 为最早入格",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 1,
      "minimum": 1
    },
    "bin_code": {
      "title": "Bin Code",
      "description": "料箱编码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 80
    },
    "bin_cell_code": {
      "title": "Bin Cell Code",
      "description": "料箱内部格位编码",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 80
    },
    "bin_cell_index": {
      "title": "Bin Cell Index",
      "description": "料箱内部格位序号",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 20
    },
    "material_identity_key": {
      "title": "Material Identity Key",
      "description": "事件证据快照；料盘属性主源以 material_units 为准",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 300
    },
    "pkg_code": {
      "title": "Pkg Code",
      "description": "PKG 展示字段",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 200
    },
    "material_code": {
      "title": "Material Code",
      "description": "事件证据快照；料盘属性主源以 material_units 为准",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 120
    },
    "lot_code": {
      "title": "Lot Code",
      "description": "事件证据快照；料盘属性主源以 material_units 为准",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 120
    },
    "date_code": {
      "title": "Date Code",
      "description": "事件证据快照；料盘属性主源以 material_units 为准",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 80
    },
    "qty_snapshot": {
      "title": "Qty Snapshot",
      "description": "当时执行过程看到的数量",
      "type": "number",
      "required": false,
      "nullable": true,
      "minimum": 0
    },
    "reel_diameter": {
      "title": "Reel Diameter",
      "description": "料盘直径",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 80
    },
    "reel_thickness": {
      "title": "Reel Thickness",
      "description": "料盘厚度",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 80
    },
    "wms_inventory_id": {
      "title": "Wms Inventory Id",
      "description": "WMS 库存记录引用",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 120
    },
    "wms_inventory_version": {
      "title": "Wms Inventory Version",
      "description": "WMS 库存或分拆版本引用",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 120
    },
    "writeback_evidence_id": {
      "title": "Writeback Evidence Id",
      "description": "关联 WMS 回写证据",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "mount_status": {
      "description": "物料占用状态",
      "required": false,
      "nullable": false,
      "default": "UNKNOWN",
      "enum": [
        "OCCUPIED",
        "REMOVED",
        "LOCKED",
        "UNKNOWN"
      ],
      "ref": "BinMaterialMountStatus"
    },
    "source_system": {
      "description": "来源系统",
      "required": true,
      "nullable": false,
      "enum": [
        "WMS",
        "RCS",
        "ECS",
        "WES_RUNTIME",
        "MANUAL_IMPORT",
        "MANUAL"
      ],
      "ref": "ResourceSourceSystem"
    },
    "source_event_id": {
      "title": "Source Event Id",
      "description": "来源事件 ID",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 200
    },
    "source_version": {
      "title": "Source Version",
      "description": "来源版本",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 100
    },
    "trace_id": {
      "title": "Trace Id",
      "description": "WorkLine trace",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 100
    },
    "workline_session_id": {
      "title": "Workline Session Id",
      "description": "关联 workline_sessions.id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "started_at": {
      "title": "Started At",
      "description": "占用确认时间",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "ended_at": {
      "title": "Ended At",
      "description": "离开料箱格位时间",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
