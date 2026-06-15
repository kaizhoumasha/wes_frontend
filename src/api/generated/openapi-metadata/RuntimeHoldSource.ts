/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeHoldSource
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeHoldSourceMetadata = {
  "title": "RuntimeHoldSource",
  "description": "Runtime Hold source refs.",
  "required": [
    "source_kind",
    "source_reason",
    "source_idempotency_key"
  ],
  "fields": {
    "source_kind": {
      "title": "Source Kind",
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
    "source_inbox_id": {
      "title": "Source Inbox Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "source_outbox_id": {
      "title": "Source Outbox Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "source_command_id": {
      "title": "Source Command Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "source_device_id": {
      "title": "Source Device Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "source_idempotency_key": {
      "title": "Source Idempotency Key",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
