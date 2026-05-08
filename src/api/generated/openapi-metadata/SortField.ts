/**
 * 自动生成的 OpenAPI schema 字段元数据: SortField
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const SortFieldMetadata = {
  "title": "SortField",
  "description": "排序字段",
  "required": [
    "field"
  ],
  "fields": {
    "field": {
      "title": "Field",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "order": {
      "title": "Order",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "desc",
      "enum": [
        "asc",
        "desc"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
