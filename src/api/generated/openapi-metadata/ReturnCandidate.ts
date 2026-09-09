/**
 * 自动生成的 OpenAPI schema 字段元数据: ReturnCandidate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ReturnCandidateMetadata = {
  "title": "ReturnCandidate",
  "required": [
    "sequence_no",
    "bin_code",
    "source"
  ],
  "additionalProperties": false,
  "fields": {
    "bin_code": {
      "title": "Bin Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "sequence_no": {
      "title": "Sequence No",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 1,
      "maximum": 4
    },
    "source": {
      "required": true,
      "nullable": false,
      "ref": "ReturnSource"
    }
  }
} satisfies OpenApiSchemaMetadata
