/**
 * 自动生成的 OpenAPI schema 字段元数据: DiagnosisEvidenceHealthResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DiagnosisEvidenceHealthResponseMetadata = {
  "title": "DiagnosisEvidenceHealthResponse",
  "description": "诊断证据健康摘要。",
  "required": [
    "level",
    "summary"
  ],
  "fields": {
    "level": {
      "title": "Level",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "summary": {
      "title": "Summary",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "missing": {
      "title": "Missing",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "items": {
      "title": "Items",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "DiagnosisEvidenceHealthItemResponse"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
