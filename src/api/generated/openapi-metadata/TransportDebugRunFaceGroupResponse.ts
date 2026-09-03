/**
 * 自动生成的 OpenAPI schema 字段元数据: TransportDebugRunFaceGroupResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TransportDebugRunFaceGroupResponseMetadata = {
  "title": "TransportDebugRunFaceGroupResponse",
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
        "ref": "TransportDebugRunBinResponse"
      }
    },
    "face": {
      "title": "Face",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
