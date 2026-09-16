/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneActiveObjectsV2
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneActiveObjectsV2Metadata = {
  "title": "PlaneActiveObjectsV2",
  "description": "资源中心的 WorkLine active objects；与 v1 并存，互不改变语义。",
  "required": [
    "workline_id"
  ],
  "additionalProperties": false,
  "fields": {
    "objects": {
      "title": "Objects",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "PlaneActiveObjectView"
      }
    },
    "scene_revision": {
      "title": "Scene Revision",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 64
    },
    "total_count": {
      "title": "Total Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0,
      "minimum": 0
    },
    "truncated": {
      "title": "Truncated",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "workline_id": {
      "title": "Workline Id",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
