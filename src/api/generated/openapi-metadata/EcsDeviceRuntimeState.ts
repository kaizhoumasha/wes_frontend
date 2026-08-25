/**
 * 自动生成的 OpenAPI schema 字段元数据: EcsDeviceRuntimeState
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const EcsDeviceRuntimeStateMetadata = {
  "title": "EcsDeviceRuntimeState",
  "description": "ECS 返回的设备运行状态。",
  "required": [
    "device_code",
    "mode",
    "status",
    "is_online",
    "current_command_code",
    "scenario",
    "updated_at"
  ],
  "additionalProperties": false,
  "fields": {
    "current_command_code": {
      "title": "Current Command Code",
      "type": "string",
      "required": true,
      "nullable": true,
      "minLength": 1,
      "maxLength": 160
    },
    "device_code": {
      "title": "Device Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "is_online": {
      "title": "Is Online",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "mode": {
      "required": true,
      "nullable": false,
      "enum": [
        "AUTO",
        "MANUAL",
        "MAINTENANCE",
        "UNKNOWN"
      ],
      "ref": "EcsDeviceMode"
    },
    "scenario": {
      "title": "Scenario",
      "type": "string",
      "required": true,
      "nullable": true,
      "minLength": 1,
      "maxLength": 100
    },
    "status": {
      "required": true,
      "nullable": false,
      "enum": [
        "IDLE",
        "RUNNING",
        "ERROR",
        "PAUSED",
        "STOPPED",
        "OFFLINE",
        "UNKNOWN"
      ],
      "ref": "EcsDeviceState"
    },
    "updated_at": {
      "title": "Updated At",
      "type": "integer",
      "required": true,
      "nullable": false,
      "maximum": 9223372036854776000
    }
  }
} satisfies OpenApiSchemaMetadata
