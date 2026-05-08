/**
 * 自动生成的 OpenAPI schema 字段元数据: DemoProductUpdate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DemoProductUpdateMetadata = {
  "title": "DemoProductUpdate",
  "description": "DemoProduct 更新模型\n\n注意：更新时必须包含 version 字段（乐观锁）",
  "required": [
    "version"
  ],
  "additionalProperties": false,
  "fields": {
    "name": {
      "title": "Name",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 100
    },
    "price": {
      "title": "Price",
      "type": "number",
      "required": false,
      "nullable": true,
      "minimum": 0
    },
    "stock": {
      "title": "Stock",
      "type": "integer",
      "required": false,
      "nullable": true,
      "minimum": 0
    },
    "version": {
      "title": "Version",
      "description": "乐观锁版本号，更新时必传",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "product_lists": {
      "title": "Product Lists",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "DemoProductListUpdate"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
