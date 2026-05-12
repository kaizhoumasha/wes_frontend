/**
 * 自动生成的 OpenAPI schema 字段元数据: DemoProductResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DemoProductResponseMetadata = {
  "title": "DemoProductResponse",
  "description": "DemoProduct 响应模型\n\n包含 version 字段，前端在更新时必须传回该字段",
  "required": [
    "name",
    "price",
    "stock",
    "id",
    "product_lists"
  ],
  "fields": {
    "deleted_by": {
      "title": "Deleted By",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "deleted_at": {
      "title": "Deleted At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "is_deleted": {
      "title": "Is Deleted",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "version": {
      "title": "Version",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "created_at": {
      "title": "Created At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": false
    },
    "updated_at": {
      "title": "Updated At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "created_by": {
      "title": "Created By",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "updated_by": {
      "title": "Updated By",
      "type": "integer",
      "required": false,
      "nullable": true
    },
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
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "product_lists": {
      "title": "Product Lists",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "DemoProductListResponse"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
