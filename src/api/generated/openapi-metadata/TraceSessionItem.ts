/**
 * 自动生成的 OpenAPI schema 字段元数据: TraceSessionItem
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TraceSessionItemMetadata = {
  "title": "TraceSessionItem",
  "required": [
    "id",
    "session_code",
    "workline_id",
    "plugin_key",
    "run_mode",
    "status",
    "context_json"
  ],
  "fields": {
    "id": {
      "title": "Id",
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
    "workline_id": {
      "title": "Workline Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "plugin_key": {
      "title": "Plugin Key",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "run_mode": {
      "title": "Run Mode",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "business_key": {
      "title": "Business Key",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "barcode": {
      "title": "Barcode",
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
    "step_code": {
      "title": "Step Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "trace_id": {
      "title": "Trace Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "started_at": {
      "title": "Started At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "ended_at": {
      "title": "Ended At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "current_wait_type": {
      "title": "Current Wait Type",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "current_wait_token": {
      "title": "Current Wait Token",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "current_wait_timeout_seconds": {
      "title": "Current Wait Timeout Seconds",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "waiting_since": {
      "title": "Waiting Since",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "deadline_at": {
      "title": "Deadline At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "awaiting_command_id": {
      "title": "Awaiting Command Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "reconciliation_state": {
      "title": "Reconciliation State",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "reconciliation_reason": {
      "title": "Reconciliation Reason",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "reconciliation_source_kind": {
      "title": "Reconciliation Source Kind",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "reconciliation_source_inbox_id": {
      "title": "Reconciliation Source Inbox Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "reconciliation_source_outbox_id": {
      "title": "Reconciliation Source Outbox Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "reconciliation_command_id": {
      "title": "Reconciliation Command Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "reconciliation_device_id": {
      "title": "Reconciliation Device Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "reconciliation_wait_token": {
      "title": "Reconciliation Wait Token",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "reconciliation_ack_received_at": {
      "title": "Reconciliation Ack Received At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "reconciliation_deadline_at": {
      "title": "Reconciliation Deadline At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "reconciliation_occurred_at": {
      "title": "Reconciliation Occurred At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "reconciliation_late_evidence_received": {
      "title": "Reconciliation Late Evidence Received",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "reconciliation_resolution": {
      "title": "Reconciliation Resolution",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "reconciliation_resolved_at": {
      "title": "Reconciliation Resolved At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "required_operator_action": {
      "title": "Required Operator Action",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "failure_domain": {
      "title": "Failure Domain",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "failure_code": {
      "title": "Failure Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "failure_message": {
      "title": "Failure Message",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "ingress_count": {
      "title": "Ingress Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "last_request_id": {
      "title": "Last Request Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "last_ingress_at": {
      "title": "Last Ingress At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "last_inbox_id": {
      "title": "Last Inbox Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "context_json": {
      "title": "Context Json",
      "type": "object",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
