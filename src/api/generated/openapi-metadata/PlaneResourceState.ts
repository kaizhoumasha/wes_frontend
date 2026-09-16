/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneResourceState
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneResourceStateMetadata = {
  "title": "PlaneResourceState",
  "description": "单个资源在当前 Snapshot 下的活动摘要；只在 source_status=COMPLETE 时可信。",
  "required": [
    "resource_ref",
    "active_object_count",
    "highest_conflict_state"
  ],
  "additionalProperties": false,
  "fields": {
    "active_object_count": {
      "title": "Active Object Count",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "highest_conflict_state": {
      "title": "Highest Conflict State",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "OK",
        "TRANSIENT",
        "RECONCILING"
      ]
    },
    "resource_ref": {
      "required": true,
      "nullable": false,
      "ref": "PlaneResourceRef"
    }
  }
} satisfies OpenApiSchemaMetadata
