/**
 * 自动生成的 OpenAPI schema 字段元数据: DeviceIngressHistoryItem
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DeviceIngressHistoryItemMetadata = {
  "title": "DeviceIngressHistoryItem",
  "required": [
    "row_key",
    "recorded_at",
    "attempt",
    "latest_update"
  ],
  "additionalProperties": false,
  "fields": {
    "attempt": {
      "required": true,
      "nullable": true,
      "ref": "DeviceIngressAttempt"
    },
    "latest_update": {
      "required": true,
      "nullable": true,
      "ref": "DeviceEvidenceUpdate"
    },
    "recorded_at": {
      "title": "Recorded At",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "row_key": {
      "title": "Row Key",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
