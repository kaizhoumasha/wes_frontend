/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeTraceDeviceAction
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeTraceDeviceActionMetadata = {
  "title": "RuntimeTraceDeviceAction",
  "required": [
    "kind",
    "label"
  ],
  "fields": {
    "kind": {
      "title": "Kind",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "label": {
      "title": "Label",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "timestamp": {
      "title": "Timestamp",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "message": {
      "title": "Message",
      "type": "string",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
