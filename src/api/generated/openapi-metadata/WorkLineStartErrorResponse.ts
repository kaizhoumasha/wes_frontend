/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLineStartErrorResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLineStartErrorResponseMetadata = {
  "title": "WorkLineStartErrorResponse",
  "description": "Stable machine-readable START rejection.",
  "required": [
    "reason"
  ],
  "fields": {
    "reason": {
      "title": "Reason",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "WORKLINE_NOT_FOUND",
        "INVALID_STATE",
        "CONFIGURATION_INVALID",
        "IDEMPOTENCY_CONFLICT",
        "SERVICE_UNAVAILABLE"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
