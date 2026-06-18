/**
 * 自动生成的 OpenAPI schema 字段元数据: RackBinMountResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RackBinMountResponseMetadata = {
  "title": "RackBinMountResponse",
  "description": "料箱挂载投影响应 Schema。",
  "required": [
    "rack_code",
    "rack_slot_code",
    "bin_code",
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
    "rack_slot_code": {
      "title": "Rack Slot Code",
      "description": "货架槽位编码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 50
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
    "mount_status": {
      "description": "料箱挂载状态",
      "required": false,
      "nullable": false,
      "default": "UNKNOWN",
      "enum": [
        "MOUNTED",
        "UNMOUNTED",
        "EXCHANGING",
        "UNKNOWN"
      ],
      "ref": "RackBinMountStatus"
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
    "started_at": {
      "title": "Started At",
      "description": "挂载确认时间",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "ended_at": {
      "title": "Ended At",
      "description": "解除挂载时间",
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
