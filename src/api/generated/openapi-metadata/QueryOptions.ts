/**
 * 自动生成的 OpenAPI schema 字段元数据: QueryOptions
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const QueryOptionsMetadata = {
  "title": "QueryOptions",
  "description": "查询选项",
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
    },
    "offset": {
      "title": "Offset",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0,
      "minimum": 0
    },
    "limit": {
      "title": "Limit",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 10,
      "minimum": 1,
      "maximum": 100
    },
    "max_depth": {
      "title": "Max Depth",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 1,
      "minimum": 0,
      "maximum": 3
    },
    "include_deleted": {
      "title": "Include Deleted",
      "description": "是否包含已删除记录",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    }
  }
} satisfies OpenApiSchemaMetadata
