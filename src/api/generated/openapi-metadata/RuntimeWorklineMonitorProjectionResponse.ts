/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeWorklineMonitorProjectionResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeWorklineMonitorProjectionResponseMetadata = {
  "title": "RuntimeWorklineMonitorProjectionResponse",
  "required": [
    "summary",
    "boundary",
    "active_sessions",
    "recent_failed_traces",
    "recent_completed_traces",
    "resource_evidence",
    "action_candidates",
    "generated_at"
  ],
  "fields": {
    "summary": {
      "required": true,
      "nullable": false,
      "ref": "RuntimeWorklineSummary"
    },
    "boundary": {
      "required": true,
      "nullable": false,
      "ref": "RuntimeWorklineBoundary"
    },
    "device_nodes": {
      "title": "Device Nodes",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RuntimeMonitorDeviceNode"
      }
    },
    "active_sessions": {
      "required": true,
      "nullable": false,
      "ref": "RuntimeMonitorSessionSection"
    },
    "recent_failed_traces": {
      "required": true,
      "nullable": false,
      "ref": "RuntimeMonitorTraceSection"
    },
    "recent_completed_traces": {
      "required": true,
      "nullable": false,
      "ref": "RuntimeMonitorTraceSection"
    },
    "resource_evidence": {
      "required": true,
      "nullable": false,
      "ref": "RuntimeMonitorEvidenceSection"
    },
    "action_candidates": {
      "required": true,
      "nullable": false,
      "ref": "RuntimeMonitorActionCandidates"
    },
    "generated_at": {
      "title": "Generated At",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
