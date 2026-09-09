/**
 * 自动生成的 OpenAPI schema 字段元数据: IntegrationTransportActionKind
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const IntegrationTransportActionKindMetadata = {
  "title": "IntegrationTransportActionKind",
  "required": [],
  "fields": {
    "__enum": {
      "title": "IntegrationTransportActionKind",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "MOVE_RACK",
        "ROTATE_RACK",
        "MOVE_BINS"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
