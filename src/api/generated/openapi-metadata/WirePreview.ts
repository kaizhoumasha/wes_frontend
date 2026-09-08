/**
 * 自动生成的 OpenAPI schema 字段元数据: WirePreview
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WirePreviewMetadata = {
  "title": "WirePreview",
  "required": [],
  "additionalProperties": false,
  "fields": {
    "body": {
      "title": "Body",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "headers": {
      "title": "Headers",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "array"
      }
    },
    "source": {
      "title": "Source",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "NOT_CAPTURED",
      "enum": [
        "WIRE",
        "FROZEN_PAYLOAD",
        "NOT_CAPTURED"
      ]
    },
    "state": {
      "title": "State",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "NOT_CAPTURED",
      "enum": [
        "CAPTURED",
        "TRUNCATED",
        "UNSAFE_JSON",
        "EMPTY",
        "NOT_CAPTURED",
        "NO_RESPONSE"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
