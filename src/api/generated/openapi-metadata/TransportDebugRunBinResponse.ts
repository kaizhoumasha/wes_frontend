/**
 * 自动生成的 OpenAPI schema 字段元数据: TransportDebugRunBinResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TransportDebugRunBinResponseMetadata = {
  "title": "TransportDebugRunBinResponse",
  "required": [
    "bin_id",
    "slot_id"
  ],
  "additionalProperties": false,
  "fields": {
    "bin_id": {
      "title": "Bin Id",
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
