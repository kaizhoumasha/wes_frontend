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
  "required": [
    "slot_key",
    "display_name",
    "position_type",
    "location_type"
  ],
  "fields": {
    "allowed_rack_kind": {
      "title": "Allowed Rack Kind",
      "type": "string",
      "required": false,
      "nullable": true,
      "enum": [
        "SINGLE_LAYER",
        "FIVE_LAYER",
        "RETURN",
        "TRANSFER",
        "PRODUCTION"
      ]
    },
    "display_name": {
      "title": "Display Name",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "location_type": {
      "title": "Location Type",
      "type": "string",
      "required": true,
      "nullable": false
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
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
