/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeHoldBlocker
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeHoldBlockerMetadata = {
  "title": "RuntimeHoldBlocker",
  "description": "Another active hold blocking the same WorkLine.",
  "required": [
    "id",
    "hold_type",
    "status",
    "source_reason"
  ],
  "fields": {
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "hold_type": {
      "title": "Hold Type",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "source_reason": {
      "title": "Source Reason",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "session_id": {
      "title": "Session Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "source_device_id": {
      "title": "Source Device Id",
      "type": "integer",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
