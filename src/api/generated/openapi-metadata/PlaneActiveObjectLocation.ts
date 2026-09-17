/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneActiveObjectLocation
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneActiveObjectLocationMetadata = {
  "title": "PlaneActiveObjectLocation",
  "description": "Active Objects v2 的位置证据摘要；与 v1 同源，仅冲突状态改为字面量。",
  "required": [
    "location_scope",
    "location_code",
    "conflict_state"
  ],
  "additionalProperties": false,
  "fields": {
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
