/**
 * 自动生成的 OpenAPI schema 字段元数据: RackKind
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RackKindMetadata = {
  "title": "RackKind",
  "description": "货架物理结构类型。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "RackKind",
      "description": "货架物理结构类型。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "SINGLE_LAYER",
        "FIVE_LAYER",
        "RETURN",
        "TRANSFER",
        "PRODUCTION"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
