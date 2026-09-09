/**
 * 自动生成的 OpenAPI schema 字段元数据: CloseRunRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const CloseRunRequestMetadata = {
  "title": "CloseRunRequest",
  "required": [
    "expected_version",
    "wms_cleanup_confirmed",
    "site_cleanup_confirmed"
  ],
  "additionalProperties": false,
  "fields": {
    "expected_version": {
      "title": "Expected Version",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "site_cleanup_confirmed": {
      "title": "Site Cleanup Confirmed",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "wms_cleanup_confirmed": {
      "title": "Wms Cleanup Confirmed",
      "type": "boolean",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
