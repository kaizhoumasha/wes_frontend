/**
 * 自动生成的 OpenAPI schema 字段元数据: TransportDebugRunPhase
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TransportDebugRunPhaseMetadata = {
  "title": "TransportDebugRunPhase",
  "required": [],
  "fields": {
    "__enum": {
      "title": "TransportDebugRunPhase",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "RACK_TO_STATION",
        "BINS_TO_INFEED",
        "WAIT_SCAN12",
        "BINS_TO_RACK",
        "ROTATE_TO_NEXT_FACE",
        "RACK_TO_STORAGE"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
