/**
 * 自动生成的 OpenAPI schema 字段元数据: ManualDebugPreflightRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ManualDebugPreflightRequestMetadata = {
  "title": "ManualDebugPreflightRequest",
  "required": [
    "endpoint_base_url"
  ],
  "additionalProperties": false,
  "fields": {
    "endpoint_base_url": {
      "title": "Endpoint Base Url",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 255
    }
  }
} satisfies OpenApiSchemaMetadata
