/**
 * 自动生成的 OpenAPI schema 字段元数据: ManualReconcileDeviceIdleRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ManualReconcileDeviceIdleRequestMetadata = {
  "title": "ManualReconcileDeviceIdleRequest",
  "required": [
    "reason"
  ],
  "additionalProperties": false,
  "fields": {
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
