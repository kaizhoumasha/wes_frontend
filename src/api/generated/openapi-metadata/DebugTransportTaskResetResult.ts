/**
 * 自动生成的 OpenAPI schema 字段元数据: DebugTransportTaskResetResult
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DebugTransportTaskResetResultMetadata = {
  "title": "DebugTransportTaskResetResult",
  "required": [
    "transport_task_id",
    "deleted_member_count",
    "deleted_binding_count"
  ],
  "additionalProperties": false,
  "fields": {
    "deleted_binding_count": {
      "title": "Deleted Binding Count",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "deleted_member_count": {
      "title": "Deleted Member Count",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "transport_task_id": {
      "title": "Transport Task Id",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
