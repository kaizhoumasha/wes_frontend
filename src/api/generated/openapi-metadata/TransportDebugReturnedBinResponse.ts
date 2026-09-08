/**
 * 自动生成的 OpenAPI schema 字段元数据: TransportDebugReturnedBinResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TransportDebugReturnedBinResponseMetadata = {
  "title": "TransportDebugReturnedBinResponse",
  "required": [
    "bin_code",
    "rack_id",
    "rack_face",
    "slot_id"
  ],
  "additionalProperties": false,
  "fields": {
    "bin_code": {
      "title": "Bin Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "rack_face": {
      "title": "Rack Face",
      "description": "Opaque non-empty face value without NUL; preserve exactly",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 10
    },
    "rack_id": {
      "title": "Rack Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "slot_id": {
      "title": "Slot Id",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
