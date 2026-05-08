/**
 * 自动生成的 OpenAPI schema 字段元数据: CallbackLogResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const CallbackLogResponseMetadata = {
  "title": "CallbackLogResponse",
  "description": "回调日志响应 Schema",
  "required": [
    "id",
    "callback_type",
    "device_id",
    "request_body",
    "client_ip",
    "user_agent",
    "request_id",
    "trace_id",
    "event_id",
    "causation_id",
    "response_status",
    "response_time_ms",
    "error_message",
    "ingress_outcome",
    "failure_stage",
    "created_at",
    "updated_at"
  ],
  "fields": {
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "callback_type": {
      "title": "Callback Type",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "device_id": {
      "title": "Device Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "request_body": {
      "title": "Request Body",
      "type": "object",
      "required": true,
      "nullable": false
    },
    "client_ip": {
      "title": "Client Ip",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "user_agent": {
      "title": "User Agent",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "request_id": {
      "title": "Request Id",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "trace_id": {
      "title": "Trace Id",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "event_id": {
      "title": "Event Id",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "causation_id": {
      "title": "Causation Id",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "response_status": {
      "title": "Response Status",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "response_time_ms": {
      "title": "Response Time Ms",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "error_message": {
      "title": "Error Message",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "ingress_outcome": {
      "title": "Ingress Outcome",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "failure_stage": {
      "title": "Failure Stage",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "created_at": {
      "title": "Created At",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "updated_at": {
      "title": "Updated At",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
