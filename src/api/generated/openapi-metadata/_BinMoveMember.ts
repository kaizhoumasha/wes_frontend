/**
 * 自动生成的 OpenAPI schema 字段元数据: _BinMoveMember
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const _BinMoveMemberMetadata = {
  "title": "_BinMoveMember",
  "required": [
    "bin_id",
    "source",
    "target"
  ],
  "additionalProperties": false,
  "fields": {
    "bin_id": {
      "title": "Bin Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "source": {
      "required": true,
      "nullable": false,
      "ref": "_BinPosition"
    },
    "target": {
      "required": true,
      "nullable": false,
      "ref": "_BinPosition"
    }
  }
} satisfies OpenApiSchemaMetadata
