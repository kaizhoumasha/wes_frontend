/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneSceneDiagnostics
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneSceneDiagnosticsMetadata = {
  "title": "PlaneSceneDiagnostics",
  "description": "Scene v2 附带诊断；不创建伪造资源行。",
  "required": [],
  "additionalProperties": false,
  "fields": {
    "orphan_bindings": {
      "title": "Orphan Bindings",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "PlaneOrphanBinding"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
