/**
 * 自动生成的 OpenAPI schema 字段元数据: TraceContextResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TraceContextResponseMetadata = {
  "title": "TraceContextResponse",
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
    "device_id": {
      "title": "Device Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "device_code": {
      "title": "Device Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "command_id": {
      "title": "Command Id",
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
    "outbox_id": {
      "title": "Outbox Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "dispatch_key": {
      "title": "Dispatch Key",
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
    "plugin_key": {
      "title": "Plugin Key",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "contract_version": {
      "title": "Contract Version",
      "type": "string",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
