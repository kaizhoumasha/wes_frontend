/**
 * 自动生成的 OpenAPI schema 字段元数据: TransportDebugStep
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TransportDebugStepMetadata = {
  "title": "TransportDebugStep",
  "required": [],
  "fields": {
    "__enum": {
      "title": "TransportDebugStep",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "RACK_TO_STATION",
        "BINS_TO_INFEED",
        "BINS_TO_RACK",
        "RACK_TO_STORAGE"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
