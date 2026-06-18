/**
 * 自动生成的 OpenAPI schema 字段元数据: ValidityPeriod
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ValidityPeriodMetadata = {
  "title": "ValidityPeriod",
  "description": "有效期枚举",
  "required": [],
  "fields": {
    "__enum": {
      "title": "ValidityPeriod",
      "description": "有效期枚举",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "1d",
        "1w",
        "1m",
        "6m",
        "1y",
        "never"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
