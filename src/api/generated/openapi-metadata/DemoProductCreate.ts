/**
 * 自动生成的 OpenAPI schema 字段元数据: DemoProductCreate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DemoProductCreateMetadata = {
  "title": "DemoProductCreate",
  "description": "DemoProduct 创建模型",
  "required": [
    "name",
    "price",
    "stock"
  ],
  "additionalProperties": false,
  "fields": {
    "name": {
      "title": "Name",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 100
    },
    "price": {
      "title": "Price",
      "type": "number",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "stock": {
      "title": "Stock",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "product_lists": {
      "title": "Product Lists",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "DemoProductListCreate"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
