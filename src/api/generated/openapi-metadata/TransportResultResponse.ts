/**
 * 自动生成的 OpenAPI schema 字段元数据: TransportResultResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TransportResultResponseMetadata = {
  "title": "TransportResultResponse",
  "required": [
    "outcome_version",
    "status",
    "reason_code",
    "members"
  ],
  "additionalProperties": false,
  "fields": {
    "members": {
      "title": "Members",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "TransportResultMemberResponse"
      }
    },
    "outcome_version": {
      "title": "Outcome Version",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "reason_code": {
      "title": "Reason Code",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "SUCCEEDED",
        "FAILED",
        "REJECTED",
        "UNKNOWN"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
