/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeWorklineReadiness
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeWorklineReadinessMetadata = {
  "title": "RuntimeWorklineReadiness",
  "required": [],
  "fields": {
    "__enum": {
      "title": "RuntimeWorklineReadiness",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "READY",
        "NOT_READY",
        "UNKNOWN"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
