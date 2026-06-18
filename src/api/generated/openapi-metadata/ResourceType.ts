/**
 * 自动生成的 OpenAPI schema 字段元数据: ResourceType
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ResourceTypeMetadata = {
  "title": "ResourceType",
  "description": "WES 运行时资源类型。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "ResourceType",
      "description": "WES 运行时资源类型。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "RACK",
        "BIN",
        "MATERIAL"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
