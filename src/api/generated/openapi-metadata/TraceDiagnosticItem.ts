/**
 * 自动生成的 OpenAPI schema 字段元数据: TraceDiagnosticItem
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TraceDiagnosticItemMetadata = {
  "title": "TraceDiagnosticItem",
  "required": [],
  "fields": {
    "request_id": {
      "title": "Request Id",
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
    "session_id": {
      "title": "Session Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "inbox_id": {
      "title": "Inbox Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "outbox_id": {
      "title": "Outbox Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "command_code": {
      "title": "Command Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "device_code": {
      "title": "Device Code",
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
    "workline_code": {
      "title": "Workline Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "plugin_key": {
      "title": "Plugin Key",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "canonical_event_type": {
      "title": "Canonical Event Type",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "transition": {
      "title": "Transition",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "extra": {
      "title": "Extra",
      "type": "object",
      "required": false,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
