/**
 * 自动生成的 OpenAPI schema 字段元数据: UserUpdate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const UserUpdateMetadata = {
  "title": "UserUpdate",
  "description": "用户更新 Schema - 所有字段可选",
  "required": [
    "version"
  ],
  "additionalProperties": false,
  "fields": {
    "username": {
      "title": "Username",
      "description": "用户名",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 3,
      "maxLength": 50
    },
    "email": {
      "title": "Email",
      "description": "邮箱",
      "type": "string",
      "format": "email",
      "required": false,
      "nullable": true,
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
    "version": {
      "title": "Version",
      "description": "乐观锁版本号，更新时必传",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
