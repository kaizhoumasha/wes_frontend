/**
 * 自动生成的 OpenAPI schema 字段元数据: NodeRef
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const NodeRefMetadata = {
  "title": "NodeRef",
  "description": "拓扑节点引用。",
  "required": [
    "kind",
    "ref"
  ],
  "fields": {
    "kind": {
      "title": "Kind",
      "description": "拓扑节点引用类型",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "ref": {
      "title": "Ref",
      "description": "拓扑节点引用值",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
