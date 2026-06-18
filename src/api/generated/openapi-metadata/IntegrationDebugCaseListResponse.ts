/**
 * 自动生成的 OpenAPI schema 字段元数据: IntegrationDebugCaseListResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const IntegrationDebugCaseListResponseMetadata = {
  "title": "IntegrationDebugCaseListResponse",
  "description": "最新集成调试案件列表。",
  "required": [
    "total"
  ],
  "fields": {
    "total": {
      "title": "Total",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "items": {
      "title": "Items",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "IntegrationDebugCaseResponse"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
