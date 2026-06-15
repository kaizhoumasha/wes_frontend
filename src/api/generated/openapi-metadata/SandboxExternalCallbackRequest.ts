/**
 * 自动生成的 OpenAPI schema 字段元数据: SandboxExternalCallbackRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const SandboxExternalCallbackRequestMetadata = {
  "title": "SandboxExternalCallbackRequest",
  "description": "沙箱 External HTTP 回调模拟请求。",
  "required": [
    "dispatch_key"
  ],
  "fields": {
    "dispatch_key": {
      "title": "Dispatch Key",
      "description": "External HTTP Outbox Dispatch Key",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 200
    },
    "callback_type": {
      "title": "Callback Type",
      "description": "外部回调类型；为空时优先使用 Outbox payload.resume_callback_type",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 100
    },
    "payload": {
      "title": "Payload",
      "description": "回调 Payload 增量字段",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "source_system": {
      "title": "Source System",
      "description": "外部来源系统",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "WMS"
    },
    "source_event_id": {
      "title": "Source Event Id",
      "description": "外部事件 ID；为空时自动生成",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 200
    },
    "source_version": {
      "title": "Source Version",
      "description": "外部来源版本",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "1",
      "maxLength": 50
    },
    "request_id": {
      "title": "Request Id",
      "description": "外部请求 ID；为空时自动生成",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 200
    },
    "occurred_at": {
      "title": "Occurred At",
      "description": "外部事件发生时间",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "timestamp": {
      "title": "Timestamp",
      "description": "外部回调时间",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "signature": {
      "title": "Signature",
      "description": "沙箱签名占位",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "sandbox",
      "maxLength": 500
    }
  }
} satisfies OpenApiSchemaMetadata
