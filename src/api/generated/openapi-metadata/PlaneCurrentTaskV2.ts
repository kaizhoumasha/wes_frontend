/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneCurrentTaskV2
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneCurrentTaskV2Metadata = {
  "title": "PlaneCurrentTaskV2",
  "description": "按需读取的 WorkLine 当前任务采样。",
  "required": [
    "schema_version",
    "generated_at"
  ],
  "additionalProperties": false,
  "fields": {
    "current_task": {
      "required": false,
      "nullable": true,
      "ref": "PlaneCurrentTaskView"
    },
    "generated_at": {
      "title": "Generated At",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "schema_version": {
      "title": "Schema Version",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
