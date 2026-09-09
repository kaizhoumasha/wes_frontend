/**
 * 自动生成的 OpenAPI schema 字段元数据: ManualBinReconciling
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ManualBinReconcilingMetadata = {
  "title": "ManualBinReconciling",
  "required": [
    "completion_operation_id",
    "task_id",
    "bin_code",
    "apply_revision",
    "apply_result",
    "reason_code",
    "occurred_at"
  ],
  "additionalProperties": false,
  "fields": {
    "apply_result": {
      "description": "discriminator enum property added by openapi-typescript",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
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
    "bin_code": {
      "title": "Bin Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "completion_operation_id": {
      "title": "Completion Operation Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "occurred_at": {
      "title": "Occurred At",
      "type": "integer",
      "required": true,
      "nullable": false,
      "maximum": 9223372036854776000
    },
    "reason_code": {
      "title": "Reason Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "RESULT_CONFLICT",
        "FIRST_COMPLETION_OUT_OF_WINDOW",
        "POINT2_BINDING_MISMATCH",
        "WORKLINE_NOT_ACTIVE",
        "COMPLETED_AT_INVALID",
        "DEVICE_COMMAND_IDENTITY_CONFLICT"
      ]
    },
    "task_id": {
      "title": "Task Id",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
