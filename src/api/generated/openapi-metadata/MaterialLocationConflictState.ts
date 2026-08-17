/**
 * 自动生成的 OpenAPI schema 字段元数据: MaterialLocationConflictState
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const MaterialLocationConflictStateMetadata = {
  "title": "MaterialLocationConflictState",
  "description": "MaterialLocationQuery 冲突状态。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "MaterialLocationConflictState",
      "description": "MaterialLocationQuery 冲突状态。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "OK",
        "NOT_FOUND",
        "RECONCILING",
        "WMS_UNAVAILABLE"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
