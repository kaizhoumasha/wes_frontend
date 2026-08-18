/**
 * 自动生成的 OpenAPI schema 字段元数据: WorklineActiveObjectConflictState
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorklineActiveObjectConflictStateMetadata = {
  "title": "WorklineActiveObjectConflictState",
  "description": "WorklineActiveObjects 冲突展示状态。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "WorklineActiveObjectConflictState",
      "description": "WorklineActiveObjects 冲突展示状态。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "OK",
        "TRANSIENT",
        "RECONCILING"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
