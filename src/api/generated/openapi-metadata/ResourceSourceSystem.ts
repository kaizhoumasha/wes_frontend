/**
 * 自动生成的 OpenAPI schema 字段元数据: ResourceSourceSystem
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ResourceSourceSystemMetadata = {
  "title": "ResourceSourceSystem",
  "description": "资源事实来源系统。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "ResourceSourceSystem",
      "description": "资源事实来源系统。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "WMS",
        "RCS",
        "ECS",
        "WES_RUNTIME",
        "MANUAL_IMPORT",
        "MANUAL"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
