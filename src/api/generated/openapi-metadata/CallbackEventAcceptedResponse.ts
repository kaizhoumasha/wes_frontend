/**
 * 自动生成的 OpenAPI schema 字段元数据: CallbackEventAcceptedResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const CallbackEventAcceptedResponseMetadata = {
  "title": "CallbackEventAcceptedResponse",
  "description": "设备事件回调接收响应数据。",
  "required": [
    "status",
    "device_code"
  ],
  "fields": {
    "status": {
      "title": "Status",
      "description": "入口处理状态",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "submitted",
        "duplicate",
        "accepted"
      ]
    },
    "device_code": {
      "title": "Device Code",
      "description": "设备编码",
      "type": "string",
      "required": true,
      "nullable": false
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
    },
    "diagnostic": {
      "title": "Diagnostic",
      "description": "START 准入诊断信息",
      "type": "object",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
