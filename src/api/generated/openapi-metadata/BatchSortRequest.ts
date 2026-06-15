/**
 * 自动生成的 OpenAPI schema 字段元数据: BatchSortRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const BatchSortRequestMetadata = {
  "title": "BatchSortRequest",
  "description": "批量排序请求",
  "required": [
    "items"
  ],
  "fields": {
    "items": {
      "title": "Items",
      "description": "排序项列表",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "SortItem"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
