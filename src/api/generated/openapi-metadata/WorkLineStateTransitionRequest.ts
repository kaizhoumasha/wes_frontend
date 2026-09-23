/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLineStateTransitionRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLineStateTransitionRequestMetadata = {
  "title": "WorkLineStateTransitionRequest",
  "description": "作业线启停请求。",
  "required": [
    "version"
  ],
  "fields": {
    "picking_task_id": {
      "title": "Picking Task Id",
      "description": "单任务归档目标（与 task_id 二选一）",
      "type": "integer",
      "required": false,
      "nullable": true,
      "minimum": 1
    },
    "task_id": {
      "title": "Task Id",
      "description": "WMS 业务 task_id（与 picking_task_id 二选一）",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 100
    },
    "version": {
      "title": "Version",
      "description": "WorkLine 乐观锁版本号",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
