/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLineStartRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLineStartRequestMetadata = {
  "title": "WorkLineStartRequest",
  "required": [
    "version"
  ],
  "additionalProperties": false,
  "fields": {
    "version": {
      "title": "Version",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    }
  }
} satisfies OpenApiSchemaMetadata
