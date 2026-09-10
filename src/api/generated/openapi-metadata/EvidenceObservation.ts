/**
 * 自动生成的 OpenAPI schema 字段元数据: EvidenceObservation
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const EvidenceObservationMetadata = {
  "title": "EvidenceObservation",
  "required": [
    "operation",
    "operation_id",
    "apply_status",
    "received_at",
    "processed_at",
    "published_at",
    "decision_attempt_count",
    "decision_next_attempt_at"
  ],
  "fields": {
    "apply_status": {
      "required": true,
      "nullable": false,
      "enum": [
        "PENDING",
        "APPLIED",
        "IGNORED",
        "RECONCILING"
      ],
      "ref": "InboundEvidenceApplyStatus"
    },
    "decision_attempt_count": {
      "title": "Decision Attempt Count",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "decision_next_attempt_at": {
      "title": "Decision Next Attempt At",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "operation": {
      "title": "Operation",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "operation_id": {
      "title": "Operation Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "processed_at": {
      "title": "Processed At",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "published_at": {
      "title": "Published At",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "received_at": {
      "title": "Received At",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
