/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeHoldSummary
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeHoldSummaryMetadata = {
  "title": "RuntimeHoldSummary",
  "description": "Runtime Hold summary.",
  "required": [
    "id",
    "hold_type",
    "status",
    "blocking",
    "workline_id",
    "source_reason",
    "version"
  ],
  "fields": {
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "hold_type": {
      "title": "Hold Type",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "blocking": {
      "title": "Blocking",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "workline_id": {
      "title": "Workline Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "session_id": {
      "title": "Session Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "trace_id": {
      "title": "Trace Id",
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
    "source_reason": {
      "title": "Source Reason",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "material_disposition": {
      "title": "Material Disposition",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "ng_reason_code": {
      "title": "Ng Reason Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "ng_reason_label": {
      "title": "Ng Reason Label",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "version": {
      "title": "Version",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "created_at": {
      "title": "Created At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "resolved_at": {
      "title": "Resolved At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "resolved_by": {
      "title": "Resolved By",
      "type": "integer",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
