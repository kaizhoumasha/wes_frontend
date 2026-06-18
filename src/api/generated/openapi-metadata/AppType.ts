/**
 * 自动生成的 OpenAPI schema 字段元数据: AppType
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const AppTypeMetadata = {
  "title": "AppType",
  "required": [],
  "fields": {
    "__enum": {
      "title": "AppType",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "ECS",
        "RCS",
        "WMS",
        "Third-Party"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
