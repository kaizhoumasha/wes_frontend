/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLineStartRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLineStartRequestMetadata = {
  "title": "WorkLineStartRequest",
  "description": "Stable identity for one WorkLine START attempt.",
  "required": [
    "request_id"
  ],
  "additionalProperties": false,
  "fields": {
    "request_id": {
      "title": "Request Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    }
  }
} satisfies OpenApiSchemaMetadata
