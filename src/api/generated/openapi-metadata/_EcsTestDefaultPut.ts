/**
 * 自动生成的 OpenAPI schema 字段元数据: _EcsTestDefaultPut
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const _EcsTestDefaultPutMetadata = {
  "title": "_EcsTestDefaultPut",
  "required": [
    "default"
  ],
  "additionalProperties": false,
  "fields": {
    "default": {
      "required": true,
      "nullable": true,
      "ref": "_EcsTestDefaultRule"
    }
  }
} satisfies OpenApiSchemaMetadata
