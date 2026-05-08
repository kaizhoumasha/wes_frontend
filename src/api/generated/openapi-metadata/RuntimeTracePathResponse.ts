/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeTracePathResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeTracePathResponseMetadata = {
  "title": "RuntimeTracePathResponse",
  "required": [],
  "fields": {
    "workline_id": {
      "title": "Workline Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "session_id": {
      "title": "Session Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "trace_id": {
      "title": "Trace Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "devices": {
      "title": "Devices",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RuntimeTraceDevicePathNode"
      }
    },
    "timeline_groups": {
      "title": "Timeline Groups",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RuntimeTraceTimelineGroup"
      }
    },
    "current_blocking_device_id": {
      "title": "Current Blocking Device Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "blocking_reason": {
      "required": false,
      "nullable": true,
      "ref": "RuntimeBlockingReason"
    },
    "evidence": {
      "required": false,
      "nullable": true,
      "ref": "TraceDetailResponse"
    }
  }
} satisfies OpenApiSchemaMetadata
