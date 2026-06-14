/**
 * 自动生成的 OpenAPI schema 字段元数据: SortItem
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const SortItemMetadata = {
  "title": "SortItem",
  "description": "批量排序项",
  "required": [
    "id"
  ],
  "fields": {
    "id": {
      "title": "Id",
      "description": "节点ID",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "parent_id": {
      "title": "Parent Id",
      "description": "父节点ID",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "sort_order": {
      "title": "Sort Order",
      "description": "排序值",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    }
  }
} satisfies OpenApiSchemaMetadata
