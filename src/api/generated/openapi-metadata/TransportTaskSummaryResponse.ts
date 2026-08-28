/**
 * 自动生成的 OpenAPI schema 字段元数据: TransportTaskSummaryResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TransportTaskSummaryResponseMetadata = {
  "title": "TransportTaskSummaryResponse",
  "required": [
    "transport_task_id",
    "client_request_id",
    "submit_operation_id",
    "kind",
    "status",
    "reason_code",
    "created_at",
    "updated_at",
    "latest_evidence"
  ],
  "additionalProperties": false,
  "fields": {
    "client_request_id": {
      "title": "Client Request Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "created_at": {
      "title": "Created At",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "kind": {
      "title": "Kind",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "RACK_MOVE",
        "RACK_ROTATE",
        "BIN_MOVE",
        "BIN_EXCHANGE"
      ]
    },
    "latest_evidence": {
      "required": true,
      "nullable": true,
      "ref": "TransportEvidenceResponse"
    },
    "reason_code": {
      "title": "Reason Code",
      "type": "string",
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
        "ACCEPTED",
        "REJECTED",
        "SUCCEEDED",
        "FAILED",
        "RECONCILING"
      ]
    },
    "submit_operation_id": {
      "title": "Submit Operation Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "transport_task_id": {
      "title": "Transport Task Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "updated_at": {
      "title": "Updated At",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
