/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneObjectSnapshot
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneObjectSnapshotMetadata = {
  "title": "PlaneObjectSnapshot",
  "description": "Plane snapshot object state.",
  "required": [
    "object_code",
    "object_label",
    "state"
  ],
  "additionalProperties": false,
  "fields": {
    "object_code": {
      "title": "Object Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    },
    "object_label": {
      "title": "Object Label",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    },
    "state": {
      "title": "State",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 80
    }
  }
} satisfies OpenApiSchemaMetadata
