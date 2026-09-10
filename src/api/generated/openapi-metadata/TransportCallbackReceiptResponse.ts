/**
 * 自动生成的 OpenAPI schema 字段元数据: TransportCallbackReceiptResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TransportCallbackReceiptResponseMetadata = {
  "title": "TransportCallbackReceiptResponse",
  "required": [
    "operation",
    "operation_id",
    "response_http_status",
    "response_code",
    "response_data",
    "received_at",
    "conflict_code"
  ],
  "additionalProperties": false,
  "fields": {
    "conflict_code": {
      "title": "Conflict Code",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "operation": {
      "title": "Operation",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "operation_id": {
      "title": "Operation Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "received_at": {
      "title": "Received At",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "response_code": {
      "title": "Response Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "response_data": {
      "title": "Response Data",
      "type": "object",
      "required": true,
      "nullable": false
    },
    "response_http_status": {
      "title": "Response Http Status",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
