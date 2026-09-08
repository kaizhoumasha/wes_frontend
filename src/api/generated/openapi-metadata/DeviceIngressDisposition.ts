/**
 * 自动生成的 OpenAPI schema 字段元数据: DeviceIngressDisposition
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DeviceIngressDispositionMetadata = {
  "title": "DeviceIngressDisposition",
  "required": [],
  "fields": {
    "__enum": {
      "title": "DeviceIngressDisposition",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "ACCEPTED",
        "DUPLICATE",
        "CONFLICT",
        "REJECTED"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
