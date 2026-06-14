/**
 * 自动生成的 OpenAPI schema 字段元数据: TraceTimelineItem
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TraceTimelineItemMetadata = {
  "title": "TraceTimelineItem",
  "required": [
    "id",
    "session_id",
    "workline_id",
    "seq_no",
    "occurred_at",
    "stage",
    "action_type",
    "actor_type",
    "status"
  ],
  "fields": {
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "session_id": {
      "title": "Session Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "workline_id": {
      "title": "Workline Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "trace_id": {
      "title": "Trace Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "seq_no": {
      "title": "Seq No",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "occurred_at": {
      "title": "Occurred At",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "stage": {
      "title": "Stage",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "action_type": {
      "title": "Action Type",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "actor_type": {
      "title": "Actor Type",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "actor_code": {
      "title": "Actor Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "from_status": {
      "title": "From Status",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "to_status": {
      "title": "To Status",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "failure_domain": {
      "title": "Failure Domain",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "message": {
      "title": "Message",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "payload_json": {
      "title": "Payload Json",
      "type": "object",
      "required": false,
      "nullable": true
    },
    "related_inbox_id": {
      "title": "Related Inbox Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "related_command_id": {
      "title": "Related Command Id",
      "type": "integer",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
