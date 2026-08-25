/**
 * 自动生成的 OpenAPI schema 字段元数据: ManualDebugDeviceCommandCreated
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ManualDebugDeviceCommandCreatedMetadata = {
  "title": "ManualDebugDeviceCommandCreated",
  "required": [
    "command_code",
    "client_request_id",
    "status"
  ],
  "additionalProperties": false,
  "fields": {
    "client_request_id": {
      "title": "Client Request Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "command_code": {
      "title": "Command Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
