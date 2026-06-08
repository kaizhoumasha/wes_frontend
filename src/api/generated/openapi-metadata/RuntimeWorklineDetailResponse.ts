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
    "workline_readiness": {
      "required": false,
      "nullable": false,
      "default": "UNKNOWN",
      "enum": [
        "READY",
        "NOT_READY",
        "UNKNOWN"
      ],
      "ref": "RuntimeWorklineReadiness"
    },
    "station_lease": {
      "required": false,
      "nullable": false,
      "default": "UNKNOWN",
      "enum": [
        "IDLE",
        "ACTIVE_RACK_BOUND",
        "ACTIVE_DISPATCH_LEASE",
        "ACTIVE_SESSION_BOUND",
        "UNKNOWN"
      ],
      "ref": "RuntimeStationLease"
    },
    "single_layer_rack_snapshot": {
      "required": false,
      "nullable": false,
      "default": "UNKNOWN",
      "enum": [
        "ACTIVE",
        "MISSING",
        "INVALID",
        "NON_SINGLE_LAYER_EVIDENCE",
        "UNKNOWN"
      ],
      "ref": "RuntimeSingleLayerRackSnapshot"
    },
    "rack_operation_wait": {
      "required": false,
      "nullable": false,
      "default": "NONE",
      "enum": [
        "WAITING_WMS",
        "WMS_CALLBACK_RECEIVED",
        "TIMEOUT",
        "FAILED",
        "NONE",
        "UNKNOWN"
      ],
      "ref": "RuntimeRackOperationWait"
    },
    "resource_evidence_kind": {
      "required": false,
      "nullable": false,
      "default": "UNKNOWN",
      "enum": [
        "WES_ACTIVE_SNAPSHOT",
        "WMS_CALLBACK_EVIDENCE",
        "TRACE_RESOURCE_EVIDENCE",
        "GENERIC_EVIDENCE",
        "UNKNOWN"
      ],
      "ref": "RuntimeResourceEvidenceKind"
    },
    "resource_evidence_items": {
      "title": "Resource Evidence Items",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RuntimeResourceEvidenceItem"
      }
    },
    "resource_evidence_total_count": {
      "title": "Resource Evidence Total Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "resource_evidence_truncated": {
      "title": "Resource Evidence Truncated",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
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
