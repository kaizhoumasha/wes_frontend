/**
 * 自动生成的 OpenAPI schema 字段元数据: IntegrationDebugProfile
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const IntegrationDebugProfileMetadata = {
  "title": "IntegrationDebugProfile",
  "required": [],
  "fields": {
    "__enum": {
      "title": "IntegrationDebugProfile",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "CONTRACT_SIMULATION",
        "DEVICE_INTEGRATION",
        "FULL_SITE_INTEGRATION"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
