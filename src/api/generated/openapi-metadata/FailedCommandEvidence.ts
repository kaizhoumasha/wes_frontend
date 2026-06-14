/**
 * 自动生成的 OpenAPI schema 字段元数据: FailedCommandEvidence
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const FailedCommandEvidenceMetadata = {
  "title": "FailedCommandEvidence",
  "description": "Failed command evidence for operator review.",
  "required": [],
  "fields": {
    "command_id": {
      "title": "Command Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "command_code": {
      "title": "Command Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "result": {
      "title": "Result",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "error_detail": {
      "title": "Error Detail",
      "type": "object",
      "required": false,
      "nullable": true
    },
    "result_data": {
      "title": "Result Data",
      "type": "object",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
