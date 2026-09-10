/**
 * 自动生成的 OpenAPI schema 字段元数据: WmsConfirmationStatus
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WmsConfirmationStatusMetadata = {
  "title": "WmsConfirmationStatus",
  "required": [],
  "fields": {
    "__enum": {
      "title": "WmsConfirmationStatus",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "PENDING",
        "DISPATCHING",
        "COMPLETED",
        "RECONCILING",
        "SUPERSEDED"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
