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
    "rack_id": {
      "title": "Rack Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    }
  }
} satisfies OpenApiSchemaMetadata
