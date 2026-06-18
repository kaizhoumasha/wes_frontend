/**
 * 自动生成的 OpenAPI schema 字段元数据: TopologySpec
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TopologySpecMetadata = {
  "title": "TopologySpec",
  "description": "插件声明的静态拓扑。",
  "required": [],
  "fields": {
    "flow_edges": {
      "title": "Flow Edges",
      "description": "拓扑边列表",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "FlowEdge"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
