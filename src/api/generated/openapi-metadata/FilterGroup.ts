/**
 * 自动生成的 OpenAPI schema 字段元数据: FilterGroup
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const FilterGroupMetadata = {
  "title": "FilterGroup",
  "description": "过滤条件组",
  "required": [],
  "fields": {
    "couple": {
      "title": "Couple",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "and",
      "enum": [
        "and",
        "or",
        "not"
      ]
    },
    "conditions": {
      "title": "Conditions",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {}
    }
  }
} satisfies OpenApiSchemaMetadata
