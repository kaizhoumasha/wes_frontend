/**
 * 自动生成的 OpenAPI schema 字段元数据: BindTaskRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const BindTaskRequestMetadata = {
  "title": "BindTaskRequest",
  "required": [
    "expected_version",
    "task_id"
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
    "task_id": {
      "title": "Task Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    }
  }
} satisfies OpenApiSchemaMetadata
