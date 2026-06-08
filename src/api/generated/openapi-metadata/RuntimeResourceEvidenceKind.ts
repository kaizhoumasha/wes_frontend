/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeResourceEvidenceKind
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeResourceEvidenceKindMetadata = {
  "title": "RuntimeResourceEvidenceKind",
  "required": [],
  "fields": {
    "__enum": {
      "title": "RuntimeResourceEvidenceKind",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "WES_ACTIVE_SNAPSHOT",
        "WMS_CALLBACK_EVIDENCE",
        "TRACE_RESOURCE_EVIDENCE",
        "GENERIC_EVIDENCE",
        "UNKNOWN"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
