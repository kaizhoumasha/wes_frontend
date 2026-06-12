/**
 * 自动生成的 OpenAPI schema 字段元数据: SmtInboundHandoffDemandDetailResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const SmtInboundHandoffDemandDetailResponseMetadata = {
  "title": "SmtInboundHandoffDemandDetailResponse",
  "description": "SMT 入库 handoff demand 详情投影。",
  "required": [
    "id",
    "demand_key",
    "rack_release_id",
    "single_layer_rack_code",
    "status"
  ],
  "fields": {
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "demand_key": {
      "title": "Demand Key",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "rack_release_id": {
      "title": "Rack Release Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "source_workline_id": {
      "title": "Source Workline Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "source_workline_code": {
      "title": "Source Workline Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "target_workline_id": {
      "title": "Target Workline Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "target_workline_code": {
      "title": "Target Workline Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "single_layer_rack_code": {
      "title": "Single Layer Rack Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "release_reason_code": {
      "title": "Release Reason Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "decision_status": {
      "title": "Decision Status",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "handling_operation_key": {
      "title": "Handling Operation Key",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "sorting_source_demand_key": {
      "title": "Sorting Source Demand Key",
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
    "trace_id": {
      "title": "Trace Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "item_status_counts": {
      "title": "Item Status Counts",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "handling_trace_summary": {
      "title": "Handling Trace Summary",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "claim_recovery_summary": {
      "title": "Claim Recovery Summary",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "available_actions": {
      "title": "Available Actions",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "release_snapshot": {
      "title": "Release Snapshot",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "source_items": {
      "title": "Source Items",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "SmtInboundHandoffSourceItemDetailResponse"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
