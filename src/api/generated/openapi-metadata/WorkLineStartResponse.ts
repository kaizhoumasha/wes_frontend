/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLineStartResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLineStartResponseMetadata = {
  "title": "WorkLineStartResponse",
  "description": "Frozen Epoch identity and the current WorkLine projection.",
  "required": [
    "line_run_epoch_id",
    "epoch_code",
    "workline_id",
    "plugin_key",
    "plugin_version",
    "flow_mode",
    "epoch_status",
    "epoch_started_at",
    "epoch_closed_at",
    "current_workline_runtime_status",
    "created"
  ],
  "fields": {
    "line_run_epoch_id": {
      "title": "Line Run Epoch Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "epoch_code": {
      "title": "Epoch Code",
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
    "plugin_version": {
      "title": "Plugin Version",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "flow_mode": {
      "title": "Flow Mode",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "epoch_status": {
      "title": "Epoch Status",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "ACTIVE",
        "CLOSED"
      ]
    },
    "epoch_started_at": {
      "title": "Epoch Started At",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "epoch_closed_at": {
      "title": "Epoch Closed At",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": true
    },
    "current_workline_runtime_status": {
      "title": "Current Workline Runtime Status",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "created": {
      "title": "Created",
      "type": "boolean",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
