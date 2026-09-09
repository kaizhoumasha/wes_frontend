/**
 * 自动生成的 OpenAPI schema 字段元数据: ConfirmPhaseRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ConfirmPhaseRequestMetadata = {
  "title": "ConfirmPhaseRequest",
  "required": [
    "expected_version",
    "note"
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
    "note": {
      "title": "Note",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 500
    }
  }
} satisfies OpenApiSchemaMetadata
