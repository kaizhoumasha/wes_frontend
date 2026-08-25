/**
 * 自动生成的 OpenAPI schema 字段元数据: RoleResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
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
    "name": {
      "title": "Name",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 100
    },
    "permissions": {
      "title": "Permissions",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "PermissionResponse"
      }
    },
    "version": {
      "title": "Version",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
