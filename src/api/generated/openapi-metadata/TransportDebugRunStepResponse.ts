/**
 * 自动生成的 OpenAPI schema 字段元数据: TransportDebugRunStepResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TransportDebugRunStepResponseMetadata = {
  "title": "TransportDebugRunStepResponse",
  "required": [
    "ordinal",
    "group_index",
    "phase",
    "status",
    "client_request_id",
    "transport_task_id",
    "evidence_high_watermark",
    "evidence_not_before_ms",
    "observed_bin_ids",
    "reason_code",
    "created_at",
    "updated_at"
  ],
  "additionalProperties": false,
  "fields": {
    "client_request_id": {
      "title": "Client Request Id",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "created_at": {
      "title": "Created At",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "evidence_high_watermark": {
      "title": "Evidence High Watermark",
      "type": "integer",
      "required": true,
      "nullable": true
    },
    "evidence_not_before_ms": {
      "title": "Evidence Not Before Ms",
      "type": "integer",
      "required": true,
      "nullable": true
    },
    "group_index": {
      "title": "Group Index",
      "type": "integer",
      "required": true,
      "nullable": true
    },
    "observed_bin_ids": {
      "title": "Observed Bin Ids",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "ordinal": {
      "title": "Ordinal",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "phase": {
      "required": true,
      "nullable": false,
      "enum": [
        "RACK_TO_STATION",
        "BINS_TO_INFEED",
        "WAIT_SCAN12",
        "BINS_TO_RACK",
        "ROTATE_TO_NEXT_FACE",
        "RACK_TO_STORAGE"
      ],
      "ref": "TransportDebugRunPhase"
    },
    "reason_code": {
      "title": "Reason Code",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "status": {
      "required": true,
      "nullable": false,
      "enum": [
        "PENDING",
        "WAITING",
        "SUCCEEDED",
        "FAILED",
        "NEEDS_ATTENTION"
      ],
      "ref": "TransportDebugRunStepStatus"
    },
    "transport_task_id": {
      "title": "Transport Task Id",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "updated_at": {
      "title": "Updated At",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
