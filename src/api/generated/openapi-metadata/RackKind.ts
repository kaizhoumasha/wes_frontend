/**
 * 自动生成的 OpenAPI schema 字段元数据: RackKind
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RackKindMetadata = {
  "title": "RackKind",
  "required": [],
  "fields": {
    "__enum": {
      "title": "RackKind",
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
