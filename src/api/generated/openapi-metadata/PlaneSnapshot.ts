/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneSnapshot
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneSnapshotMetadata = {
  "title": "PlaneSnapshot",
  "description": "WorkLine plane dynamic snapshot.",
  "required": [
    "schema_version",
    "workline_code",
    "scene_schema_version",
    "objects",
    "extremes"
  ],
  "additionalProperties": false,
  "fields": {
    "schema_version": {
      "title": "Schema Version",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "workline_code": {
      "title": "Workline Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 80
    },
    "scene_schema_version": {
      "title": "Scene Schema Version",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "objects": {
      "title": "Objects",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "PlaneObjectSnapshot"
      }
    },
    "extremes": {
      "title": "Extremes",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "PlaneExtremeState"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
