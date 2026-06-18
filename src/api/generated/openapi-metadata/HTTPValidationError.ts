/**
 * 自动生成的 OpenAPI schema 字段元数据: HTTPValidationError
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const HTTPValidationErrorMetadata = {
  "title": "HTTPValidationError",
  "required": [],
  "fields": {
    "detail": {
      "title": "Detail",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "ValidationError"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
