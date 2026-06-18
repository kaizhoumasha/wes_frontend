/**
 * 自动生成的 OpenAPI schema 字段元数据: DebugDataCleanupResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DebugDataCleanupResponseMetadata = {
  "title": "DebugDataCleanupResponse",
  "description": "非生产调试过程数据清理响应。",
  "required": [
    "scope",
    "dry_run",
    "deleted",
    "message"
  ],
  "fields": {
    "scope": {
      "title": "Scope",
      "description": "清理范围",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "workline_id": {
      "title": "Workline Id",
      "description": "按工作线清理时的工作线 ID",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "dry_run": {
      "title": "Dry Run",
      "description": "是否仅预览影响范围",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "deleted": {
      "title": "Deleted",
      "description": "是否已执行删除",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "counts": {
      "title": "Counts",
      "description": "影响数据计数",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "affected_workline_ids": {
      "title": "Affected Workline Ids",
      "description": "受影响工作线 ID",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "integer"
      }
    },
    "affected_session_ids": {
      "title": "Affected Session Ids",
      "description": "受影响 Session ID",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "integer"
      }
    },
    "message": {
      "title": "Message",
      "description": "清理结果消息",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
