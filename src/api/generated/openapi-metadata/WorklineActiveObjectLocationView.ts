/**
 * 自动生成的 OpenAPI schema 字段元数据: WorklineActiveObjectLocationView
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorklineActiveObjectLocationViewMetadata = {
  "title": "WorklineActiveObjectLocationView",
  "description": "来自具体 Resource projection 的当前位置证据。",
  "required": [
    "location_scope",
    "location_code",
    "conflict_state"
  ],
  "fields": {
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
    "location_code": {
      "title": "Location Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "location_scope": {
      "title": "Location Scope",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
