/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeMonitorCommandSnapshot
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeMonitorCommandSnapshotMetadata = {
  "title": "RuntimeMonitorCommandSnapshot",
  "description": "运行监控视图中的设备当前指令快照。\n\n字段固定，专供 dashboard ECS ACK 链消费；不引入业务流转字段。",
  "required": [
    "id",
    "command_code",
    "status"
  ],
  "fields": {
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "command_code": {
      "title": "Command Code",
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
    "sent_at": {
      "title": "Sent At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "ack_received_at": {
      "title": "Ack Received At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "ack_code": {
      "title": "Ack Code",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "ack_message": {
      "title": "Ack Message",
      "type": "string",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
