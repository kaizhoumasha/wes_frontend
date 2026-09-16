/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneSnapshotSourceStatus
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneSnapshotSourceStatusMetadata = {
  "title": "PlaneSnapshotSourceStatus",
  "description": "Snapshot v2 数据来源状态；非 COMPLETE 时前端不得渲染伪造的零活动。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "PlaneSnapshotSourceStatus",
      "description": "Snapshot v2 数据来源状态；非 COMPLETE 时前端不得渲染伪造的零活动。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "COMPLETE",
        "PARTIAL",
        "FAILED",
        "STALE"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
