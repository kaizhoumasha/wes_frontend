/**
 * 自动生成的 OpenAPI schema 字段元数据: WorklineActiveObjectsResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorklineActiveObjectsResponseMetadata = {
  "title": "WorklineActiveObjectsResponse",
  "description": "WorkLine active objects 聚合响应。",
  "required": [
    "workline_id"
  ],
  "fields": {
    "workline_id": {
      "title": "Workline Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "objects": {
      "title": "Objects",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "WorklineActiveObjectView"
      }
    },
    "truncated": {
      "title": "Truncated",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "total_count": {
      "title": "Total Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    }
  }
} satisfies OpenApiSchemaMetadata
