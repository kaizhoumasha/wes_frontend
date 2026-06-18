/**
 * 自动生成的 OpenAPI schema 字段元数据: AssignRolesRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const AssignRolesRequestMetadata = {
  "title": "AssignRolesRequest",
  "description": "为用户分配角色请求",
  "required": [
    "role_ids"
  ],
  "fields": {
    "role_ids": {
      "title": "Role Ids",
      "description": "角色 ID 列表",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "type": "integer"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
