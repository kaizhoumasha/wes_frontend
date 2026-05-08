/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeStatCard
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeStatCardMetadata = {
  "title": "RuntimeStatCard",
  "required": [
    "key",
    "label",
    "value"
  ],
  "fields": {
    "key": {
      "title": "Key",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "label": {
      "title": "Label",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "value": {
      "title": "Value",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "info"
    }
  }
} satisfies OpenApiSchemaMetadata
