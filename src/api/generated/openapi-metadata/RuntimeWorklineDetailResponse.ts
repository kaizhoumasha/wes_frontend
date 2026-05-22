/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeWorklineDetailResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeWorklineDetailResponseMetadata = {
  "title": "RuntimeWorklineDetailResponse",
  "required": [
    "summary"
  ],
  "fields": {
    "summary": {
      "required": true,
      "nullable": false,
      "ref": "RuntimeWorklineSummary"
    },
    "devices": {
      "title": "Devices",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RuntimeWorklineDeviceItem"
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
    },
    "recent_failed_traces": {
      "title": "Recent Failed Traces",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RuntimeTraceListItem"
      }
    },
    "recent_completed_traces": {
      "title": "Recent Completed Traces",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RuntimeTraceListItem"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
