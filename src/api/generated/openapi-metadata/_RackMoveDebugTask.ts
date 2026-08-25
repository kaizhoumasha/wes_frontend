/**
 * 自动生成的 OpenAPI schema 字段元数据: _RackMoveDebugTask
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const _RackMoveDebugTaskMetadata = {
  "title": "_RackMoveDebugTask",
  "required": [
    "client_request_id",
    "kind",
    "data"
  ],
  "additionalProperties": false,
  "fields": {
    "client_request_id": {
      "title": "Client Request Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 36,
      "maxLength": 36
    },
    "data": {
      "required": true,
      "nullable": false,
      "ref": "_RackMoveData"
    },
    "kind": {
      "description": "discriminator enum property added by openapi-typescript",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "RACK_MOVE"
      ]
    },
    "station_id": {
      "title": "Station Id",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 100
    }
  }
} satisfies OpenApiSchemaMetadata
