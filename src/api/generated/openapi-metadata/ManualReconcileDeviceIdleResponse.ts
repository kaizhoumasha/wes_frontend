/**
 * 自动生成的 OpenAPI schema 字段元数据: ManualReconcileDeviceIdleResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ManualReconcileDeviceIdleResponseMetadata = {
  "title": "ManualReconcileDeviceIdleResponse",
  "required": [
    "command_code",
    "status",
    "failure_code"
  ],
  "additionalProperties": false,
  "fields": {
    "command_code": {
      "title": "Command Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "failure_code": {
      "title": "Failure Code",
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
