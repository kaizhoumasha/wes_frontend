/**
 * 自动生成的 OpenAPI schema 字段元数据: DemoProductListUpdate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DemoProductListUpdateMetadata = {
  "title": "DemoProductListUpdate",
  "description": "DemoProductList 更新模型\n\n注意：在更新主表时，使用 Diff 算法处理从表：\n- 有 id：更新现有记录\n- 无 id：创建新记录\n- 缺失：删除记录\n\n因此 id 和 product_id 都是可选的",
  "required": [],
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
      "required": false,
      "nullable": true,
      "minimum": 0
    },
    "id": {
      "title": "Id",
      "type": "integer",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
