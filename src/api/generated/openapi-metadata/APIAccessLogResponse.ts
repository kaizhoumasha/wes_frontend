/**
 * 自动生成的 OpenAPI schema 字段元数据: APIAccessLogResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const APIAccessLogResponseMetadata = {
  "title": "APIAccessLogResponse",
  "required": [
    "system_id",
    "direction",
    "method",
    "path",
    "id",
    "created_at"
  ],
  "fields": {
    "causation_id": {
      "title": "Causation Id",
      "description": "因果事件 ID",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 200
    },
    "created_at": {
      "title": "Created At",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "delivery_state": {
      "title": "Delivery State",
      "description": "出站送达事实",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 32
    },
    "details": {
      "title": "Details",
      "type": "object",
      "required": false,
      "nullable": true
    },
    "direction": {
      "title": "Direction",
      "description": "交互方向",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "INBOUND",
        "OUTBOUND"
      ],
      "maxLength": 8
    },
    "error_code": {
      "title": "Error Code",
      "description": "稳定错误分类",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 100
    },
    "event_id": {
      "title": "Event Id",
      "description": "事件 ID",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 200
    },
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "method": {
      "title": "Method",
      "description": "HTTP 方法",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 10
    },
    "path": {
      "title": "Path",
      "description": "实际路径，不含 query",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 500
    },
    "peer_address": {
      "title": "Peer Address",
      "description": "对端地址",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 500
    },
    "request_id": {
      "title": "Request Id",
      "description": "请求或 attempt ID",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 100
    },
    "response_time_ms": {
      "title": "Response Time Ms",
      "description": "测得的交互耗时，毫秒",
      "type": "integer",
      "required": false,
      "nullable": true,
      "minimum": 0
    },
    "status_code": {
      "title": "Status Code",
      "description": "实际 HTTP 状态，无响应为 null",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "system_id": {
      "title": "System Id",
      "description": "外部系统标识",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 64
    },
    "trace_id": {
      "title": "Trace Id",
      "description": "Trace ID",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 100
    }
  }
} satisfies OpenApiSchemaMetadata
