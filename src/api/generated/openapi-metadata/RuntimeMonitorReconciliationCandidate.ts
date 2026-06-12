/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeMonitorReconciliationCandidate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeMonitorReconciliationCandidateMetadata = {
  "title": "RuntimeMonitorReconciliationCandidate",
  "required": [
    "session_id",
    "session_code",
    "reason",
    "source_kind",
    "occurred_at"
  ],
  "fields": {
    "session_id": {
      "title": "Session Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "session_code": {
      "title": "Session Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "trace_id": {
      "title": "Trace Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "request_id": {
      "title": "Request Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "reason": {
      "title": "Reason",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "source_kind": {
      "title": "Source Kind",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "device_id": {
      "title": "Device Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "command_id": {
      "title": "Command Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "wait_token": {
      "title": "Wait Token",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "occurred_at": {
      "title": "Occurred At",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "deadline_at": {
      "title": "Deadline At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "late_evidence_received": {
      "title": "Late Evidence Received",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    }
  }
} satisfies OpenApiSchemaMetadata
