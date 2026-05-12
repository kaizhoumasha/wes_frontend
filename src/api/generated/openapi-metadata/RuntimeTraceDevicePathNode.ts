/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeTraceDevicePathNode
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeTraceDevicePathNodeMetadata = {
  "title": "RuntimeTraceDevicePathNode",
  "required": [
    "device_id"
  ],
  "fields": {
    "device_id": {
      "title": "Device Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "device_code": {
      "title": "Device Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "device_name": {
      "title": "Device Name",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "device_role": {
      "title": "Device Role",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "is_current": {
      "title": "Is Current",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "actions": {
      "title": "Actions",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RuntimeTraceDeviceAction"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
