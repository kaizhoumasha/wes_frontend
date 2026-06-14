/**
 * 自动生成的 OpenAPI schema 字段元数据: TraceDispatchAttemptItem
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TraceDispatchAttemptItemMetadata = {
  "title": "TraceDispatchAttemptItem",
  "required": [
    "id",
    "outbox_id",
    "dispatch_key",
    "attempt_no",
    "lease_token",
    "status",
    "started_at"
  ],
  "fields": {
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "outbox_id": {
      "title": "Outbox Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "dispatch_key": {
      "title": "Dispatch Key",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "attempt_no": {
      "title": "Attempt No",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "lease_token": {
      "title": "Lease Token",
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
    "target_type": {
      "title": "Target Type",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "target_code": {
      "title": "Target Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "started_at": {
      "title": "Started At",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "finalized_at": {
      "title": "Finalized At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "error_message": {
      "title": "Error Message",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "response_json": {
      "title": "Response Json",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "trace_json": {
      "title": "Trace Json",
      "type": "object",
      "required": false,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
