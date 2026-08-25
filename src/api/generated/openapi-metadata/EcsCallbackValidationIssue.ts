/**
 * 自动生成的 OpenAPI schema 字段元数据: EcsCallbackValidationIssue
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const EcsCallbackValidationIssueMetadata = {
  "title": "EcsCallbackValidationIssue",
  "required": [
    "field",
    "code"
  ],
  "additionalProperties": false,
  "fields": {
    "code": {
      "title": "Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "expected": {
      "title": "Expected",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "field": {
      "title": "Field",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
