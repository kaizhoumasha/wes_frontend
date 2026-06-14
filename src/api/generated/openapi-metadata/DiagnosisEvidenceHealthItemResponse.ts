/**
 * 自动生成的 OpenAPI schema 字段元数据: DiagnosisEvidenceHealthItemResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DiagnosisEvidenceHealthItemResponseMetadata = {
  "title": "DiagnosisEvidenceHealthItemResponse",
  "description": "诊断证据健康明细。",
  "required": [
    "key",
    "label",
    "count",
    "state",
    "hint"
  ],
  "fields": {
    "key": {
      "title": "Key",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "label": {
      "title": "Label",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "count": {
      "title": "Count",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "state": {
      "title": "State",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "hint": {
      "title": "Hint",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
