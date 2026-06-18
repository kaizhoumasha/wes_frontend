/**
 * 自动生成的 OpenAPI schema 字段元数据: UserPermissionsResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const UserPermissionsResponseMetadata = {
  "title": "UserPermissionsResponse",
  "description": "用户权限列表响应 Schema\n\n包含用户有权限访问的所有 API 权限",
  "required": [
    "total",
    "permissions"
  ],
  "fields": {
    "total": {
      "title": "Total",
      "description": "权限总数",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "permissions": {
      "title": "Permissions",
      "description": "用户有权限访问的 API 列表",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "ApiPermissionInfo"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
