/**
 * 自动生成的 OpenAPI schema 字段元数据: ManualDebugDeviceCommandCreate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ManualDebugDeviceCommandCreateMetadata = {
  "title": "ManualDebugDeviceCommandCreate",
  "required": [
    "client_request_id",
    "endpoint_base_url",
    "device_code",
    "timeout",
    "task_type",
    "reason"
  ],
  "additionalProperties": false,
  "fields": {
    "client_request_id": {
      "title": "Client Request Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 36,
      "maxLength": 36
    },
    "endpoint_base_url": {
      "title": "Endpoint Base Url",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 255
    },
    "device_code": {
      "title": "Device Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "timeout": {
      "title": "Timeout",
      "type": "integer",
      "required": true,
      "nullable": false,
      "maximum": 2147483647
    },
    "task_type": {
      "title": "Task Type",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "params": {
      "title": "Params",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "reason": {
      "title": "Reason",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 500
    }
  }
} satisfies OpenApiSchemaMetadata
