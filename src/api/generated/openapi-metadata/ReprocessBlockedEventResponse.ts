/**
 * 自动生成的 OpenAPI schema 字段元数据: ReprocessBlockedEventResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ReprocessBlockedEventResponseMetadata = {
  "title": "ReprocessBlockedEventResponse",
  "required": [
    "source_event_id",
    "block_id",
    "apply_status"
  ],
  "additionalProperties": false,
  "fields": {
    "apply_status": {
      "title": "Apply Status",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "block_id": {
      "title": "Block Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "source_event_id": {
      "title": "Source Event Id",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
