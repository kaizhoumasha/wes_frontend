/**
 * 自动生成的 OpenAPI schema 字段元数据: _RackRotateData
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const _RackRotateDataMetadata = {
  "title": "_RackRotateData",
  "required": [
    "rack_id",
    "position",
    "target_face"
  ],
  "additionalProperties": false,
  "fields": {
    "rack_id": {
      "title": "Rack Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "position": {
      "required": true,
      "nullable": false,
      "ref": "_RackPosition"
    },
    "target_face": {
      "required": true,
      "nullable": false,
      "enum": [
        "A",
        "B"
      ],
      "ref": "RackFace"
    }
  }
} satisfies OpenApiSchemaMetadata
