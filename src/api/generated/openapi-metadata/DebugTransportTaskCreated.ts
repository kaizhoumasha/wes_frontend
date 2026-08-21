/**
 * 自动生成的 OpenAPI schema 字段元数据: DebugTransportTaskCreated
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DebugTransportTaskCreatedMetadata = {
  "title": "DebugTransportTaskCreated",
  "required": [
    "transport_task_id",
    "client_request_id"
  ],
  "additionalProperties": false,
  "fields": {
    "transport_task_id": {
      "title": "Transport Task Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "client_request_id": {
      "title": "Client Request Id",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
