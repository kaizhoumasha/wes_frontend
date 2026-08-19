/**
 * 自动生成的 OpenAPI schema 字段元数据: DeviceResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DeviceResponseMetadata = {
  "title": "DeviceResponse",
  "description": "设备静态主数据响应。",
  "required": [
    "device_code",
    "device_name",
    "device_role",
    "id",
    "version"
  ],
  "fields": {
    "device_code": {
      "title": "Device Code",
      "description": "独立命令资源编码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "device_name": {
      "title": "Device Name",
      "description": "设备名称",
      "type": "string",
      "required": true,
      "nullable": false,
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
      "description": "是否允许进入新运行代际",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": true
    },
    "sort_order": {
      "title": "Sort Order",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "device_role": {
      "title": "Device Role",
      "description": "物理拓扑角色",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 50
    },
    "role_index": {
      "title": "Role Index",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 1,
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
      "nullable": false
    },
    "endpoint_base_url": {
      "title": "Endpoint Base Url",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 255
    },
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "version": {
      "title": "Version",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
