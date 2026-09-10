/**
 * 自动生成的 OpenAPI schema 字段元数据: ConfirmationObservation
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ConfirmationObservationMetadata = {
  "title": "ConfirmationObservation",
  "required": [
    "operation",
    "operation_id",
    "status",
    "attempt_count",
    "retry_eligible",
    "next_attempt_at",
    "deadline_at",
    "last_dispatch_at",
    "response_evidence_id",
    "response_result",
    "updated_at"
  ],
  "fields": {
    "attempt_count": {
      "title": "Attempt Count",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "deadline_at": {
      "title": "Deadline At",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "last_dispatch_at": {
      "title": "Last Dispatch At",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "next_attempt_at": {
      "title": "Next Attempt At",
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
    "response_evidence_id": {
      "title": "Response Evidence Id",
      "type": "integer",
      "required": true,
      "nullable": true
    },
    "response_result": {
      "title": "Response Result",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "retry_eligible": {
      "title": "Retry Eligible",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "status": {
      "required": true,
      "nullable": false,
      "enum": [
        "PENDING",
        "DISPATCHING",
        "COMPLETED",
        "RECONCILING",
        "SUPERSEDED"
      ],
      "ref": "WmsConfirmationStatus"
    },
    "updated_at": {
      "title": "Updated At",
      "type": "string",
      "required": true,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
