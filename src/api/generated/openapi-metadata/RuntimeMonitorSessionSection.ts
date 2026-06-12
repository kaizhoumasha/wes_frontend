/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeMonitorSessionSection
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeMonitorSessionSectionMetadata = {
  "title": "RuntimeMonitorSessionSection",
  "required": [],
  "fields": {
    "items": {
      "title": "Items",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RuntimeMonitorSessionItem"
      }
    },
    "total_count": {
      "title": "Total Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "truncated": {
      "title": "Truncated",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    }
  }
} satisfies OpenApiSchemaMetadata
