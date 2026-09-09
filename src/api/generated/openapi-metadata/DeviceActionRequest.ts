/**
 * 自动生成的 OpenAPI schema 字段元数据: DeviceActionRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DeviceActionRequestMetadata = {
  "title": "DeviceActionRequest",
  "required": [
    "expected_version",
    "client_request_id",
    "device_code",
    "task_type",
    "params",
    "timeout_ms",
    "reason"
  ],
  "additionalProperties": false,
  "fields": {
    "client_request_id": {
      "title": "Client Request Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    },
    "device_code": {
      "title": "Device Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    },
    "expected_version": {
      "title": "Expected Version",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "params": {
      "title": "Params",
      "type": "object",
      "required": true,
      "nullable": false
    },
    "reason": {
      "title": "Reason",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    },
    "task_type": {
      "title": "Task Type",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    },
    "timeout_ms": {
      "title": "Timeout Ms",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 100,
      "maximum": 600000
    }
  }
} satisfies OpenApiSchemaMetadata
