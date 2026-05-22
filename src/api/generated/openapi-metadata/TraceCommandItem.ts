/**
 * 自动生成的 OpenAPI schema 字段元数据: TraceCommandItem
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TraceCommandItemMetadata = {
  "title": "TraceCommandItem",
  "required": [
    "id",
    "device_id",
    "command_code",
    "task_type",
    "status",
    "params"
  ],
  "fields": {
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "device_id": {
      "title": "Device Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "command_code": {
      "title": "Command Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "trace_id": {
      "title": "Trace Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "workline_id": {
      "title": "Workline Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "session_id": {
      "title": "Session Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "task_type": {
      "title": "Task Type",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "result": {
      "title": "Result",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "retry_count": {
      "title": "Retry Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "sent_at": {
      "title": "Sent At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "ack_received_at": {
      "title": "Ack Received At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "completed_at": {
      "title": "Completed At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "ack_code": {
      "title": "Ack Code",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "ack_message": {
      "title": "Ack Message",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "ack_trace_id": {
      "title": "Ack Trace Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "params": {
      "title": "Params",
      "type": "object",
      "required": true,
      "nullable": false
    },
    "result_data": {
      "title": "Result Data",
      "type": "object",
      "required": false,
      "nullable": true
    },
    "error_detail": {
      "title": "Error Detail",
      "type": "object",
      "required": false,
      "nullable": true
    },
    "duration_ms": {
      "title": "Duration Ms",
      "type": "integer",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
