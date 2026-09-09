/**
 * 自动生成的 OpenAPI schema 字段元数据: PrepareTaskRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PrepareTaskRequestMetadata = {
  "title": "PrepareTaskRequest",
  "required": [
    "expected_version",
    "client_request_id",
    "workline_code"
  ],
  "additionalProperties": false,
  "fields": {
    "client_request_id": {
      "title": "Client Request Id",
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
    "workline_code": {
      "title": "Workline Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 50
    }
  }
} satisfies OpenApiSchemaMetadata
