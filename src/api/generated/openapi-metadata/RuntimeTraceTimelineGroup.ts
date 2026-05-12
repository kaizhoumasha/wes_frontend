/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeTraceTimelineGroup
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeTraceTimelineGroupMetadata = {
  "title": "RuntimeTraceTimelineGroup",
  "required": [
    "group_key",
    "group_type",
    "display_name"
  ],
  "fields": {
    "group_key": {
      "title": "Group Key",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "group_type": {
      "title": "Group Type",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "display_name": {
      "title": "Display Name",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "device_id": {
      "title": "Device Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "device_code": {
      "title": "Device Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "is_current": {
      "title": "Is Current",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "is_blocked": {
      "title": "Is Blocked",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "events": {
      "title": "Events",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "TraceTimelineItem"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
