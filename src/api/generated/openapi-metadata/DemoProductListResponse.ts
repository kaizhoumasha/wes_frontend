/**
 * 自动生成的 OpenAPI schema 字段元数据: DemoProductListResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DemoProductListResponseMetadata = {
  "title": "DemoProductListResponse",
  "description": "DemoProductList 响应模型",
  "required": [
    "product_id",
    "quantity",
    "id"
  ],
  "fields": {
    "product_id": {
      "title": "Product Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "quantity": {
      "title": "Quantity",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
