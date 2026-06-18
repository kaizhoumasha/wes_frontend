/**
 * 自动生成的 OpenAPI schema 字段元数据: NgReasonInput
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const NgReasonInputMetadata = {
  "title": "NgReasonInput",
  "description": "Operator-selected NG reason.",
  "required": [
    "source",
    "code",
    "label"
  ],
  "additionalProperties": false,
  "fields": {
    "source": {
      "title": "Source",
      "description": "NG reason source",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "code": {
      "title": "Code",
      "description": "Canonical NG reason code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "label": {
      "title": "Label",
      "description": "Human-readable NG reason label",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 200
    }
  }
} satisfies OpenApiSchemaMetadata
