/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneCurrentTaskView
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneCurrentTaskViewMetadata = {
  "title": "PlaneCurrentTaskView",
  "description": "WorkLine 当前绑定的 PickingTask 及其公开 plan_delta 目标。",
  "required": [
    "task_id",
    "status",
    "last_applied_plan_revision"
  ],
  "additionalProperties": false,
  "fields": {
    "last_applied_plan_revision": {
      "title": "Last Applied Plan Revision",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "PREPARING",
        "EXECUTING"
      ]
    },
    "target_rack_face": {
      "title": "Target Rack Face",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "target_rack_id": {
      "title": "Target Rack Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "task_id": {
      "title": "Task Id",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
