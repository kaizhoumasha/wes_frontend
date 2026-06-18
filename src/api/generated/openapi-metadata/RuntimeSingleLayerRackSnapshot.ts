/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeSingleLayerRackSnapshot
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeSingleLayerRackSnapshotMetadata = {
  "title": "RuntimeSingleLayerRackSnapshot",
  "description": "单层料架快照状态，用于运行时资源视图诊断。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "RuntimeSingleLayerRackSnapshot",
      "description": "单层料架快照状态，用于运行时资源视图诊断。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "ACTIVE",
        "MISSING",
        "INVALID",
        "NON_SINGLE_LAYER_EVIDENCE",
        "UNKNOWN"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
