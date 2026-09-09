/**
 * 自动生成的 OpenAPI schema 字段元数据: IntegrationRunResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const IntegrationRunResponseMetadata = {
  "title": "IntegrationRunResponse",
  "required": [
    "run_id",
    "workline_id",
    "workline_code",
    "scenario_key",
    "expected_plugin_key",
    "profile",
    "environment_label",
    "operator_user_id",
    "status",
    "current_phase",
    "version",
    "task_id",
    "issued_operation_id",
    "bin_code",
    "device_code",
    "rack_id",
    "plan_resources",
    "site_configuration",
    "operation_context",
    "attention_code",
    "attention_detail",
    "wms_cleanup_confirmed",
    "site_cleanup_confirmed",
    "created_at",
    "updated_at",
    "steps"
  ],
  "additionalProperties": false,
  "fields": {
    "attention_code": {
      "title": "Attention Code",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "attention_detail": {
      "title": "Attention Detail",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "bin_code": {
      "title": "Bin Code",
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
    "current_phase": {
      "title": "Current Phase",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "device_code": {
      "title": "Device Code",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "environment_label": {
      "title": "Environment Label",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "expected_plugin_key": {
      "title": "Expected Plugin Key",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "issued_operation_id": {
      "title": "Issued Operation Id",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "operation_context": {
      "title": "Operation Context",
      "type": "object",
      "required": true,
      "nullable": false
    },
    "operator_user_id": {
      "title": "Operator User Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "plan_resources": {
      "title": "Plan Resources",
      "type": "object",
      "required": true,
      "nullable": true
    },
    "profile": {
      "required": true,
      "nullable": false,
      "enum": [
        "CONTRACT_SIMULATION",
        "DEVICE_INTEGRATION",
        "FULL_SITE_INTEGRATION"
      ],
      "ref": "IntegrationDebugProfile"
    },
    "rack_id": {
      "title": "Rack Id",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "run_id": {
      "title": "Run Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "scenario_key": {
      "title": "Scenario Key",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "site_cleanup_confirmed": {
      "title": "Site Cleanup Confirmed",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "site_configuration": {
      "title": "Site Configuration",
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
    "steps": {
      "title": "Steps",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "IntegrationRunStepResponse"
      }
    },
    "task_id": {
      "title": "Task Id",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "updated_at": {
      "title": "Updated At",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "version": {
      "title": "Version",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "wms_cleanup_confirmed": {
      "title": "Wms Cleanup Confirmed",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "workline_code": {
      "title": "Workline Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "workline_id": {
      "title": "Workline Id",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
