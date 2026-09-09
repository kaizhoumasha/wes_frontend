/**
 * 自动生成的 OpenAPI schema 字段元数据: BindCompletionRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const BindCompletionRequestMetadata = {
  "title": "BindCompletionRequest",
  "required": [
    "expected_version",
    "operation_id"
  ],
  "additionalProperties": false,
  "fields": {
    "expected_version": {
      "title": "Expected Version",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "operation_id": {
      "title": "Operation Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    }
  }
} satisfies OpenApiSchemaMetadata
