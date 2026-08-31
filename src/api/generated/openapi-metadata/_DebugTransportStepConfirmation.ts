/**
 * 自动生成的 OpenAPI schema 字段元数据: _DebugTransportStepConfirmation
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const _DebugTransportStepConfirmationMetadata = {
  "title": "_DebugTransportStepConfirmation",
  "required": [
    "step",
    "assertion"
  ],
  "additionalProperties": false,
  "fields": {
    "assertion": {
      "title": "Assertion",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "step": {
      "required": true,
      "nullable": false,
      "enum": [
        "RACK_TO_STATION",
        "BINS_TO_INFEED",
        "BINS_TO_RACK",
        "RACK_TO_STORAGE"
      ],
      "ref": "TransportDebugStep"
    }
  }
} satisfies OpenApiSchemaMetadata
