/**
 * 自动生成的 OpenAPI schema 字段元数据: RoleResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RoleResponseMetadata = {
  "title": "RoleResponse",
  "description": "角色响应 Schema",
  "required": [
    "name",
    "id",
    "version"
  ],
  "fields": {
    "name": {
      "title": "Name",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 100
    },
    "description": {
      "title": "Description",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 255
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
      "required": true,
      "nullable": false
    },
    "permissions": {
      "title": "Permissions",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "PermissionResponse"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
