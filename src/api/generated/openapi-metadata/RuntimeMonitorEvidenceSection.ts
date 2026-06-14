/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeMonitorEvidenceSection
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeMonitorEvidenceSectionMetadata = {
  "title": "RuntimeMonitorEvidenceSection",
  "required": [],
  "fields": {
    "kind": {
      "required": false,
      "nullable": false,
      "default": "UNKNOWN",
      "enum": [
        "WES_ACTIVE_SNAPSHOT",
        "WMS_CALLBACK_EVIDENCE",
        "TRACE_RESOURCE_EVIDENCE",
        "GENERIC_EVIDENCE",
        "UNKNOWN"
      ],
      "ref": "RuntimeResourceEvidenceKind"
    },
    "items": {
      "title": "Items",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RuntimeResourceEvidenceItem"
      }
    },
    "total_count": {
      "title": "Total Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "truncated": {
      "title": "Truncated",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    }
  }
} satisfies OpenApiSchemaMetadata
