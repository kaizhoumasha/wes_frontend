/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeMonitorSessionItem
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeMonitorSessionItemMetadata = {
  "title": "RuntimeMonitorSessionItem",
  "required": [
    "session_id",
    "session_code",
    "workline_id",
    "status"
  ],
  "fields": {
    "session_id": {
      "title": "Session Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "session_code": {
      "title": "Session Code",
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
    "request_id": {
      "title": "Request Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "last_inbox_id": {
      "title": "Last Inbox Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "barcode": {
      "title": "Barcode",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "workline_id": {
      "title": "Workline Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "device_id": {
      "title": "Device Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "device_name": {
      "title": "Device Name",
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
    "status": {
      "title": "Status",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "current_wait_type": {
      "title": "Current Wait Type",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "failure_domain": {
      "title": "Failure Domain",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "failure_code": {
      "title": "Failure Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "latest_timeline_action": {
      "title": "Latest Timeline Action",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "latest_timeline_status": {
      "title": "Latest Timeline Status",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "latest_timeline_message": {
      "title": "Latest Timeline Message",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "started_at": {
      "title": "Started At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "last_ingress_at": {
      "title": "Last Ingress At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "deadline_at": {
      "title": "Deadline At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "is_timed_out": {
      "title": "Is Timed Out",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    }
  }
} satisfies OpenApiSchemaMetadata
