/**
 * 自动生成的 OpenAPI schema 字段元数据: AppStatus
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const AppStatusMetadata = {
  "title": "AppStatus",
  "required": [],
  "fields": {
    "__enum": {
      "title": "AppStatus",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "active",
        "revoked",
        "expired"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
