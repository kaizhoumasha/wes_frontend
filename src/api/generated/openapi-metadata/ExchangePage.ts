/**
 * 自动生成的 OpenAPI schema 字段元数据: ExchangePage
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ExchangePageMetadata = {
  "title": "ExchangePage",
  "required": [
    "items",
    "next_cursor",
    "scan_incomplete",
    "retention_hours"
  ],
  "fields": {
    "items": {
      "title": "Items",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "ExchangeSummary"
      }
    },
    "next_cursor": {
      "title": "Next Cursor",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "retention_hours": {
      "title": "Retention Hours",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "scan_incomplete": {
      "title": "Scan Incomplete",
      "type": "boolean",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
