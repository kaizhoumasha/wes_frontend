/**
 * 自动生成的 OpenAPI schema 字段元数据: TraceDetailResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TraceDetailResponseMetadata = {
  "title": "TraceDetailResponse",
  "required": [
    "trace",
    "summary"
  ],
  "fields": {
    "trace": {
      "required": true,
      "nullable": false,
      "ref": "TraceContextResponse"
    },
    "summary": {
      "required": true,
      "nullable": false,
      "ref": "TraceOverviewSummary"
    },
    "session": {
      "required": false,
      "nullable": true,
      "ref": "TraceSessionItem"
    },
    "sessions": {
      "title": "Sessions",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "TraceSessionItem"
      }
    },
    "callback_logs": {
      "title": "Callback Logs",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "TraceCallbackLogItem"
      }
    },
    "inboxes": {
      "title": "Inboxes",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "TraceInboxItem"
      }
    },
    "commands": {
      "title": "Commands",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "TraceCommandItem"
      }
    },
    "outboxes": {
      "title": "Outboxes",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "TraceOutboxItem"
      }
    },
    "dispatch_attempts": {
      "title": "Dispatch Attempts",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "TraceDispatchAttemptItem"
      }
    },
    "timelines": {
      "title": "Timelines",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "TraceTimelineItem"
      }
    },
    "diagnostics": {
      "title": "Diagnostics",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "TraceDiagnosticItem"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
