/**
 * 自动生成的 OpenAPI schema 字段元数据: RackSlotKind
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RackSlotKindMetadata = {
  "title": "RackSlotKind",
  "description": "货架槽位承载对象类型。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "RackSlotKind",
      "description": "货架槽位承载对象类型。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "BIN_SLOT",
        "MATERIAL_SLOT"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
