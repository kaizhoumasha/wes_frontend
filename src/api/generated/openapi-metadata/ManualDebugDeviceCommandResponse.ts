/**
 * 自动生成的 OpenAPI schema 字段元数据: ManualDebugDeviceCommandResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ManualDebugDeviceCommandResponseMetadata = {
  "title": "ManualDebugDeviceCommandResponse",
  "required": [
    "command_code",
    "client_request_id",
    "device_code",
    "endpoint_base_url",
    "contract_key",
    "contract_version",
    "command_timeout_ms",
    "task_type",
    "params",
    "trace_id",
    "status",
    "attempt_count",
    "ack_received_at",
    "completed_at",
    "failure_code",
    "reconciliation_reason",
    "execution_reason",
    "created_by",
    "callback"
  ],
  "additionalProperties": false,
  "fields": {
    "command_code": {
      "title": "Command Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "client_request_id": {
      "title": "Client Request Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "device_code": {
      "title": "Device Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "endpoint_base_url": {
      "title": "Endpoint Base Url",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "contract_key": {
      "title": "Contract Key",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "contract_version": {
      "title": "Contract Version",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "command_timeout_ms": {
      "title": "Command Timeout Ms",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "task_type": {
      "title": "Task Type",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "params": {
      "title": "Params",
      "type": "object",
      "required": true,
      "nullable": false
    },
    "trace_id": {
      "title": "Trace Id",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "attempt_count": {
      "title": "Attempt Count",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "ack_received_at": {
      "title": "Ack Received At",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "completed_at": {
      "title": "Completed At",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "failure_code": {
      "title": "Failure Code",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "reconciliation_reason": {
      "title": "Reconciliation Reason",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "execution_reason": {
      "title": "Execution Reason",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "created_by": {
      "title": "Created By",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "callback": {
      "required": true,
      "nullable": true,
      "ref": "DeviceCommandCallbackResponse"
    }
  }
} satisfies OpenApiSchemaMetadata
