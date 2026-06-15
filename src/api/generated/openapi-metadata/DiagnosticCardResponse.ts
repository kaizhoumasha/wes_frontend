/**
 * 自动生成的 OpenAPI schema 字段元数据: DiagnosticCardResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DiagnosticCardResponseMetadata = {
  "title": "DiagnosticCardResponse",
  "required": [
    "title",
    "summary",
    "error_code",
    "error_domain",
    "severity",
    "recoverability",
    "problem_class",
    "user_message",
    "context"
  ],
  "fields": {
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
    "error_code": {
      "title": "Error Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "error_domain": {
      "title": "Error Domain",
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
    "recoverability": {
      "title": "Recoverability",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "problem_class": {
      "title": "Problem Class",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "user_message": {
      "title": "User Message",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "operator_action": {
      "title": "Operator Action",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "technical_summary": {
      "title": "Technical Summary",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "next_steps": {
      "title": "Next Steps",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "context": {
      "required": true,
      "nullable": false,
      "ref": "TraceDiagnosticContextItem"
    }
  }
} satisfies OpenApiSchemaMetadata
