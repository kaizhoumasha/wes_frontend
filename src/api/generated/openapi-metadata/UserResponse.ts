/**
 * 自动生成的 OpenAPI schema 字段元数据: UserResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const UserResponseMetadata = {
  "title": "UserResponse",
  "description": "用户响应 Schema - 返回给客户端",
  "required": [
    "username",
    "email",
    "id",
    "is_superuser",
    "is_multi_login",
    "created_at"
  ],
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
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "version": {
      "title": "Version",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "is_superuser": {
      "title": "Is Superuser",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "is_multi_login": {
      "title": "Is Multi Login",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "created_at": {
      "title": "Created At",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "created_by": {
      "title": "Created By",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "updated_at": {
      "title": "Updated At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "updated_by": {
      "title": "Updated By",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "deleted_by": {
      "title": "Deleted By",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "deleted_at": {
      "title": "Deleted At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "roles": {
      "title": "Roles",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RoleResponseSimple"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
