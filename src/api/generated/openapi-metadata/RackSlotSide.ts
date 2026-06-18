/**
 * 自动生成的 OpenAPI schema 字段元数据: RackSlotSide
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RackSlotSideMetadata = {
  "title": "RackSlotSide",
  "description": "货架槽位面。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "RackSlotSide",
      "description": "货架槽位面。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "A",
        "B",
        "NONE"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
