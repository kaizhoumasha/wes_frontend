/**
 * 自动生成的 OpenAPI schema 字段元数据: TransportEvidenceResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TransportEvidenceResponseMetadata = {
  "title": "TransportEvidenceResponse",
  "required": [
    "operation",
    "operation_id",
    "outcome_revision",
    "status",
    "conflict_code",
    "received_at",
    "processed_at"
  ],
  "additionalProperties": false,
  "fields": {
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
    "outcome_revision": {
      "title": "Outcome Revision",
      "type": "integer",
      "required": true,
      "nullable": true
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "PENDING",
        "APPLIED",
        "CONFLICT"
      ]
    },
    "conflict_code": {
      "title": "Conflict Code",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "received_at": {
      "title": "Received At",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "processed_at": {
      "title": "Processed At",
      "type": "string",
      "required": true,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
