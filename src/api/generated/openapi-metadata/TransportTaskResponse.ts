/**
 * 自动生成的 OpenAPI schema 字段元数据: TransportTaskResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TransportTaskResponseMetadata = {
  "title": "TransportTaskResponse",
  "required": [
    "transport_task_id",
    "client_request_id",
    "submit_operation_id",
    "kind",
    "status",
    "reason_code",
    "created_at",
    "updated_at",
    "latest_evidence",
    "send_started_at",
    "next_submit_at",
    "result_deadline_at",
    "submit_attempt_count",
    "outcome_version",
    "published_outcome_version",
    "pending_evidence_count",
    "request",
    "result"
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
    "next_submit_at": {
      "title": "Next Submit At",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "outcome_version": {
      "title": "Outcome Version",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "pending_evidence_count": {
      "title": "Pending Evidence Count",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "published_outcome_version": {
      "title": "Published Outcome Version",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "reason_code": {
      "title": "Reason Code",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "request": {
      "title": "Request",
      "type": "object",
      "required": true,
      "nullable": false
    },
    "result": {
      "required": true,
      "nullable": true,
      "ref": "TransportResultResponse"
    },
    "result_deadline_at": {
      "title": "Result Deadline At",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "send_started_at": {
      "title": "Send Started At",
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
    "submit_attempt_count": {
      "title": "Submit Attempt Count",
      "type": "integer",
      "required": true,
      "nullable": false
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
