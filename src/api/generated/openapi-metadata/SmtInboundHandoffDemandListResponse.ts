/**
 * 自动生成的 OpenAPI schema 字段元数据: SmtInboundHandoffDemandListResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const SmtInboundHandoffDemandListResponseMetadata = {
  "title": "SmtInboundHandoffDemandListResponse",
  "description": "SMT 入库 handoff demand 列表响应数据。",
  "required": [],
  "fields": {
    "total": {
      "title": "Total",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0,
      "minimum": 0
    },
    "items": {
      "title": "Items",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "SmtInboundHandoffDemandSummaryResponse"
      }
    },
    "limit": {
      "title": "Limit",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 50,
      "minimum": 1
    },
    "offset": {
      "title": "Offset",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0,
      "minimum": 0
    }
  }
} satisfies OpenApiSchemaMetadata
