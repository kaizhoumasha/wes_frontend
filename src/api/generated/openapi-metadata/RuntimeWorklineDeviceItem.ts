/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeWorklineDeviceItem
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeWorklineDeviceItemMetadata = {
  "title": "RuntimeWorklineDeviceItem",
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
