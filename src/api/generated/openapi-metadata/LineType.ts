/**
 * 自动生成的 OpenAPI schema 字段元数据: LineType
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const LineTypeMetadata = {
  "title": "LineType",
  "description": "作业线类型枚举。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "LineType",
      "description": "作业线类型枚举。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "AUTO",
        "MANUAL",
        "HYBRID"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
