/**
 * 自动生成的 OpenAPI schema 字段元数据: ResourceStateEventResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ResourceStateEventResponseMetadata = {
  "title": "ResourceStateEventResponse",
  "description": "资源事实响应 Schema。",
  "required": [
    "event_code",
    "event_type",
    "resource_type",
    "resource_code",
    "source_system",
    "source_event_id",
    "occurred_at",
    "received_at",
    "id"
  ],
  "fields": {
    "event_code": {
      "title": "Event Code",
      "description": "资源事件唯一编码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 160
    },
    "idempotency_key": {
      "title": "Idempotency Key",
      "description": "资源事实幂等键",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 240
    },
    "event_type": {
      "description": "资源事件类型",
      "required": true,
      "nullable": false,
      "enum": [
        "RACK_ARRIVED",
        "RACK_DEPARTED",
        "BIN_ARRIVED",
        "BIN_DEPARTED",
        "BIN_MOUNTED",
        "BIN_UNMOUNTED",
        "MATERIAL_MOUNTED",
        "MATERIAL_UNMOUNTED",
        "EXCHANGE_STATUS_UPDATED",
        "RESOURCE_RECONCILED"
      ],
      "ref": "ResourceStateEventType"
    },
    "resource_type": {
      "description": "资源类型",
      "required": true,
      "nullable": false,
      "enum": [
        "RACK",
        "BIN",
        "MATERIAL"
      ],
      "ref": "ResourceType"
    },
    "resource_code": {
      "title": "Resource Code",
      "description": "资源编码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
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
    "session_id": {
      "title": "Session Id",
      "description": "WorkLine Session",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 100
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
    "payload_json": {
      "title": "Payload Json",
      "description": "事件事实",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "occurred_at": {
      "title": "Occurred At",
      "description": "事实发生时间",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "received_at": {
      "title": "Received At",
      "description": "WES 接收时间",
      "type": "string",
      "format": "date-time",
      "required": true,
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
