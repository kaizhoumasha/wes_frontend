/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeWorklineReadiness
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeWorklineReadinessMetadata = {
  "title": "RuntimeWorklineReadiness",
  "description": "产线启动准入与运行准备状态。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "RuntimeWorklineReadiness",
      "description": "产线启动准入与运行准备状态。",
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
