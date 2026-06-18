/**
 * 自动生成的 OpenAPI schema 字段元数据: SmtInboundHandoffActionResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const SmtInboundHandoffActionResponseMetadata = {
  "title": "SmtInboundHandoffActionResponse",
  "description": "SMT 入库 handoff 手工动作响应。",
  "required": [
    "id",
    "status"
  ],
  "fields": {
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "available_actions": {
      "title": "Available Actions",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
