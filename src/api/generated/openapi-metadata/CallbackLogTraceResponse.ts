/**
 * 自动生成的 OpenAPI schema 字段元数据: CallbackLogTraceResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const CallbackLogTraceResponseMetadata = {
  "title": "CallbackLogTraceResponse",
  "description": "Trace 维度回调日志列表响应。",
  "required": [
    "trace_id",
    "count",
    "items"
  ],
  "fields": {
    "count": {
      "title": "Count",
      "description": "回调日志数量",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "items": {
      "title": "Items",
      "description": "回调日志列表",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "CallbackLogResponse"
      }
    },
    "trace_id": {
      "title": "Trace Id",
      "description": "Trace ID",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
