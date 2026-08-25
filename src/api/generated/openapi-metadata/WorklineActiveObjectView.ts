/**
 * 自动生成的 OpenAPI schema 字段元数据: WorklineActiveObjectView
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorklineActiveObjectViewMetadata = {
  "title": "WorklineActiveObjectView",
  "description": "单个 active object 只读视图。",
  "required": [
    "object_type",
    "object_key",
    "conflict_state"
  ],
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
      "required": true,
      "nullable": false,
      "enum": [
        "OK",
        "TRANSIENT",
        "RECONCILING"
      ],
      "ref": "WorklineActiveObjectConflictState"
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
      "ref": "MaterialLocationResult"
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
    "runtime_hold": {
      "required": false,
      "nullable": true,
      "ref": "RuntimeHoldView"
    }
  }
} satisfies OpenApiSchemaMetadata
