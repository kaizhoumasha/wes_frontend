/**
 * 自动生成的 OpenAPI schema 字段元数据: ApplyPlanCorrectionResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ApplyPlanCorrectionResponseMetadata = {
  "title": "ApplyPlanCorrectionResponse",
  "required": [
    "task_id",
    "plan_revision",
    "version",
    "correction_evidence_id"
  ],
  "fields": {
    "correction_evidence_id": {
      "title": "Correction Evidence Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "plan_revision": {
      "title": "Plan Revision",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "task_id": {
      "title": "Task Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "version": {
      "title": "Version",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
