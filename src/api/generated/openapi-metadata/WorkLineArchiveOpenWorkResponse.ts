/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLineArchiveOpenWorkResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLineArchiveOpenWorkResponseMetadata = {
  "title": "WorkLineArchiveOpenWorkResponse",
  "description": "一次清线归档的可核对结果。",
  "required": [
    "workline_id",
    "version",
    "archived_picking_tasks",
    "archived_plugin_tasks",
    "archived_total"
  ],
  "fields": {
    "archived_picking_tasks": {
      "title": "Archived Picking Tasks",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "archived_plugin_tasks": {
      "title": "Archived Plugin Tasks",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "archived_single_picking_task": {
      "title": "Archived Single Picking Task",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "archived_single_picking_task_id": {
      "title": "Archived Single Picking Task Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "archived_total": {
      "title": "Archived Total",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "picking_task_status_before": {
      "title": "Picking Task Status Before",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "version": {
      "title": "Version",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "workline_id": {
      "title": "Workline Id",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
