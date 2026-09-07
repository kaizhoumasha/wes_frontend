/**
 * 自动生成的 OpenAPI schema 字段元数据: ApplyPlanCorrectionRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ApplyPlanCorrectionRequestMetadata = {
  "title": "ApplyPlanCorrectionRequest",
  "required": [
    "correction_evidence_id",
    "expected_version",
    "reason"
  ],
  "additionalProperties": false,
  "fields": {
    "correction_evidence_id": {
      "title": "Correction Evidence Id",
      "type": "integer",
      "required": true,
      "nullable": false,
      "maximum": 9223372036854776000
    },
    "expected_version": {
      "title": "Expected Version",
      "type": "integer",
      "required": true,
      "nullable": false,
      "maximum": 9223372036854776000
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
