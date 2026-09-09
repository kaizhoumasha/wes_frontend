/**
 * 自动生成的 OpenAPI schema 字段元数据: IntegrationRunStepResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const IntegrationRunStepResponseMetadata = {
  "title": "IntegrationRunStepResponse",
  "required": [
    "ordinal",
    "phase",
    "status",
    "client_request_id",
    "operation",
    "operation_id",
    "wms_confirmation_id",
    "transport_task_id",
    "device_command_code",
    "request",
    "result",
    "reason_code",
    "created_at"
  ],
  "additionalProperties": false,
  "fields": {
    "client_request_id": {
      "title": "Client Request Id",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "created_at": {
      "title": "Created At",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "device_command_code": {
      "title": "Device Command Code",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "operation": {
      "title": "Operation",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "operation_id": {
      "title": "Operation Id",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "ordinal": {
      "title": "Ordinal",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "phase": {
      "title": "Phase",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "reason_code": {
      "title": "Reason Code",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "request": {
      "title": "Request",
      "type": "object",
      "required": true,
      "nullable": false
    },
    "result": {
      "title": "Result",
      "type": "object",
      "required": true,
      "nullable": false
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "transport_task_id": {
      "title": "Transport Task Id",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "wms_confirmation_id": {
      "title": "Wms Confirmation Id",
      "type": "integer",
      "required": true,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
