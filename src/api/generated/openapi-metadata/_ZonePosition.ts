/**
 * 自动生成的 OpenAPI schema 字段元数据: _ZonePosition
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const _ZonePositionMetadata = {
  "title": "_ZonePosition",
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
        "ZONE"
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
