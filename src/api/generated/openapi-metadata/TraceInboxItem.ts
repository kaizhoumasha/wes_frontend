/**
 * 自动生成的 OpenAPI schema 字段元数据: TraceInboxItem
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TraceInboxItemMetadata = {
  "title": "TraceInboxItem",
  "required": [
    "id",
    "kind",
    "source_system",
    "status",
    "received_at",
    "payload_json"
  ],
  "fields": {
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "kind": {
      "title": "Kind",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "source_system": {
      "title": "Source System",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "source_message_id": {
      "title": "Source Message Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "trace_id": {
      "title": "Trace Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "event_id": {
      "title": "Event Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "causation_id": {
      "title": "Causation Id",
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
    "device_id": {
      "title": "Device Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "command_id": {
      "title": "Command Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "session_id": {
      "title": "Session Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "received_at": {
      "title": "Received At",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "processed_at": {
      "title": "Processed At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "attempt_count": {
      "title": "Attempt Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "max_attempts": {
      "title": "Max Attempts",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "next_retry_at": {
      "title": "Next Retry At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "error_message": {
      "title": "Error Message",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "payload_json": {
      "title": "Payload Json",
      "type": "object",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
