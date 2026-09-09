/**
 * 自动生成的 OpenAPI schema 字段元数据: RackDepartureRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RackDepartureRequestMetadata = {
  "title": "RackDepartureRequest",
  "required": [
    "expected_version",
    "client_request_id",
    "data"
  ],
  "additionalProperties": false,
  "fields": {
    "client_request_id": {
      "title": "Client Request Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    },
    "data": {
      "required": true,
      "nullable": false,
      "ref": "RackDepartureData"
    },
    "expected_version": {
      "title": "Expected Version",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    }
  }
} satisfies OpenApiSchemaMetadata
