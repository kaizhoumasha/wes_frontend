/**
 * 自动生成的 OpenAPI schema 字段元数据: TransportTaskPageResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TransportTaskPageResponseMetadata = {
  "title": "TransportTaskPageResponse",
  "required": [
    "items",
    "next_cursor"
  ],
  "additionalProperties": false,
  "fields": {
    "items": {
      "title": "Items",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "TransportTaskSummaryResponse"
      }
    },
    "next_cursor": {
      "title": "Next Cursor",
      "type": "string",
      "required": true,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
