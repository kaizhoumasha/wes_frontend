/**
 * 自动生成的 OpenAPI schema 字段元数据: LogoutResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const LogoutResponseMetadata = {
  "title": "LogoutResponse",
  "description": "登出响应 Schema",
  "required": [
    "message"
  ],
  "fields": {
    "message": {
      "title": "Message",
      "description": "响应消息",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "revoked_count": {
      "title": "Revoked Count",
      "description": "撤销的令牌数量",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    }
  }
} satisfies OpenApiSchemaMetadata
