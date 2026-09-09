/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLinePositionSlot
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLinePositionSlotMetadata = {
  "title": "WorkLinePositionSlot",
  "description": "插件工作位需求；执行位置类型来自插件合同，现场编码来自工作线。",
  "required": [
    "slot_key",
    "display_name",
    "position_type",
    "location_type"
  ],
  "additionalProperties": false,
  "fields": {
    "allowed_rack_kind": {
      "required": false,
      "nullable": true,
      "enum": [
        "SINGLE_LAYER",
        "FIVE_LAYER",
        "RETURN",
        "TRANSFER",
        "PRODUCTION"
      ],
      "ref": "RackKind"
    },
    "display_name": {
      "title": "Display Name",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "location_type": {
      "title": "Location Type",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "position_type": {
      "title": "Position Type",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "RACK_POSITION",
        "STATION"
      ]
    },
    "slot_key": {
      "title": "Slot Key",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    }
  }
} satisfies OpenApiSchemaMetadata
