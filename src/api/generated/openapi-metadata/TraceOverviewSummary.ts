/**
 * 自动生成的 OpenAPI schema 字段元数据: TraceOverviewSummary
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TraceOverviewSummaryMetadata = {
  "title": "TraceOverviewSummary",
  "description": "Trace 详情页顶部摘要。",
  "required": [],
  "fields": {
    "callback_logs": {
      "title": "Callback Logs",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "inboxes": {
      "title": "Inboxes",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "commands": {
      "title": "Commands",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "outboxes": {
      "title": "Outboxes",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "timelines": {
      "title": "Timelines",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "diagnostics": {
      "title": "Diagnostics",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "session_status": {
      "title": "Session Status",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "current_wait_type": {
      "title": "Current Wait Type",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "latest_timeline_action": {
      "title": "Latest Timeline Action",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "latest_timeline_status": {
      "title": "Latest Timeline Status",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "latest_timeline_message": {
      "title": "Latest Timeline Message",
      "type": "string",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
