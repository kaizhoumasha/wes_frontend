/**
 * 自动生成的 OpenAPI schema 字段元数据: BinContentSnapshotStatus
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const BinContentSnapshotStatusMetadata = {
  "title": "BinContentSnapshotStatus",
  "description": "料箱内容快照完整性。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "BinContentSnapshotStatus",
      "description": "料箱内容快照完整性。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "COMPLETE",
        "PARTIAL",
        "UNKNOWN"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
