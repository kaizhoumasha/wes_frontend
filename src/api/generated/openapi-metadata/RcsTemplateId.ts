/**
 * 自动生成的 OpenAPI schema 字段元数据: RcsTemplateId
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RcsTemplateIdMetadata = {
  "title": "RcsTemplateId",
  "required": [],
  "fields": {
    "__enum": {
      "title": "RcsTemplateId",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "CTU01",
        "CTU02",
        "CTU03",
        "F01"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
