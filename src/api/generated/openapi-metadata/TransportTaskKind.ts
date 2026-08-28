/**
 * 自动生成的 OpenAPI schema 字段元数据: TransportTaskKind
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TransportTaskKindMetadata = {
  "title": "TransportTaskKind",
  "required": [],
  "fields": {
    "__enum": {
      "title": "TransportTaskKind",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "RACK_MOVE",
        "RACK_ROTATE",
        "BIN_MOVE",
        "BIN_EXCHANGE"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
