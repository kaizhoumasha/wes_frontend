/**
 * 自动生成的 OpenAPI schema 字段元数据: RevokeSessionResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RevokeSessionResponseMetadata = {
  "title": "RevokeSessionResponse",
  "description": "撤销会话响应 Schema",
  "required": [
    "message",
    "session_uuid"
  ],
  "fields": {
    "message": {
      "title": "Message",
      "description": "响应消息",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "session_uuid": {
      "title": "Session Uuid",
      "description": "被撤销的会话 UUID",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
