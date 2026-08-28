/**
 * 自动生成的 OpenAPI schema 字段元数据: TransportTaskStatus
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TransportTaskStatusMetadata = {
  "title": "TransportTaskStatus",
  "required": [],
  "fields": {
    "__enum": {
      "title": "TransportTaskStatus",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "PENDING",
        "ACCEPTED",
        "REJECTED",
        "SUCCEEDED",
        "FAILED",
        "RECONCILING"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
