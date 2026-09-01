/**
 * 自动生成的 OpenAPI schema 字段元数据: _RackPosition
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const _RackPositionMetadata = {
  "title": "_RackPosition",
  "required": [
    "kind",
    "location_code"
  ],
  "additionalProperties": false,
  "fields": {
    "kind": {
      "description": "discriminator enum property added by openapi-typescript",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "RACK_POSITION"
      ]
    },
    "location_code": {
      "title": "Location Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    }
  }
} satisfies OpenApiSchemaMetadata
