/**
 * 自动生成的 OpenAPI schema 字段元数据: EcsCallbackAck
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const EcsCallbackAckMetadata = {
  "title": "EcsCallbackAck",
  "required": [
    "code",
    "message"
  ],
  "additionalProperties": false,
  "fields": {
    "code": {
      "title": "Code",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "message": {
      "title": "Message",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "trace_id": {
      "title": "Trace Id",
      "type": "string",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
