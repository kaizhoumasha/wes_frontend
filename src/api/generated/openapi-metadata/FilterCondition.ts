/**
 * 自动生成的 OpenAPI schema 字段元数据: FilterCondition
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const FilterConditionMetadata = {
  "title": "FilterCondition",
  "description": "单个过滤条件",
  "required": [
    "field",
    "op"
  ],
  "fields": {
    "field": {
      "title": "Field",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "op": {
      "required": true,
      "nullable": false,
      "enum": [
        "eq",
        "ne",
        "gt",
        "ge",
        "lt",
        "le",
        "in",
        "nin",
        "ilike",
        "between",
        "is_null",
        "not_null"
      ],
      "ref": "FilterOperator"
    },
    "value": {
      "title": "Value",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
