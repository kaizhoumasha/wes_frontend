/**
 * 自动生成的 OpenAPI schema 字段元数据: InboundEvidenceApplyStatus
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const InboundEvidenceApplyStatusMetadata = {
  "title": "InboundEvidenceApplyStatus",
  "required": [],
  "fields": {
    "__enum": {
      "title": "InboundEvidenceApplyStatus",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "PENDING",
        "APPLIED",
        "IGNORED",
        "RECONCILING"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
