/**
 * 自动生成的 OpenAPI schema 字段元数据: DiagnosisVerdictResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DiagnosisVerdictResponseMetadata = {
  "title": "DiagnosisVerdictResponse",
  "description": "Trace 统一诊断结论。",
  "required": [
    "state",
    "severity",
    "title",
    "summary",
    "requires_operator_action",
    "blocking_point",
    "evidence_health"
  ],
  "fields": {
    "state": {
      "title": "State",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "severity": {
      "title": "Severity",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "title": {
      "title": "Title",
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
    "requires_operator_action": {
      "title": "Requires Operator Action",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "primary_action": {
      "title": "Primary Action",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "blocking_point": {
      "title": "Blocking Point",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "owner": {
      "title": "Owner",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "evidence_health": {
      "required": true,
      "nullable": false,
      "ref": "DiagnosisEvidenceHealthResponse"
    }
  }
} satisfies OpenApiSchemaMetadata
