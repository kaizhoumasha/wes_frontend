/**
 * 自动生成的 OpenAPI schema 字段元数据: ResolveRuntimeReconciliationRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ResolveRuntimeReconciliationRequestMetadata = {
  "title": "ResolveRuntimeReconciliationRequest",
  "description": "人工运行时对账解除请求。",
  "required": [
    "resolution",
    "checks",
    "operator_note",
    "confirmed_at"
  ],
  "fields": {
    "resolution": {
      "title": "Resolution",
      "description": "人工对账决议",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "checks": {
      "title": "Checks",
      "description": "按 reconciliation_reason 要求确认的 checklist",
      "type": "object",
      "required": true,
      "nullable": false
    },
    "operator_note": {
      "title": "Operator Note",
      "description": "现场确认说明",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 1000
    },
    "result_payload": {
      "title": "Result Payload",
      "description": "COMPLETED 时可补录业务结果摘要",
      "type": "object",
      "required": false,
      "nullable": true
    },
    "confirmed_at": {
      "title": "Confirmed At",
      "description": "现场确认时间",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
