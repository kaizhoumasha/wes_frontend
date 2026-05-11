/**
 * 自动生成的 OpenAPI schema 字段元数据: NgReturnItemResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const NgReturnItemResponseMetadata = {
  "title": "NgReturnItemResponse",
  "description": "NG return item response.",
  "required": [
    "id",
    "source_workline_id",
    "source_session_id",
    "material_identity_key",
    "material_identity_json",
    "physical_handoff_evidence_json",
    "disposition",
    "ng_reason_source",
    "ng_reason_code",
    "ng_reason_label",
    "status"
  ],
  "fields": {
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "source_workline_id": {
      "title": "Source Workline Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "source_session_id": {
      "title": "Source Session Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "source_command_id": {
      "title": "Source Command Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "source_event_id": {
      "title": "Source Event Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "material_identity_key": {
      "title": "Material Identity Key",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "material_identity_json": {
      "title": "Material Identity Json",
      "type": "object",
      "required": true,
      "nullable": false
    },
    "physical_handoff_evidence_json": {
      "title": "Physical Handoff Evidence Json",
      "type": "object",
      "required": true,
      "nullable": false
    },
    "disposition": {
      "title": "Disposition",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "ng_reason_source": {
      "title": "Ng Reason Source",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "ng_reason_code": {
      "title": "Ng Reason Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "ng_reason_label": {
      "title": "Ng Reason Label",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "operator_note": {
      "title": "Operator Note",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "created_from_runtime_hold_id": {
      "title": "Created From Runtime Hold Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "confirmed_by": {
      "title": "Confirmed By",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "confirmed_at": {
      "title": "Confirmed At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "created_at": {
      "title": "Created At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
