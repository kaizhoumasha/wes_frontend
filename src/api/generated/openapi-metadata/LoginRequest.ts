/**
 * 自动生成的 OpenAPI schema 字段元数据: LoginRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const LoginRequestMetadata = {
  "title": "LoginRequest",
  "description": "登录请求 Schema",
  "required": [
    "username",
    "password"
  ],
  "fields": {
    "password": {
      "title": "Password",
      "description": "密码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 6,
      "maxLength": 100
    },
    "username": {
      "title": "Username",
      "description": "用户名",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 3,
      "maxLength": 50
    }
  }
} satisfies OpenApiSchemaMetadata
