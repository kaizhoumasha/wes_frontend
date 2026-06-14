/**
 * 自动生成的 OpenAPI schema 字段元数据: UserCreate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const UserCreateMetadata = {
  "title": "UserCreate",
  "description": "用户创建 Schema - 接收客户端输入",
  "required": [
    "username",
    "email",
    "password"
  ],
  "additionalProperties": false,
  "fields": {
    "username": {
      "title": "Username",
      "description": "用户名",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 3,
      "maxLength": 50
    },
    "email": {
      "title": "Email",
      "description": "邮箱",
      "type": "string",
      "format": "email",
      "required": true,
      "nullable": false,
      "maxLength": 100
    },
    "full_name": {
      "title": "Full Name",
      "description": "姓名",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 100
    },
    "password": {
      "title": "Password",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 6,
      "maxLength": 100
    }
  }
} satisfies OpenApiSchemaMetadata
