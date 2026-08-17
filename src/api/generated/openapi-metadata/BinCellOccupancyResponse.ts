/**
 * 自动生成的 OpenAPI schema 字段元数据: BinCellOccupancyResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const BinCellOccupancyResponseMetadata = {
  "title": "BinCellOccupancyResponse",
  "description": "料箱格位聚合占用响应 Schema。",
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
      "description": "格位聚合键；料盘属性权威以 material_units 为准",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 300
    },
    "material_code": {
      "title": "Material Code",
      "description": "格位聚合键引用；料盘属性权威以 material_units 为准",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 120
    },
    "lot_code": {
      "title": "Lot Code",
      "description": "格位聚合键快照；料盘属性权威以 material_units 为准",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 120
    },
    "date_code": {
      "title": "Date Code",
      "description": "格位聚合键快照；料盘属性权威以 material_units 为准",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 80
    },
    "reel_count": {
      "title": "Reel Count",
      "description": "当前格位内 active 料盘数量",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0,
      "minimum": 0
    },
    "used_depth_mm": {
      "title": "Used Depth Mm",
      "description": "当前格位已使用深度",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "0"
    },
    "capacity_depth_mm": {
      "title": "Capacity Depth Mm",
      "description": "当前格位可用总深度",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "remaining_depth_mm": {
      "title": "Remaining Depth Mm",
      "description": "当前格位剩余深度",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "occupancy_status": {
      "description": "格位聚合占用状态",
      "required": false,
      "nullable": false,
      "default": "UNKNOWN",
      "enum": [
        "OCCUPIED",
        "FULL",
        "REMOVED",
        "UNKNOWN"
      ],
      "ref": "BinCellOccupancyStatus"
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
      "description": "最近来源事件 ID",
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
      "description": "最近关联 workline_sessions.id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "started_at": {
      "title": "Started At",
      "description": "首次占用确认时间",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "ended_at": {
      "title": "Ended At",
      "description": "格位占用结束时间",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "metadata_json": {
      "title": "Metadata Json",
      "description": "扩展属性",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
