/**
 * 自动生成的 OpenAPI schema 字段元数据: PickingTaskPrepareData
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PickingTaskPrepareDataMetadata = {
  "title": "PickingTaskPrepareData",
  "required": [
    "task_id",
    "workline_code"
  ],
  "fields": {
    "task_id": {
      "title": "Task Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "workline_code": {
      "title": "Workline Code",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
