/**
 * 自动生成的 OpenAPI schema 字段元数据: Body_callback_logs_query_post
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const Body_callback_logs_query_postMetadata = {
  "title": "Body_callback_logs_query_post",
  "required": [],
  "fields": {
    "filters": {
      "required": false,
      "nullable": true,
      "ref": "FilterGroup"
    },
    "sort": {
      "title": "Sort",
      "type": "array",
      "required": false,
      "nullable": true,
      "items": {
        "ref": "SortField"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
