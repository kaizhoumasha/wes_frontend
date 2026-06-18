/**
 * 自动生成的 OpenAPI schema 字段元数据: ValidationError
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ValidationErrorMetadata = {
  "title": "ValidationError",
  "required": [
    "loc",
    "msg",
    "type"
  ],
  "fields": {
    "loc": {
      "title": "Location",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {}
    },
    "msg": {
      "title": "Message",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "type": {
      "title": "Error Type",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "input": {
      "title": "Input",
      "required": false,
      "nullable": false
    },
    "ctx": {
      "title": "Context",
      "type": "object",
      "required": false,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
