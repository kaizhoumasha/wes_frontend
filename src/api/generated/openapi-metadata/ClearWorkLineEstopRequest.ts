/**
 * 自动生成的 OpenAPI schema 字段元数据: ClearWorkLineEstopRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ClearWorkLineEstopRequestMetadata = {
  "title": "ClearWorkLineEstopRequest",
  "description": "人工清除 WorkLine 急停请求。",
  "required": [],
  "fields": {
    "checks": {
      "title": "Checks",
      "description": "恢复 checklist；所有项必须为 true",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "reason": {
      "title": "Reason",
      "description": "恢复说明",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 500
    }
  }
} satisfies OpenApiSchemaMetadata
