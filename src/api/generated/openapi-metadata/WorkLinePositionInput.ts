/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLinePositionInput
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLinePositionInputMetadata = {
  "title": "WorkLinePositionInput",
  "description": "本线静态工作位；不包含承载物身份、占用或物理到位状态。",
  "required": [
    "position_code",
    "position_name"
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
    "capacity": {
      "title": "Capacity",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 1,
      "minimum": 1
    },
    "device_id": {
      "title": "Device Id",
      "description": "关联本线物理设备 ID，与业务插件无关",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "enabled": {
      "title": "Enabled",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": true
    },
    "external_location_code": {
      "title": "External Location Code",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 120
    },
    "logic_location_code": {
      "title": "Logic Location Code",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 120
    },
    "position_code": {
      "title": "Position Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 80
    },
    "position_name": {
      "title": "Position Name",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    },
    "position_role": {
      "required": false,
      "nullable": true,
      "enum": [
        "SMT_CLASSIFIER_SINGLE_RACK_WORK",
        "SMT_RACK_EXCHANGE_AREA",
        "SMT_SORTER_QUEUE",
        "SMT_SORTER_STATION",
        "SMT_RETURN_RACK_POSITION",
        "SMT_TRANSFER_RACK_POSITION",
        "SMT_EMPTY_RACK_AREA"
      ],
      "ref": "WorklineRackPositionRole"
    },
    "position_type": {
      "title": "Position Type",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "RACK_POSITION",
      "enum": [
        "RACK_POSITION",
        "STATION"
      ]
    },
    "priority": {
      "title": "Priority",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 100,
      "minimum": 0
    }
  }
} satisfies OpenApiSchemaMetadata
