/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeMonitorDeviceNode
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeMonitorDeviceNodeMetadata = {
  "title": "RuntimeMonitorDeviceNode",
  "required": [
    "id",
    "device_code",
    "device_name",
    "device_role",
    "role_index",
    "device_status"
  ],
  "fields": {
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "device_code": {
      "title": "Device Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "device_name": {
      "title": "Device Name",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "device_role": {
      "title": "Device Role",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "role_index": {
      "title": "Role Index",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "upstream_device_id": {
      "title": "Upstream Device Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "device_status": {
      "title": "Device Status",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "maintenance_mode": {
      "title": "Maintenance Mode",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "current_command_id": {
      "title": "Current Command Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "open_command_count": {
      "title": "Open Command Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "pending_command_count": {
      "title": "Pending Command Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "blocked_outbox_count": {
      "title": "Blocked Outbox Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "blocked_reason": {
      "title": "Blocked Reason",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "blocked_wait_seconds": {
      "title": "Blocked Wait Seconds",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "blocked_check_count": {
      "title": "Blocked Check Count",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "open_issue_count": {
      "title": "Open Issue Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "active_runtime_hold_ids": {
      "title": "Active Runtime Hold Ids",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "integer"
      }
    },
    "last_heartbeat_at": {
      "title": "Last Heartbeat At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "error_code": {
      "title": "Error Code",
      "type": "string",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
