/**
 * 自动生成的 OpenAPI schema 字段元数据: SandboxEventRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const SandboxEventRequestMetadata = {
  "title": "SandboxEventRequest",
  "description": "沙箱 Event 发送请求。",
  "required": [
    "workline_id",
    "device_id",
    "event_type"
  ],
  "fields": {
    "workline_id": {
      "title": "Workline Id",
      "description": "工作线 ID",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "device_id": {
      "title": "Device Id",
      "description": "目标设备 ID",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "event_type": {
      "title": "Event Type",
      "description": "事件类型",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "trace_id": {
      "title": "Trace Id",
      "description": "Trace ID（可选，自动生成）",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 200
    },
    "session_id": {
      "title": "Session Id",
      "description": "Session ID（可选）",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "payload": {
      "title": "Payload",
      "description": "事件 Payload",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "timestamp": {
      "title": "Timestamp",
      "description": "事件时间戳（默认当前时间）",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
