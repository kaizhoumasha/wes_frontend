/**
 * 自动生成的 OpenAPI schema 字段元数据: MenuUpdate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const MenuUpdateMetadata = {
  "title": "MenuUpdate",
  "description": "菜单更新 Schema",
  "required": [
    "version"
  ],
  "additionalProperties": false,
  "fields": {
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
      "nullable": true
    },
    "icon": {
      "title": "Icon",
      "description": "图标",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 50
    },
    "is_hidden": {
      "title": "Is Hidden",
      "description": "是否隐藏",
      "type": "boolean",
      "required": false,
      "nullable": true
    },
    "level": {
      "title": "Level",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "name": {
      "title": "Name",
      "description": "菜单标识，如 system:users",
      "type": "string",
      "required": false,
      "nullable": true,
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
      "required": false,
      "nullable": true,
      "maxLength": 200
    },
    "sort_order": {
      "title": "Sort Order",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "title": {
      "title": "Title",
      "description": "显示标题",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 50
    },
    "tree_path": {
      "title": "Tree Path",
      "type": "string",
      "required": false,
      "nullable": true
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
