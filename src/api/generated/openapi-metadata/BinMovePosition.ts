/**
 * 自动生成的 OpenAPI schema 字段元数据: BinMovePosition
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const BinMovePositionMetadata = {
  "title": "BinMovePosition",
  "required": [
    "kind"
  ],
  "additionalProperties": false,
  "fields": {
    "kind": {
      "title": "Kind",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "HANDOFF_POSITION",
        "RACK_BIN_SLOT"
      ]
    },
    "location_code": {
      "title": "Location Code",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 120
    },
    "rack_face": {
      "title": "Rack Face",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 120
    },
    "rack_id": {
      "title": "Rack Id",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 120
    },
    "slot_id": {
      "title": "Slot Id",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 120
    }
  }
} satisfies OpenApiSchemaMetadata
