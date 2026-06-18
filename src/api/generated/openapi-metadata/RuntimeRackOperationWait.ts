/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeRackOperationWait
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeRackOperationWaitMetadata = {
  "title": "RuntimeRackOperationWait",
  "description": "料架操作等待状态，描述 WMS 回调与超时结果。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "RuntimeRackOperationWait",
      "description": "料架操作等待状态，描述 WMS 回调与超时结果。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "WAITING_WMS",
        "WMS_CALLBACK_RECEIVED",
        "TIMEOUT",
        "FAILED",
        "NONE",
        "UNKNOWN"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
