/**
 * 自动生成的 OpenAPI schema 字段元数据: SmtInboundHandoffSourceItemDetailResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const SmtInboundHandoffSourceItemDetailResponseMetadata = {
  "title": "SmtInboundHandoffSourceItemDetailResponse",
  "description": "SMT 入库 handoff source item 详情投影。",
  "required": [
    "id",
    "status"
  ],
  "fields": {
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "item_key": {
      "title": "Item Key",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "bin_code": {
      "title": "Bin Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "bin_cell_index": {
      "title": "Bin Cell Index",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "bin_cell_code": {
      "title": "Bin Cell Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "material_identity_key": {
      "title": "Material Identity Key",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "pkg_code": {
      "title": "Pkg Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "reel_thickness_mm": {
      "title": "Reel Thickness Mm",
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
    "sorting_session_id": {
      "title": "Sorting Session Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "claim_attempt_no": {
      "title": "Claim Attempt No",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 1
    },
    "source_pick_inbox_id": {
      "title": "Source Pick Inbox Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "source_pick_command_id": {
      "title": "Source Pick Command Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "source_pick_command_code": {
      "title": "Source Pick Command Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "source_pick_dispatch_key": {
      "title": "Source Pick Dispatch Key",
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
    "source_pick_inbox": {
      "title": "Source Pick Inbox",
      "type": "object",
      "required": false,
      "nullable": true
    },
    "source_pick_command": {
      "title": "Source Pick Command",
      "type": "object",
      "required": false,
      "nullable": true
    },
    "source_pick_outbox": {
      "title": "Source Pick Outbox",
      "type": "object",
      "required": false,
      "nullable": true
    },
    "available_actions": {
      "title": "Available Actions",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
