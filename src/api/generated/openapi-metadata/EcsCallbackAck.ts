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
    "error_detail": {
      "required": false,
      "nullable": true,
      "ref": "EcsCallbackRejectionDetail"
    },
    "message": {
      "title": "Message",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
