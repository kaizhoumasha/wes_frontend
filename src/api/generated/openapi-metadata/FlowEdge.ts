/**
 * 自动生成的 OpenAPI schema 字段元数据: FlowEdge
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const FlowEdgeMetadata = {
  "title": "FlowEdge",
  "description": "拓扑中的物料流或操作关系。",
  "required": [
    "from_node",
    "to_node",
    "type"
  ],
  "fields": {
    "from_node": {
      "description": "起点节点",
      "required": true,
      "nullable": false,
      "ref": "NodeRef"
    },
    "to_node": {
      "description": "终点节点",
      "required": true,
      "nullable": false,
      "ref": "NodeRef"
    },
    "type": {
      "title": "Type",
      "description": "拓扑边类型",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
