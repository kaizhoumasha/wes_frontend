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
  "description": "位置可承载货架/槽位能力。",
  "required": [
    "min_capacity",
    "max_capacity"
  ],
  "fields": {
    "allowed_rack_kinds": {
      "title": "Allowed Rack Kinds",
      "description": "允许货架类型",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "min_capacity": {
      "title": "Min Capacity",
      "description": "最小容量限制",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "max_capacity": {
      "title": "Max Capacity",
      "description": "最大容量限制",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "allowed_slot_kinds": {
      "title": "Allowed Slot Kinds",
      "description": "允许槽位类型",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
