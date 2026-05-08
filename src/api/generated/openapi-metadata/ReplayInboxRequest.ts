/**
 * 自动生成的 OpenAPI schema 字段元数据: ReplayInboxRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ReplayInboxRequestMetadata = {
  "title": "ReplayInboxRequest",
  "description": "Replay 请求。",
  "required": [
    "reason"
  ],
  "fields": {
    "reason": {
      "title": "Reason",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 500
    },
    "operator_id": {
      "title": "Operator Id",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 100
    }
  }
} satisfies OpenApiSchemaMetadata
