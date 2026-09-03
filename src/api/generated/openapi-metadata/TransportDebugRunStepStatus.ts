/**
 * 自动生成的 OpenAPI schema 字段元数据: TransportDebugRunStepStatus
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TransportDebugRunStepStatusMetadata = {
  "title": "TransportDebugRunStepStatus",
  "required": [],
  "fields": {
    "__enum": {
      "title": "TransportDebugRunStepStatus",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "PENDING",
        "WAITING",
        "SUCCEEDED",
        "FAILED",
        "NEEDS_ATTENTION"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
