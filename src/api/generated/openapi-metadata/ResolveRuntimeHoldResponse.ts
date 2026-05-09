/**
 * 自动生成的 OpenAPI schema 字段元数据: ResolveRuntimeHoldResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ResolveRuntimeHoldResponseMetadata = {
  "title": "ResolveRuntimeHoldResponse",
  "description": "Resolve Runtime Hold response.",
  "required": [
    "hold_id",
    "status",
    "workline_id",
    "workline_runtime_status",
    "remaining_active_blocking_holds",
    "released_outbox_count"
  ],
  "fields": {
    "hold_id": {
      "title": "Hold Id",
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
    "workline_id": {
      "title": "Workline Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "workline_runtime_status": {
      "title": "Workline Runtime Status",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "remaining_active_blocking_holds": {
      "title": "Remaining Active Blocking Holds",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "released_outbox_count": {
      "title": "Released Outbox Count",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "ng_return_item_id": {
      "title": "Ng Return Item Id",
      "type": "integer",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
