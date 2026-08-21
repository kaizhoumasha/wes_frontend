/**
 * 自动生成的 OpenAPI schema 字段元数据: _BinMoveData
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const _BinMoveDataMetadata = {
  "title": "_BinMoveData",
  "required": [
    "moves"
  ],
  "additionalProperties": false,
  "fields": {
    "moves": {
      "title": "Moves",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "_BinMoveMember"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
