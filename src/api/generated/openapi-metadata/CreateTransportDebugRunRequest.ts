/**
 * 自动生成的 OpenAPI schema 字段元数据: CreateTransportDebugRunRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const CreateTransportDebugRunRequestMetadata = {
  "title": "CreateTransportDebugRunRequest",
  "required": [
    "workline_code",
    "rack_id",
    "face_groups"
  ],
  "additionalProperties": false,
  "fields": {
    "face_groups": {
      "title": "Face Groups",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "TransportDebugRunFaceGroupRequest"
      }
    },
    "infeed_position": {
      "title": "Infeed Position",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "CNV0301",
      "minLength": 1,
      "maxLength": 100
    },
    "outfeed_position": {
      "title": "Outfeed Position",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "CNV0302",
      "minLength": 1,
      "maxLength": 100
    },
    "rack_id": {
      "title": "Rack Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "scan_device_codes": {
      "title": "Scan Device Codes",
      "type": "array",
      "required": false,
      "nullable": false,
      "default": [
        "STATION_SCAN9",
        "STATION_SCAN10",
        "STATION_SCAN11",
        "STATION_SCAN12"
      ],
      "items": {
        "type": "string"
      }
    },
    "workline_code": {
      "title": "Workline Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "workstation": {
      "title": "Workstation",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "KT16",
      "minLength": 1,
      "maxLength": 100
    }
  }
} satisfies OpenApiSchemaMetadata
