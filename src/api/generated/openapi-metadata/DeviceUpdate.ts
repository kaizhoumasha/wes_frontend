/**
 * 自动生成的 OpenAPI schema 字段元数据: DeviceUpdate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DeviceUpdateMetadata = {
  "title": "DeviceUpdate",
  "description": "设备静态主数据更新合同。",
  "required": [
    "version"
  ],
  "additionalProperties": false,
  "fields": {
    "device_code": {
      "title": "Device Code",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 100
    },
    "device_name": {
      "title": "Device Name",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 100
    },
    "work_line_id": {
      "title": "Work Line Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "description": {
      "title": "Description",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 500
    },
    "is_active": {
      "title": "Is Active",
      "type": "boolean",
      "required": false,
      "nullable": true
    },
    "sort_order": {
      "title": "Sort Order",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "device_role": {
      "title": "Device Role",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 50
    },
    "role_index": {
      "title": "Role Index",
      "type": "integer",
      "required": false,
      "nullable": true,
      "minimum": 1
    },
    "upstream_device_id": {
      "title": "Upstream Device Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "diagnostic_profile": {
      "title": "Diagnostic Profile",
      "type": "object",
      "required": false,
      "nullable": true
    },
    "version": {
      "title": "Version",
      "description": "乐观锁版本号，更新时必传",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
