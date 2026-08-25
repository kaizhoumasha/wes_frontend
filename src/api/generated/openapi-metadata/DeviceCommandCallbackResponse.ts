/**
 * 自动生成的 OpenAPI schema 字段元数据: DeviceCommandCallbackResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DeviceCommandCallbackResponseMetadata = {
  "title": "DeviceCommandCallbackResponse",
  "required": [
    "result",
    "data",
    "error_detail",
    "source_event_id",
    "received_at",
    "apply_status"
  ],
  "additionalProperties": false,
  "fields": {
    "apply_status": {
      "title": "Apply Status",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "data": {
      "title": "Data",
      "type": "object",
      "required": true,
      "nullable": false
    },
    "error_detail": {
      "title": "Error Detail",
      "type": "object",
      "required": true,
      "nullable": true
    },
    "received_at": {
      "title": "Received At",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "result": {
      "title": "Result",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "source_event_id": {
      "title": "Source Event Id",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
