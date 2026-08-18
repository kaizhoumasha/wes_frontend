/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneExtremeState
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneExtremeStateMetadata = {
  "title": "PlaneExtremeState",
  "description": "Plane snapshot extreme state marker.",
  "required": [
    "code",
    "label",
    "severity"
  ],
  "additionalProperties": false,
  "fields": {
    "code": {
      "title": "Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    },
    "label": {
      "title": "Label",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    },
    "severity": {
      "title": "Severity",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 40
    }
  }
} satisfies OpenApiSchemaMetadata
