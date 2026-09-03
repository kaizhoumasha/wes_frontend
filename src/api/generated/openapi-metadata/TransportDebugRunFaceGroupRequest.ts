/**
 * 自动生成的 OpenAPI schema 字段元数据: TransportDebugRunFaceGroupRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TransportDebugRunFaceGroupRequestMetadata = {
  "title": "TransportDebugRunFaceGroupRequest",
  "required": [
    "face",
    "bins"
  ],
  "additionalProperties": false,
  "fields": {
    "bins": {
      "title": "Bins",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "TransportDebugRunBinRequest"
      }
    },
    "face": {
      "title": "Face",
      "description": "Opaque non-empty face value without NUL; preserve exactly",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1
    }
  }
} satisfies OpenApiSchemaMetadata
