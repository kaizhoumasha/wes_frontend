/**
 * 自动生成的 OpenAPI schema 字段元数据: Body_admin_menus_move_put
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const Body_admin_menus_move_putMetadata = {
  "title": "Body_admin_menus_move_put",
  "required": [
    "node_id",
    "new_parent_id"
  ],
  "fields": {
    "new_parent_id": {
      "title": "New Parent Id",
      "description": "新的父节点ID",
      "type": "integer",
      "required": true,
      "nullable": true
    },
    "node_id": {
      "title": "Node Id",
      "description": "要移动的节点ID",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
