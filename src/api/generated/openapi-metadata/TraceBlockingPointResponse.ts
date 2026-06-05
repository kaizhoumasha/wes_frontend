/**
 * 自动生成的 OpenAPI schema 字段元数据: TraceBlockingPointResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TraceBlockingPointResponseMetadata = {
  "title": "TraceBlockingPointResponse",
  "required": [
    "trace_id",
    "blocking_point",
    "diagnosis_verdict",
    "owner",
    "recoverability",
    "operator_action",
    "diagnostic_card"
  ],
  "fields": {
    "trace_id": {
      "title": "Trace Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "request_id": {
      "title": "Request Id",
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
    "diagnosis_verdict": {
      "required": true,
      "nullable": false,
      "ref": "DiagnosisVerdictResponse"
    },
    "owner": {
      "title": "Owner",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "recoverability": {
      "title": "Recoverability",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "operator_action": {
      "title": "Operator Action",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "diagnostic_card": {
      "required": true,
      "nullable": false,
      "ref": "DiagnosticCardResponse"
    },
    "evidence": {
      "title": "Evidence",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "next_steps": {
      "title": "Next Steps",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
