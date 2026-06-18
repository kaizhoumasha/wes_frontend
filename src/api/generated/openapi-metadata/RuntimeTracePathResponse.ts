/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeTracePathResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeTracePathResponseMetadata = {
  "title": "RuntimeTracePathResponse",
  "required": [
    "diagnosis_verdict"
  ],
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
    "diagnosis_verdict": {
      "required": true,
      "nullable": false,
      "ref": "DiagnosisVerdictResponse"
    },
    "sessions": {
      "title": "Sessions",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "TraceSessionItem"
      }
    },
    "resource_view": {
      "required": false,
      "nullable": false,
      "ref": "RuntimeTraceResourceView"
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
    }
  }
} satisfies OpenApiSchemaMetadata
