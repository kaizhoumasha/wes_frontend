/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneEdge
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneEdgeMetadata = {
  "title": "PlaneEdge",
  "description": "Plane scene edge.",
  "required": [
    "code",
    "from_code",
    "to_code"
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
    "from_code": {
      "title": "From Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    },
    "label": {
      "title": "Label",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 120
    },
    "to_code": {
      "title": "To Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    }
  }
} satisfies OpenApiSchemaMetadata
