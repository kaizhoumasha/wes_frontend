/**
 * 自动生成的 OpenAPI schema 字段元数据: TransportResultMemberResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TransportResultMemberResponseMetadata = {
  "title": "TransportResultMemberResponse",
  "required": [
    "object_id",
    "status",
    "final_position",
    "position_unknown",
    "failure_code",
    "arrival_face"
  ],
  "additionalProperties": false,
  "fields": {
    "arrival_face": {
      "title": "Arrival Face",
      "description": "Opaque non-empty face value without NUL; preserve exactly",
      "type": "string",
      "required": true,
      "nullable": true,
      "minLength": 1
    },
    "failure_code": {
      "title": "Failure Code",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "final_position": {
      "title": "Final Position",
      "type": "object",
      "required": true,
      "nullable": true
    },
    "object_id": {
      "title": "Object Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "position_unknown": {
      "title": "Position Unknown",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "UNKNOWN",
        "FAILED",
        "SUCCEEDED"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
