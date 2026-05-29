/**
 * 自动生成的 OpenAPI schema 字段元数据: RackPlacementStatus
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RackPlacementStatusMetadata = {
  "title": "RackPlacementStatus",
  "description": "货架位置投影状态。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "RackPlacementStatus",
      "description": "货架位置投影状态。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "ARRIVED",
        "IN_TRANSIT",
        "DEPARTED",
        "UNKNOWN"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
