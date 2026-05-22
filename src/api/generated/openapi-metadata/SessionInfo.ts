/**
 * 自动生成的 OpenAPI schema 字段元数据: SessionInfo
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const SessionInfoMetadata = {
  "title": "SessionInfo",
  "description": "会话信息 Schema\n\n描述一个活跃的用户会话",
  "required": [
    "session_uuid",
    "jti",
    "created_at"
  ],
  "fields": {
    "session_uuid": {
      "title": "Session Uuid",
      "description": "会话 UUID",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "jti": {
      "title": "Jti",
      "description": "JWT ID",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "created_at": {
      "title": "Created At",
      "description": "会话创建时间",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "device_info": {
      "title": "Device Info",
      "description": "设备信息（可选）",
      "type": "object",
      "required": false,
      "nullable": true
    },
    "last_active": {
      "title": "Last Active",
      "description": "最后活跃时间",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
