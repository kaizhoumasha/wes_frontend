/**
 * 自动生成的 OpenAPI schema 字段元数据: MenuUpdate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
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
      "description": "菜单标识，如 system:users",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 50
    },
    "title": {
      "title": "Title",
      "description": "显示标题",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 50
    },
    "path": {
      "title": "Path",
      "description": "路由路径，如 /system/users",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 200
    },
    "component": {
      "title": "Component",
      "description": "组件路径，如 views/system/users.vue",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 200
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
    "version": {
      "title": "Version",
      "description": "乐观锁版本号，更新时必传",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
