/**
 * 自动生成的 OpenAPI schema 字段元数据: DeviceCreate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DeviceCreateMetadata = {
  "title": "DeviceCreate",
  "description": "设备创建合同。",
  "required": [
    "device_code",
    "device_name",
    "device_role"
  ],
  "additionalProperties": false,
  "fields": {
    "description": {
      "title": "Description",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 500
    },
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
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "device_role": {
      "title": "Device Role",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 50
    },
    "diagnostic_profile": {
      "title": "Diagnostic Profile",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "endpoint_base_url": {
      "title": "Endpoint Base Url",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 255
    },
    "is_active": {
      "title": "Is Active",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": true
    },
    "role_index": {
      "title": "Role Index",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 1,
      "minimum": 1
    },
    "sort_order": {
      "title": "Sort Order",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "upstream_device_id": {
      "title": "Upstream Device Id",
      "type": "integer",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
