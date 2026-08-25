/**
 * 自动生成的 OpenAPI schema 字段元数据: PermissionTree
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PermissionTreeMetadata = {
  "title": "PermissionTree",
  "description": "API 权限树形结构 Schema\n\n用于权限分组展示和管理（如按模块分组）",
  "required": [
    "name",
    "id"
  ],
  "fields": {
    "action": {
      "title": "Action",
      "description": "操作：create、read、update、delete、list 等",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 50
    },
    "category": {
      "title": "Category",
      "description": "权限分类：admin、system、business 等",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 50
    },
    "children": {
      "title": "Children",
      "description": "子权限列表",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "PermissionTree"
      }
    },
    "description": {
      "title": "Description",
      "description": "权限描述",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 255
    },
    "has_children": {
      "title": "Has Children",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "level": {
      "title": "Level",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 1
    },
    "method": {
      "title": "Method",
      "description": "HTTP 方法：GET、POST、PUT、DELETE、PATCH 等",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 10
    },
    "name": {
      "title": "Name",
      "description": "权限标识，如 admin:role:create",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 100
    },
    "parent_id": {
      "title": "Parent Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "path": {
      "title": "Path",
      "description": "API 路径：/admin/users/{id}、/api/v1/warehouses 等",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 255
    },
    "resource": {
      "title": "Resource",
      "description": "资源类型：user、role、permission、warehouse 等",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 50
    },
    "sort_order": {
      "title": "Sort Order",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "tree_path": {
      "title": "Tree Path",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "/"
    },
    "type": {
      "title": "Type",
      "description": "权限类型：user_api（内部管理API）、app_api（外部应用API）",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "user_api",
      "maxLength": 20
    }
  }
} satisfies OpenApiSchemaMetadata
