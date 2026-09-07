/**
 * 自动生成的 OpenAPI schema 字段元数据: _BinExchangePair
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const _BinExchangePairMetadata = {
  "title": "_BinExchangePair",
  "required": [
    "left_bin_code",
    "left_location",
    "right_bin_code",
    "right_location"
  ],
  "additionalProperties": false,
  "fields": {
    "left_bin_code": {
      "title": "Left Bin Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "left_location": {
      "required": true,
      "nullable": false,
      "ref": "_RackBinSlot"
    },
    "right_bin_code": {
      "title": "Right Bin Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "right_location": {
      "required": true,
      "nullable": false,
      "ref": "_RackBinSlot"
    }
  }
} satisfies OpenApiSchemaMetadata
