/**
 * 自动生成的 OpenAPI schema 字段元数据: TransportDebugRunResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TransportDebugRunResponseMetadata = {
  "title": "TransportDebugRunResponse",
  "required": [
    "workstation",
    "infeed_position",
    "outfeed_position",
    "scan_device_codes",
    "workline_code",
    "returned_bins",
    "run_id",
    "status",
    "rack_id",
    "face_groups",
    "current_group_index",
    "current_phase",
    "current_step",
    "steps",
    "observed_bin_codes",
    "attention_code",
    "attention_detail",
    "can_abort",
    "version",
    "created_by_user_id",
    "aborted_by_user_id",
    "aborted_reason",
    "created_at",
    "updated_at"
  ],
  "additionalProperties": false,
  "fields": {
    "aborted_by_user_id": {
      "title": "Aborted By User Id",
      "type": "integer",
      "required": true,
      "nullable": true
    },
    "aborted_reason": {
      "title": "Aborted Reason",
      "type": "string",
      "required": true,
      "nullable": true
    },
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
    "can_abort": {
      "title": "Can Abort",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "created_at": {
      "title": "Created At",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "created_by_user_id": {
      "title": "Created By User Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "current_group_index": {
      "title": "Current Group Index",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "current_phase": {
      "required": true,
      "nullable": false,
      "enum": [
        "RACK_TO_STATION",
        "BINS_TO_INFEED",
        "WAIT_SCAN12",
        "BINS_TO_RACK",
        "ROTATE_TO_NEXT_FACE",
        "RACK_TO_STORAGE"
      ],
      "ref": "TransportDebugRunPhase"
    },
    "current_step": {
      "required": true,
      "nullable": true,
      "ref": "TransportDebugRunStepResponse"
    },
    "face_groups": {
      "title": "Face Groups",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "TransportDebugRunFaceGroupResponse"
      }
    },
    "infeed_position": {
      "title": "Infeed Position",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "observed_bin_codes": {
      "title": "Observed Bin Codes",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "outfeed_position": {
      "title": "Outfeed Position",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "rack_id": {
      "title": "Rack Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "returned_bins": {
      "title": "Returned Bins",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "TransportDebugReturnedBinResponse"
      }
    },
    "run_id": {
      "title": "Run Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "scan_device_codes": {
      "title": "Scan Device Codes",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "status": {
      "required": true,
      "nullable": false,
      "enum": [
        "RUNNING",
        "NEEDS_ATTENTION",
        "COMPLETED",
        "FAILED",
        "ABORTED"
      ],
      "ref": "TransportDebugRunStatus"
    },
    "steps": {
      "title": "Steps",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "TransportDebugRunStepResponse"
      }
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
    "workline_code": {
      "title": "Workline Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "workstation": {
      "title": "Workstation",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
