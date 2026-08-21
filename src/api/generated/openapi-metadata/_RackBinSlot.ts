/**
 * 自动生成的 OpenAPI schema 字段元数据: _RackBinSlot
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const _RackBinSlotMetadata = {
  "title": "_RackBinSlot",
  "required": [
    "kind",
    "rack_id",
    "rack_face",
    "slot_id"
  ],
  "additionalProperties": false,
  "fields": {
    "kind": {
      "description": "discriminator enum property added by openapi-typescript",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "RACK_BIN_SLOT"
      ]
    },
    "rack_id": {
      "title": "Rack Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "rack_face": {
      "required": true,
      "nullable": false,
      "enum": [
        "A",
        "B"
      ],
      "ref": "RackFace"
    },
    "slot_id": {
      "title": "Slot Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    }
  }
} satisfies OpenApiSchemaMetadata
