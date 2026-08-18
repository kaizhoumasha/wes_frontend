/**
 * 自动生成的 OpenAPI schema 字段元数据: MaterialLocationResult
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const MaterialLocationResultMetadata = {
  "title": "MaterialLocationResult",
  "description": "统一位置查询结果。",
  "required": [
    "query_entry",
    "conflict_state"
  ],
  "fields": {
    "query_entry": {
      "title": "Query Entry",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "conflict_state": {
      "required": true,
      "nullable": false,
      "enum": [
        "OK",
        "NOT_FOUND",
        "RECONCILING",
        "WMS_UNAVAILABLE"
      ],
      "ref": "MaterialLocationConflictState"
    },
    "object_type": {
      "title": "Object Type",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "object_key": {
      "title": "Object Key",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "location_scope": {
      "title": "Location Scope",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "location_code": {
      "title": "Location Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "source": {
      "title": "Source",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "correlation_id": {
      "title": "Correlation Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "evidence": {
      "title": "Evidence",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "MaterialLocationEvidence"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
