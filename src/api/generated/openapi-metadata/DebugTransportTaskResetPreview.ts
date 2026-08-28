/**
 * 自动生成的 OpenAPI schema 字段元数据: DebugTransportTaskResetPreview
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DebugTransportTaskResetPreviewMetadata = {
  "title": "DebugTransportTaskResetPreview",
  "required": [
    "transport_task_id",
    "status",
    "eligible",
    "blockers",
    "evidence_count",
    "outcome_version",
    "member_count",
    "binding_count",
    "active_binding_count"
  ],
  "additionalProperties": false,
  "fields": {
    "active_binding_count": {
      "title": "Active Binding Count",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "binding_count": {
      "title": "Binding Count",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "blockers": {
      "title": "Blockers",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "type": "string",
        "enum": [
          "STATUS_NOT_RECONCILING",
          "TRANSPORT_EVIDENCE_EXISTS",
          "TRANSPORT_OUTCOME_EXISTS"
        ]
      }
    },
    "eligible": {
      "title": "Eligible",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "evidence_count": {
      "title": "Evidence Count",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "member_count": {
      "title": "Member Count",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "outcome_version": {
      "title": "Outcome Version",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "PENDING",
        "ACCEPTED",
        "REJECTED",
        "SUCCEEDED",
        "FAILED",
        "RECONCILING"
      ]
    },
    "transport_task_id": {
      "title": "Transport Task Id",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
