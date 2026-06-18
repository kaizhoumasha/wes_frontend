/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeTraceListResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeTraceListResponseMetadata = {
  "title": "RuntimeTraceListResponse",
  "description": "Trace 列表响应。",
  "required": [
    "total",
    "items"
  ],
  "fields": {
    "total": {
      "title": "Total",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "items": {
      "title": "Items",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "RuntimeTraceListItem"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
