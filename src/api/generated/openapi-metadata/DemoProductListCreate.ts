/**
 * 自动生成的 OpenAPI schema 字段元数据: DemoProductListCreate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DemoProductListCreateMetadata = {
  "title": "DemoProductListCreate",
  "description": "DemoProductList 创建模型\n\n注意：product_id 在创建时是可选的，因为会自动从主表 ID 设置",
  "required": [
    "quantity"
  ],
  "additionalProperties": false,
  "fields": {
    "product_id": {
      "title": "Product Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "quantity": {
      "title": "Quantity",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    }
  }
} satisfies OpenApiSchemaMetadata
