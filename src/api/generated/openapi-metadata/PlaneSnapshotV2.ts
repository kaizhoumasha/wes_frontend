/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneSnapshotV2
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneSnapshotV2Metadata = {
  "title": "PlaneSnapshotV2",
  "description": "资源中心的 WorkLine plane 动态 snapshot；与 plane.snapshot.v1 并存，互不改变语义。",
  "required": [
    "schema_version",
    "source_status"
  ],
  "additionalProperties": false,
  "fields": {
    "generated_at": {
      "title": "Generated At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "resource_states": {
      "title": "Resource States",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "PlaneResourceState"
      }
    },
    "scene_revision": {
      "title": "Scene Revision",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 64
    },
    "schema_version": {
      "title": "Schema Version",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "source_status": {
      "required": true,
      "nullable": false,
      "enum": [
        "COMPLETE",
        "PARTIAL",
        "FAILED",
        "STALE"
      ],
      "ref": "PlaneSnapshotSourceStatus"
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
    "unmapped_object_count": {
      "title": "Unmapped Object Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0,
      "minimum": 0
    }
  }
} satisfies OpenApiSchemaMetadata
