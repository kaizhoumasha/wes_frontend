/**
 * 自动生成的 OpenAPI schema 字段元数据: PermissionUpdate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PermissionUpdateMetadata = {
  "title": "PermissionUpdate",
  "description": "API 权限更新 Schema",
  "required": [
    "version"
  ],
  "additionalProperties": false,
  "fields": {
    "parent_id": {
      "title": "Parent Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "tree_path": {
      "title": "Tree Path",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "level": {
      "title": "Level",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "sort_order": {
      "title": "Sort Order",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "has_children": {
      "title": "Has Children",
      "type": "boolean",
      "required": false,
      "nullable": true
    },
    "name": {
      "title": "Name",
      "description": "权限标识，如 admin:role:create",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 100
    },
    "description": {
      "title": "Description",
      "description": "权限描述",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 255
    },
    "type": {
      "title": "Type",
      "description": "权限类型：user_api（内部管理API）、app_api（外部应用API）",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 20
    },
    "category": {
      "title": "Category",
      "description": "权限分类：admin、system、business 等",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 50
    },
    "resource": {
      "title": "Resource",
      "description": "资源类型：user、role、permission、warehouse 等",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 50
    },
    "action": {
      "title": "Action",
      "description": "操作：create、read、update、delete、list 等",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 50
    },
    "method": {
      "title": "Method",
      "description": "HTTP 方法：GET、POST、PUT、DELETE、PATCH 等",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 10
    },
    "path": {
      "title": "Path",
      "description": "API 路径：/admin/users/{id}、/api/v1/warehouses 等",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 255
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
