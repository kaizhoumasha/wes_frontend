/**
 * 自动生成的 OpenAPI schema 字段元数据: CallbackResultAcceptedResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const CallbackResultAcceptedResponseMetadata = {
  "title": "CallbackResultAcceptedResponse",
  "description": "设备结果回调接收响应数据。",
  "required": [],
  "fields": {
    "ack": {
      "title": "Ack",
      "description": "入口是否接收",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": true
    },
    "request_id": {
      "title": "Request Id",
      "description": "入口请求 ID",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "trace_id": {
      "title": "Trace Id",
      "description": "Trace ID",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "event_id": {
      "title": "Event Id",
      "description": "供应商事件 ID",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "causation_id": {
      "title": "Causation Id",
      "description": "因果事件 ID",
      "type": "string",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
