/**
 * 自动生成的 OpenAPI schema 字段元数据: _BinMoveDebugTask
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const _BinMoveDebugTaskMetadata = {
  "title": "_BinMoveDebugTask",
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
    "station_id": {
      "title": "Station Id",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 100
    },
    "kind": {
      "description": "discriminator enum property added by openapi-typescript",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "BIN_MOVE"
      ]
    },
    "data": {
      "required": true,
      "nullable": false,
      "ref": "_BinMoveData"
    }
  }
} satisfies OpenApiSchemaMetadata
