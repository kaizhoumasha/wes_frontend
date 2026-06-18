/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeTraceResourceView
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeTraceResourceViewMetadata = {
  "title": "RuntimeTraceResourceView",
  "required": [],
  "fields": {
    "active_bin_racks": {
      "title": "Active Bin Racks",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RuntimeActiveBinRackView"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
