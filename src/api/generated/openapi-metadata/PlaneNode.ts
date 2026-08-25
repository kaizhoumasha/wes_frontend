/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneNode
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneNodeMetadata = {
  "title": "PlaneNode",
  "description": "Plane scene node with stable code and display label.",
  "required": [
    "code",
    "label",
    "kind"
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
    "kind": {
      "title": "Kind",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 80
    },
    "label": {
      "title": "Label",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    }
  }
} satisfies OpenApiSchemaMetadata
