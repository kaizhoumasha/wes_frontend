/**
 * 自动生成的 OpenAPI schema 字段元数据: ActiveSessionsResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ActiveSessionsResponseMetadata = {
  "title": "ActiveSessionsResponse",
  "description": "活跃会话列表响应 Schema\n\n包含用户所有活跃会话",
  "required": [
    "total",
    "sessions"
  ],
  "fields": {
    "total": {
      "title": "Total",
      "description": "活跃会话总数",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "sessions": {
      "title": "Sessions",
      "description": "会话列表",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "SessionInfo"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
