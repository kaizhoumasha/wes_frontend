/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeBlockingReason
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeBlockingReasonMetadata = {
  "title": "RuntimeBlockingReason",
  "required": [
    "reason"
  ],
  "fields": {
    "device_id": {
      "title": "Device Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "reason": {
      "title": "Reason",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "detail": {
      "title": "Detail",
      "type": "string",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
