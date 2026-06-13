/**
 * 自动生成的 OpenAPI schema 字段元数据: PositionCarrierCapability
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PositionCarrierCapabilityMetadata = {
  "title": "PositionCarrierCapability",
  "description": "WES 管理货架停靠位的货架/槽位承载能力。",
  "required": [
    "min_capacity",
    "max_capacity"
  ],
  "fields": {
    "allowed_rack_kinds": {
      "title": "Allowed Rack Kinds",
      "description": "停靠位允许承载的货架类型",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "min_capacity": {
      "title": "Min Capacity",
      "description": "停靠位最小承载容量限制",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "max_capacity": {
      "title": "Max Capacity",
      "description": "停靠位最大承载容量限制",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "allowed_slot_kinds": {
      "title": "Allowed Slot Kinds",
      "description": "停靠位允许承载的槽位类型",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
