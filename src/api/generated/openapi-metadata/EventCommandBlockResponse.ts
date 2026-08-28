/**
 * 自动生成的 OpenAPI schema 字段元数据: EventCommandBlockResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const EventCommandBlockResponseMetadata = {
  "title": "EventCommandBlockResponse",
  "required": [
    "block_id",
    "status",
    "source_event_id",
    "device_code",
    "blocking_command_code",
    "blocking_command_detected_status",
    "blocking_command_detected_reconciliation_reason",
    "blocking_command_current_status",
    "blocking_command_terminal",
    "reason_code",
    "blocked_at",
    "requeued_at",
    "reconcile_device_idle_path",
    "reprocess_path"
  ],
  "additionalProperties": false,
  "fields": {
    "block_id": {
      "title": "Block Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "blocked_at": {
      "title": "Blocked At",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "blocking_command_code": {
      "title": "Blocking Command Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "blocking_command_current_status": {
      "title": "Blocking Command Current Status",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "blocking_command_detected_reconciliation_reason": {
      "title": "Blocking Command Detected Reconciliation Reason",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "blocking_command_detected_status": {
      "title": "Blocking Command Detected Status",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "blocking_command_terminal": {
      "title": "Blocking Command Terminal",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "device_code": {
      "title": "Device Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "reason_code": {
      "title": "Reason Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "reconcile_device_idle_path": {
      "title": "Reconcile Device Idle Path",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "reprocess_path": {
      "title": "Reprocess Path",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "requeued_at": {
      "title": "Requeued At",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "source_event_id": {
      "title": "Source Event Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
