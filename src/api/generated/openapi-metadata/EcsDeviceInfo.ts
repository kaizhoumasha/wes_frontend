/**
 * 自动生成的 OpenAPI schema 字段元数据: EcsDeviceInfo
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const EcsDeviceInfoMetadata = {
  "title": "EcsDeviceInfo",
  "description": "ECS 返回的设备静态描述。",
  "required": [
    "device_code",
    "device_name",
    "device_type",
    "role",
    "supported_commands",
    "supported_events"
  ],
  "additionalProperties": false,
  "fields": {
    "device_code": {
      "title": "Device Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "device_name": {
      "title": "Device Name",
      "type": "string",
      "required": true,
      "nullable": true,
      "minLength": 1,
      "maxLength": 200
    },
    "device_type": {
      "title": "Device Type",
      "type": "string",
      "required": true,
      "nullable": true,
      "minLength": 1,
      "maxLength": 100
    },
    "role": {
      "title": "Role",
      "type": "string",
      "required": true,
      "nullable": true,
      "minLength": 1,
      "maxLength": 100
    },
    "supported_commands": {
      "title": "Supported Commands",
      "type": "array",
      "required": true,
      "nullable": true,
      "items": {
        "type": "string"
      }
    },
    "supported_events": {
      "title": "Supported Events",
      "type": "array",
      "required": true,
      "nullable": true,
      "items": {
        "type": "string"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
