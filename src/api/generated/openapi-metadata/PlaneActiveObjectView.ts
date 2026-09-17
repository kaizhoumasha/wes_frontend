/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneActiveObjectView
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneActiveObjectViewMetadata = {
  "title": "PlaneActiveObjectView",
  "description": "Active Objects v2 单个对象视图；在 v1 字段基础上追加 resource_ref。",
  "required": [
    "object_type",
    "object_key",
    "conflict_state"
  ],
  "additionalProperties": false,
  "fields": {
    "all_sources": {
      "title": "All Sources",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "conflict_state": {
      "title": "Conflict State",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "OK",
        "TRANSIENT",
        "RECONCILING"
      ]
    },
    "evidence_refs": {
      "title": "Evidence Refs",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "location_summary": {
      "required": false,
      "nullable": true,
      "ref": "PlaneActiveObjectLocation"
    },
    "object_key": {
      "title": "Object Key",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "object_type": {
      "title": "Object Type",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "operator_hint": {
      "title": "Operator Hint",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "primary_source": {
      "title": "Primary Source",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "resource_ref": {
      "required": false,
      "nullable": true,
      "ref": "PlaneResourceRef"
    }
  }
} satisfies OpenApiSchemaMetadata
