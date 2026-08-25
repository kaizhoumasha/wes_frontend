/**
 * 自动生成的 OpenAPI schema 字段元数据: ManualDebugPreflightResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ManualDebugPreflightResponseMetadata = {
  "title": "ManualDebugPreflightResponse",
  "required": [
    "endpoint_base_url",
    "devices"
  ],
  "additionalProperties": false,
  "fields": {
    "devices": {
      "title": "Devices",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "ManualDebugPreflightDevice"
      }
    },
    "endpoint_base_url": {
      "title": "Endpoint Base Url",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
