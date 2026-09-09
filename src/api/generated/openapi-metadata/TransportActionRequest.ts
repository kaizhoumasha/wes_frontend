/**
 * 自动生成的 OpenAPI schema 字段元数据: TransportActionRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TransportActionRequestMetadata = {
  "title": "TransportActionRequest",
  "required": [
    "expected_version",
    "client_request_id",
    "kind",
    "rack_id",
    "source",
    "rcs_template_id"
  ],
  "additionalProperties": false,
  "fields": {
    "bin_code": {
      "title": "Bin Code",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 120
    },
    "client_request_id": {
      "title": "Client Request Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    },
    "expected_version": {
      "title": "Expected Version",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "kind": {
      "required": true,
      "nullable": false,
      "enum": [
        "MOVE_RACK",
        "ROTATE_RACK",
        "MOVE_BINS"
      ],
      "ref": "IntegrationTransportActionKind"
    },
    "rack_id": {
      "title": "Rack Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    },
    "rcs_template_id": {
      "title": "Rcs Template Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "CTU01",
        "CTU02",
        "CTU03",
        "F01"
      ]
    },
    "source": {
      "title": "Source",
      "required": true,
      "nullable": false
    },
    "target": {
      "title": "Target",
      "required": false,
      "nullable": true
    },
    "target_face": {
      "title": "Target Face",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 120
    }
  }
} satisfies OpenApiSchemaMetadata
