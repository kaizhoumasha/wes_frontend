/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeWorklineSummary
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeWorklineSummaryMetadata = {
  "title": "RuntimeWorklineSummary",
  "required": [
    "id",
    "line_code",
    "line_name",
    "line_type",
    "is_active"
  ],
  "fields": {
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "line_code": {
      "title": "Line Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "line_name": {
      "title": "Line Name",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "line_type": {
      "title": "Line Type",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "zone_name": {
      "title": "Zone Name",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "plugin_key": {
      "title": "Plugin Key",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "contract_version": {
      "title": "Contract Version",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "is_active": {
      "title": "Is Active",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "device_count": {
      "title": "Device Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "active_session_count": {
      "title": "Active Session Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "waiting_session_count": {
      "title": "Waiting Session Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "failed_session_count": {
      "title": "Failed Session Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "error_device_count": {
      "title": "Error Device Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "offline_device_count": {
      "title": "Offline Device Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "maintenance_device_count": {
      "title": "Maintenance Device Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "run_mode": {
      "title": "Run Mode",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "AUTO"
    },
    "runtime_status": {
      "title": "Runtime Status",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "STOPPED"
    },
    "active_safety_incident_id": {
      "title": "Active Safety Incident Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "stopped_at": {
      "title": "Stopped At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "stopped_reason": {
      "title": "Stopped Reason",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "resumed_at": {
      "title": "Resumed At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "start_admission_status": {
      "title": "Start Admission Status",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "start_admission_message": {
      "title": "Start Admission Message",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "start_admission_failed_device_code": {
      "title": "Start Admission Failed Device Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "start_admission_checked_at": {
      "title": "Start Admission Checked At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "last_start_request_id": {
      "title": "Last Start Request Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "last_start_trace_id": {
      "title": "Last Start Trace Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "last_activity_at": {
      "title": "Last Activity At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
