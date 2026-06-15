/**
 * 自动生成的 OpenAPI schema 字段元数据: LoginResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const LoginResponseMetadata = {
  "title": "LoginResponse",
  "description": "登录响应 Schema\n\n包含访问令牌、刷新令牌元数据和用户信息",
  "required": [
    "access_token",
    "access_token_jti",
    "refresh_token_jti",
    "access_token_expire_time",
    "refresh_token_expire_time",
    "session_uuid",
    "user",
    "expires_in",
    "refresh_expires_in"
  ],
  "fields": {
    "access_token": {
      "title": "Access Token",
      "description": "访问令牌",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "access_token_jti": {
      "title": "Access Token Jti",
      "description": "访问令牌唯一标识符（用于撤销）",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "refresh_token_jti": {
      "title": "Refresh Token Jti",
      "description": "刷新令牌唯一标识符（用于撤销）",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "access_token_expire_time": {
      "title": "Access Token Expire Time",
      "description": "访问令牌过期时间",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "refresh_token_expire_time": {
      "title": "Refresh Token Expire Time",
      "description": "刷新令牌过期时间（令牌仅存储于 HttpOnly Cookie）",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "session_uuid": {
      "title": "Session Uuid",
      "description": "会话 UUID",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "user": {
      "description": "用户信息",
      "required": true,
      "nullable": false,
      "ref": "UserResponse"
    },
    "expires_in": {
      "title": "Expires In",
      "description": "访问令牌过期时间（秒）- OAuth 2.0 标准字段",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "refresh_expires_in": {
      "title": "Refresh Expires In",
      "description": "刷新令牌过期时间（秒）",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
