/**
 * 自动生成的 OpenAPI schema 字段元数据: RackPlacementResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RackPlacementResponseMetadata = {
  "title": "RackPlacementResponse",
  "description": "货架位置投影响应 Schema。",
  "required": [
    "rack_code",
    "source_system",
    "source_event_id",
    "started_at",
    "id"
  ],
  "fields": {
    "rack_code": {
      "title": "Rack Code",
      "description": "货架编码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 80
    },
    "rack_kind": {
      "description": "货架类型",
      "required": false,
      "nullable": true,
      "enum": [
        "SINGLE_LAYER",
        "FIVE_LAYER",
        "RETURN",
        "TRANSFER",
        "PRODUCTION"
      ],
      "ref": "RackKind"
    },
    "location_code": {
      "title": "Location Code",
      "description": "兼容地码或逻辑位置",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 80
    },
    "workline_id": {
      "title": "Workline Id",
      "description": "关联 WorkLine.id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "workline_code": {
      "title": "Workline Code",
      "description": "工作线编码",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 50
    },
    "position_code": {
      "title": "Position Code",
      "description": "工作线停靠位编码",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 80
    },
    "position_role": {
      "title": "Position Role",
      "description": "工作线停靠位角色",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 80
    },
    "logic_location_code": {
      "title": "Logic Location Code",
      "description": "WES 逻辑位置",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 120
    },
    "external_location_code": {
      "title": "External Location Code",
      "description": "外部地码证据",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 120
    },
    "placement_status": {
      "description": "位置投影状态",
      "required": false,
      "nullable": false,
      "default": "UNKNOWN",
      "enum": [
        "ARRIVED",
        "IN_TRANSIT",
        "DEPARTED",
        "UNKNOWN"
      ],
      "ref": "RackPlacementStatus"
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
    "source_task_id": {
      "title": "Source Task Id",
      "description": "WMS/RCS 搬运任务 ID",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 120
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
    "session_id": {
      "title": "Session Id",
      "description": "WorkLine Session",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 100
    },
    "started_at": {
      "title": "Started At",
      "description": "进入该关系的时间",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "ended_at": {
      "title": "Ended At",
      "description": "离开该关系的时间",
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
