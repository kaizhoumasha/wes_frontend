/**
 * 自动生成的 OpenAPI schema 字段元数据: TraceOutboxItem
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TraceOutboxItemMetadata = {
  "title": "TraceOutboxItem",
  "required": [
    "id",
    "workline_id",
    "dispatch_type",
    "dispatch_key",
    "target_type",
    "target_code",
    "status",
    "created_at",
    "payload_json"
  ],
  "fields": {
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "session_id": {
      "title": "Session Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "workline_id": {
      "title": "Workline Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "dispatch_type": {
      "title": "Dispatch Type",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "dispatch_key": {
      "title": "Dispatch Key",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "target_type": {
      "title": "Target Type",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "target_code": {
      "title": "Target Code",
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
    "attempt_count": {
      "title": "Attempt Count",
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
    "last_error": {
      "title": "Last Error",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "blocked_by_runtime_hold_id": {
      "title": "Blocked By Runtime Hold Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "blocked_by_reconciliation_session_id": {
      "title": "Blocked By Reconciliation Session Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "blocked_device_id": {
      "title": "Blocked Device Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "blocked_workline_id": {
      "title": "Blocked Workline Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "blocked_reason": {
      "title": "Blocked Reason",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "created_at": {
      "title": "Created At",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "sent_at": {
      "title": "Sent At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "finished_at": {
      "title": "Finished At",
      "type": "string",
      "format": "date-time",
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
