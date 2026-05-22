/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeDeviceDetailResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeDeviceDetailResponseMetadata = {
  "title": "RuntimeDeviceDetailResponse",
  "required": [
    "summary"
  ],
  "fields": {
    "summary": {
      "required": true,
      "nullable": false,
      "ref": "RuntimeDeviceSummary"
    },
    "recent_commands": {
      "title": "Recent Commands",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "TraceCommandItem"
      }
    },
    "recent_callbacks": {
      "title": "Recent Callbacks",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "TraceCallbackLogItem"
      }
    },
    "active_sessions": {
      "title": "Active Sessions",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RuntimeTraceListItem"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
