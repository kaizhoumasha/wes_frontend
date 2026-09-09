/**
 * 自动生成的 OpenAPI schema 字段元数据: CompletionApplyReportRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const CompletionApplyReportRequestMetadata = {
  "title": "CompletionApplyReportRequest",
  "required": [
    "expected_version",
    "client_request_id",
    "completion_operation_id",
    "apply_revision",
    "apply_result",
    "occurred_at"
  ],
  "additionalProperties": false,
  "fields": {
    "apply_result": {
      "title": "Apply Result",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "APPLIED",
        "RECONCILING"
      ]
    },
    "apply_revision": {
      "title": "Apply Revision",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 1
    },
    "client_request_id": {
      "title": "Client Request Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    },
    "completion_operation_id": {
      "title": "Completion Operation Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    },
    "expected_version": {
      "title": "Expected Version",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "occurred_at": {
      "title": "Occurred At",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "reason_code": {
      "title": "Reason Code",
      "type": "string",
      "required": false,
      "nullable": true,
      "enum": [
        "RESULT_CONFLICT",
        "FIRST_COMPLETION_OUT_OF_WINDOW",
        "POINT2_BINDING_MISMATCH",
        "WORKLINE_NOT_ACTIVE",
        "COMPLETED_AT_INVALID",
        "DEVICE_COMMAND_IDENTITY_CONFLICT"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
