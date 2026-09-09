/**
 * 自动生成的 OpenAPI schema 字段元数据: RackMovePosition
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RackMovePositionMetadata = {
  "title": "RackMovePosition",
  "required": [
    "kind",
    "location_code"
  ],
  "additionalProperties": false,
  "fields": {
    "kind": {
      "title": "Kind",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "RACK",
        "ZONE",
        "RACK_POSITION"
      ]
    },
    "location_code": {
      "title": "Location Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    }
  }
} satisfies OpenApiSchemaMetadata
