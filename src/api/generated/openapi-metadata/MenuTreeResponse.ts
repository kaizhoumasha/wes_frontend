/**
 * 自动生成的 OpenAPI schema 字段元数据: MenuTreeResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const MenuTreeResponseMetadata = {
  "title": "MenuTreeResponse",
  "description": "菜单树响应 Schema",
  "required": [
    "name",
    "title",
    "path",
    "id",
    "version"
  ],
  "fields": {
    "children": {
      "title": "Children",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "MenuTreeResponse"
      }
    },
    "component": {
      "title": "Component",
      "description": "组件路径，如 views/system/users.vue",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 200
    },
    "has_children": {
      "title": "Has Children",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "icon": {
      "title": "Icon",
      "description": "图标",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 50
    },
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "is_hidden": {
      "title": "Is Hidden",
      "description": "是否隐藏",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "level": {
      "title": "Level",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 1
    },
    "name": {
      "title": "Name",
      "description": "菜单标识，如 system:users",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 50
    },
    "parent_id": {
      "title": "Parent Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "path": {
      "title": "Path",
      "description": "路由路径，如 /system/users",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 200
    },
    "roles": {
      "title": "Roles",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RoleResponse"
      }
    },
    "sort_order": {
      "title": "Sort Order",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "title": {
      "title": "Title",
      "description": "显示标题",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 50
    },
    "tree_path": {
      "title": "Tree Path",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "/"
    },
    "version": {
      "title": "Version",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
