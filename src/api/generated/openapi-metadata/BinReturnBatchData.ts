/**
 * 自动生成的 OpenAPI schema 字段元数据: BinReturnBatchData
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const BinReturnBatchDataMetadata = {
  "title": "BinReturnBatchData",
  "required": [
    "workline_code",
    "rack_id",
    "rack_face",
    "return_candidates"
  ],
  "fields": {
    "rack_face": {
      "title": "Rack Face",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 10
    },
    "rack_id": {
      "title": "Rack Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "return_candidates": {
      "title": "Return Candidates",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "ReturnCandidate"
      }
    },
    "workline_code": {
      "title": "Workline Code",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
